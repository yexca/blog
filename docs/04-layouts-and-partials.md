# Layouts And Partials

## Template Map

| Area | Files | Notes |
| --- | --- | --- |
| Base document | `layouts/baseof.html` | Outer HTML shell. |
| Header | `_partials/header/site.html` | Sticky site title, search, language, theme, and mobile menu controls. |
| Head | `_partials/head/*` | Metadata, styles, per-language font link, hreflang, JSON-LD, language redirect (zh-cn home only). |
| Footer | `_partials/footer/*` | Script loading and footer UI. |
| Home/list cards | `_partials/article-list/*` | Default, compact, tile, and cover variants. List cards call `article/components/details` with `(dict "Page" . "IsList" true)`, which shows a summary and hides the translation row. |
| Article page | `_partials/article/article.html`, `_partials/article/components/*` | Header, content, tags, related content, math, comments. |
| Sidebars | `_partials/sidebar/left.html`, `_partials/sidebar/right.html` | Navigation, profile, widgets, TOC. |
| Widgets | `_partials/widget/*` | Archives, categories, search, tag cloud, TOC, and desktop related posts. |
| Search | `layouts/page/search.*`, `_partials/search/index-data.html`, `_partials/search/results.html`, `assets/ts/search.tsx` | Snippet and full-text indexes, ranking, and client-side pagination. |
| Taxonomy cards | `_partials/taxonomy/post-card.html` | Category/tag listing cards. |
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
- Sidebar markup affects both desktop fixed layout and mobile behavior.
- The Header sits above the `.page-columns` wrapper so the original three-column
  width calculations remain intact.
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
