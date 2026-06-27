# Overview

This repository is a Hugo blog with a heavily customized Stack-based theme.
The important maintenance fact is that `themes/hugo-theme-stack` is no longer a
clean upstream theme checkout. Treat it as local application code.

## Core Facts

- Static site generator: Hugo extended.
- Expected Hugo version: `0.140.1`.
- Main config: `hugo.yml`.
- Theme directory: `themes/hugo-theme-stack`.
- Main content section: `posts`.
- Languages: `zh-cn`, `zh-tw`, `en-us`, `ja-jp`.
- Default language: `zh-cn`.
- Build output: `public/`.
- Translation state: `translation/translation-manifest.json`.

## Maintenance Principles

- Read the local theme before relying on upstream Stack behavior.
- Prefer editing existing partials, SCSS partials, and feature modules over
  adding parallel systems.
- Keep behavior gated by selectors so soft navigation can reinitialize pages.
- Keep generated output, caches, and unused heavy assets out of source unless
  they are intentionally versioned.
- Update docs when a change affects future edit points or verification steps.

## What These Docs Do Not Cover

These docs do not summarize the blog's article content. They focus on the
theme, build system, translation workflow, and maintenance risks.
