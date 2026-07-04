# Shortcodes

Shortcodes live in `themes/hugo-theme-stack/layouts/shortcodes/`.

## Inventory

| Shortcode | File |
| --- | --- |
| About 2026 | `about-2026.html` |
| About version | `about_version.html` |
| About versions | `about_versions.html` |
| Bilibili | `bilibili.html` |
| Details | `details.html` |
| GitHub | `github.html` |
| GitLab | `gitlab.html` |
| Kbd | `kbd.html` |
| Mark | `mark.html` |
| Netease | `netease.html` |
| Notice | `notice.html` |
| Quote | `quote.html` |
| Raw HTML | `rawhtml.html` |
| Ruby | `ruby.html` |
| Tencent | `tencent.html` |
| Timeline | `timeline.html` |
| Video | `video.html` |
| YouTube | `youtube.html` |

## Styling And Scripts

Shared shortcode styles belong in
`assets/scss/partials/components/shortcodes.scss` unless the shortcode is a
large page-specific feature.

Interactive shortcode behavior should live in `assets/ts/features/` and be
registered through `assets/ts/core/pageInit.ts`.

## About 2026

`about-2026.html` renders the current rich About page from a JSON file passed
with `src`, for example:

```go-html-template
{{< about-2026 src="content/zh-cn/page/about/about-2026.json" >}}
```

Each language keeps its text in its own `content/<lang>/page/about/about-2026.json`.
The shortcode owns the markup only; identity copy, focus items, mind-map cards,
site-universe labels, project rows, history nodes, and footer text belong in
the JSON file.

## Maintenance Rules

- Keep old parameter names working when posts already use them.
- Document new parameters near the shortcode template or in this file.
- Check rendered output in every language that uses the shortcode.
- Avoid fetching third-party data before the shortcode enters the viewport.
