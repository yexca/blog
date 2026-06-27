# Blog Development Documentation

This folder documents the current development state of this Hugo blog.
The site started from `hugo-theme-stack`, but the active theme has been modified directly and should now be treated as a project-specific theme.

## Document Map

- [Development Workflow](./development-workflow.md)
  How to run, build, verify, and deploy the site.
- [Theme Architecture](./theme-architecture.md)
  How Hugo layouts, partials, sidebars, article cards, archives, links, and comments fit together.
- [Content Model](./content-model.md)
  How posts, pages, multilingual content, front matter, taxonomies, links, and shortcodes are expected to work.
- [Customization Reference](./customization-reference.md)
  The main visual and behavior customizations compared with the original Stack theme.
- [Page Transitions](./page-transitions.md)
  How same-origin soft navigation, View Transitions, script replay, and scroll restoration work.
- [Performance](./performance.md)
  Performance budgets, build reports, lazy loading rules, and output-size maintenance notes.
- [Translation Actions](./translation-actions.md)
  How source hashes, LLM provider fallback, translation commits, and Pages deployment are wired.
- [About Page Versioning Summary](./about-page-versioning.md)
  How the versioned About page, 2026 card layout, Mind Map slider, dynamic site universe, and Git-style blog history are implemented.

## Core Facts

- Static site generator: Hugo extended.
- Expected Hugo version: `0.140.1`.
- Theme directory: `themes/hugo-theme-stack`.
- Site config: `hugo.yml`.
- Primary content sections: `posts`.
- Languages: Simplified Chinese, Traditional Chinese, English, Japanese.
- Default language: `zh-cn`, without a language subdirectory in generated URLs.
- Public output directory: `public`.

## Important Maintenance Note

The theme is customized in place under `themes/hugo-theme-stack`.
Do not assume upstream Stack documentation exactly matches this repository.
Before pulling or replacing the upstream theme, compare the local changes carefully.
