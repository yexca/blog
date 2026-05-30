# Content Model

## Content Directory Layout

The site is multilingual.
Each language has its own content root:

```text
content/zh-cn
content/zh-tw
content/en-us
content/ja-jp
```

The language keys in `hugo.yml` are:

```text
zh-cn
zh-tw
en
ja
```

The English content directory is `content/en-us`, but the generated language prefix is `/en/`.
The Japanese content directory is `content/ja-jp`, but the generated language prefix is `/ja/`.

The default language is `zh-cn`.
Because `defaultContentLanguageInSubdir` is `false`, Simplified Chinese URLs do not get a `/zh-cn/` prefix.

## Main Content Sections

The theme default config sets:

```yaml
params:
  mainSections:
    - posts
```

The home page, archives, widgets, search, and related content all rely on `mainSections`.

If a future section should behave like blog posts, add it to `mainSections`.
If a page should not appear on listing pages, set:

```yaml
hidden: true
```

## Permalinks

Configured in `hugo.yml`:

```yaml
permalinks:
  posts: /archives/:slug/
  page: /:slug/
```

For posts, `slug` is important.
The generated article URL is usually:

```text
/archives/<slug>/
```

The default archetype contains:

```yaml
slug:
title:
author: yexca
date:
categories:
tags:
```

## Recommended Post Front Matter

```yaml
---
slug: 282
title: Example Title
author: yexca
date: 2026-05-30T12:00:00+09:00
categories:
  - Life
tags:
  - Hugo
  - Blog
description: Short subtitle shown under the title.
image: cover.jpg
---
```

Common optional fields:

```yaml
hidden: true
comments: false
math: true
readingTime: false
license: false
translationKey: stable-key-for-this-post
```

Use `translationKey` if Hugo does not automatically connect translations.
Otherwise, keep translated posts in matching relative paths and filenames across language directories.

## Categories and Tags

Categories are rendered from Hugo taxonomy terms:

```go-html-template
{{ range (.GetTerms "categories") }}
```

Tags on the home card are rendered from raw front matter values:

```go-html-template
{{ range .Params.tags }}
```

This means category links and tag links are generated slightly differently:

- categories use Hugo term pages
- tags use `"/tags/" | relLangURL` plus `urlize`

The home card category badges are styled as glass badges under `.article-list .article-category a`.
The general category style still exists for other contexts.

Term pages may define:

```yaml
style:
  background: "#2a9d8f"
  color: "#fff"
```

The current `details.html` still outputs this as inline style.
Inline style will override normal SCSS.
Avoid term-level `style` if the design should remain fully glass and color-neutral.

## Translations

Article translation links appear when:

```go-html-template
{{ if .IsTranslated }}
```

The home card and article page both render translation links from:

```text
themes/hugo-theme-stack/layouts/partials/article/components/details.html
```

The left sidebar language switcher tries to link to the current page translation.
If the current page does not have a translation in a language, it links to that language's home page.

## Link Pages

The links component supports grouped sections.
Use `linkSections` in page front matter:

```yaml
---
title: Links
slug: links
linkSections:
  - title: Friends
    description: Personal blogs and websites.
    icon: users
    links:
      - title: Example Site
        website: https://example.com
        description: A short note.
        icon: link
        external: true
  - title: Tools
    icon: tool
    links:
      - title: Local Page
        website: /some-page/
        description: Internal link.
        external: false
---
```

Legacy `links` is still supported.
If only `links` is present, the component wraps it in a single default section.

Each link can use:

- `title`
- `website`
- `description`
- `icon`
- `image`
- `external`

Images are first resolved from page resources, then used as given.

## Shortcodes

Custom shortcodes live in:

```text
themes/hugo-theme-stack/layouts/shortcodes
```

Important customized shortcodes:

- `notice.html`
- `details.html`
- `timeline.html`
- `github.html`
- media embeds such as `bilibili.html`, `youtube.html`, `netease.html`, `video.html`

### Notice

Usage:

```markdown
{{< notice type="info" >}}
Message.
{{< /notice >}}
```

Supported types:

- empty/default
- `info`
- `warn`
- `danger`

The shortcode includes inline CSS and uses the global glass variables.

### Details

Usage:

```markdown
{{< details "Title" >}}
Hidden content.
{{< /details >}}
```

Warning: the shortcode CSS targets generic `details` and `summary` selectors.
If many native details blocks are added later, consider scoping this shortcode with a custom class.

### Timeline

Usage:

```markdown
{{< timeline src="content/path/to/file.json" >}}
```

The shortcode reads JSON using `readFile` and expects each item to contain:

```json
[
  {
    "date": "2026-05-30",
    "content": "HTML-safe timeline content"
  }
]
```

`content` is rendered with `safeHTML`, so only trusted JSON should be used.

### GitHub

Argon-style GitHub repository card.

Usage:

```markdown
{{< github repo="owner/repo" >}}
{{< github repo="owner/repo" size="mini" >}}
{{< github author="owner" project="repo" >}}
```

The card fetches repository description, stars, forks, and homepage in the browser from the GitHub API.
If the repository has no description, the card shows a localized fallback message from `themes/hugo-theme-stack/i18n/*.yaml`.
If the repository has no homepage, the homepage row is hidden.
The `mini` size always hides the homepage row to keep the compact card readable.
The card background is transparent (`rgba(..., 0)`) and the text colors follow Stack light/dark theme variables.

## Possible AI Summary Extension

A future AI summary feature can be implemented as static front matter:

```yaml
aiSummary: "One or two sentence summary."
```

Then render it in `article/components/details.html` or in a home-card-only partial.
Prefer generating summaries before build time and storing them in Markdown front matter.
Do not call an AI API during Hugo builds, because it would make builds slow, fragile, and harder to secure.

