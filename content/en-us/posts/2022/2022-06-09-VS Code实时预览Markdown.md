---
slug: 46
title: 'Real-time Markdown Preview in VS Code'
date: '2022-06-09T00:03:34+08:00'
author: yexca
# layout: post
# permalink: /archives/46
views:
    - '245'
categories:
    - Tech Tips
tags:
    - Markdown
    - VS Code
---

{{< notice >}} This article was translated by Gemini-3-flash {{< /notice >}}

## Introduction

After learning [how to use Markdown](https://yexca.xyz/index.php/2022/05/28/markdown%e7%ae%80%e6%98%93%e5%85%a5%e9%97%a8%e5%ad%a6%e4%b9%a0%e7%ac%94%e8%ae%b0/), I've found it incredibly useful (~~all my recent posts are written in Markdown~~). Since I often work with Markdown for coding or [building GitHub Pages](https://yexca.xyz/index.php/2022/05/28/github-pages%e5%bb%ba%e7%ab%99%e5%8f%8a%e8%87%aa%e5%ae%9a%e4%b9%89%e5%9f%9f%e5%90%8d/), and VS Code is my go-to editor (~~for watching Diana~~), I looked for a way to enable real-time previews.

## Shortcuts

Inside a Markdown file (.md), click into the editor window to focus it, then press `CTRL+K` followed by `V`. Note: make sure you're using an **English input method**.

The method above opens a *side-by-side preview*. You can also press `CTRL+Shift+V` to open the preview in a full-sized tab.

## Toolbar Button

In the top right corner of the Markdown editor, there is an "Open Preview to the Side" button. Just click it.

![Real-time Preview Button](https://cdn.jsdelivr.net/gh/yexca/picx-images-hosting@master/2022/06-VsCode-嘉然/image.2x0ji2pjqik0.webp)

## Command Palette

Press `CTRL+Shift+P` to open the Command Palette, then type `markdown` to see the available commands.

## References

[Writing and Real-time Previewing Markdown in Visual Studio Code](https://blog.csdn.net/supergao222/article/details/78596704)