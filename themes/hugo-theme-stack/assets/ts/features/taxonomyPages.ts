import { getTagGroup } from "ts/features/tagGroups";

export function setupTaxonomyPages() {
    document.querySelectorAll('.taxonomy-post-card:not([data-stack-card-ready])').forEach((card: HTMLElement) => {
        card.dataset.stackCardReady = 'true';
        card.addEventListener('click', (event) => {
            const target = event.target as HTMLElement;
            if (target.closest('a')) return;
            const link = card.querySelector('.taxonomy-post-card-link') as HTMLAnchorElement | null;
            if (link?.href) window.location.href = link.href;
        });
    });

    const tagPage = document.querySelector('[data-taxonomy-tags]:not([data-stack-taxonomy-ready])') as HTMLElement | null;

    if (tagPage) {
        tagPage.dataset.stackTaxonomyReady = 'true';

        const search = tagPage.querySelector('[data-tag-search]') as HTMLInputElement | null;
        const emptyState = tagPage.querySelector('[data-tag-empty]') as HTMLElement | null;
        const status = tagPage.querySelector('[data-tag-status]') as HTMLElement | null;
        const cloud = tagPage.querySelector('[data-tag-cloud]') as HTMLElement | null;
        const language = document.documentElement.lang.toLowerCase();

        const placeTagItems = () => {
            const source = tagPage.querySelector('[data-tag-source]') as HTMLElement | null;
            const indexItems = Array.from(tagPage.querySelectorAll('[data-tag-source] .tag-index-link, .tag-index-list .tag-index-link')) as HTMLElement[];
            indexItems.forEach((item) => {
                /// A tag page may set `reading` in its front matter to override the guessed row.
                const title = item.dataset.tagReading || item.dataset.tagTitle || item.textContent || '';
                const targetGroup = getTagGroup(title, language);
                const group = tagPage.querySelector(`[data-tag-group-key="${targetGroup}"] .tag-index-list`);
                if (!group) {
                    item.remove();
                    return;
                }
                group.append(item);
            });
            source?.remove();
        };

        const filterTags = () => {
            const query = (search?.value || '').trim().toLowerCase();

            const items = Array.from(tagPage.querySelectorAll('[data-tag-item]')) as HTMLElement[];
            items.forEach((item) => {
                const name = item.dataset.tagName || item.textContent?.toLowerCase() || '';
                item.classList.toggle('is-hidden', Boolean(query) && !name.includes(query));
            });

            /// Rows without a visible tag collapse, and their letter in the jump bar dims.
            let firstGroup = true;
            const groups = Array.from(tagPage.querySelectorAll('[data-tag-group]')) as HTMLElement[];
            groups.forEach((group) => {
                const hasVisibleTag = Boolean(group.querySelector('[data-tag-item]:not(.is-hidden)'));
                group.classList.toggle('is-empty', !hasVisibleTag);
                group.classList.toggle('is-first', hasVisibleTag && firstGroup);
                if (hasVisibleTag) firstGroup = false;

                const letter = tagPage.querySelector(`[data-tag-letter="${group.dataset.tagGroupKey}"]`);
                letter?.classList.toggle('is-empty', !hasVisibleTag);
                letter?.setAttribute('aria-disabled', hasVisibleTag ? 'false' : 'true');
            });

            cloud?.classList.toggle('is-empty', !cloud.querySelector('[data-tag-item]:not(.is-hidden)'));

            /// The directory lists every tag once, so its count is the number of matches.
            const matchCount = tagPage.querySelectorAll('.tag-index-link:not(.is-hidden)').length;
            if (status) {
                status.textContent = query ? (status.dataset.template || '#COUNT').replace('#COUNT', String(matchCount)) : '';
            }
            if (emptyState) emptyState.hidden = matchCount > 0;
        };

        placeTagItems();
        search?.addEventListener('input', filterTags);
        filterTags();
    }
}
