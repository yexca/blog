type NavigationHistoryBehavior = 'auto' | 'push' | 'replace';

type ScrollBehaviorMode = 'top' | 'restore';

interface StackHistoryState {
    stackNavigation?: true;
    scrollX?: number;
    scrollY?: number;
}

interface ScrollPosition {
    x: number;
    y: number;
}

interface NavigateEvent extends Event {
    readonly canIntercept: boolean;
    readonly destination?: {
        readonly url: string;
        readonly sameDocument: boolean;
    };
    readonly downloadRequest: string | null;
    readonly formData: FormData | null;
    readonly hashChange: boolean;
    readonly info: unknown;
    readonly navigationType: 'push' | 'replace' | 'reload' | 'traverse';
    readonly userInitiated: boolean;
    intercept(options?: {
        handler?: () => Promise<void>;
        focusReset?: 'after-transition' | 'manual';
        scroll?: 'after-transition' | 'manual';
    }): void;
}

interface NavigationLike extends EventTarget {
    addEventListener(type: 'navigate', listener: (event: NavigateEvent) => void): void;
}

declare global {
    interface Document {
        startViewTransition?: (updateCallback: () => Promise<void> | void) => {
            ready: Promise<void>;
            finished: Promise<void>;
            updateCallbackDone: Promise<void>;
        };
    }

    interface Window {
        navigation?: NavigationLike;
        Stack?: {
            init: () => void;
        };
    }
}

const parser = new DOMParser();
const shellSelector = '[data-page-shell]';
const scriptSelector = 'script:not([type]), script[type=""], script[type="text/javascript"], script[type="application/javascript"], script[type="module"]';
const scrollStorageKey = 'StackPageScrollPositions';

let pendingNavigation: AbortController | null = null;
let activeNavigationURL: string | null = null;
let renderedURL = window.location.href;
let scrollSaveTimer: number | null = null;

function getCurrentOrigin() {
    return window.location.origin;
}

function shouldHandleURL(url: URL, allowCurrentURL = false) {
    if (url.origin !== getCurrentOrigin()) return false;
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;

    const currentURL = new URL(window.location.href);
    if (!allowCurrentURL && url.href === currentURL.href) return false;
    if (url.pathname === currentURL.pathname && url.search === currentURL.search && url.hash !== currentURL.hash) return false;

    return true;
}

function updateHead(nextDocument: Document) {
    document.title = nextDocument.title;

    const selectors = [
        'meta[name="description"]',
        'meta[name="keywords"]',
        'link[rel="canonical"]',
        'meta[property^="og:"]',
        'meta[name^="twitter:"]',
        'link[rel="alternate"]',
        'link[rel="preload"][as="fetch"]',
    ];

    selectors.forEach((selector) => {
        document.head.querySelectorAll(selector).forEach((node) => node.remove());

        nextDocument.head.querySelectorAll(selector).forEach((node) => {
            document.head.appendChild(document.importNode(node, true));
        });
    });
}

function replaceInlineStyles(nextDocument: Document) {
    const currentStyles = document.head.querySelectorAll('style[data-stack-runtime-style]');
    const nextStyles = nextDocument.head.querySelectorAll('style[data-stack-runtime-style]');

    currentStyles.forEach((style) => style.remove());
    nextStyles.forEach((style) => {
        document.head.appendChild(document.importNode(style, true));
    });
}

function replaceBody(nextDocument: Document) {
    const currentShell = document.querySelector(shellSelector);
    const nextShell = nextDocument.querySelector(shellSelector);

    if (!currentShell || !nextShell) {
        throw new Error('Missing page shell');
    }

    document.body.className = nextDocument.body.className;
    currentShell.replaceWith(document.importNode(nextShell, true));
}

function getCurrentHistoryState(): StackHistoryState {
    return (window.history.state && typeof window.history.state === 'object') ? window.history.state : {};
}

function getStoredScrollPositions(): Record<string, ScrollPosition> {
    try {
        return JSON.parse(window.sessionStorage.getItem(scrollStorageKey) || '{}');
    }
    catch (_) {
        return {};
    }
}

function getScrollPosition(url: string): ScrollPosition {
    const positions = getStoredScrollPositions();
    return positions[url] || { x: 0, y: 0 };
}

function saveScrollPosition(url = renderedURL) {
    const positions = getStoredScrollPositions();
    const position = {
        x: window.scrollX,
        y: window.scrollY,
    };

    positions[url] = position;
    window.sessionStorage.setItem(scrollStorageKey, JSON.stringify(positions));

    if (window.location.href !== url) return;

    const state = getCurrentHistoryState();

    window.history.replaceState({
        ...state,
        stackNavigation: true,
        scrollX: position.x,
        scrollY: position.y,
    }, '', window.location.href);
}

function setupScrollPositionTracking() {
    window.addEventListener('scroll', () => {
        if (scrollSaveTimer) {
            window.clearTimeout(scrollSaveTimer);
        }

        scrollSaveTimer = window.setTimeout(() => {
            saveScrollPosition(renderedURL);
            scrollSaveTimer = null;
        }, 120);
    }, { passive: true });

    window.addEventListener('pagehide', () => {
        saveScrollPosition(renderedURL);
    });
}

function createHistoryState(): StackHistoryState {
    return {
        stackNavigation: true,
        scrollX: 0,
        scrollY: 0,
    };
}

