# yexca's Blog

> 语言 / 言語: [简体中文](README.zh-CN.md) | [日本語](README.ja.md) | [繁體中文](README.zh-TW.md)

Welcome to my blog repository!

This is where I document my thoughts, experiences, and creations related to learning, life, and development.  
The blog supports multiple languages: Simplified Chinese, Traditional Chinese, Japanese, and English.  
(Note: Not every post has versions in all languages.)

## ✨ Features

- 📚 Multi-language support (Hugo + i18n)
- 🛠 Customized theme and category/tag system
- 💡 Tech notes / Life thoughts
- 🗂 Clear content structure, suitable for browsing and further development
- Same-origin soft navigation with browser history, scroll restoration, View Transition support, and safe fallbacks
- Enhanced code blocks with copy, line wrapping, collapse, and detachable window mode
- Performance maintenance workflow for build output, search index size, assets, fonts, and third-party scripts

## 🗃 Directory Structure

- `content/`: Blog posts, organized by language
- `themes/`: Based on [stack](https://github.com/CaiJimmy/hugo-theme-stack) with customizations
- `static/`: Static resources
- `docs/`: maintenance documentation for the current refactored blog
- `scripts/`: local maintenance scripts, including performance reporting
- `hugo.yml`: Blog configuration

## 🧩 Built With

- Hugo static site generator
- GitHub Actions for automatic deployment

## 📄 Documentation

Start with [docs/README.md](docs/README.md). The current maintenance notes cover:

- development workflow
- theme architecture
- content model
- layout and partial references
- styles and client scripts
- performance
- maintenance playbooks

Important note: the theme is customized directly under `themes/hugo-theme-stack`. Before replacing or upgrading the upstream Stack theme, compare local changes carefully.

## 📝 License

Blog content is licensed under [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) (see [LICENSE](LICENSE)): you may share and adapt it for non-commercial purposes, as long as you give credit and release your adaptations under the same license. Quoted third-party content remains with its original authors, as credited.

The theme in `themes/hugo-theme-stack` is a modified [Hugo Theme Stack](https://github.com/CaiJimmy/hugo-theme-stack) and stays under its own [GPL-3.0](themes/hugo-theme-stack/LICENSE) license.
