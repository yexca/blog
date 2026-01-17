---
slug: 3
title: WordPressでBilibili動画を埋め込む方法
date: '2021-11-06T16:43:20+08:00'
author: yexca
# permalink: /archives/3
views:
    - '201'
categories:
    - 開発実践
tags:
    - WordPress
---

{{< notice >}} この記事は gemini-3-flash-preview によって翻訳されました {{< /notice >}}

## 本文

まずは、埋め込みたい動画のページに行って、共有ボタンの上にマウスを置いてみて（クリックはしなくていいよ）。

それから「埋め込みコード」のところまで移動してコピーしてね。

（今回の例だとこんな感じのコードになるよ）

```html
<iframe src="//player.bilibili.com/player.html?aid=583631611&bvid=BV1Tz4y1X7Bg&cid=206708397&page=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"> </iframe>
```

このコードの中にある「**aid**」と「**cid**」の部分（つまり aid=583631611 と cid=206708397 ）が必要なんだ。

次に、aidとcidを下のコードの対応する場所に書き込もう。

```html
<div style="position: relative; padding: 30% 45%;">
<iframe style="position: absolute; width: 100%; height: 100%; left: 0; top: 0;" src="https://player.bilibili.com/player.html?cid=206708397&aid=583631611&page=1&as_wide=1&high_quality=1&danmaku=0" frameborder="no" scrolling="no"></iframe>
</div>
```

（上のコードはaidとcidを書き換え済みだよ）

記事を書いてる時に動画を入れたくなったら、ブロックを「**カスタムHTML**」にして、aidとcidを書き換えたコードを貼り付けるだけでOK。

実際のサンプル動画はこんな感じ。

{{< bilibili BV1Tz4y1X7Bg >}}

## 参考記事

[关于博客园内嵌入bilibili视频](https://www.cnblogs.com/wkfvawl/p/12268980.html)
