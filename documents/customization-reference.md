# Customization Reference

This file lists the major ways this theme differs from the upstream Stack theme.

## Glassmorphism System

The visual system is built around translucent cards, borders, blur, and light/dark theme variables.

Primary config:

```text
hugo.yml
```

Relevant config block:

```yaml
params:
  background:
    image:
    mobileImage:
    local: true
    size: cover
    position: center
    attachment: fixed
    blur: 18px
    saturation: 1.35
    light:
      tint:
      card:
      cardSecondary:
      cardSelected:
      border:
    dark:
      tint:
      card:
      cardSecondary:
      cardSelected:
      border:
```

Fallback CSS variables live in:

```text
themes/hugo-theme-stack/assets/scss/variables.scss
```

Runtime variable injection lives in:

```text
themes/hugo-theme-stack/layouts/partials/head/style.html
```

`mobileImage` is optional. When it is empty, mobile viewports reuse `image` and crop it with `cover`.

Global glass surfaces are assigned in:

```text
themes/hugo-theme-stack/assets/scss/partials/base.scss
```

The global list currently includes:

- article cards
- compact article lists
- tile article cards
- sidebar panels
- section cards
- taxonomy surfaces
- main articles
- table of contents widget
- archive widgets
- site footer
- tag cloud links
- pagination
- search form
- archive page card
- comment containers

When adding a new card-like surface, prefer using existing variables:

```scss
background-color: var(--card-background);
border: 1px solid var(--card-border-color);
backdrop-filter: saturate(var(--glass-saturation)) blur(var(--glass-blur));
-webkit-backdrop-filter: saturate(var(--glass-saturation)) blur(var(--glass-blur));
box-shadow: var(--shadow-l1);
border-radius: var(--card-border-radius);
```

For nested taxonomy UI, keep the visual hierarchy explicit:

- outer surfaces use `var(--card-background)`
- inner cards, buttons, tag links, and pagination buttons use `rgba(255, 255, 255, 0)`
- hover/active state should use border, transform, and shadow before adding another filled background

This keeps the glass effect from becoming stacked and muddy.

## Home Article Cards Are Fully Clickable

Files:

```text
themes/hugo-theme-stack/layouts/partials/article-list/default.html
themes/hugo-theme-stack/assets/scss/partials/article.scss
```

Implementation:

- `.article-card-link` is an absolute link covering the whole card.
- It has `aria-hidden="true"` and `tabindex="-1"`.
- Real links inside the card have higher `z-index`.

Why:

- Clicking empty card space opens the article.
- Category, tag, title, image, and translation links keep their own behavior.
- Keyboard navigation is not polluted by a duplicate hidden link.

If card click behavior breaks, inspect stacking order first:

```scss
.article-card-link {
  z-index: 1;
}

.article-details a,
.article-image a {
  z-index: 2;
}
```

## Home Category Badges Use Glass Styling

File:

```text
themes/hugo-theme-stack/assets/scss/partials/article.scss
```

Selector:

```scss
.article-list article .article-category a
```

The old rotating color palette was removed for home cards.
Category badges now use:

- `--card-background-secondary`
- `--card-border-color`
- `--glass-blur`
- `--glass-saturation`
- `--card-background-selected` on hover

Important caveat:

`article/components/details.html` still allows term-level inline category colors:

```go-html-template
{{ with .Params.style }}style="background-color: {{ .background }}; color: {{ .color }};"{{ end }}
```

Inline styles override SCSS.
Remove or rewrite that template line if category colors should never be allowed.

## Tags on Article Cards

Files:

```text
themes/hugo-theme-stack/layouts/partials/article/components/details.html
themes/hugo-theme-stack/assets/scss/custom.scss
```

Tags are shown directly inside the shared article details partial.
This means they appear on home cards and article headers.

The tag CSS uses:

- `--card-background-secondary`
- `--card-border-color`
- `--card-text-color-tertiary`
- `--card-background-selected`

Tags currently open in a new tab because the template has:

```html
target="_blank"
```

Change this in `details.html` if same-tab navigation is preferred.

## Multilingual Sidebar Switcher

Files:

```text
themes/hugo-theme-stack/layouts/partials/sidebar/left.html
themes/hugo-theme-stack/assets/scss/partials/sidebar.scss
```

