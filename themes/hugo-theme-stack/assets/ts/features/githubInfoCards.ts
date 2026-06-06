export function setupGithubInfoCards() {
    const cards = document.querySelectorAll('.github-info-card:not([data-stack-github-ready])');

    cards.forEach((card: HTMLElement) => {
        card.dataset.stackGithubReady = 'true';

        const author = card.dataset.author || '';
        const project = card.dataset.project || '';
        const description = card.querySelector('.github-info-card-description') as HTMLElement | null;
        const homepageRow = card.querySelector('.github-info-card-homepage') as HTMLElement | null;
        const stars = card.querySelector('.github-info-card-stars') as HTMLElement | null;
        const forks = card.querySelector('.github-info-card-forks') as HTMLElement | null;
        const isMini = card.classList.contains('github-info-card-mini');
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
                description.textContent = repo.description || text.noDescription;

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
            })
            .catch((error) => {
                description.textContent = error.message === 'not-found'
                    ? text.notFound
                    : text.failed;
            });
    });
}
