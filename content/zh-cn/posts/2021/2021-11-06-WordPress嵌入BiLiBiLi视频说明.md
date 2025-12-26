---
slug: 3
title: WordPress 嵌入 BiLiBiLi 视频说明
date: '2021-11-06T16:43:20+08:00'
author: yexca
# permalink: /archives/3
views:
    - '201'
categories:
    - 开发实践
tags:
    - WordPress
---

## 正文

首先到待嵌入的视频将鼠标移到分享按钮上（不用点击）

然后移到嵌入代码并复制

（本例代码如下）

```html
<iframe src="//player.bilibili.com/player.html?aid=583631611&bvid=BV1Tz4y1X7Bg&cid=206708397&page=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"> </iframe>
```

我们需要这串代码中的“**aid**”和“**cid**”部分（即 aid=583631611 和 cid=206708397 ）

然后将 aid 和 cid 填入下方代码的相应位置

```html
<div style="position: relative; padding: 30% 45%;">
<iframe style="position: absolute; width: 100%; height: 100%; left: 0; top: 0;" src="https://player.bilibili.com/player.html?cid=206708397&aid=583631611&page=1&as_wide=1&high_quality=1&danmaku=0" frameborder="no" scrolling="no"></iframe>
</div>
```

（以上代码中 aid 和 cid 已替换）

在编写文章的过程若插入视频只需将区块设成“**自定义 HTML**”然后把替换好aid和cid的代码拷贝过去即可

如下为示例视频

{{< bilibili BV1Tz4y1X7Bg >}}

## 参考文章

[关于博客园内嵌入bilibili视频](https://www.cnblogs.com/wkfvawl/p/12268980.html)
