export function setupStickySidebar() {
    const sidebar = document.querySelector('.left-sidebar') as HTMLElement;
    if (!sidebar) return;
    if (sidebar.dataset.stackStickyReady === 'true') return;

    sidebar.dataset.stackStickyReady = 'true';

    const updateStickyTop = () => {
        const overflow = sidebar.offsetHeight - window.innerHeight;
        if (overflow <= 0) {
            sidebar.style.setProperty('--sidebar-sticky-top', '0px');
            return;
        }

        const page = document.documentElement;
        const maxScroll = page.scrollHeight - window.innerHeight;
        const revealStart = Math.max(0, maxScroll - overflow);
        const revealProgress = Math.min(Math.max(window.scrollY - revealStart, 0), overflow);

        sidebar.style.setProperty('--sidebar-sticky-top', `${-revealProgress}px`);
    };

    updateStickyTop();
    window.addEventListener('scroll', updateStickyTop, { passive: true });
    window.addEventListener('resize', updateStickyTop);

    if ('ResizeObserver' in window) {
        new ResizeObserver(updateStickyTop).observe(sidebar);
    }
}
