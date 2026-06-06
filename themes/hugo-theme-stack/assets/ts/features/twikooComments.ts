declare global {
    interface Window {
        twikoo?: {
            init: (options: Record<string, string>) => void;
        };
    }
}

let loadingPromise: Promise<void> | null = null;

function loadScript(src: string) {
    if (window.twikoo) return Promise.resolve();
    if (loadingPromise) return loadingPromise;

    loadingPromise = new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement | null;
        if (existing) {
            existing.addEventListener('load', () => resolve(), { once: true });
            existing.addEventListener('error', () => reject(new Error('Failed to load Twikoo')), { once: true });
            return;
        }

        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.defer = true;
        script.addEventListener('load', () => resolve(), { once: true });
        script.addEventListener('error', () => reject(new Error('Failed to load Twikoo')), { once: true });
        document.head.append(script);
    });

    return loadingPromise;
}

function initTwikoo(container: HTMLElement) {
    const cdn = container.dataset.twikooCdn;
    const envId = container.dataset.envId;
    if (!cdn || !envId) return;

    loadScript(cdn)
        .then(() => {
            window.twikoo?.init({
                envId,
                el: `#${container.id}`,
                ...(container.dataset.region ? { region: container.dataset.region } : {}),
                ...(container.dataset.path ? { path: container.dataset.path } : {}),
                ...(container.dataset.lang ? { lang: container.dataset.lang } : {}),
            });
        })
        .catch(() => {
            container.dataset.twikooFailed = 'true';
        });
}

export function setupTwikooComments(root: ParentNode = document) {
    const comments = Array.from(root.querySelectorAll('[data-twikoo]:not([data-stack-twikoo-ready])')) as HTMLElement[];
    if (!comments.length) return;

    const observer = 'IntersectionObserver' in window
        ? new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const target = entry.target as HTMLElement;
                observer.unobserve(target);
                initTwikoo(target);
            });
        }, { rootMargin: '400px' })
        : null;

    comments.forEach((container) => {
        container.dataset.stackTwikooReady = 'true';
        if (observer) observer.observe(container);
        else initTwikoo(container);
    });
}
