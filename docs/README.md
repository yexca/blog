# Maintenance Docs

This directory is the maintenance manual for the blog codebase.

The blog still uses the `hugo-theme-stack` directory name, but the theme has
been changed enough that it should be treated as a project-specific fork.
Use these docs to find the correct edit point before changing layouts, styles,
client scripts, content rules, translation automation, or performance budgets.

## Start Here

- [Overview](./01-overview.md): project facts and maintenance principles.
- [Project Structure](./02-project-structure.md): what each top-level directory owns.
- [Theme Architecture](./03-theme-architecture.md): how Hugo templates, assets, and scripts fit together.
- [Layouts And Partials](./04-layouts-and-partials.md): important template entry points.
- [Styles And Design System](./05-styles-and-design-system.md): SCSS organization and visual rules.
- [Client Scripts](./06-client-scripts.md): TypeScript initialization and page features.
- [Content And I18n](./07-content-and-i18n.md): content layout, languages, and translation automation.
- [Shortcodes](./08-shortcodes.md): shortcode inventory and maintenance rules.
- [Performance](./09-performance.md): budgets, assets, search, fonts, and lazy loading.
- [Build Deploy Verify](./10-build-deploy-verify.md): local commands and release checks.
- [Maintenance Playbook](./11-maintenance-playbook.md): common change recipes.
- [Upstream Theme Risk](./12-upstream-theme-risk.md): how to handle Stack theme updates.

## Archived Notes

Older implementation notes live in [archive](./archive/). They are useful for
historical context, but the files above are the source of truth for future
maintenance.

## Documentation Rules

- Prefer maintenance guidance over change history.
- Point to concrete files and responsibilities.
- Keep article content out of these docs unless it affects theme behavior.
- When adding a feature, document the template, style, script, config, and
  verification points together.
- If a file in `static/` is not required at runtime, move it out of `static/`
  or delete it. Everything in `static/` is published.
