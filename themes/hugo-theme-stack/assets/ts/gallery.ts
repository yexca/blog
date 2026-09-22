/// PhotoSwipe 5 lightbox for article images.
/// The library is loaded from the CDN on the first click, so pages that are only read never pay for it.
/// Local page-bundle images carry width/height from Hugo; hosted images get their size from the loaded element.

type PhotoSwipeItem = {
    src: string;
    width: number;
    height: number;
    alt?: string;
    element: HTMLImageElement;
};

type PhotoSwipeContent = {
    width: number;
    height: number;
    element?: HTMLElement;
};

type PhotoSwipeSlide = {
    width: number;
    height: number;
    calculateSize: () => void;
    zoomAndPanToInitial: () => void;
    applyCurrentZoomPan: () => void;
    updateContentSize: (force?: boolean) => void;
};

type PhotoSwipeInstance = {
    init: () => void;
    on: (name: 'loadComplete', callback: (event: { content: PhotoSwipeContent; slide?: PhotoSwipeSlide }) => void) => void;
};

type PhotoSwipeConstructor = new (options: Record<string, unknown>) => PhotoSwipeInstance;

declare global {
    interface Window {
        PhotoSwipe?: PhotoSwipeConstructor;
    }
}

const photoSwipeScript = {
    src: 'https://cdn.jsdelivr.net/npm/photoswipe@5.4.4/dist/umd/photoswipe.umd.min.js',
    integrity: 'sha256-uob9La2zGs2OSIVA/ttQN8WYv4bGOiqATVAlJxr2oyM=',
};
const photoSwipeStyle = {
    href: 'https://cdn.jsdelivr.net/npm/photoswipe@5.4.4/dist/photoswipe.css',
    integrity: 'sha256-sOqq4LneBk0l4vGFF7kBGlJtmyFCN24cD+vQls66ufM=',
};

/// Badges, counters, icons and emoji-sized images are not worth a lightbox:
/// PhotoSwipe never upscales, so both sides must be reasonably large.
const minZoomableSize = 120;
const zoomableClass = 'is-zoomable';

let loadingPromise: Promise<PhotoSwipeConstructor> | null = null;

function loadPhotoSwipe() {
    if (window.PhotoSwipe) return Promise.resolve(window.PhotoSwipe);
    if (loadingPromise) return loadingPromise;

    loadingPromise = new Promise<PhotoSwipeConstructor>((resolve, reject) => {
        const style = document.createElement('link');
        style.rel = 'stylesheet';
        style.href = photoSwipeStyle.href;
        style.integrity = photoSwipeStyle.integrity;
        style.crossOrigin = 'anonymous';
        document.head.append(style);

        const script = document.createElement('script');
        script.src = photoSwipeScript.src;
        script.integrity = photoSwipeScript.integrity;
        script.crossOrigin = 'anonymous';
        script.dataset.stackExecuted = 'true';
        script.addEventListener('load', () => {
            if (window.PhotoSwipe) resolve(window.PhotoSwipe);
            else reject(new Error('PhotoSwipe loaded without exposing its API'));
        }, { once: true });
        script.addEventListener('error', () => reject(new Error('Failed to load PhotoSwipe')), { once: true });
        document.head.append(script);
    }).catch((error) => {
        loadingPromise = null;
        throw error;
    });

    return loadingPromise;
}

/// An image the author wrapped in a link to somewhere else keeps behaving as a link.
function isLinkedElsewhere(img: HTMLImageElement) {
    const link = img.closest('a');
    return !!link && link.href !== img.currentSrc && link.href !== img.src;
}

function isLargeEnough(img: HTMLImageElement) {
    const width = img.naturalWidth || Number(img.getAttribute('width')) || 0;
    const height = img.naturalHeight || Number(img.getAttribute('height')) || 0;
    return width >= minZoomableSize && height >= minZoomableSize;
}

/// Lazy images further down are zoomable before they load so they join the gallery;
/// they drop out once loading shows they are too small.
function markZoomable(img: HTMLImageElement) {
    if (isLinkedElsewhere(img) || img.closest('[data-no-lightbox]')) return;

    const update = () => img.classList.toggle(zoomableClass, isLargeEnough(img));
    if (img.complete && img.naturalWidth) {
        update();
        return;
    }

    img.classList.add(zoomableClass);
    img.addEventListener('load', update, { once: true });
}

function toItem(img: HTMLImageElement): PhotoSwipeItem {
    const width = img.naturalWidth || Number(img.getAttribute('width')) || 0;
    const height = img.naturalHeight || Number(img.getAttribute('height')) || 0;

    return {
        src: img.currentSrc || img.src,
        // Unloaded hosted images have no size yet; start from the viewport and correct it on load.
        width: width || window.innerWidth,
        height: height || window.innerHeight,
        alt: img.alt || undefined,
        element: img,
    };
}

function readLabels(container: HTMLElement) {
    const labels = container.dataset.lightboxLabels;
    if (!labels) return {};

    try {
        return JSON.parse(labels) as Record<string, string>;
    }
    catch (_) {
        return {};
    }
}

