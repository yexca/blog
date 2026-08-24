# Maintenance Playbook

## Change Article Cards

Check:

- `partials/article-list/default.html`
- `partials/article-list/compact.html`
- `partials/article-list/tile.html`
- `partials/article-list/cover.html`
- `assets/scss/partials/layout/list.scss`
- `assets/ts/features/articleTiles.ts`

Verify home, list, taxonomy, and mobile layouts.

## Change Article Page

Check:

- `layouts/_default/single.html`
- `partials/article/article.html`
- `partials/article/components/*`
- `assets/scss/partials/layout/article.scss`
- `assets/ts/features/codeBlocks.ts`

Verify headings, cover image, tags, math, code blocks, related content, and comments.

## Change Mermaid Diagrams

Check:

- `hugo.yml` and the post's `mermaid` front matter switch.
- `layouts/_default/_markup/render-codeblock-mermaid.html`.
- `assets/ts/features/mermaid.ts` and `assets/ts/core/pageInit.ts`.
- `assets/scss/partials/components/mermaid.scss`.

Verify enabled and disabled pages, invalid syntax fallback, light/dark schemes,
mobile sizing, soft navigation, and the performance report.

## Add A JavaScript Feature

1. Add a module under `assets/ts/features/`.
2. Expose a setup function with `root?: ParentNode`.
3. Register it in `assets/ts/core/pageInit.ts`.
4. Use selectors and element readiness flags.
5. Verify normal load and soft navigation.

## Change Search

Check:

- `layouts/page/search.json` for indexed fields.
- `layouts/partials/search/results.html` for the result and pagination shell.
- `assets/ts/search.tsx` for OR matching, CJK/Latin spacing, ranking, and
  client-side pagination.
- `assets/scss/partials/layout/search.scss` for the result controls.

Verify title-vs-body ordering, a mixed query such as `学习Linux` and
`学习 Linux`, a result set larger than one page, an empty query, and the 404
search form. Run the performance report because the index contains article
text.

## Change Header

Check `partials/header/site.html`, `partials/header.scss`, `features/header.ts`,
`colorScheme.ts`, and the `.page-columns` wrapper in `baseof.html`. Verify the
desktop search expansion, all language targets, all three theme choices,
sticky position and anchor offset, mobile search navigation, the mobile menu
at a scrolled position, the home-only mobile author profile, and soft
navigation.

## Add Or Change A Shortcode

1. Edit or add `layouts/shortcodes/<name>.html`.
2. Add shared styles to `partials/components/shortcodes.scss`.
3. Add feature script only if interaction is required.
4. Check old posts that already use the shortcode.

## Change Fonts

1. Update `assets/scss/variables.scss`.
2. Update font links in head partials if needed.
3. Do not add large files to `static/` unless they are used.
4. Run the performance report.

## Change Translation Automation

1. Edit `translation/translate.config.json` or `scripts/translate/translate.mjs`.
2. Preserve manifest semantics.
3. Run a small translation check before bulk updates.
4. Review `translation/translation-manifest.json` diffs carefully.
