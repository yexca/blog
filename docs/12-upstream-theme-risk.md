# Upstream Theme Risk

The theme directory name is `hugo-theme-stack`, but this repository should not
be treated as a clean upstream Stack theme install.

## Why Direct Replacement Is Risky

Local changes affect:

- Layout templates.
- Article cards.
- Sidebars.
- Taxonomy pages.
- Archives.
- Search.
- About page shortcodes.
- SCSS variables and visual system.
- TypeScript page features.
- Soft navigation and reinitialization.
- Comments and third-party lazy loading.

Replacing the directory with upstream Stack can silently remove project-specific
behavior.

## Safer Upgrade Process

1. Create a separate upstream comparison checkout.
2. Diff upstream files against `themes/hugo-theme-stack`.
3. Group differences by area: layouts, partials, SCSS, TypeScript, i18n, config.
4. Port upstream fixes selectively.
5. Build and verify every affected page type.
6. Run the performance report.
7. Update docs if edit points or behavior changed.

## Sync Record

Upstream: <https://github.com/CaiJimmy/hugo-theme-stack> (`master`).

The baseline is the newest upstream commit whose changes have been reviewed.
Next time, only review `git log --no-merges <baseline>..origin/master` in an
upstream checkout; everything up to the baseline is already decided below.

| Date | Upstream commit | Local commit | Notes |
| --- | --- | --- | --- |
| 2024-12-27 | `087989e4274f24a472d16d7c35d394a227fed47a` (v3.29.0+2, 2024-12-22) | `1fb9916` | Original import as a git submodule; vendored as plain files in `698697e`. |
| 2026-05-30 | `3e123a30b79b5d52a3a8e88a9dd678fcfd28e418` (v4.0.3) | `25bb3b3` | Partial backport of v4.0.x fixes (sidebar, scrollspy, compact list, details, Twikoo, video). |
| 2026-10-29 | `3e123a30b79b5d52a3a8e88a9dd678fcfd28e418` (v4.0.3) | (this commit) | Full review of `087989e..3e123a3` and port of the small fixes below. No upstream commits after v4.0.3 yet. **Current baseline.** |

### Review Of `087989e..3e123a3`

Already covered locally, by backport or by an independent implementation:
Hugo 0.146 template layout, PhotoSwipe 5, Vibrant.js removal, collapsible
mobile ToC, CJK autospace, Mermaid, pagination redesign with page jump,
scrollspy null check and `ResizeObserver`, sidebar active-link condition,
`hugo.Data`, `<time datetime>`, external featured images, content image
`srcset`, code copy fallback when the Clipboard API is missing, video `muted`,
`<html lang>` / `dir` using `Language.Locale` / `Language.Direction`, pagination
ARIA (disabled links are `aria-hidden` spans).

Ported on 2026-10-29:

- `#1334` Hugo 0.158 language deprecations: every `.Language.Lang` is now
  `.Language.Name` (also in `head/head.html` and `header/site.html`, which
  upstream does not have).
- `#1098` the 404 page decodes the URL before filling the search box, so CJK
  slugs are readable.
- `#1150` removed the unused `_internal/google_analytics.html` template call;
  Google Analytics is not configured.
- `#1311` `.chroma .lnt` line numbers are not selectable.
- `ff2e308` English reading time uses "minutes read" for the plural.

Optional features, port only if wanted:

- `#1221` / `#1269` Markdown alerts (`render-blockquote.html`); the `notice`
  shortcode covers this today and no content uses `> [!NOTE]`.
- `#1267` `canonicalUrl` front matter override in `head/head.html`.
- `#1283` responsive featured images and thumbnails (`helper/responsive-image`,
  `helper/thumbnail-image`); content images already have `srcset`.
- `#1249` / `#1250` `build.list` instead of `Params.hidden`, sorting by lastmod;
  needs a front matter migration.
- `#1341` ToC enable reads `params.article.toc`; no effect while the site keeps
  `toc: true`.

Not applicable: Artalk, Comentario, Waline, Giscus, Cusdis, cookie consent
banner, i18n/config migration to TOML, demo site, Go module path, category
color generation, generic taxonomy widget and linked widget titles, OpenGraph
`.Permalink` casing and static-folder image fixes (the local `helper/image`
still returns a lowercase `permalink` key and uses `relURL`), favicon existence
check, related-content overflow fixes (layout replaced locally), Google Fonts
preload (local font loading is custom).

## Files To Inspect First

- `layouts/baseof.html`
- `layouts/home.html`
- `layouts/single.html`
- `layouts/list.html`
- `layouts/page/search.*`
- `layouts/_partials/article-list/*`
- `layouts/_partials/sidebar/*`
- `assets/scss/variables.scss`
- `assets/scss/partials/layout/*`
- `assets/ts/core/pageInit.ts`
- `assets/ts/pageTransitions.ts`
- `assets/ts/features/*`

## Removed Upstream Files

The following upstream Stack files were removed on purpose and should not be
restored when porting fixes: `exampleSite/`, `images/`, `netlify.toml`, `go.mod`,
`debug.sh`, theme-level `.github/` and `.devcontainer/`, i18n files other than
`en`, `ja`, `zh-cn`, `zh-tw`, comment providers other than Twikoo, and
`assets/scss/partials/comments/disqusjs.scss`. `LICENSE` (GPL-3.0) stays.
