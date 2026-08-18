# Theme Architecture

## Request Flow

Hugo resolves pages through the theme layouts:

1. `layouts/_default/baseof.html` provides the outer document structure.
2. Head partials inject metadata, styles, color-scheme data, and custom links.
3. Page templates render the page body.
4. Shared partials render sidebars, article cards, pagination, comments, and widgets.
5. Footer partials load bundled scripts and runtime-only helpers.

## Main Page Types

| Page type | Primary files |
| --- | --- |
| Home | `layouts/index.html`, `partials/article-list/*` |
| Section/list | `layouts/_default/list.html`, `partials/article-list/*` |
| Article | `layouts/_default/single.html`, `partials/article/*` |
| Archives | `layouts/_default/archives.html`, `assets/ts/features/archives.ts` |
| Search | `layouts/page/search.html`, `layouts/page/search.json`, `assets/ts/search.tsx` |
| Taxonomy | `partials/taxonomy/post-card.html`, `assets/ts/features/taxonomyPages.ts` |
| About versions | `layouts/shortcodes/about*.html`, `assets/ts/features/about*.ts` |
| Mermaid diagrams | `layouts/_default/_markup/render-codeblock-mermaid.html`, `assets/ts/features/mermaid.ts` |

## Asset Flow

SCSS and TypeScript are Hugo assets. Prefer adding code under the existing
`assets/scss/partials/` and `assets/ts/features/` structure.

Page-specific JavaScript should expose an initializer and be registered from
`assets/ts/core/pageInit.ts`. Initializers must tolerate repeated calls because
same-origin soft navigation can replace page content without a full reload.

Mermaid is an opt-in page feature. The render hook emits Mermaid nodes only
when the page or site article setting enables it; the client module then loads
the external renderer on demand.

## Soft Navigation

Same-origin page transitions are handled by `assets/ts/pageTransitions.ts` and
styled by `assets/scss/partials/page-transitions.scss`. When a feature relies
on DOMContentLoaded or one-time script execution, make it compatible with the
page initialization system.