function restoreScroll(url: URL, mode: ScrollBehaviorMode) {
    if (mode === 'restore') {
        const position = getScrollPosition(url.href);
        window.scrollTo({
            left: position.x,
            top: position.y,
            behavior: 'instant' as ScrollBehavior,
        });
        return;
    }

    if (!url.hash) {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
        return;
    }

    const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
    if (target) {
        target.scrollIntoView({ behavior, block: 'start' });
    }
}

function runPageScripts() {
    document.querySelectorAll(scriptSelector).forEach((script: HTMLScriptElement) => {
        const src = script.getAttribute('src') || '';
        if (src.includes('/ts/main.') || src.includes('/ts/custom.')) return;
        if (script.dataset.stackExecuted === 'true') return;

        const nextScript = document.createElement('script');

        for (const attribute of Array.from(script.attributes)) {
            if (attribute.name === 'defer') continue;
            nextScript.setAttribute(attribute.name, attribute.value);
        }

        nextScript.dataset.stackExecuted = 'true';
        nextScript.textContent = script.textContent;
        script.replaceWith(nextScript);
    });
}

function reinitializePage() {
    window.Stack?.init();
    runPageScripts();
    window.dispatchEvent(new CustomEvent('stack:page-load'));
}

async function fetchDocument(url: URL, signal: AbortSignal) {
    const response = await fetch(url.href, {
        headers: {
            Accept: 'text/html',
            'X-Stack-Navigation': 'soft',
        },
        signal,
    });

    const isHTML = response.headers.get('content-type')?.includes('text/html');
    const canRenderResponse = response.ok || response.status === 404;

    if (!canRenderResponse || !isHTML) {
        throw new Error(`Unable to load ${url.href}`);
    }

    return parser.parseFromString(await response.text(), 'text/html');
}

async function swapPage(url: URL, historyBehavior: NavigationHistoryBehavior, scrollMode: ScrollBehaviorMode, signal: AbortSignal) {
    activeNavigationURL = url.href;
    document.documentElement.classList.add('is-page-transitioning');
    saveScrollPosition(renderedURL);

    const nextDocument = await fetchDocument(url, signal);

    const update = async () => {
        updateHead(nextDocument);
        replaceInlineStyles(nextDocument);
        replaceBody(nextDocument);
    };

    if (document.startViewTransition) {
        await document.startViewTransition(update).finished;
    }
    else {
        await update();
    }

    if (historyBehavior === 'push') {
        window.history.pushState(createHistoryState(), '', url);
    }
    else if (historyBehavior === 'replace') {
        window.history.replaceState({
            ...getCurrentHistoryState(),
            stackNavigation: true,
        }, '', url);
    }

    restoreScroll(url, scrollMode);
    reinitializePage();
    renderedURL = url.href;
    activeNavigationURL = null;
    document.documentElement.classList.remove('is-page-transitioning');
}

function navigate(url: URL, historyBehavior: NavigationHistoryBehavior = 'push', scrollMode: ScrollBehaviorMode = 'top') {
    pendingNavigation?.abort();
    pendingNavigation = new AbortController();

    return swapPage(url, historyBehavior, scrollMode, pendingNavigation.signal).catch((error) => {
        activeNavigationURL = null;
        document.documentElement.classList.remove('is-page-transitioning');
        if (error.name === 'AbortError') return;
        window.location.href = url.href;
    });
}

async function handleInterceptedNavigation(url: URL, navigationType: NavigateEvent['navigationType']) {
    pendingNavigation?.abort();
    pendingNavigation = new AbortController();

    try {
        await swapPage(url, 'auto', navigationType === 'traverse' ? 'restore' : 'top', pendingNavigation.signal);
    }
    catch (error) {
        activeNavigationURL = null;
        document.documentElement.classList.remove('is-page-transitioning');
        if (error instanceof Error && error.name === 'AbortError') return;
        window.location.href = url.href;
    }
}

function setupClickFallback() {
    document.addEventListener('click', (event) => {
        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

        const anchor = (event.target as HTMLElement).closest('a[href]') as HTMLAnchorElement | null;
        if (!anchor) return;
        if (anchor.target || anchor.download || anchor.hasAttribute('data-no-soft-navigation')) return;

        const url = new URL(anchor.href, window.location.href);
        if (!shouldHandleURL(url)) return;

        event.preventDefault();
        navigate(url);
    });
}

function setupNavigationAPI() {
    if (!window.navigation) return false;

    window.navigation.addEventListener('navigate', (event) => {
        if (!event.canIntercept || event.hashChange || event.downloadRequest || event.formData) return;
        if (event.destination?.sameDocument) return;

        const url = new URL(event.destination?.url || window.location.href);
        if (!shouldHandleURL(url)) return;

        event.intercept({
            scroll: 'manual',
            focusReset: 'after-transition',
            handler: async () => {
                await handleInterceptedNavigation(url, event.navigationType);
            },
        });
    });

    return true;
}

function setupPopstateFallback() {
    window.addEventListener('popstate', () => {
        const url = new URL(window.location.href);
        if (!shouldHandleURL(url, true)) return;
        if (url.href === renderedURL || url.href === activeNavigationURL) return;

        navigate(url, 'replace', 'restore');
    });
}

export function setupPageTransitions() {
    if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
    }

    saveScrollPosition(renderedURL);
    setupScrollPositionTracking();

    window.history.replaceState({
        ...getCurrentHistoryState(),
        stackNavigation: true,
    }, '', window.location.href);

    const navigationAPIReady = setupNavigationAPI();
    if (!navigationAPIReady) {
        setupClickFallback();
    }

    setupPopstateFallback();
}
