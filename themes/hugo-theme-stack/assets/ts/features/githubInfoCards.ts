type GithubCacheEntry = {
    expires: number;
    ok: boolean;
    data?: any;
    error?: string;
};

const successTtl = 60 * 60 * 1000;
const failureTtl = 5 * 60 * 1000;

function getCache(key: string): GithubCacheEntry | null {
    try {
        const raw = sessionStorage.getItem(key);
        if (!raw) return null;
        const cache = JSON.parse(raw) as GithubCacheEntry;
        if (cache.expires <= Date.now()) {
            sessionStorage.removeItem(key);
            return null;
        }
        return cache;
    }
    catch (_) {
        return null;
    }
}

function setCache(key: string, entry: GithubCacheEntry) {
    try {
        sessionStorage.setItem(key, JSON.stringify(entry));
    }
    catch (_) {
        /// Ignore storage quota and privacy-mode failures.
    }
}

function renderRepo(card: HTMLElement, repo: any, text: Record<string, string>) {
    const description = card.querySelector('.github-info-card-description') as HTMLElement | null;
    const homepageRow = card.querySelector('.github-info-card-homepage') as HTMLElement | null;
    const stars = card.querySelector('.github-info-card-stars') as HTMLElement | null;
    const forks = card.querySelector('.github-info-card-forks') as HTMLElement | null;
    const isMini = card.classList.contains('github-info-card-mini');

    if (description) description.textContent = repo.description || text.noDescription;

    if (repo.homepage && !isMini) {
        const homepage = document.createElement('a');
        homepage.href = repo.homepage;
        homepage.target = '_blank';
        homepage.rel = 'noopener noreferrer';
        homepage.classList.add('link');
        homepage.textContent = repo.homepage;
        homepageRow?.querySelector('a')?.remove();
        homepageRow?.append(homepage);
        homepageRow?.removeAttribute('hidden');
    }
    else if (homepageRow) {
        homepageRow.setAttribute('hidden', '');
        homepageRow.querySelector('a')?.remove();
    }

    if (stars) stars.textContent = String(repo.stargazers_count ?? '-');
    if (forks) forks.textContent = String(repo.forks_count ?? '-');
}

function renderError(card: HTMLElement, error: string, text: Record<string, string>) {
    const description = card.querySelector('.github-info-card-description') as HTMLElement | null;
    if (!description) return;

    description.textContent = error === 'not-found'
        ? text.notFound
        : text.failed;
}

function setupCard(card: HTMLElement) {
    const author = card.dataset.author || '';
    const project = card.dataset.project || '';
    const description = card.querySelector('.github-info-card-description') as HTMLElement | null;
    const stars = card.querySelector('.github-info-card-stars') as HTMLElement | null;
    const forks = card.querySelector('.github-info-card-forks') as HTMLElement | null;
    const text = {
        loading: card.dataset.textLoading || 'Loading...',
        missingRepo: card.dataset.textMissingRepo || 'Missing repository name',
        noDescription: card.dataset.textNoDescription || 'No description',
        notFound: card.dataset.textNotFound || 'Repository not found',
        failed: card.dataset.textFailed || 'Failed to get repository information',
    };

    if (!author || !project || !description) {
        if (description) description.textContent = text.missingRepo;
        return;
    }

    const cacheKey = `stack:github:${author}/${project}`;
    const cache = getCache(cacheKey);
    if (cache?.ok && cache.data) {
        renderRepo(card, cache.data, text);
        return;
    }
    if (cache && !cache.ok) {
        renderError(card, cache.error || 'request-failed', text);
        return;
    }

    description.textContent = text.loading;
    if (stars) stars.textContent = '-';
    if (forks) forks.textContent = '-';

    fetch(`https://api.github.com/repos/${encodeURIComponent(author)}/${encodeURIComponent(project)}`, {
        headers: { Accept: 'application/vnd.github+json' },
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error(response.status === 404 ? 'not-found' : 'request-failed');
            }
            return response.json();
        })
        .then((repo) => {
            setCache(cacheKey, { ok: true, data: repo, expires: Date.now() + successTtl });
            renderRepo(card, repo, text);
        })
        .catch((error) => {
            const message = error.message === 'not-found' ? 'not-found' : 'request-failed';
            setCache(cacheKey, { ok: false, error: message, expires: Date.now() + failureTtl });
            renderError(card, message, text);
        });
}

export function setupGithubInfoCards(root: ParentNode = document) {
    const cards = Array.from(root.querySelectorAll('.github-info-card:not([data-stack-github-ready])')) as HTMLElement[];
    if (!cards.length) return;

    const observer = 'IntersectionObserver' in window
        ? new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const card = entry.target as HTMLElement;
                observer.unobserve(card);
                setupCard(card);
            });
        }, { rootMargin: '200px' })
        : null;

    cards.forEach((card) => {
        card.dataset.stackGithubReady = 'true';
        if (observer) observer.observe(card);
        else setupCard(card);
    });
}
