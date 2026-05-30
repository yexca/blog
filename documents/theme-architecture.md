# Theme Architecture

## High-Level Layout Flow

The base layout is:

```text
themes/hugo-theme-stack/layouts/_default/baseof.html
```

It builds the page skeleton:

```text
html
  head
    partial head/head.html
  body
    partial head/colorScheme
    .container.main-container
      left sidebar
      optional right sidebar
      main content block
    partial footer/include.html
```

The main layout depends on the page kind:

- Home page: `layouts/index.html`
- Single article: `layouts/_default/single.html`
- Section or taxonomy list: `layouts/_default/list.html`
- Archives page: `layouts/_default/archives.html`
- Search page: `layouts/page/search.html` and `layouts/page/search.json`

## Head and Style Injection

The head entry point is:

```text
themes/hugo-theme-stack/layouts/partials/head/head.html
```

It loads the compiled SCSS through:

```text
themes/hugo-theme-stack/layouts/partials/head/style.html
```

`style.html` compiles `assets/scss/style.scss`, then injects runtime CSS variables from `params.background` in `hugo.yml`.

The most important injected variables are:

- `--glass-blur`
- `--glass-saturation`
- `--card-background`
- `--card-background-secondary`
- `--card-background-selected`
- `--card-border-color`
- `--body-background-overlay-light`
- `--body-background-overlay-dark`
- `--body-background-image`

These variables are the core of the current glassmorphism design.

## Home Page Article Cards

The home page is:

```text
themes/hugo-theme-stack/layouts/index.html
```

It selects posts from `Site.Params.mainSections`, removes posts with `hidden: true`, paginates them, then renders:

```text
partials/article-list/default.html
```

The default card partial is intentionally small:

```text
themes/hugo-theme-stack/layouts/partials/article-list/default.html
```

It renders:

- article image and metadata through `article/components/header.html`
- a full-card link through `.article-card-link`

The full-card link is placed behind normal links with z-index. This makes the whole card clickable while preserving category, tag, title, and translation links.

The related SCSS is in:

```text
themes/hugo-theme-stack/assets/scss/partials/article.scss
```

Key selectors:

- `.article-list article`
- `.article-card-link`
- `.article-details a`
- `.article-image a`
- `.article-category a`

## Article Header and Details

Article card and article page headers share:

```text
themes/hugo-theme-stack/layouts/partials/article/components/header.html
themes/hugo-theme-stack/layouts/partials/article/components/details.html
```

`details.html` renders:

- categories
- title
- optional `description`
- date
- reading time
- tags
- translation links

Because this partial is shared by the home card and article page, changes here affect both surfaces.
If a change should affect only home cards, scope the style under `.article-list`.

## Single Article Page

The single page entry point is:

```text
themes/hugo-theme-stack/layouts/_default/single.html
```

It renders:

```text
partials/article/article.html
```

That article partial renders:

- `article/components/header.html`
- `article/components/content.html`
- `article/components/footer.html`
- optional math component

`content.html` wraps Markdown tables in `.table-wrapper`.

Code blocks are rendered by Hugo/Chroma during Markdown rendering.
The visual shell and syntax palette live in:

```text
themes/hugo-theme-stack/assets/scss/partials/layout/article.scss
themes/hugo-theme-stack/assets/scss/partials/highlight
```

The macOS-style code block controls are attached on page load by:

```text
themes/hugo-theme-stack/assets/ts/main.ts
```

Those controls add language labels, copy, line wrapping, collapse, and a draggable/resizable window mode.
Window mode uses a temporary body-level `.codeBlockPortal` so the enlarged code block stays centered in the viewport instead of being constrained by article layout containers.

## Sidebars

Left sidebar:

```text
themes/hugo-theme-stack/layouts/partials/sidebar/left.html
themes/hugo-theme-stack/assets/scss/partials/sidebar.scss
```

It contains:

- profile card
- social links
- RSS link
- main menu
- language switcher
- dark mode toggle

The language switcher uses page translations when available and falls back to the translated home page for languages without a page translation.

Right sidebar:

```text
themes/hugo-theme-stack/layouts/partials/sidebar/right.html
```

It renders configured widgets from `params.widgets`.
On the home page, widgets include search, archives, categories, and tag cloud.
On article pages, the table of contents widget is used.

## Archives Page

The archive layout is:

```text
themes/hugo-theme-stack/layouts/_default/archives.html
```

It is heavily customized.

It renders:

- a horizontal year rail with previous/next controls
- one expanded per-year post timeline at a time
- dotted connector segments between months
- posts filtered by `mainSections`
- posts with `hidden: true` excluded

Archive-specific SCSS is in:

```text
themes/hugo-theme-stack/assets/scss/partials/layout/archives.scss
```

Look for selectors prefixed with:

```text
.archive-year
.archive-post-timeline
.argon-timeline
.archive-page-card
```

## Links Page

The links component is:

```text
themes/hugo-theme-stack/layouts/partials/article/components/links.html
```

It supports both:

- legacy `links`
- grouped `linkSections`

The SCSS for the new grouped link cards is in:

```text
themes/hugo-theme-stack/assets/scss/partials/article.scss
```

Look for:

```text
.link-sections
.link-section
.link-card-list
.link-card
```

## Comments

Comments are included from:

```text
themes/hugo-theme-stack/layouts/_default/single.html
themes/hugo-theme-stack/layouts/partials/comments/include.html
```

Site-level settings live in:

```text
themes/hugo-theme-stack/config.yaml
```

The current default provider is Twikoo:

```yaml
comments:
  enabled: true
  provider: twikoo
```

The Twikoo provider template is:

```text
themes/hugo-theme-stack/layouts/partials/comments/provider/twikoo.html
```

It has custom glass-style CSS.

To disable comments for one article, set:

```yaml
comments: false
```

in the article front matter.

