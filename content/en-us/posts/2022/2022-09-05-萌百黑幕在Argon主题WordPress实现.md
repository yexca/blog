---
slug: 67
title: Implementing Moegirl-style "Blackout" Text in WordPress Argon Theme
date: '2022-09-05T21:51:23+08:00'
author: yexca
# layout: post
# permalink: /archives/67
views:
    - '256'
categories:
    - Development Practice
tags:
    - WordPress
---

{{< notice >}} This article was translated by Gemini-3-flash {{< /notice >}}

## Introduction

This "blackout" effect (Heimu) is a lot of fun. Unfortunately, it won't render on the homepage, and writing it directly in Markdown is a bit of a pain.

## Usage

When writing a post, select **Edit as HTML** and insert the following:

```html
<span class="heimu" title="Tooltip text">Text to hide</span>
```

## Inserting CSS

I originally wanted to get the blackout effect working on the homepage, but testing showed it just won't render there. ~~(Why won't it render?! Imagine Warma's voice here.)~~

Go to your dashboard, find the **Footer** settings, and paste the code below. Alternatively, you can insert it into the WordPress Custom CSS section (just remember to remove the `<style>` tags).

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

Note: Since the Argon theme doesn't render comments, I've left the following out of the code block:

`/* Read more: https://zh.moegirl.org/MediaWiki:Mobile.css This content is cited from Moegirlpedia (https://zh.moegirl.org). Text content is available under CC BY-NC-SA 3.0. */`

## References

[Re: Implementing Blackout on Moegirlpedia – Vanilla_chan – Blog Garden](https://www.cnblogs.com/Vanilla-chan/p/12355387.html)

[Moegirl Blackout CSS Code - Hiyoung’blog](https://hiyoungssr.xyz/2022/08/22/%E8%90%8C%E7%99%BE%E9%BB%91%E5%B9%95CSS%E4%BB%A3%E7%A0%81/)
