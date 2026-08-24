interface pageData {
    title: string,
    date: string,
    permalink: string,
    content?: string,
    summary?: string,
    description?: string,
    tags?: string[],
    categories?: string[],
    keywords?: string[],
    image?: string,
    preview?: string,
    matchCount?: number,
    rank?: searchRank
}

interface match {
    start: number,
    end: number
}

interface searchRank {
    titleTerms: number,
    titleMatches: number,
    contentTerms: number,
    contentMatches: number,
    metaTerms: number,
    metaMatches: number,
    matchedTerms: number
}

interface keywordPattern {
    key: string,
    regex: RegExp
}

interface fieldMatches {
    matches: match[],
    keywords: Set<string>
}

/**
 * Escape HTML tags as HTML entities.
 * Edited from:
 * @link https://stackoverflow.com/a/5499821
 */
const tagsToReplace: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    '…': '&hellip;'
};

function replaceTag(tag: string): string {
    return tagsToReplace[tag] || tag;
}

function replaceHTMLEnt(str: string = ''): string {
    return str.replace(/[&<>"…]/g, replaceTag);
}

function escapeRegExp(string: string): string {
    return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&');
}

function isCjkCharacter(character: string): boolean {
    return /[\u2e80-\u2fff\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uac00-\ud7af]/u.test(character);
}

function isLatinOrNumber(character: string): boolean {
    return /[A-Za-z0-9]/.test(character);
}

function allowsCjkLatinSpacing(left: string, right: string): boolean {
    return (isCjkCharacter(left) && isLatinOrNumber(right))
        || (isLatinOrNumber(left) && isCjkCharacter(right));
}

/**
 * Make whitespace optional only at a CJK/Latin boundary. This keeps normal
 * space-separated OR terms intact while matching both "学习Linux" and
 * "学习 Linux" for a mixed term.
 */
function createKeywordSource(keyword: string): string {
    const characters = Array.from(keyword);
    return characters.map((character, index) => {
        if (index > 0 && allowsCjkLatinSpacing(characters[index - 1], character)) {
            return `\\s*${escapeRegExp(character)}`;
        }
        return escapeRegExp(character);
    }).join('');
}

function splitKeywords(query: string): string[] {
    const seen = new Set<string>();
    const result: string[] = [];
    const characters = Array.from(query.trim());
    let normalizedQuery = '';

    for (let index = 0; index < characters.length; index++) {
        const character = characters[index];
        if (!/\s/u.test(character)) {
            normalizedQuery += character;
            continue;
        }

        let nextIndex = index + 1;
        while (nextIndex < characters.length && /\s/u.test(characters[nextIndex])) nextIndex++;

        const left = normalizedQuery.slice(-1);
        const right = characters[nextIndex] || '';
        if (!left || !right || !allowsCjkLatinSpacing(left, right)) normalizedQuery += ' ';
        index = nextIndex - 1;
    }

    for (const value of normalizedQuery.split(/\s+/)) {
        const keyword = value.trim();
        const key = keyword.toLocaleLowerCase();
        if (!keyword || seen.has(key)) continue;
        seen.add(key);
        result.push(keyword);
    }

    return result;
}

function collectMatches(text: string, pattern: keywordPattern): match[] {
    if (!text) return [];

    const matches: match[] = [];
    for (const found of Array.from(text.matchAll(pattern.regex))) {
        if (found.index === undefined) continue;
        matches.push({
            start: found.index,
            end: found.index + found[0].length
        });
    }

    return matches;
}

function collectFieldMatches(text: string, patterns: keywordPattern[]): fieldMatches {
    const matches: match[] = [];
    const keywords = new Set<string>();

    for (const pattern of patterns) {
        const patternMatches = collectMatches(text, pattern);
        if (patternMatches.length > 0) keywords.add(pattern.key);
        matches.push(...patternMatches);
    }

    return { matches, keywords };
}

function mergeKeywords(...fields: fieldMatches[]): Set<string> {
    const result = new Set<string>();
    fields.forEach(field => field.keywords.forEach(keyword => result.add(keyword)));
    return result;
}

class Search {
    private data: pageData[] = [];
    private results: pageData[] = [];
    private form: HTMLFormElement;
    private input: HTMLInputElement;
    private list: HTMLDivElement;
    private resultTitle: HTMLHeadingElement;
    private resultTitleTemplate: string;
    private pagination: HTMLElement | null;
    private pageLinks: HTMLElement | null;
    private previousButton: HTMLButtonElement | null;
    private nextButton: HTMLButtonElement | null;
    private pageStatus: HTMLElement | null;
    private pageStatusTemplate: string;
    private pageSize: number;
    private currentPage = 1;
    private lastSearch = '';
    private searchGeneration = 0;

    constructor({ form, input, list, resultTitle, pagination, resultTitleTemplate }) {
        this.form = form;
        this.input = input;
        this.list = list;
        this.resultTitle = resultTitle;
        this.pagination = pagination;
        this.pageLinks = pagination?.querySelector('[data-search-page-links]') || null;
        this.previousButton = pagination?.querySelector('[data-search-prev]') as HTMLButtonElement | null;
        this.nextButton = pagination?.querySelector('[data-search-next]') as HTMLButtonElement | null;
        this.pageStatus = pagination?.querySelector('[data-search-page-status]') || null;
        this.pageStatusTemplate = pagination?.getAttribute('data-page-status-template') || 'Page #CURRENT_PAGE / #TOTAL_PAGES';
        this.pageSize = Math.max(1, Number(pagination?.getAttribute('data-page-size') || 10));
        this.resultTitleTemplate = resultTitleTemplate || '#PAGES_COUNT results (#TIME_SECONDS seconds)';

        /// A 404 page supplies the path-derived value directly; the search page
        /// reads its initial value from the URL instead.
        if (this.input.value.trim() !== '') {
            const initialQuery = this.input.value.trim();
            this.lastSearch = initialQuery;
            this.doSearch(initialQuery, this.getPageFromURL());
        }
        else {
            this.handleQueryString();
        }

        this.bindQueryStringChange();
        this.bindSearchForm();
        this.bindPagination();
    }

    /**
     * Processes search matches.
     * @param str original text
     * @param matches array of matches
     * @param ellipsis whether to add ellipsis to the end of each match
     * @param charLimit max length of preview string
     * @param offset how many characters before and after the match to include in preview
     * @returns preview string
     */
    private static processMatches(str: string, matches: match[], ellipsis: boolean = true, charLimit = 140, offset = 20): string {
        matches.sort((a, b) => a.start - b.start);

        let i = 0,
            lastIndex = 0,
            charCount = 0;

        const resultArray: string[] = [];

        while (i < matches.length) {
            const item = matches[i];

            if (ellipsis && item.start - offset > lastIndex) {
                resultArray.push(`${replaceHTMLEnt(str.substring(lastIndex, lastIndex + offset))} [...] `);
                resultArray.push(`${replaceHTMLEnt(str.substring(item.start - offset, item.start))}`);
                charCount += offset * 2;
            }
            else {
                resultArray.push(replaceHTMLEnt(str.substring(lastIndex, item.start)));
                charCount += item.start - lastIndex;
            }

            let j = i + 1,
                end = item.end;

            while (j < matches.length && matches[j].start <= end) {
                end = Math.max(matches[j].end, end);
                ++j;
            }

            resultArray.push(`<mark>${replaceHTMLEnt(str.substring(item.start, end))}</mark>`);
            charCount += end - item.start;

            i = j;
            lastIndex = end;

            if (ellipsis && charCount > charLimit) break;
        }

        if (lastIndex < str.length) {
            let end = str.length;
            if (ellipsis) end = Math.min(end, lastIndex + offset);

            resultArray.push(`${replaceHTMLEnt(str.substring(lastIndex, end))}`);

            if (ellipsis && end !== str.length) resultArray.push(' [...]');
        }

        return resultArray.join('');
    }

    private async searchKeywords(keywords: string[]): Promise<pageData[]> {
        const rawData = await this.getData();
        const results: pageData[] = [];
        const patterns: keywordPattern[] = [];

        for (const keyword of keywords) {
            const key = keyword.toLocaleLowerCase();
            const source = createKeywordSource(keyword);
            if (!source || patterns.some(pattern => pattern.key === key)) continue;
            patterns.push({ key, regex: new RegExp(source, 'giu') });
        }

        if (!patterns.length) return results;

        for (const item of rawData) {
            const titleText = item.title || '';
            const contentText = item.content || '';
            const summaryText = item.summary || '';
            const descriptionText = item.description || '';
            const searchableMeta = [
                ...(item.tags || []),
                ...(item.categories || []),
                ...(item.keywords || [])
            ].join(' ');

            const titleMatches = collectFieldMatches(titleText, patterns);
            const contentMatches = collectFieldMatches(contentText, patterns);
            const summaryMatches = collectFieldMatches(summaryText, patterns);
            const descriptionMatches = collectFieldMatches(descriptionText, patterns);
            const metaMatches = collectFieldMatches(searchableMeta, patterns);
            const contentKeywords = mergeKeywords(contentMatches, summaryMatches, descriptionMatches);
            const matchedKeywords = mergeKeywords(titleMatches, contentMatches, summaryMatches, descriptionMatches, metaMatches);

            if (matchedKeywords.size === 0) continue;

            const result: pageData = {
                ...item,
                title: replaceHTMLEnt(titleText),
                preview: '',
                matchCount: titleMatches.matches.length
                    + contentMatches.matches.length
                    + summaryMatches.matches.length
                    + descriptionMatches.matches.length
                    + metaMatches.matches.length,
                rank: {
                    titleTerms: titleMatches.keywords.size,
                    titleMatches: titleMatches.matches.length,
                    contentTerms: contentKeywords.size,
                    contentMatches: contentMatches.matches.length
                        + summaryMatches.matches.length
                        + descriptionMatches.matches.length,
                    metaTerms: metaMatches.keywords.size,
                    metaMatches: metaMatches.matches.length,
                    matchedTerms: matchedKeywords.size
                }
            };

            if (titleMatches.matches.length > 0) {
                result.title = Search.processMatches(titleText, titleMatches.matches, false);
            }

            if (contentMatches.matches.length > 0) {
                result.preview = Search.processMatches(contentText, contentMatches.matches);
            }
            else if (summaryMatches.matches.length > 0) {
                result.preview = Search.processMatches(summaryText, summaryMatches.matches);
            }
            else if (descriptionMatches.matches.length > 0) {
                result.preview = Search.processMatches(descriptionText, descriptionMatches.matches);
            }
            else {
                result.preview = replaceHTMLEnt((summaryText || descriptionText || contentText).substring(0, 140));
            }

            results.push(result);
        }

        /// Results covering more OR terms rank first. Within the same coverage,
        /// title hits dominate, while body and metadata hits are lower-weight
        /// tie breakers.
        return results.sort((left, right) => {
            const a = left.rank;
            const b = right.rank;
            if (!a || !b) return 0;

            return b.matchedTerms - a.matchedTerms
                || b.titleTerms - a.titleTerms
                || b.titleMatches - a.titleMatches
                || b.contentTerms - a.contentTerms
                || b.contentMatches - a.contentMatches
                || b.metaTerms - a.metaTerms
                || b.metaMatches - a.metaMatches
                || new Date(right.date).getTime() - new Date(left.date).getTime()
                || left.title.localeCompare(right.title);
        });
    }

    private async doSearch(query: string, page = 1): Promise<void> {
        const generation = ++this.searchGeneration;
        const startTime = performance.now();
        const results = await this.searchKeywords(splitKeywords(query));

        if (generation !== this.searchGeneration) return;

        this.results = results;
        this.currentPage = page;
        this.renderCurrentPage();

        const endTime = performance.now();
        this.resultTitle.innerText = this.generateResultTitle(
            results.length,
            ((endTime - startTime) / 1000).toPrecision(1)
        );
    }

    private renderCurrentPage(): void {
        const totalPages = Math.max(1, Math.ceil(this.results.length / this.pageSize));
        this.currentPage = Math.min(Math.max(this.currentPage, 1), totalPages);
        this.list.innerHTML = '';

        const start = (this.currentPage - 1) * this.pageSize;
        this.results.slice(start, start + this.pageSize).forEach(item => {
            this.list.append(Search.render(item));
        });

        this.renderPagination(totalPages);
    }

    private renderPagination(totalPages: number): void {
        if (!this.pagination || !this.pageLinks || !this.previousButton || !this.nextButton) return;

        if (this.results.length === 0 || totalPages <= 1) {
            this.pagination.hidden = true;
            this.pageLinks.innerHTML = '';
            this.previousButton.disabled = true;
            this.nextButton.disabled = true;
            if (this.pageStatus) this.pageStatus.textContent = '';
            return;
        }

        this.pagination.hidden = false;
        this.previousButton.disabled = this.currentPage <= 1;
        this.nextButton.disabled = this.currentPage >= totalPages;
        this.pageLinks.innerHTML = '';

        for (const page of Search.pageNumbers(this.currentPage, totalPages)) {
            if (page === null) {
                const dots = document.createElement('span');
                dots.className = 'page-link dots';
                dots.setAttribute('aria-hidden', 'true');
                dots.textContent = '…';
                this.pageLinks.append(dots);
                continue;
            }

            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'page-link';
            button.textContent = String(page);
            if (page === this.currentPage) {
                button.classList.add('current');
                button.setAttribute('aria-current', 'page');
            }
            else {
                button.addEventListener('click', () => this.goToPage(page));
            }
            this.pageLinks.append(button);
        }

        this.previousButton.onclick = () => this.goToPage(this.currentPage - 1);
        this.nextButton.onclick = () => this.goToPage(this.currentPage + 1);

        if (this.pageStatus) {
            this.pageStatus.textContent = this.pageStatusTemplate
                .replace('#CURRENT_PAGE', String(this.currentPage))
                .replace('#TOTAL_PAGES', String(totalPages));
        }
    }

    private goToPage(page: number): void {
        const totalPages = Math.ceil(this.results.length / this.pageSize);
        if (page < 1 || page > totalPages || page === this.currentPage) return;

        this.currentPage = page;
        Search.updateQueryString(this.input.value.trim(), page, true);
        this.renderCurrentPage();
    }

    private static pageNumbers(current: number, total: number): Array<number | null> {
        if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);

        const pages: Array<number | null> = [1];
        const start = Math.max(2, current - 1);
        const end = Math.min(total - 1, current + 1);

        if (start > 2) pages.push(null);
        for (let page = start; page <= end; page++) pages.push(page);
        if (end < total - 1) pages.push(null);
        pages.push(total);
        return pages;
    }

    private generateResultTitle(resultLen: number, time: string): string {
        return this.resultTitleTemplate.replace('#PAGES_COUNT', String(resultLen)).replace('#TIME_SECONDS', time);
    }

    public async getData(): Promise<pageData[]> {
        if (!this.data.length) {
            const jsonURL = this.form.dataset.json;
            if (!jsonURL) return [];

            this.data = await fetch(jsonURL).then(response => response.json());
            const parser = new DOMParser();

            for (const item of this.data) {
                item.content = parser.parseFromString(item.content || '', 'text/html').body.innerText;
                item.summary = parser.parseFromString(item.summary || '', 'text/html').body.innerText;
                item.description = parser.parseFromString(item.description || '', 'text/html').body.innerText;
            }
        }

        return this.data;
    }

    private bindSearchForm(): void {
        const runSearch = () => {
            const query = this.input.value.trim();
            if (query === this.lastSearch) return;

            this.lastSearch = query;
            Search.updateQueryString(query, 1, true);

            if (!query) {
                this.clear();
                return;
            }

            this.doSearch(query, 1);
        };

        this.input.addEventListener('input', runSearch);
        this.input.addEventListener('compositionend', runSearch);
        this.form.addEventListener('submit', (event) => {
            event.preventDefault();
            runSearch();
        });
    }

    private bindPagination(): void {
        if (!this.pagination) return;
        this.pagination.addEventListener('click', (event) => {
            const target = event.target as HTMLElement;
            if (target.closest('button')) event.stopPropagation();
        });
    }

    private clear(): void {
        this.searchGeneration++;
        this.results = [];
        this.currentPage = 1;
        this.list.innerHTML = '';
        this.resultTitle.innerText = '';
        if (this.pagination) this.pagination.hidden = true;
        if (this.pageLinks) this.pageLinks.innerHTML = '';
        if (this.pageStatus) this.pageStatus.textContent = '';
    }

    private bindQueryStringChange(): void {
        window.addEventListener('popstate', () => this.handleQueryString());
    }

    private getPageFromURL(): number {
        const page = Number(new URL(window.location.href).searchParams.get('page') || 1);
        return Number.isInteger(page) && page > 0 ? page : 1;
    }

    private handleQueryString(): void {
        const pageURL = new URL(window.location.toString());
        const keywords = pageURL.searchParams.get('keyword') || '';
        this.input.value = keywords;
        this.lastSearch = keywords.trim();

        if (keywords.trim()) this.doSearch(keywords, this.getPageFromURL());
        else this.clear();
    }

    private static updateQueryString(keywords: string, page = 1, replaceState = false): void {
        const pageURL = new URL(window.location.toString());

        if (!keywords) pageURL.searchParams.delete('keyword');
        else pageURL.searchParams.set('keyword', keywords);

        if (page > 1) pageURL.searchParams.set('page', String(page));
        else pageURL.searchParams.delete('page');

        if (replaceState) window.history.replaceState('', '', pageURL.toString());
        else window.history.pushState('', '', pageURL.toString());
    }

    public static render(item: pageData): HTMLElement {
        return <article>
            <a href={item.permalink}>
                <div class="article-details">
                    <h2 class="article-title" dangerouslySetInnerHTML={{ __html: item.title }}></h2>
                    <section class="article-preview" dangerouslySetInnerHTML={{ __html: item.preview || '' }}></section>
                </div>
                {item.image &&
                    <div class="article-image">
                        <img src={item.image} loading="lazy" />
                    </div>
                }
            </a>
        </article>;
    }
}

function setupSearch(root: ParentNode = document): void {
    const searchForm = root.querySelector('[data-search-page-form]') as HTMLFormElement | null;
    if (!searchForm || searchForm.dataset.stackSearchReady === 'true') return;

    const searchInput = searchForm.querySelector('input') as HTMLInputElement | null;
    const resultRoot = root.querySelector('[data-search-result]');
    const searchResultList = resultRoot?.querySelector('.search-result--list') as HTMLDivElement | null;
    const searchResultTitle = resultRoot?.querySelector('.search-result--title') as HTMLHeadingElement | null;
    if (!searchInput || !searchResultList || !searchResultTitle) return;

    searchForm.dataset.stackSearchReady = 'true';
    new Search({
        form: searchForm,
        input: searchInput,
        list: searchResultList,
        resultTitle: searchResultTitle,
        pagination: resultRoot?.querySelector('[data-search-pagination]') as HTMLElement | null,
        resultTitleTemplate: resultRoot?.getAttribute('data-result-title-template') || ''
    });
}

window.addEventListener('load', () => {
    setTimeout(() => setupSearch(), 0);
});

if (document.readyState !== 'loading') setTimeout(() => setupSearch(), 0);

export default Search;
