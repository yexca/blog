# Layouts And Partials

## Template Map

| Area | Files | Notes |
| --- | --- | --- |
| Base document | `layouts/_default/baseof.html` | Outer HTML shell. |
| Header | `partials/header/site.html` | Avatar, site name, search, language, theme, and mobile menu controls. |
| Head | `partials/head/*` | Metadata, styles, custom font links, language redirect. |
| Footer | `partials/footer/*` | Script loading and footer UI. |
| Home/list cards | `partials/article-list/*` | Default, compact, tile, and cover variants. |
| Article page | `partials/article/article.html`, `partials/article/components/*` | Header, content, tags, related content, math, comments. |
| Sidebars | `partials/sidebar/left.html`, `partials/sidebar/right.html` | Navigation, profile, widgets, TOC. |
| Widgets | `partials/widget/*` | Archives, categories, search, tag cloud, TOC, and desktop related posts. |
| Search | `layouts/page/search.*`, `partials/search/results.html`, `assets/ts/search.tsx` | Search index, ranking, and client-side pagination. |
| Taxonomy cards | `partials/taxonomy/post-card.html` | Category/tag listing cards. |
| Comments | `partials/comments/*` | Provider containers and lazy-loading hooks. |
| Shortcodes | `layouts/shortcodes/*` | Inline content features. |

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
- Article related content is calculated in `layouts/_default/single.html`,
  rendered as a compact list on mobile, and rendered below the TOC by the
  page-scoped related widget on desktop.
- Head and footer changes can break soft navigation, analytics, comments, or fonts.
- Shortcode changes can affect old posts across every language.
