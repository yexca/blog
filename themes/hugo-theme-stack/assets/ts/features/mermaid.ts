type MermaidApi = {
    initialize: (config: {
        startOnLoad: boolean;
        securityLevel: 'strict';
        theme: 'default' | 'dark';
    }) => void;
    run: (options: {
        nodes: HTMLElement[];
        suppressErrors: boolean;
    }) => Promise<void>;
};

declare global {
    interface Window {
        StackMermaid?: MermaidApi;
    }
}

const mermaidUrl = 'https://cdn.jsdelivr.net/npm/mermaid@11.16.1/dist/mermaid.esm.min.mjs';
const mermaidSelector = '.article-content .mermaid';

let loadingPromise: Promise<MermaidApi> | null = null;
let renderQueue = Promise.resolve();
const queuedNodes = new Set<HTMLElement>();
let colorSchemeListenerBound = false;

function getMermaidNodes(root: ParentNode = document) {
    if (root instanceof Element && root.matches(mermaidSelector)) {
        return [root as HTMLElement];
    }

    return Array.from(root.querySelectorAll(mermaidSelector)) as HTMLElement[];
}

function rememberSource(node: HTMLElement) {
    if (node.dataset.stackMermaidSource === undefined) {
        node.dataset.stackMermaidSource = node.textContent || '';
    }

    return node.dataset.stackMermaidSource;
}

function restoreSource(node: HTMLElement) {
    node.removeAttribute('data-processed');
    node.classList.remove('is-mermaid-error');
    node.dataset.stackMermaidRendered = 'false';
    node.textContent = rememberSource(node);
}

function markRenderError(node: HTMLElement) {
    restoreSource(node);
    node.classList.add('is-mermaid-error');
}

function loadMermaid() {
    if (window.StackMermaid) return Promise.resolve(window.StackMermaid);
    if (loadingPromise) return loadingPromise;

    loadingPromise = new Promise<MermaidApi>((resolve, reject) => {
        const cleanup = () => {
            window.removeEventListener('stack:mermaid-ready', handleReady);
            window.removeEventListener('stack:mermaid-error', handleError);
        };

        const handleReady = () => {
            cleanup();
            if (window.StackMermaid) {
                resolve(window.StackMermaid);
            }
            else {
                reject(new Error('Mermaid loaded without exposing its API'));
            }
        };

        const handleError = (event: Event | Error) => {
            cleanup();
            if (event instanceof Error) {
                reject(event);
                return;
            }

            const detail = (event as CustomEvent<unknown>).detail;
            reject(detail instanceof Error ? detail : new Error('Failed to load Mermaid'));
        };

        window.addEventListener('stack:mermaid-ready', handleReady, { once: true });
        window.addEventListener('stack:mermaid-error', handleError as EventListener, { once: true });

        const loader = document.createElement('script');
        loader.type = 'module';
        loader.dataset.stackMermaidLoader = 'true';
        loader.dataset.stackExecuted = 'true';
        loader.addEventListener('error', () => handleError(new Error('Failed to load Mermaid module')), { once: true });
        loader.textContent = `
            (async () => {
                try {
                    const module = await import(${JSON.stringify(mermaidUrl)});
                    window.StackMermaid = module.default;
                    window.dispatchEvent(new Event('stack:mermaid-ready'));
                }
                catch (error) {
                    window.dispatchEvent(new CustomEvent('stack:mermaid-error', { detail: error }));
                }
            })();
        `;
        document.head.append(loader);
    });

    return loadingPromise;
}

async function renderNodes(nodes: HTMLElement[]) {
    if (!nodes.length) return;

    const mermaid = await loadMermaid();
    const theme = document.documentElement.dataset.scheme === 'dark' ? 'dark' : 'default';

    mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'strict',
        theme,
    });

    for (const node of nodes) {
        if (!document.contains(node)) continue;

        restoreSource(node);

        try {
            await mermaid.run({
                nodes: [node],
                suppressErrors: true,
            });

            const svg = node.querySelector('svg');
            if (!svg || svg.querySelector('.error-icon, .error-text')) {
                throw new Error('Mermaid did not produce an SVG');
            }

            node.dataset.stackMermaidRendered = 'true';
        }
        catch (error) {
            markRenderError(node);
            console.warn('Unable to render Mermaid diagram', error);
        }
    }
}

function queueRender(nodes: HTMLElement[]) {
    const pending = nodes.filter((node) => document.contains(node) && !queuedNodes.has(node));
    if (!pending.length) return;

    pending.forEach((node) => queuedNodes.add(node));
    renderQueue = renderQueue.then(async () => {
        try {
            await renderNodes(pending);
        }
        catch (error) {
            pending.forEach(markRenderError);
            console.warn('Unable to initialize Mermaid', error);
        }
        finally {
            pending.forEach((node) => queuedNodes.delete(node));
        }
    });
}

function bindColorSchemeListener() {
    if (colorSchemeListenerBound) return;

    colorSchemeListenerBound = true;
    window.addEventListener('onColorSchemeChange', () => {
        const nodes = getMermaidNodes();
        if (nodes.length) queueRender(nodes);
    });
}

export function setupMermaid(root: ParentNode = document) {
    const nodes = getMermaidNodes(root);
    if (!nodes.length) return;

    bindColorSchemeListener();
    nodes.forEach(rememberSource);

    const pending = nodes.filter((node) => node.dataset.stackMermaidRendered !== 'true');
    if (pending.length) queueRender(pending);
}
