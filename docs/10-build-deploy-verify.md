# Build Deploy Verify

## Local Preview

Use Hugo server for local development. Keep drafts and future content behavior
explicit when testing.

```powershell
.\env\hugo\hugo.exe server --buildDrafts --buildFuture
```

## Production Build

```powershell
.\env\hugo\hugo.exe --gc --minify
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
- Search page.
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