The language switcher is a native `select`.
It uses `Site.Home.AllTranslations` as the language list, then tries to replace each target with the current page's matching translation.

This keeps all languages visible even when a page is missing one translation.

## Sidebar Was Reworked Into Glass Panels

Files:

```text
themes/hugo-theme-stack/layouts/partials/sidebar/left.html
themes/hugo-theme-stack/assets/scss/partials/sidebar.scss
```

The left sidebar is split into panels:

- `.sidebar-profile`
- `.sidebar-menu`
- `.sidebar-controls`

Each panel gets the general `.sidebar-panel` card style.

The profile card contains the avatar, title, subtitle, social links, and RSS link.
The controls panel contains the language switcher and dark mode toggle.

## Archive Page Timeline

Files:

```text
themes/hugo-theme-stack/layouts/_default/archives.html
themes/hugo-theme-stack/assets/scss/partials/layout/archives.scss
```

The archive page is no longer a plain Stack archive.
It renders:

- a horizontal year rail with previous/next controls
- one expanded per-year timeline at a time
- article counts inside year nodes
- dotted connector segments at the start of each month
- per-post timeline cards

Selectors:

```scss
.archive-year-stage
.archive-year-link
.archive-year-dot
.archive-post-timeline
.argon-timeline
.argon-timeline-node
.argon-timeline-card
.archive-page-card
.archive-timeline-title
```

The timeline filters out hidden posts.

## Taxonomy Pages

Files:

```text
themes/hugo-theme-stack/layouts/_default/list.html
themes/hugo-theme-stack/layouts/partials/taxonomy/post-card.html
themes/hugo-theme-stack/assets/scss/partials/layout/list.scss
themes/hugo-theme-stack/assets/ts/main.ts
themes/hugo-theme-stack/i18n/*.yaml
```

The category and tag list pages are custom project-specific pages now.
They should not be treated as upstream Stack-compatible surfaces.

Category page behavior:

- category cards are rendered in a responsive grid
- if the site has eight or fewer categories, all categories are shown
- if the site has nine or more categories, the first seven categories are shown and the eighth grid slot becomes the expand card
- the selected category panel shows post cards below the switcher
- category panel pagination is client-side, currently 12 posts per page
- category cards do not show raw URLs

Tag page behavior:

- top area contains search plus frequent tags
- tags are rendered into a hidden source container and distributed to groups by `setupTaxonomyPages()`
- Chinese pages group by pinyin initial when known, with unknown characters under `#`
- Japanese pages group kana into gojūon rows and Latin tags into individual `A-Z` groups
- search filters both frequent tags and grouped tags

The shared taxonomy post card is fully clickable:

- `.taxonomy-post-card-link` covers the card
- real links in `.taxonomy-post-body` and `.taxonomy-post-tags` sit above it
- clicking empty card space opens the article
- clicking a tag opens the tag page

Important selectors:

```scss
.taxonomy-page
.taxonomy-surface
.category-card-grid
.category-switch-card
.category-expand-button
.category-panel
.taxonomy-post-card
.taxonomy-post-card-link
.taxonomy-inline-pagination
.tag-finder
.tag-index-group
.tag-index-link
```

## Links Page Cards

Files:

```text
themes/hugo-theme-stack/layouts/partials/article/components/links.html
themes/hugo-theme-stack/assets/scss/partials/article.scss
```

The links component supports grouped sections through `linkSections`.
It also keeps compatibility with the older `links` front matter.

Selectors:

```scss
.link-sections
.link-section
.link-section-header
.link-section-icon
.link-card-list
.link-card
.link-card-media
.link-card-content
```

## Pagination

Files:

```text
themes/hugo-theme-stack/layouts/partials/pagination.html
themes/hugo-theme-stack/assets/scss/partials/pagination.scss
```

Pagination is styled as a glass card and includes a page jump control on larger viewports.

If page navigation looks broken on mobile, inspect:

```scss
.pagination-links
.page-link
.pagination-jump
```

## Code Blocks and Article Content

Files:

