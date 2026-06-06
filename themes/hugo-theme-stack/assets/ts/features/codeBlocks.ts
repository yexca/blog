const codeBlockText = {
    copy: 'Copy',
    copied: 'Copied!',
    failed: 'Failed',
    wrap: 'Wrap lines',
    noWrap: 'No wrap',
    collapse: 'Collapse',
    expand: 'Expand',
    window: 'Window',
    closeWindow: 'Close window',
    enableWrap: 'Enable line wrap',
    disableWrap: 'Disable line wrap',
    collapseBlock: 'Collapse code block',
    expandBlock: 'Expand code block',
    openWindow: 'Open code block in a floating window',
    closeFloatingWindow: 'Close floating code window',
};

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

export function setupCodeBlocks() {
    const highlights = document.querySelectorAll('.article-content div.highlight:not([data-stack-code-ready])');

    highlights.forEach((highlight: HTMLElement) => {
        highlight.dataset.stackCodeReady = 'true';
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
        wrapButton.setAttribute('aria-label', codeBlockText.enableWrap);
        wrapButton.title = codeBlockText.wrap;

        const collapseButton = document.createElement('button');
        collapseButton.type = 'button';
        collapseButton.classList.add('codeBlockControl', 'codeBlockControl--collapse');
        collapseButton.setAttribute('aria-label', codeBlockText.collapseBlock);
        collapseButton.title = codeBlockText.collapse;

        const focusButton = document.createElement('button');
        focusButton.type = 'button';
        focusButton.classList.add('codeBlockControl', 'codeBlockControl--focus');
        focusButton.setAttribute('aria-label', codeBlockText.openWindow);
        focusButton.title = codeBlockText.window;

        controls.append(wrapButton, collapseButton, focusButton);

        const language = document.createElement('span');
        language.classList.add('codeBlockLanguage');
        language.textContent = codeBlock.getAttribute('data-lang')?.toUpperCase() || 'CODE';

        const copyButton = document.createElement('button');
        copyButton.type = 'button';
        copyButton.innerHTML = codeBlockText.copy;
        copyButton.classList.add('copyCodeButton');

        header.append(controls, language, copyButton);
        highlight.prepend(header);

        const closeFocusedBlock = () => {
            highlight.classList.remove('is-focused');
            highlight.style.left = '';
            highlight.style.top = '';
            highlight.style.width = '';
            highlight.style.height = '';
            highlight.style.transform = '';
            if (originalParent) {
                originalParent.insertBefore(highlight, originalNextSibling);
            }
            focusPlaceholder?.remove();
            focusPortal?.remove();
            focusPlaceholder = null;
            focusPortal = null;
            originalParent = null;
            originalNextSibling = null;
            focusButton.setAttribute('aria-label', codeBlockText.openWindow);
            focusButton.title = codeBlockText.window;
        };

        focusButton.addEventListener('click', () => {
            const isFocused = !highlight.classList.contains('is-focused');

            if (isFocused) {
                highlight.style.left = '';
                highlight.style.top = '';
                highlight.style.width = '';
                highlight.style.height = '';
                highlight.style.transform = '';
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
                isFocused ? codeBlockText.closeFloatingWindow : codeBlockText.openWindow
            );
            focusButton.title = isFocused ? codeBlockText.closeWindow : codeBlockText.window;
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
            collapseButton.setAttribute('aria-label', isCollapsed ? codeBlockText.expandBlock : codeBlockText.collapseBlock);
            collapseButton.title = isCollapsed ? codeBlockText.expand : codeBlockText.collapse;
        });

        wrapButton.addEventListener('click', () => {
            const isWrapped = highlight.classList.toggle('is-wrapped');
            wrapButton.setAttribute('aria-label', isWrapped ? codeBlockText.disableWrap : codeBlockText.enableWrap);
            wrapButton.title = isWrapped ? codeBlockText.noWrap : codeBlockText.wrap;
        });

        document.addEventListener('keydown', (event) => {
            if (event.key !== 'Escape') return;
            closeFocusedBlock();
        });

        copyButton.addEventListener('click', async (event) => {
            event.stopPropagation();

            try {
                await writeClipboardText(codeBlock.textContent || '');
                copyButton.textContent = codeBlockText.copied;
            }
            catch (err) {
                copyButton.textContent = codeBlockText.failed;
                console.log('Something went wrong', err);
            }

            setTimeout(() => {
                copyButton.textContent = codeBlockText.copy;
            }, 1000);
        });
    });
}
