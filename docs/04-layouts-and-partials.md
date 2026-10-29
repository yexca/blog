# Layouts And Partials

## Template Map

| Area | Files | Notes |
| --- | --- | --- |
| Base document | `layouts/baseof.html` | Outer HTML shell. |
| Header | `_partials/header/site.html` | Sticky site title, search, language, theme, and mobile menu controls. |
| Head | `_partials/head/*` | Metadata, styles, per-language font link, hreflang, JSON-LD, language redirect (zh-cn home only). |
| Footer | `_partials/footer/*` | Script loading and footer UI. |
| Home/list cards | `_partials/article-list/*` | Default, compact, tile, cover, and featured variants. Home page 1 leads with `featured.html` (newest post: eyebrow, title, longer summary, cover beside it); the rest use `default.html`. Default cards call `article/components/details` with `(dict "Page" . "IsList" true)`, which shows a summary, swaps the article date/reading-time/tags footers for `article/components/list-meta.html` (`2006-01-02` date, first category as a pill, up to three tags), and hides the translation row. Only the home page renders `default.html`; section lists use `compact.html`. |
| Article page | `_partials/article/article.html`, `_partials/article/components/*` | Header, content, tags, related content, math, comments. |
| Sidebars | `_partials/sidebar/left.html`, `_partials/sidebar/right.html` | Navigation, profile, widgets, TOC. |
| Widgets | `_partials/widget/*` | Archives, categories, search, tag cloud, TOC, and desktop related posts. |
| Search | `layouts/page/search.*`, `_partials/search/index-data.html`, `_partials/search/results.html`, `assets/ts/search.tsx` | Snippet and full-text indexes, ranking, and client-side pagination. |
| Taxonomy | `_partials/taxonomy/categories.html`, `_partials/taxonomy/tags.html`, `_partials/taxonomy/post-card.html` | `/categories/` overview (share bar, one card per category with a posts-per-year trend and its latest posts), `/tags/` overview (filter, weighted cloud of the 30 most used tags, A–Z directory), and the post cards on term pages. |
| Comments | `_partials/comments/*` | Provider containers and lazy-loading hooks. |
| Shortcodes | `layouts/_shortcodes/*` | Inline content features. |

## Editing Rules

- Change shared partials only after checking all page types that include them.
- Keep article-card changes compatible with home, list, taxonomy, and archive contexts.
- Do not add inline scripts to templates when the behavior belongs in `assets/ts/features/`.
- Keep data attributes stable when TypeScript modules depend on them.
- Use Hugo partials for repeated template logic instead of duplicating markup.

## Common Risk Points

- Article cards are used in multiple contexts and can affect layout density.
- The `homepage` widget scope (theme `config.yaml`) is shared by `home.html` and
  `list.html` (section and term pages; not the `/categories/` and `/tags/` overviews).
  It holds only `widget/overview.html`: build-time post/category/tag/year stats, a
  posts-per-year strip on the archives year axis linking to `/archives/#YYYY`, and a
  category share bar with the five largest categories, and the eight most used tags.
  It displays the blog rather than repeating page entries, which stay in the left
  sidebar. On windows too short to show the whole panel (see the media query in
  `layout/home.scss`) the right sidebar scrolls with the page instead of sticking. The archives, categories and
  tag-cloud widget partials remain available but are no longer configured. The
  right sidebar is shown from the `lg` breakpoint up, so phones see no overview.
- Sidebar markup affects both desktop fixed layout and mobile behavior.
- The Header sits above the `.page-columns` wrapper so the original three-column
  width calculations remain intact.
- Scrolled content ends 12px below the Header (`--site-header-scroll-offset`, the
  line the sticky sidebars stop at). The site background lives on `.site-backdrop`
  (an empty `<div>` in `baseof.html`, styled in `base.scss`): `::before` is the
  background (z-index -1) and `::after` repeats it, clipped to the band above that
  line and stacked under the Header (z-index 25). Anything that must appear above
  it there needs a higher z-index. `assets/ts/features/contentClip.ts` redraws the
  rounded, bordered top edge of each card crossing the line as a
  `--content-clip-gap` (16px) cap, so text keeps a margin from the cut edge; add new
  card surfaces to its `cardQuery`.
- Keep that structure for iOS Safari 26, which draws the page under the status bar
  and the bottom toolbar: fixed elements are clipped to the area between them, so the
  layers are sticky and reach `--viewport-overscan` (120px on touch screens) past the
  viewport; a fixed or sticky *element* on a screen edge makes Safari paint the bar in
  a flat colour, so the layers are pseudo-elements; `overflow: clip` on the wrapper
  keeps the overscan from lengthening the page.
- The sidebar profile uses `params.author.name` for the displayed author name. On
  phone layouts it is shown only on language home pages.
- The ToC markup comes from `_partials/article/components/toc.html` (Hugo's
  wrapper stripped). The desktop widget wraps it in `nav#TableOfContents`, which
  the scrollspy targets; below `lg` a collapsible `.article-toc` copy without the
  id is rendered inside the article card.
- Article related content is calculated in `layouts/single.html`,
  rendered as a compact list on mobile, and rendered below the TOC by the
  page-scoped related widget on desktop.
- Head and footer changes can break soft navigation, analytics, comments, or fonts.
- Shortcode changes can affect old posts across every language.
- `_markup/render-link.html` opens a new tab only for absolute URLs that do not
  start with `site.BaseURL`; relative links and anchors stay in the same tab.
- `hreflang` links are generated from `.AllTranslations` in `_partials/head/custom.html`;
  do not hard-code language URLs there.
- Templates use the Hugo 0.146+ layout: page kinds sit directly in `layouts/`
  (`home.html`, `single.html`, `list.html`, `baseof.html`, `rss.xml`), partials in
  `layouts/_partials/`, shortcodes in `layouts/_shortcodes/`, render hooks in
  `layouts/_markup/`. `templates.Exists` paths must use the `_partials/` prefix.
- The image lightbox needs no template: `_partials/article/components/content.html`
  only passes translated PhotoSwipe labels (`lightbox.*` in `i18n/`) as
  `data-lightbox-labels`. Wrap content in `data-no-lightbox` to opt images out.
- Taxonomy overview pages (`/categories/`, `/tags/`) render without the widget column.
- The categories overview is server-rendered only. Its trend bars share one year
  axis (first post to the current year) and the tones fade by post-count rank, so
  the hero share bar, legend and card stripes match.
- The tags directory rows are filled client-side: `taxonomyPages.ts` moves the
  hidden `[data-tag-source]` links into `[data-tag-group-key]` rows and dims empty
  letters in the jump bar. `features/tagGroups.ts` picks the row: pinyin initials for
  Chinese and gojūon rows (then A–Z) for Japanese, read from the browser's
  `Intl.Collator` data (pinyin collation; JIS level-1 kanji order for `ja`), so no
  character table is kept in the repo. Level-2 kanji and unknown scripts go to `#`.
- The search page hero holds the `.search-box` form; `.search-form` stays the
  widget/404 style. `.search-explore` (tag and category starting points) hides
  itself with `:has()` once the result shell is visible. Result markup comes from
  `Search.render()` in `search.tsx` and is shared with the 404 page.
