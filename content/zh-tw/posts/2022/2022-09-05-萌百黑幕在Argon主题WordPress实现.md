---
slug: 67
title: 萌娘百科黑幕在 Argon 主題 WordPress 實作
date: '2022-09-05T21:51:23+08:00'
author: yexca
# layout: post
# permalink: /archives/67
views:
    - '256'
categories:
    - 開發實踐
tags:
    - WordPress
---

{{< notice >}} 本文由 Gemini-3-flash 翻譯 {{< /notice >}}

## 引言

這個黑幕很好玩啊，非常好玩啊，可惜首頁無法渲染出來，而且 Markdown 編寫渲染也難

## 使用方式

撰寫文章時選擇*作為 HTML 編輯*，插入以下語句

```html
<span class="heimu" title="黑幕彈框裡的字">需要隱藏的文字</span>
```

## 插入 CSS

本來是想著實作首頁也有黑幕，但實際測試發現首頁不會渲染 ~~(為什麼不渲染啊啊啊啊啊啊啊！！！！！！！試著想像 Warma 的聲音)~~

進入後台設定，找到*頁尾*設定，輸入以下程式碼，或者在 WP 的自訂 CSS 處插入，不過需要去掉標籤

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

註：因 Argon 不會渲染註釋，所以我並不把以下內容放入程式碼中：

`/*閱讀更多：https://zh.moegirl.org/MediaWiki:Mobile.css 本文引自萌娘百科(https://zh.moegirl.org)，文字內容預設使用《創用 CC 姓名標示-非商業性-相同方式分享 3.0》協議。*/`

## 參考文章

[Re：萌娘百科上的黑幕實現 – Vanilla\_chan – 博客園](https://www.cnblogs.com/Vanilla-chan/p/12355387.html)

[萌百黑幕CSS代码-Hiyoung’blog](https://hiyoungssr.xyz/2022/08/22/%E8%90%8C%E7%99%BE%E9%BB%91%E5%B9%95CSS%E4%BB%A3%E7%A0%81/)
