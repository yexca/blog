import { pinyinInitials } from "ts/data/tagInitials";

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

    const categoryPage = document.querySelector('[data-taxonomy-categories]:not([data-stack-taxonomy-ready])') as HTMLElement | null;

    if (categoryPage) {
        categoryPage.dataset.stackTaxonomyReady = 'true';

        const buttons = Array.from(categoryPage.querySelectorAll('[data-category-button]')) as HTMLButtonElement[];
        const panels = Array.from(categoryPage.querySelectorAll('[data-category-panel]')) as HTMLElement[];
        const categoryGrid = categoryPage.querySelector('[data-category-grid]') as HTMLElement | null;
        const expandButton = categoryPage.querySelector('[data-category-expand]') as HTMLButtonElement | null;
        const expandTitle = expandButton?.querySelector('.category-switch-title');
        const categoryItems = Array.from(categoryPage.querySelectorAll('[data-category-button], [data-category-link]')) as HTMLElement[];

        const activatePanel = (targetID: string) => {
            buttons.forEach((button) => {
                const isActive = button.dataset.categoryButton === targetID;
                button.classList.toggle('is-active', isActive);
                button.setAttribute('aria-selected', isActive ? 'true' : 'false');
            });

            panels.forEach((panel) => {
                const isActive = panel.dataset.categoryPanel === targetID;
                panel.classList.toggle('is-active', isActive);
                panel.hidden = !isActive;
            });
        };

        const setupCategoryCollapse = () => {
            if (!categoryGrid || !expandButton) return;

            const shouldCollapse = categoryItems.length >= 9;
            expandButton.setAttribute('aria-expanded', 'false');
            expandButton.hidden = !shouldCollapse;
            categoryGrid.classList.toggle('is-collapsed', shouldCollapse);
            if (expandTitle) {
                expandTitle.textContent = expandButton.dataset.expandText || expandTitle.textContent;
            }
        };

        if (!buttons.length || !panels.length) {
            setupCategoryCollapse();
            expandButton?.addEventListener('click', () => {
                if (!categoryGrid || !expandButton) return;
                const isExpanded = expandButton.getAttribute('aria-expanded') === 'true';
                categoryGrid.classList.toggle('is-collapsed', isExpanded);
                expandButton.setAttribute('aria-expanded', isExpanded ? 'false' : 'true');
                if (expandTitle) {
                    expandTitle.textContent = isExpanded
                        ? (expandButton.dataset.expandText || expandTitle.textContent)
                        : (expandButton.dataset.collapseText || expandTitle.textContent);
                }
            });
            return;
        }

        const setupCategoryPagination = (panel: HTMLElement) => {
            const pageSize = Number(panel.dataset.categoryPageSize || 12);
            const posts = Array.from(panel.querySelectorAll('[data-category-post]')) as HTMLElement[];
            const pagination = panel.querySelector('[data-category-pagination]') as HTMLElement | null;
            if (!pagination || !pageSize || posts.length <= pageSize) {
                if (pagination) pagination.hidden = true;
                posts.forEach((post) => post.classList.remove('is-hidden'));
                return;
            }

            let currentPage = 1;
            const totalPages = Math.ceil(posts.length / pageSize);

            const renderPage = () => {
                posts.forEach((post, index) => {
                    const page = Math.floor(index / pageSize) + 1;
                    post.classList.toggle('is-hidden', page !== currentPage);
                });

                pagination.innerHTML = '';
                for (let page = 1; page <= totalPages; page++) {
                    const button = document.createElement('button');
                    button.type = 'button';
                    button.classList.add('taxonomy-page-button');
                    button.classList.toggle('is-active', page === currentPage);
                    button.setAttribute('aria-label', `Page ${page}`);
                    button.textContent = String(page);
                    button.addEventListener('click', () => {
                        currentPage = page;
                        renderPage();
                        panel.scrollIntoView({ block: 'start', behavior: 'smooth' });
                    });
                    pagination.append(button);
                }

                pagination.hidden = false;
            };

            renderPage();
        };

        buttons.forEach((button) => {
            button.addEventListener('click', () => {
                if (!button.dataset.categoryButton) return;
                activatePanel(button.dataset.categoryButton);
            });
        });

        expandButton?.addEventListener('click', () => {
            if (!categoryGrid || !expandButton) return;
            const isExpanded = expandButton.getAttribute('aria-expanded') === 'true';
            categoryGrid.classList.toggle('is-collapsed', isExpanded);
            expandButton.setAttribute('aria-expanded', isExpanded ? 'false' : 'true');
            if (expandTitle) {
                expandTitle.textContent = isExpanded
                    ? (expandButton.dataset.expandText || expandTitle.textContent)
                    : (expandButton.dataset.collapseText || expandTitle.textContent);
            }
        });

        panels.forEach(setupCategoryPagination);
        setupCategoryCollapse();
    }

    const tagPage = document.querySelector('[data-taxonomy-tags]:not([data-stack-taxonomy-ready])') as HTMLElement | null;

    if (tagPage) {
        tagPage.dataset.stackTaxonomyReady = 'true';

        const search = tagPage.querySelector('[data-tag-search]') as HTMLInputElement | null;
        const emptyState = tagPage.querySelector('[data-tag-empty]') as HTMLElement | null;
        const language = document.documentElement.lang.toLowerCase();

        const getChineseGroup = (title: string) => {
            const first = title.trim().charAt(0);
            const latin = first.normalize('NFD').replace(/[\u0300-\u036f]/g, '').charAt(0).toUpperCase();
            if (/^[A-Z]$/.test(latin)) return latin;
            for (const [initial, chars] of Object.entries(pinyinInitials)) {
                if (chars.includes(first)) return initial.toUpperCase();
            }
            return '#';
        };

        const getJapaneseGroup = (title: string) => {
            const first = title.trim().charAt(0);
            const normalized = first.normalize('NFKC');
            const code = normalized.charCodeAt(0);
            const kana = code >= 0x30a1 && code <= 0x30f6
                ? String.fromCharCode(code - 0x60)
                : normalized;
            if ('あいうえおぁぃぅぇぉ'.includes(kana)) return 'あ';
            if ('かきくけこがぎぐげご'.includes(kana)) return 'か';
            if ('さしすせそざじずぜぞ'.includes(kana)) return 'さ';
            if ('たちつてとだぢづでど'.includes(kana)) return 'た';
            if ('なにぬねの'.includes(kana)) return 'な';
            if ('はひふへほばびぶべぼぱぴぷぺぽ'.includes(kana)) return 'は';
            if ('まみむめも'.includes(kana)) return 'ま';
            if ('やゆよゃゅょ'.includes(kana)) return 'や';
            if ('らりるれろ'.includes(kana)) return 'ら';
            if ('わをん'.includes(kana)) return 'わ';
            const latin = normalized.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
            if (/^[A-Z]$/.test(latin)) return latin;
            return '#';
        };

        const getTagGroup = (title: string) => {
            if (language.startsWith('ja')) return getJapaneseGroup(title);
            if (language.startsWith('zh')) return getChineseGroup(title);

            const first = title.trim().charAt(0).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
            return /^[A-Z]$/.test(first) ? first : '#';
        };

        const placeTagItems = () => {
            const source = tagPage.querySelector('[data-tag-source]') as HTMLElement | null;
            const indexItems = Array.from(tagPage.querySelectorAll('[data-tag-source] .tag-index-link, .tag-index-list .tag-index-link')) as HTMLElement[];
            indexItems.forEach((item) => {
                const title = item.dataset.tagTitle || item.textContent || '';
                const targetGroup = getTagGroup(title);
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
            let visibleCount = 0;

            const items = Array.from(tagPage.querySelectorAll('[data-tag-item]')) as HTMLElement[];
            items.forEach((item) => {
                const name = item.dataset.tagName || item.textContent?.toLowerCase() || '';
                const isVisible = !query || name.includes(query);
                item.classList.toggle('is-hidden', !isVisible);
                if (isVisible) visibleCount++;
            });

            const groups = Array.from(tagPage.querySelectorAll('[data-tag-group]')) as HTMLElement[];
            groups.forEach((group) => {
                const hasVisibleTag = Boolean(group.querySelector('[data-tag-item]:not(.is-hidden)'));
                group.classList.toggle('is-empty', !hasVisibleTag);
            });

            if (emptyState) emptyState.hidden = visibleCount > 0;
        };

        placeTagItems();
        search?.addEventListener('input', filterTags);
        filterTags();
    }
}
