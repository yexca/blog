---
slug: 67
title: ArgonテーマのWordPressで萌娘百科（MoeGirlPedia）風の「黒塗り」を実装する
date: '2022-09-05T21:51:23+08:00'
author: yexca
# layout: post
# permalink: /archives/67
views:
    - '256'
    categories:
    - 開発実践
tags:
    - WordPress
---

{{< notice >}} この記事は Gemini-3-flash によって翻訳されました {{< /notice >}}

## はじめに

この「黒塗り（黒幕）」、すごく面白いんだよね。本当に面白いんだけど、残念ながらトップページでは反映されないし、Markdownで書くのもちょっと手間がかかるんだ。

## 使い方

記事を書くときに「HTMLとして編集」を選んで、次のコードを挿入してね。

```html
<span class="heimu" title="黒塗りの上にマウスを置いた時に出る文字">隠したい文字</span>
```

## CSSの挿入

本当はトップページでも黒塗りが表示されるようにしたかったんだけど、実際にテストしてみたらトップページでは反映されなかったんだ…… ~~(なんで反映されないのぉぉぉぉぉ！！！！！！！ Warmaの声を想像してみて)~~

管理画面の設定から「フッター」設定を見つけて、以下のコードを入力するか、WordPressのカスタムCSSに挿入してね。ただし、カスタムCSSの場合は `<style>` タグを外す必要があるよ。

```html
<style>
.heimu, .heimu a, a .heimu, .heimu a.new 
{
  background-color: #252525;
  color: #252525;
  text-shadow: none;
}
.heimu:hover, .heimu:active,
.heimu:hover .heimu, .heimu:active .heimu 
{
  color: white !important;
}
.heimu:hover a, a:hover .heimu,
.heimu:active a, a:active .heimu 
{
  color: lightblue !important;
}
.heimu:hover .new, .heimu .new:hover, .new:hover .heimu,
.heimu:active .new, .heimu .new:active, .new:active .heimu 
{
  color: #BA0000 !important;
}
</style>
```

注：Argonテーマではコメントがレンダリングされないから、以下の内容はコードの中には入れてないよ：

`/*詳細：https://zh.moegirl.org/MediaWiki:Mobile.css 本文は萌娘百科(https://zh.moegirl.org)より引用。テキスト内容はクリエイティブ・コモンズ 表示 - 非営利 - 継承 3.0 非移植 (CC BY-NC-SA 3.0) ライセンスに基づきます。*/`

## 参考記事

[Re：萌娘百科上的黑幕实现 – Vanilla\_chan – 博客园](https://www.cnblogs.com/Vanilla-chan/p/12355387.html)

[萌百黑幕CSS代码-Hiyoung’blog](https://hiyoungssr.xyz/2022/08/22/%E8%90%8C%E7%99%BE%E9%BB%91%E5%B9%95CSS%E4%BB%A3%E7%A0%81/)