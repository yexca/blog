export function setupArchives() {
    const root = document.querySelector('[data-archive-stage]:not([data-stack-archives-ready])') as HTMLElement | null;
    if (!root) return;

    root.dataset.stackArchivesReady = 'true';

    const defaultYear = root.dataset.defaultYear;
    const nav = root.querySelector('[data-archive-years]') as HTMLElement | null;
    const panels = Array.from(root.querySelectorAll('[data-archive-panel]')) as HTMLElement[];
    const links = Array.from(root.querySelectorAll('[data-archive-year]')) as HTMLAnchorElement[];
    const monthLinks = Array.from(root.querySelectorAll('[data-archive-month]')) as HTMLAnchorElement[];
    const years = panels.map((panel) => panel.dataset.archivePanel).filter(Boolean) as string[];
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let activeYear: string | null = null;

    const isCurrentArchive = () => document.contains(root);

    /// The hash is either `#YYYY` or `#YYYY-MM` (a month inside that year).
    function parseHash() {
        const hash = decodeURIComponent(window.location.hash.replace('#', ''));
        const [year, month] = hash.split('-');
        if (!years.includes(year)) return { year: defaultYear, month: undefined };
        return { year, month: month ? hash : undefined };
    }

    function revealActiveLink(link: HTMLElement) {
        if (!nav || nav.scrollWidth <= nav.clientWidth) return;
        const target = link.offsetLeft - (nav.clientWidth - link.offsetWidth) / 2;
        nav.scrollTo({ left: target, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
    }

    /// On narrow screens the contribution graph scrolls; bring the year's latest post day into view.
    function revealLatestDay(panel: HTMLElement) {
        const graph = panel.querySelector('.archive-graph') as HTMLElement | null;
        if (!graph || graph.scrollWidth <= graph.clientWidth) return;
        const days = panel.querySelectorAll('.archive-graph-days a');
        const latest = days[days.length - 1] as HTMLElement | undefined;
        if (!latest) return;
        const overflow = latest.getBoundingClientRect().right - graph.getBoundingClientRect().right;
        if (overflow > 0) graph.scrollLeft += overflow + 24;
    }

    function showYear(year: string | undefined, animate: boolean) {
        if (!year || !years.includes(year)) year = defaultYear;
        if (!year || year === activeYear) return;
        activeYear = year;

        panels.forEach((panel) => {
            const isActive = panel.dataset.archivePanel === year;
            panel.hidden = !isActive;
            panel.classList.remove('is-entering');
            if (!isActive) return;
            revealLatestDay(panel);
            if (animate) {
                // Restart the entry animation even when switching back to a recent year.
                void panel.offsetWidth;
                panel.classList.add('is-entering');
            }
        });

        links.forEach((link) => {
            const isActive = link.dataset.archiveYear === year;
            link.classList.toggle('is-active', isActive);
            if (isActive) {
                link.setAttribute('aria-current', 'page');
                revealActiveLink(link);
            } else {
                link.removeAttribute('aria-current');
            }
        });
    }

    function scrollToMonth(month: string, smooth: boolean) {
        const target = document.getElementById(month);
        if (!target || target.closest('[hidden]')) return;
        target.scrollIntoView({ behavior: smooth && !reduceMotion.matches ? 'smooth' : 'auto', block: 'start' });
    }

    function applyHash(animate: boolean) {
        if (!isCurrentArchive()) return;
        const { year, month } = parseHash();
        showYear(year, animate);
        if (month) scrollToMonth(month, animate);
    }

    function navigate(hash: string) {
        if (window.location.hash !== `#${hash}`) {
            history.pushState(null, '', `#${hash}`);
        }
        applyHash(true);
    }

    links.forEach((link) => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            if (link.dataset.archiveYear) navigate(link.dataset.archiveYear);
        });
    });

    monthLinks.forEach((link) => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            if (link.dataset.archiveMonth) navigate(link.dataset.archiveMonth);
        });
    });

    // Left/Right step through years while a year link has focus.
    nav?.addEventListener('keydown', (event) => {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
        const index = links.findIndex((link) => link === document.activeElement);
        if (index < 0) return;
        const next = links[index + (event.key === 'ArrowRight' ? 1 : -1)];
        if (!next) return;
        event.preventDefault();
        next.focus();
        next.click();
    });

    applyHash(false);
    window.addEventListener('hashchange', () => applyHash(true));
}
