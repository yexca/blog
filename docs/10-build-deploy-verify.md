# Build Deploy Verify

## Local Preview

Hugo is not installed on the workstation, so build through Docker using the image from `.devcontainer/Dockerfile` (`docker build -f .devcontainer/Dockerfile -t blog-hugo:0.140.1 .devcontainer`, pinned to the CI Hugo version). Keep drafts and future content behavior
explicit when testing.

```powershell
docker run --rm -it -p 1313:1313 -v "${PWD}:/src" -w /src blog-hugo:0.140.1 hugo server --bind 0.0.0.0 --buildDrafts --buildFuture
```

## Production Build

```powershell
docker run --rm -v "${PWD}:/src" -w /src blog-hugo:0.140.1 hugo --gc --minify
```

## Performance Report

```powershell
& "C:\Users\yexca\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" scripts\check-performance.mjs
```

## Verification Checklist

After theme changes, check:

- Home page.
- One article page with code blocks.
- One article page with Mermaid enabled and one with Mermaid disabled.
- One article page with images.
- Archives page.
- Category page.
- Tag page.
- Search page (snippet mode and full-text mode).
- Home page language redirect with a non-matching browser language (and no redirect for crawler user agents).
- About page.
- Mobile layout.
- Dark and light color schemes.
- Soft navigation between same-origin pages.
- Mermaid diagrams after soft navigation and after a color-scheme switch.

After translation changes, check:

- One source post.
- One translated post per target language.
- Language switcher.
- Translation manifest diff.

After performance-sensitive changes, check:

- `public/` size.
- Largest CSS and JS files.
- Search index size.
- New files under `static/`.
