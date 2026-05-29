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

## Deployment

Deployment is configured in `.github/workflows/deploy.yml`.

The workflow:

1. Runs on pushes to `main` or manual dispatch.
2. Installs Hugo extended `0.140.1`.
3. Runs `hugo --minify`.
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
2. Start the local server.
3. Check the home page in light and dark modes.
4. Check a single article page.
5. Check a category page or tag page if taxonomy links changed.
6. Check the archive page if article list, card, or timeline styles changed.
7. Check at least one translated article if language links or URL generation changed.

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

