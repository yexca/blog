# Content And I18n

## Content Layout

Content is organized by language under `content/`:

```text
content/
  zh-cn/
  zh-tw/
  en-us/
  ja-jp/
```

The default language is `zh-cn`. Generated URLs for the default language do not
use a language prefix.

## Front Matter

Keep front matter stable across translations when possible:

- `title`
- `description`
- `date`
- `slug` or path-derived URL behavior
- `categories`
- `tags`
- `image`
- language or translation metadata when present

## Translation Workflow

Translation automation lives in:

- `translation/translate.config.json`
- `translation/translation-manifest.json`
- `scripts/translate/translate.mjs`

The manifest tracks source hashes and translation state. Do not hand-edit it
unless you are repairing known bad state.

## Theme I18n

Theme UI strings live in `themes/hugo-theme-stack/i18n/`. Add or update theme
strings there rather than hard-coding language-specific labels in templates.

## Site Identity

`params.author.name` in `hugo.yml` controls the author name shown in the sidebar
profile. The site title remains language-aware and is displayed in the Header.

## Maintenance Checks

When content structure or language rules change:

- Build the site.
- Check default-language URLs.
- Check one translated post in each language.
- Check menus, taxonomy pages, archives, and search.
- Update translation config if source/target paths changed.
