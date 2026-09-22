# Performance

## Report

Run a production build first, then run the performance report:

```powershell
docker run --rm -v "${PWD}:/src" -w /src blog-hugo:0.166.0 hugo --gc --minify
```

```powershell
& "C:\Users\yexca\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" scripts\check-performance.mjs
```

Budgets live in `scripts/performance-budgets.json`. Warnings are informational,
but they should be investigated before large UI or asset changes are merged.

## What The Report Checks

- Total public output size.
- Large HTML files.
- Search JSON size.
- CSS and JS bundle size.
- Font files.
- Feeds.
- Largest images.

## Fonts

`static/fonts/` should not contain unused fonts. Files in `static/` are copied
directly into the published site.

Web fonts come from Google Fonts. `partials/head/custom.html` emits one
`<link data-language-font>` per page with only the family for the current
language (Noto Sans SC / TC / JP + Yomogi / Comic Neue + Noto Sans). Keep that
mapping aligned with the `--*-font-family` stacks in `assets/scss/variables.scss`,
which also set `--article-font-family` per language so article text and UI use
the same family.

## Search

The search index rows are built by `partials/search/index-data.html` and
rendered by two templates:

- `layouts/page/search.json` (`index.json`): default index, article text
  truncated to `params.search.snippetLength` runes (800 in `hugo.yml`).
- `layouts/page/search.searchfull.json` (`index-full.json`): full article text,
  fetched only when the visitor enables the full-text checkbox.

Check the default `index.json` per language against the `searchJsonBytes`
budget; the full index is expected to be several times larger.

The search page should request the JSON only after the user searches or opens a
search URL with a keyword parameter.

## Images And Third Parties

Prefer responsive images for article covers and list cards. Load third-party
scripts lazily when possible. Current lazy-loading areas include comments,
GitHub info cards, tile-card color extraction, search, and PhotoSwipe (only on
articles whose content contains gallery images).

Mermaid is another opt-in third-party dependency. Keep the page switch disabled
by default and load the pinned CDN module only on pages that contain Mermaid
diagrams. Compare the production bundle and network requests before and after
changes to the Mermaid feature.
