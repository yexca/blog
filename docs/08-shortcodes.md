# Shortcodes

Shortcodes live in `themes/hugo-theme-stack/layouts/_shortcodes/`.

## Inventory

| Shortcode | File |
| --- | --- |
| About 2026 | `about-2026.html` |
| About profile | `about-profile.html` |
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

## About Profile

`about-profile.html` renders the current (2026-10-30) About version: profile,
stats, current focus, projects, and the site timeline. Copy comes from a JSON
file passed with `src`:

```go-html-template
{{< about-profile src="content/zh-cn/page/about/about-profile.json" >}}
```

Each language keeps its text in `content/<lang>/page/about/about-profile.json`.
The stats row (posts, categories, tags, languages) is counted from the current
language's site at build time; `stats.since_date` sets the founding year.
Timeline entries are grouped by the year in their `date`; `kind: main` draws a
filled dot, anything else a hollow one.

Optional keys, each rendered only when present:

- `now.updated` and `now.items[].links` (`label`/`url` chips to related posts).
- `principles` (`eyebrow`, `title`, `items[]` of `title`/`text`).
- `projects.groups[]` (`title`, `items[]`) in place of a flat `projects.items`.
- `writing` (`eyebrow`, `title`, `count`, `more`) lists the latest posts of the
  current language, so this section never needs editing. Styles live in
`assets/scss/partials/layout/about-profile.scss`; there is no script.

## About 2026

`about-2026.html` renders the 2026-05-31 About version from a JSON file passed
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
