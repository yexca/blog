# Development Workflow

## Requirements

Use Hugo extended version `0.140.1`.

On this Windows workspace, a local Hugo binary exists at:

```powershell
.\env\hugo\hugo.exe
```

The dev container and GitHub Actions workflow also install Hugo `0.140.1`.

## Local Preview

From the repository root:

```powershell
.\env\hugo\hugo.exe server --bind 127.0.0.1 --port 1313 --disableFastRender
```

Then open:

```text
http://localhost:1313/
```

Use `--disableFastRender` when changing layouts or SCSS, because it makes template changes easier to verify.

## Production Build

From the repository root:

```powershell
.\env\hugo\hugo.exe --gc --minify
```

The generated site is written to `public/`.

## Performance Report

After a production build, run:

```powershell
& "C:\Users\yexca\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" scripts\check-performance.mjs
```

The report reads `public/` and prints output size, largest HTML, search JSON,
CSS, JS, font, feed, and image files. Budget warnings are informational only.

To refresh the dated Markdown report:

```powershell
& "C:\Users\yexca\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" scripts\check-performance.mjs --write-report
```

## Deployment

Deployment is configured in `.github/workflows/deploy.yml`.

The workflow:

1. Runs on pushes to `main` or manual dispatch.
2. Installs Hugo extended `0.140.1`.
3. Runs `hugo --gc --minify`.
4. Publishes `public/` to the external repository `yexca/blog-web`, branch `main`.

The deployment token is expected in the GitHub secret:

```text
PERSONAL_TOKEN
```

## Dev Container

The dev container files are:

- `.devcontainer/Dockerfile`
- `.devcontainer/devcontainer.json`

The container installs:

- Git
- Curl
- Hugo extended `0.140.1`

The default exposed port is `1313`.

## Recommended Verification Checklist

After changing templates or SCSS:

1. Run a production build.
2. Run the performance report when output size, search, taxonomy, images, fonts, or third-party scripts changed.
3. Start the local server.
4. Check the home page in light and dark modes.
5. Check a single article page.
6. Check a category page or tag page if taxonomy links changed.
7. Check the archive page if article list, card, or timeline styles changed.
8. Check at least one translated article if language links or URL generation changed.
9. If code block styles or scripts changed, check copy, line wrap, collapse, and window mode in both light and dark modes.

## Common Commands

```powershell
# Build
.\env\hugo\hugo.exe --gc --minify

# Preview
.\env\hugo\hugo.exe server --bind 127.0.0.1 --port 1313 --disableFastRender

# Inspect changed files
git status --short
git diff --stat
```

