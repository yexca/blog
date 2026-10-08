/// Content scrolled under the sticky Header is cut off by a copy of the page background
/// (html::after in base.scss) at the line where the sticky sidebars stop. For each card
/// crossing that line, this draws a "cap": the card's rounded, bordered top edge with its
/// glass surface, hiding the first --content-clip-gap of the card so the text keeps a
/// margin from the edge. The background band is widened under every cap so the cap's
/// backdrop blur sees the page background instead of the text it covers.
/// Without this script the band still cuts content at the line, just without the cap.

/// Card surfaces that can scroll through the line (glass cards from base.scss plus the
/// bordered related-posts list). Nested matches are skipped in favour of the outer card.
const cardQuery = [
    '.main-article',
    '.article-list article',
    '.article-list--compact',
    '.section-card',
    '.sidebar-panel',
    '.widget--toc',
    '.widget.archives .widget-archive--list',
    '.related-content-list',
    '.comment-container',
    '.archive-page-card',
    '.glass-card',
    '.not-found-card',
    '.pagination',
    'footer.site-footer',
].map((selector) => `.page-columns ${selector}`).join(', ');

/// The Header sits 12px above the line, as in --site-header-scroll-offset.
const headerGap = 12;

let container: HTMLElement | null = null;
let frame = 0;
let lastBand = '';

function getContainer() {
    if (!container || !container.isConnected) {
        container = document.createElement('div');
        container.className = 'content-clip-caps';
        container.setAttribute('aria-hidden', 'true');
        document.body.append(container);
    }

    return container;
}

function setBand(value: string) {
    if (value === lastBand) return;
    lastBand = value;

    if (value) document.documentElement.style.setProperty('--content-clip-band', value);
    else document.documentElement.style.removeProperty('--content-clip-band');
}

function update() {
    frame = 0;

    const header = document.querySelector('[data-site-header]') as HTMLElement | null;
    if (!header || window.getComputedStyle(header).position !== 'sticky') {
        setBand('');
        container?.replaceChildren();
        return;
    }

    const line = header.getBoundingClientRect().bottom + headerGap;
    const rootStyle = window.getComputedStyle(document.documentElement);
    const gap = Number.parseFloat(rootStyle.getPropertyValue('--content-clip-gap')) || 0;
    /// The band's box starts --viewport-overscan above the viewport (base.scss), and the
    /// polygon is in that box's coordinates.
    const overscan = Number.parseFloat(rootStyle.getPropertyValue('--viewport-overscan')) || 0;
    const bandLine = line + overscan;

    const crossing: { card: Element, rect: DOMRect }[] = [];
    document.querySelectorAll(cardQuery).forEach((card) => {
        if (crossing.some((item) => item.card.contains(card))) return;

        const rect = card.getBoundingClientRect();
        if (rect.width > 0 && rect.top < line - 0.5 && rect.bottom > line) crossing.push({ card, rect });
    });

    const caps = getContainer();
    while (caps.children.length > crossing.length) caps.lastElementChild!.remove();
    while (caps.children.length < crossing.length) {
        const cap = document.createElement('div');
        cap.className = 'content-clip-cap';
        caps.append(cap);
    }

    /// The band polygon runs along the line from right to left and dips around each cap.
    const dips: string[] = [];
    crossing
        .sort((a, b) => b.rect.left - a.rect.left)
        .forEach(({ card, rect }, index) => {
            const cap = caps.children[index] as HTMLElement;
            const height = Math.min(gap, rect.bottom - line);
            const ending = rect.bottom - line <= gap;
            const radius = window.getComputedStyle(card).borderTopLeftRadius;

            cap.classList.toggle('is-ending', ending);
            cap.style.top = `${line}px`;
            cap.style.left = `${rect.left}px`;
            cap.style.width = `${rect.width}px`;
            cap.style.height = `${height}px`;
            cap.style.borderRadius = ending ? radius : `${radius} ${radius} 0 0`;

            const bottom = bandLine + height;
            dips.push(`${rect.right}px ${bandLine}px, ${rect.right}px ${bottom}px, ${rect.left}px ${bottom}px, ${rect.left}px ${bandLine}px`);
        });

    setBand(dips.length
        ? `polygon(0 0, 100% 0, 100% ${bandLine}px, ${dips.join(', ')}, 0 ${bandLine}px)`
        : '');
}

function scheduleUpdate() {
    if (!frame) frame = window.requestAnimationFrame(update);
}

export function setupContentClip() {
    if (document.documentElement.dataset.stackContentClipReady !== 'true') {
        document.documentElement.dataset.stackContentClipReady = 'true';
        window.addEventListener('scroll', scheduleUpdate, { passive: true });
        window.addEventListener('resize', scheduleUpdate);
    }

    /// Also runs after soft navigation swapped the page content.
    scheduleUpdate();
}
