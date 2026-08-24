export function setupStickySidebar() {
    document.querySelectorAll('.sidebar.sticky').forEach((element) => {
        const sidebar = element as HTMLElement;
        if (sidebar.dataset.stackStickyReady === 'true') return;

        sidebar.dataset.stackStickyReady = 'true';

        const updateStickyTop = () => {
            if (!sidebar.isConnected) return;

            const header = document.querySelector('[data-site-header]') as HTMLElement | null;
            const headerStyle = header ? window.getComputedStyle(header) : null;
            const stickyTop = headerStyle?.position === 'sticky'
                ? (header?.getBoundingClientRect().height || 0) + (Number.parseFloat(headerStyle.top) || 0) + 12
                : 0;
            const availableHeight = Math.max(0, window.innerHeight - stickyTop);
            const overflow = sidebar.offsetHeight - availableHeight;

            if (overflow <= 0) {
                sidebar.style.setProperty('--sidebar-sticky-top', `${stickyTop}px`);
                return;
            }

            const page = document.documentElement;
            const maxScroll = page.scrollHeight - window.innerHeight;
            const revealStart = Math.max(0, maxScroll - overflow);
            const revealProgress = Math.min(Math.max(window.scrollY - revealStart, 0), overflow);

            sidebar.style.setProperty('--sidebar-sticky-top', `${stickyTop - revealProgress}px`);
        };

        updateStickyTop();
        window.addEventListener('scroll', updateStickyTop, { passive: true });
        window.addEventListener('resize', updateStickyTop);

        if ('ResizeObserver' in window) {
            new ResizeObserver(updateStickyTop).observe(sidebar);
        }
    });
}
