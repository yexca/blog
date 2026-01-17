---
slug: 3
title: Embedding Bilibili Videos in WordPress
date: '2021-11-06T16:43:20+08:00'
author: yexca
# permalink: /archives/3
views:
    - '201'
categories:
    - Development Practice
tags:
    - WordPress
---

{{< notice >}} This article was translated by gemini-3-flash-preview {{< /notice >}}

## Content

First, hover your mouse over the share button on the video you want to embed (no need to click).

Then move to the embed code and copy it.

(Example code below)

```html
<iframe src="//player.bilibili.com/player.html?aid=583631611&bvid=BV1Tz4y1X7Bg&cid=206708397&page=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"> </iframe>
```

We need the "**aid**" and "**cid**" parts from this code (i.e., aid=583631611 and cid=206708397).

Then, plug the aid and cid into the corresponding positions in the code below:

```html
<div style="position: relative; padding: 30% 45%;">
<iframe style="position: absolute; width: 100%; height: 100%; left: 0; top: 0;" src="https://player.bilibili.com/player.html?cid=206708397&aid=583631611&page=1&as_wide=1&high_quality=1&danmaku=0" frameborder="no" scrolling="no"></iframe>
</div>
```

(The aid and cid have already been replaced in the code above.)

When writing your post, simply set the block to "**Custom HTML**" and paste the code with your specific aid and cid.

Below is an example video:

{{< bilibili BV1Tz4y1X7Bg >}}

## References

[Regarding embedding Bilibili videos in CNBlogs](https://www.cnblogs.com/wkfvawl/p/12268980.html)
