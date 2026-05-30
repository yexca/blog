/*!
*   Hugo Theme Stack
*
*   @author: Jimmy Cai
*   @website: https://jimmycai.com
*   @link: https://github.com/CaiJimmy/hugo-theme-stack
*/
import StackGallery from "ts/gallery";
import { getColor } from 'ts/color';
import menu from 'ts/menu';
import createElement from 'ts/createElement';
import StackColorScheme from 'ts/colorScheme';
import { setupScrollspy } from 'ts/scrollspy';
import { setupSmoothAnchors } from "ts/smoothAnchors";
import { setupStickySidebar } from "ts/stickySidebar";

let Stack = {
    init: () => {
        /**
         * Bind menu event
         */
        menu();
        setupStickySidebar();

        const articleContent = document.querySelector('.article-content') as HTMLElement;
        if (articleContent) {
            new StackGallery(articleContent);
            setupSmoothAnchors();
            setupScrollspy();
        }

        /**
         * Add linear gradient background to tile style article
         */
        const articleTile = document.querySelector('.article-list--tile');
        if (articleTile) {
            let observer = new IntersectionObserver(async (entries, observer) => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) return;
                    observer.unobserve(entry.target);

                    const articles = entry.target.querySelectorAll('article.has-image');
                    articles.forEach(async articles => {
                        const image = articles.querySelector('img'),
                            imageURL = image.src,
                            key = image.getAttribute('data-key'),
                            hash = image.getAttribute('data-hash'),
                            articleDetails: HTMLDivElement = articles.querySelector('.article-details');

                        const colors = await getColor(key, hash, imageURL);

                        articleDetails.style.background = `
                        linear-gradient(0deg, 
                            rgba(${colors.DarkMuted.rgb[0]}, ${colors.DarkMuted.rgb[1]}, ${colors.DarkMuted.rgb[2]}, 0.5) 0%, 
                            rgba(${colors.Vibrant.rgb[0]}, ${colors.Vibrant.rgb[1]}, ${colors.Vibrant.rgb[2]}, 0.75) 100%)`;
                    })
                })
            });

            observer.observe(articleTile)
        }


        /**
         * Add controls to code blocks
        */
        const highlights = document.querySelectorAll('.article-content div.highlight');
        const copyText = `Copy`,
            copiedText = `Copied!`;
        const writeClipboardText = async (text: string) => {
            const clipboard = window.navigator?.clipboard;

            if (clipboard && window.isSecureContext) {
                try {
                    await clipboard.writeText(text);
                    return;
                }
                catch (_) {
                    /// Fall through to textarea-based copy for browsers that block clipboard permissions.
                }
            }

            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.setAttribute('readonly', '');
            textarea.style.position = 'fixed';
            textarea.style.left = '-9999px';
            textarea.style.top = '0';
            document.body.appendChild(textarea);
            textarea.select();

            const copied = document.execCommand('copy');
            textarea.remove();

            if (!copied) throw new Error('Unable to copy code block');
        };

        highlights.forEach((highlight: HTMLElement) => {
            const codeBlock = highlight.querySelector('code[data-lang]');
            if (!codeBlock) return;
            let focusPlaceholder: HTMLElement | null = null;
            let focusPortal: HTMLElement | null = null;
            let originalParent: ParentNode | null = null;
            let originalNextSibling: ChildNode | null = null;

            const header = document.createElement('div');
            header.classList.add('codeBlockHeader');

            const controls = document.createElement('div');
            controls.classList.add('codeBlockWindowControls');

            const wrapButton = document.createElement('button');
            wrapButton.type = 'button';
            wrapButton.classList.add('codeBlockControl', 'codeBlockControl--wrap');
            wrapButton.setAttribute('aria-label', 'Enable line wrap');
            wrapButton.title = 'Wrap lines';

            const collapseButton = document.createElement('button');
            collapseButton.type = 'button';
            collapseButton.classList.add('codeBlockControl', 'codeBlockControl--collapse');
            collapseButton.setAttribute('aria-label', 'Collapse code block');
            collapseButton.title = 'Collapse';

            const focusButton = document.createElement('button');
            focusButton.type = 'button';
            focusButton.classList.add('codeBlockControl', 'codeBlockControl--focus');
            focusButton.setAttribute('aria-label', 'Open code block in a floating window');
            focusButton.title = 'Window';

            controls.append(wrapButton, collapseButton, focusButton);

            const language = document.createElement('span');
            language.classList.add('codeBlockLanguage');
            language.textContent = codeBlock.getAttribute('data-lang')?.toUpperCase() || 'CODE';

            const copyButton = document.createElement('button');
            copyButton.type = 'button';
            copyButton.innerHTML = copyText;
            copyButton.classList.add('copyCodeButton');

            header.append(controls, language, copyButton);
            highlight.prepend(header);

            const closeFocusedBlock = () => {
                highlight.classList.remove('is-focused');
                highlight.style.left = '';
                highlight.style.top = '';
                highlight.style.width = '';
                highlight.style.height = '';
                if (originalParent) {
                    originalParent.insertBefore(highlight, originalNextSibling);
                }
                focusPlaceholder?.remove();
                focusPortal?.remove();
                focusPlaceholder = null;
                focusPortal = null;
                originalParent = null;
                originalNextSibling = null;
                focusButton.setAttribute('aria-label', 'Open code block in a floating window');
                focusButton.title = 'Window';
            };

            focusButton.addEventListener('click', () => {
                const isFocused = !highlight.classList.contains('is-focused');

                if (isFocused) {
                    originalParent = highlight.parentNode;
                    originalNextSibling = highlight.nextSibling;
                    focusPlaceholder = document.createElement('div');
                    focusPlaceholder.classList.add('codeBlockPlaceholder');
                    focusPlaceholder.style.height = `${highlight.offsetHeight}px`;
                    originalParent.insertBefore(focusPlaceholder, highlight);
                    focusPortal = document.createElement('div');
                    focusPortal.classList.add('article-content', 'codeBlockPortal');
                    focusPortal.addEventListener('click', (event) => {
                        if (event.target === focusPortal) closeFocusedBlock();
                    });
                    document.body.appendChild(focusPortal);
                    focusPortal.appendChild(highlight);
                    highlight.classList.add('is-focused');
                }
                else {
                    closeFocusedBlock();
                }

                focusButton.setAttribute(
                    'aria-label',
                    isFocused ? 'Close floating code window' : 'Open code block in a floating window'
                );
                focusButton.title = isFocused ? 'Close window' : 'Window';
            });

            header.addEventListener('pointerdown', (event) => {
                if (!highlight.classList.contains('is-focused')) return;
                if ((event.target as HTMLElement).closest('button')) return;

                const rect = highlight.getBoundingClientRect();
                const offsetX = event.clientX - rect.left;
                const offsetY = event.clientY - rect.top;

                highlight.style.width = `${rect.width}px`;
                highlight.style.height = `${rect.height}px`;
                highlight.style.left = `${rect.left}px`;
                highlight.style.top = `${rect.top}px`;
                highlight.style.transform = 'none';
                header.setPointerCapture(event.pointerId);
                highlight.classList.add('is-dragging');

                const moveWindow = (moveEvent: PointerEvent) => {
                    const nextLeft = Math.min(Math.max(moveEvent.clientX - offsetX, 8), window.innerWidth - 80);
                    const nextTop = Math.min(Math.max(moveEvent.clientY - offsetY, 8), window.innerHeight - 50);
                    highlight.style.left = `${nextLeft}px`;
                    highlight.style.top = `${nextTop}px`;
                };

                const stopMoving = () => {
                    highlight.classList.remove('is-dragging');
                    header.releasePointerCapture(event.pointerId);
                    window.removeEventListener('pointermove', moveWindow);
                    window.removeEventListener('pointerup', stopMoving);
                };

                window.addEventListener('pointermove', moveWindow);
                window.addEventListener('pointerup', stopMoving);
            });

            collapseButton.addEventListener('click', () => {
                const isCollapsed = highlight.classList.toggle('is-collapsed');
                collapseButton.setAttribute('aria-label', isCollapsed ? 'Expand code block' : 'Collapse code block');
                collapseButton.title = isCollapsed ? 'Expand' : 'Collapse';
            });

            wrapButton.addEventListener('click', () => {
                const isWrapped = highlight.classList.toggle('is-wrapped');
                wrapButton.setAttribute('aria-label', isWrapped ? 'Disable line wrap' : 'Enable line wrap');
                wrapButton.title = isWrapped ? 'No wrap' : 'Wrap lines';
            });

            document.addEventListener('keydown', (event) => {
                if (event.key !== 'Escape') return;
                closeFocusedBlock();
            });

            copyButton.addEventListener('click', async (event) => {
                event.stopPropagation();

                try {
                    await writeClipboardText(codeBlock.textContent || '');
                    copyButton.textContent = copiedText;
                }
                catch (err) {
                    copyButton.textContent = 'Failed';
                    console.log('Something went wrong', err);
                }

                setTimeout(() => {
                    copyButton.textContent = copyText;
                }, 1000);
            });
        });

        new StackColorScheme(document.getElementById('dark-mode-toggle'));
    }
}

window.addEventListener('load', () => {
    setTimeout(function () {
        Stack.init();
    }, 0);
})

declare global {
    interface Window {
        createElement: any;
        Stack: any
    }
}

window.Stack = Stack;
window.createElement = createElement;
