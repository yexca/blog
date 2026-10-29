export function setupLinks() {
    const root = document.querySelector('[data-links-page]:not([data-stack-links-ready])') as HTMLElement | null;
    if (!root) return;

    root.dataset.stackLinksReady = 'true';

    /// Friend sites go offline or move their avatars; hide the broken image so the initial behind it shows.
    root.querySelectorAll('.links-card-avatar img').forEach((img: HTMLImageElement) => {
        const markBroken = () => img.classList.add('is-broken');
        if (img.complete && img.naturalWidth === 0) markBroken();
        else img.addEventListener('error', markBroken, { once: true });
    });
}
