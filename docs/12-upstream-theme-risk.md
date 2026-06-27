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

## Files To Inspect First

- `layouts/_default/baseof.html`
- `layouts/index.html`
- `layouts/_default/single.html`
- `layouts/_default/list.html`
- `layouts/page/search.*`
- `layouts/partials/article-list/*`
- `layouts/partials/sidebar/*`
- `assets/scss/variables.scss`
- `assets/scss/partials/layout/*`
- `assets/ts/core/pageInit.ts`
- `assets/ts/pageTransitions.ts`
- `assets/ts/features/*`
