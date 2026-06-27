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
- Section, taxonomy list, or taxonomy term page: `layouts/_default/list.html`
- Archives page: `layouts/_default/archives.html`
- Search page: `layouts/page/search.html` and `layouts/page/search.json`

The main container has a `data-page-shell` attribute. Client-side same-origin
soft navigation replaces this shell when moving between pages without a full
reload. See `docs/archive/page-transitions.md`.

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
- `--body-background-image-mobile`

These variables are the core of the current glassmorphism design.

## Client-Side Script Structure

The global theme script entry remains:

```text
themes/hugo-theme-stack/assets/ts/main.ts
```

`main.ts` intentionally stays small. It exposes the public `window.Stack`
contract and delegates work to:

```text
themes/hugo-theme-stack/assets/ts/core/initOnce.ts
themes/hugo-theme-stack/assets/ts/core/pageInit.ts
```

`initOnce.ts` runs one-time global setup such as soft navigation.
`pageInit.ts` runs after the initial page load and again after every soft
navigation shell replacement.

Page and component behavior is split into feature modules:

```text
themes/hugo-theme-stack/assets/ts/features/about2026.ts
themes/hugo-theme-stack/assets/ts/features/aboutVersions.ts
themes/hugo-theme-stack/assets/ts/features/archives.ts
themes/hugo-theme-stack/assets/ts/features/articleTiles.ts
themes/hugo-theme-stack/assets/ts/features/codeBlocks.ts
themes/hugo-theme-stack/assets/ts/features/githubInfoCards.ts
themes/hugo-theme-stack/assets/ts/features/taxonomyPages.ts
```

Shared data used by these features lives under:

```text
themes/hugo-theme-stack/assets/ts/data
```

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

## Taxonomy Pages

The category, tag, category term, and tag term pages are handled in:

```text
themes/hugo-theme-stack/layouts/_default/list.html
themes/hugo-theme-stack/layouts/partials/taxonomy/post-card.html
themes/hugo-theme-stack/assets/scss/partials/layout/list.scss
themes/hugo-theme-stack/assets/ts/features/taxonomyPages.ts
themes/hugo-theme-stack/assets/ts/data/tagInitials.ts
```

The taxonomy list pages no longer use the original Stack compact list design.

Category taxonomy page (`/categories/`):

- renders category link cards above the article preview area
- links each category card to its term page
- shows the first seven category cards when there are nine or more categories
- replaces the eighth grid position with an expand/collapse card
- renders preview panels for the first three categories
- limits each preview panel to six posts
- relies on term pages for full category browsing and Hugo pagination

Tag taxonomy page (`/tags/`):

- renders a search field and frequent tags
- renders tag groups by language
- Simplified and Traditional Chinese use `A-Z` plus `#`
- Japanese uses `あ/か/さ/た/な/は/ま/や/ら/わ`, `A-Z`, and `#`
- English and other languages use `A-Z` plus `#`

Taxonomy term pages (`/categories/<term>/` and `/tags/<term>/`) use the shared taxonomy post-card partial and Hugo pagination.
They intentionally avoid the upstream Stack compact list.

`partials/taxonomy/post-card.html` provides a reusable full-card-clickable post card.
The invisible full-card link sits behind real links, so clicking empty card space opens the post while tag links remain clickable.

Client-side behavior is initialized by `setupTaxonomyPages()` in `assets/ts/features/taxonomyPages.ts`.
For categories, the script handles full-card clicks and expand/collapse when the list page has no tab panels.
Because soft navigation calls `window.Stack.init()`, taxonomy interactions are reattached after same-origin page transitions.

## Article Header and Details

Article cards and article pages use separate cover partials:

```text
themes/hugo-theme-stack/layouts/partials/article/components/header.html
themes/hugo-theme-stack/layouts/partials/article-list/cover.html
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

`article/components/header.html` is for article pages and keeps larger responsive
cover images with eager loading and high fetch priority. `article-list/cover.html`
is for list cards and uses smaller list-oriented cover sizes.

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
themes/hugo-theme-stack/assets/ts/features/codeBlocks.ts
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

Archive-specific client-side behavior is in:

```text
themes/hugo-theme-stack/assets/ts/features/archives.ts
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

It renders a data container. The client script in
`assets/ts/features/twikooComments.ts` loads Twikoo from jsDelivr when the
comment container nears the viewport.

Twikoo glass-style CSS lives in:

```text
themes/hugo-theme-stack/assets/scss/partials/comments/twikoo.scss
```

To disable comments for one article, set:

```yaml
comments: false
```

in the article front matter.