async function open(container: HTMLElement, clicked: HTMLImageElement) {
    const images = Array.from(container.querySelectorAll(`img.${zoomableClass}`)) as HTMLImageElement[];
    const index = images.indexOf(clicked);
    if (index < 0) return;

    const PhotoSwipe = await loadPhotoSwipe();
    const pswp = new PhotoSwipe({
        ...readLabels(container),
        dataSource: images.map(toItem),
        index,
        bgOpacity: 0.9,
        showHideAnimationType: 'zoom',
    });

    pswp.on('loadComplete', ({ content, slide }) => {
        const img = content.element as HTMLImageElement | undefined;
        if (!img?.naturalWidth || (img.naturalWidth === content.width && img.naturalHeight === content.height)) return;

        content.width = img.naturalWidth;
        content.height = img.naturalHeight;
        if (!slide) return;

        slide.width = content.width;
        slide.height = content.height;
        slide.calculateSize();
        slide.zoomAndPanToInitial();
        slide.applyCurrentZoomPan();
        slide.updateContentSize(true);
    });

    pswp.init();
}

class StackGallery {
    constructor(container: HTMLElement) {
        StackGallery.createGallery(container);

        container.querySelectorAll('img').forEach((img) => markZoomable(img as HTMLImageElement));

        container.addEventListener('click', (event) => {
            if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

            const img = (event.target as Element).closest?.(`img.${zoomableClass}`) as HTMLImageElement | null;
            if (!img || !container.contains(img)) return;

            // Stops the fallback <a target=_blank>; soft navigation skips prevented clicks.
            event.preventDefault();
            open(container, img).catch((error) => {
                console.error(error);
                window.open(img.currentSrc || img.src, '_blank', 'noopener');
            });
        });
    }

    public static createGallery(container: HTMLElement) {
        /// The process of wrapping image with figure tag is done using JavaScript instead of only Hugo markdown render hook
        /// because it can not detect whether image is being wrapped by a link or not
        /// and it lead to a invalid HTML construction (<a><figure><img></figure></a>)

        const images = container.querySelectorAll('img.gallery-image');
        for (const img of Array.from(images)) {
            /// Images are wrapped with figure tag if the paragraph has only images without texts
            /// This is done to allow inline images within paragraphs
            const paragraph = img.closest('p');

            if (!paragraph || !container.contains(paragraph)) continue;

            if (paragraph.textContent.trim() == '') {
                /// Once we insert figcaption, this check no longer works
                /// So we add a class to paragraph to mark it
                paragraph.classList.add('no-text');
            }

            let isNewLineImage = paragraph.classList.contains('no-text');
            if (!isNewLineImage) continue;

            const hasLink = img.parentElement.tagName == 'A';

            let el: HTMLElement = img as HTMLElement;
            /// Wrap image with figure tag, with flex-grow and flex-basis values extracted from img's data attributes
            const figure = document.createElement('figure');
            figure.style.setProperty('flex-grow', img.getAttribute('data-flex-grow') || '1');
            figure.style.setProperty('flex-basis', img.getAttribute('data-flex-basis') || '0');
            if (hasLink) {
                /// Wrap <a> if it exists
                el = img.parentElement;
            }
            el.parentElement.insertBefore(figure, el);
            figure.appendChild(el);

            /// Add figcaption if it exists
            if (img.hasAttribute('alt')) {
                const figcaption = document.createElement('figcaption');
                figcaption.innerText = img.getAttribute('alt');
                figure.appendChild(figcaption);
            }

            /// Wrap img tag with <a> tag if image was not wrapped by <a> tag
            /// (the no-JS fallback: open the original image in a new tab)
            if (!hasLink) {
                figure.className = 'gallery-image';

                const a = document.createElement('a');
                a.href = (img as HTMLImageElement).src;
                a.setAttribute('target', '_blank');
                img.parentNode.insertBefore(a, img);
                a.appendChild(img);
            }
        }

        const figuresEl = container.querySelectorAll('figure.gallery-image');

        let currentGallery = [];

        for (const figure of figuresEl) {
            if (!currentGallery.length) {
                /// First iteration
                currentGallery = [figure];
            }
            else if (figure.previousElementSibling === currentGallery[currentGallery.length - 1]) {
                /// Adjacent figures
                currentGallery.push(figure);
            }
            else if (currentGallery.length) {
                /// End gallery
                StackGallery.wrap(currentGallery);
                currentGallery = [figure];
            }
        }

        if (currentGallery.length > 0) {
            StackGallery.wrap(currentGallery);
        }
    }

    /**
     * Wrap adjacent figure tags with div.gallery
     * @param figures
     */
    public static wrap(figures: HTMLElement[]) {
        const galleryContainer = document.createElement('div');
        galleryContainer.className = 'gallery';

        const parentNode = figures[0].parentNode,
            first = figures[0];

        parentNode.insertBefore(galleryContainer, first)

        for (const figure of figures) {
            galleryContainer.appendChild(figure);
        }
    }
}

export default StackGallery;
