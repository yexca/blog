---
slug: 3
title: WordPress 嵌入 BiLiBiLi 影片說明
date: '2021-11-06T16:43:20+08:00'
author: yexca
# permalink: /archives/3
views:
    - '201'
categories:
    - 開發實踐
tags:
    - WordPress
---

> 該文章使用 Google 翻譯處理。

## 正文

首先到待嵌入的視頻將鼠標移到分享按鈕上（不用點擊）

然後移到嵌入代碼並複制

（本例代碼如下）

```HTML
<iframe src="//player.bilibili.com/player.html?aid=583631611&bvid=BV1Tz4y1X7Bg&cid=206708397&page=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"> </iframe>
```

我們需要這串程式碼中的「**aid**」和「**cid**」部分（即 aid=583631611 和 cid=206708397 ）

然後將 aid 和 cid 填入下方代碼的對應位置

```html
<div style="position: relative; padding: 30% 45%;">
<iframe style="position: absolute; width: 100%; height: 100%; left: 0; top: 0;" src="https://player.bilibili.com/player.html?cid=206708397&aid=583631611&page=1&as_wide=1&high_quality=1&danmaku=0" frameborder="no" scrolling="no"></iframe>
</div>
```

（以上代碼中 aid 和 cid 已替換）

在寫文章的過程若插入影片只需將區塊設為「**自訂 HTML**」然後把替換好aid和cid的程式碼拷貝過去即可

如下為示例視頻

{{< bilibili BV1Tz4y1X7Bg >}}

## 參考文章

[關於博客園內嵌入 bilibili 視頻](https://www.cnblogs.com/wkfvawl/p/12268980.html)
