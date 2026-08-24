# Styles And Design System

## SCSS Entry Points

| File | Responsibility |
| --- | --- |
| `assets/scss/style.scss` | Main SCSS bundle entry. |
| `assets/scss/variables.scss` | CSS custom properties, font stacks, colors, article sizing. |
| `assets/scss/breakpoints.scss` | Responsive breakpoints and mixins. |
| `assets/scss/general.scss` | Broad global rules. |
| `assets/scss/partials/header.scss` | Sticky Header layout, expanding search, popovers, and anchor offset variables. |
| `assets/scss/custom.scss` | Small local overrides. Keep this file lean. |
| `assets/scss/partials/components/glass.scss` | Shared glass-style surfaces. |
| `assets/scss/partials/layout/*.scss` | Page-specific layouts. |
| `assets/scss/partials/components/*.scss` | Reusable component styling. |

## Font Rules

The active font stacks are defined in `variables.scss` and loaded from the head
partials. Local Yozai font files are not used by the active theme.

Do not add large font files to `static/` unless they are actively referenced by
runtime CSS and checked by the performance report.

## Design Rules

- Keep shared tokens in `variables.scss`.
- Prefer reusable component partials for repeated UI.
- Keep page-specific layout rules under `partials/layout/`.
- Avoid changing base typography from one feature file.
- Test mobile and desktop when changing cards, sidebars, taxonomy pages, or article content.
- Keep Header controls within the fixed action area at narrow widths; the site
  name may truncate, but controls must not overlap or expand the viewport.
- Keep `--site-header-scroll-offset` aligned with the rendered Header height so
  anchors, soft-navigation hash targets, and sticky sidebars are not covered by
  the sticky bar.

## Code Blocks

Code block behavior and styling spans templates, SCSS, and TypeScript. When
changing it, check:

- `assets/scss/partials/layout/article.scss`
- `assets/ts/features/codeBlocks.ts`
- article pages with long lines, collapsed blocks, copy buttons, and detached mode
