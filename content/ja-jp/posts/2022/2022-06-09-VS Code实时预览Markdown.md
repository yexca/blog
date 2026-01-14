---
slug: 46
title: 'VS CodeでMarkdownをリアルタイムプレビューする方法'
date: '2022-06-09T00:03:34+08:00'
author: yexca
# layout: post
# permalink: /archives/46
views:
    - '245'
categories:
    - 試行錯誤の記録
tags:
    - Markdown
    - 'VS Code'
---

{{< notice >}} この記事は Gemini-3-flash によって翻訳されました {{< /notice >}}

## はじめに

[Markdownの使い方](https://yexca.xyz/index.php/2022/05/28/markdown%e7%ae%80%e6%98%93%e5%85%a5%e9%97%a8%e5%ad%a6%e4%b9%a0%e7%ac%94%e8%ae%b0/)を学んでから、すごく使い勝手がいいなって感じてる（最近の記事は全部Markdownで書いてるんだ）。プログラミングや[GitHubでのサイト作成](https://yexca.xyz/index.php/2022/05/28/github-pages%e5%bb%ba%e7%ab%99%e5%8f%8a%e8%87%aa%e5%ae%9a%e4%b9%89%e5%9f%9f%e5%90%8d/)でMarkdownに触れる機会も多いし、普段プログラミングでVS Codeを使ってるから（嘉然を見てるし）、リアルタイムプレビューができるか調べてみたよ。

## ショートカットキー

Markdownファイル（.mdファイル）の画面で、ファイル内を一度クリックして（カーソルをファイルの中に置いて）、`CTRL+K` を押した後に `V` を押せばOK。この時、**英字入力モード**になっているか注意してね。

これが*リアルタイムプレビュー*で、`CTRL+Shift+V` を押すと新しいウィンドウでプレビューを開くことができるよ。

## ボタン

Markdownファイルの右上に「側面にプレビューを表示」ボタンがあるから、それをクリックするだけでも大丈夫。

![リアルタイムプレビューボタン](https://cdn.jsdelivr.net/gh/yexca/picx-images-hosting@master/2022/06-VsCode-嘉然/image.2x0ji2pjqik0.webp)

## コマンドパレット

`CTRL+Shift+P` を押してコマンドパレットを開いて、`markdown` と入力すれば、いくつかコマンドが表示されるよ。

## 参考記事

[Visual Studio Code 编写并实时预览 Markdown](https://blog.csdn.net/supergao222/article/details/78596704)