```text
hugo.yml
themes/hugo-theme-stack/assets/scss/variables.scss
themes/hugo-theme-stack/assets/scss/partials/layout/article.scss
themes/hugo-theme-stack/assets/scss/partials/highlight/common.scss
themes/hugo-theme-stack/assets/scss/partials/highlight/light.scss
themes/hugo-theme-stack/assets/scss/partials/highlight/dark.scss
themes/hugo-theme-stack/assets/ts/main.ts
```

Highlighting uses Hugo classes:

```yaml
pygmentsUseClasses: true
markup:
  highlight:
    noClasses: false
```

Light and dark syntax themes are imported from:

```text
themes/hugo-theme-stack/assets/scss/partials/highlight/light.scss
themes/hugo-theme-stack/assets/scss/partials/highlight/dark.scss
```

The syntax palette is Argon-inspired and adapted to Hugo Chroma classes, not Highlight.js classes.
The Chroma background itself is transparent so the code block glass surface remains visible.

Code block shell styling is defined in `partials/layout/article.scss`.
Important selectors:

```scss
.article-content .highlight
.article-content .codeBlockHeader
.article-content .codeBlockControl
.article-content .copyCodeButton
.article-content .highlight.is-collapsed
.article-content .highlight.is-focused
.article-content .highlight.is-wrapped
.codeBlockPortal
.codeBlockPlaceholder
```

The code block background is fully transparent in the normal article flow:

```scss
--pre-background-color: rgba(..., 0);
```

Windowed code blocks use a separate readable background:

```scss
--pre-focus-background-color
```

This keeps inline article code glassy while making detached windows readable over busy images.

The macOS-style window dots are generated by `assets/ts/main.ts`.
They keep the visual order red, yellow, green and map to:

- red: toggle line wrapping
- yellow: collapse or expand the code block
- green: open or close the code block as a window

The windowed mode temporarily moves the selected `.highlight` into a body-level `.codeBlockPortal` and leaves a `.codeBlockPlaceholder` in the article.
This avoids fixed-position bugs caused by nested article/card layout contexts.
Closing the window moves the code block back to its original parent and removes the portal and placeholder.

Window behavior:

- drag by the code block header
- resize with the browser's native bottom-right resize handle
- close by clicking outside the window
- close with `Esc`
- copy uses Clipboard API with a textarea fallback

Article content uses:

- table wrappers for overflow
- custom blockquote background
- glass-aware inline code and pre backgrounds
- heading border accents
- highlighted links using `--link-background-color`

## Comments Styling

Files:

```text
themes/hugo-theme-stack/layouts/partials/comments/provider/twikoo.html
themes/hugo-theme-stack/layouts/partials/comments/provider/waline.html
themes/hugo-theme-stack/assets/scss/partials/base.scss
```

Twikoo and Waline containers are included in the glass surface list.
Twikoo has additional custom CSS inside its provider template.

## Shortcode Styling Caveats

Several shortcodes include their own `<style>` blocks.
This is convenient, but it means styles may be duplicated when the shortcode appears multiple times.

Watch especially:

- `notice.html`
- `details.html`
- `timeline.html`

The `details.html` shortcode uses global `details` and `summary` selectors.
Consider scoping it if future pages need native details elements with different styling.

## Upstream Theme Upgrade Risk

Because changes are made directly in `themes/hugo-theme-stack`, replacing the theme with upstream Stack will overwrite project behavior.

Before upgrading:

1. Commit or stash all local changes.
2. Compare local theme files with upstream.
3. Preserve custom layout partials first.
4. Preserve SCSS variables and glass styling.
5. Re-run the full verification checklist.

High-risk files during an upgrade:

```text
themes/hugo-theme-stack/layouts/partials/article/components/details.html
themes/hugo-theme-stack/layouts/partials/article-list/default.html
themes/hugo-theme-stack/layouts/partials/sidebar/left.html
themes/hugo-theme-stack/layouts/partials/head/style.html
themes/hugo-theme-stack/layouts/_default/archives.html
themes/hugo-theme-stack/assets/scss/variables.scss
themes/hugo-theme-stack/assets/scss/partials/base.scss
themes/hugo-theme-stack/assets/scss/partials/article.scss
themes/hugo-theme-stack/assets/scss/partials/sidebar.scss
themes/hugo-theme-stack/assets/scss/partials/layout/archives.scss
themes/hugo-theme-stack/assets/scss/custom.scss
```

