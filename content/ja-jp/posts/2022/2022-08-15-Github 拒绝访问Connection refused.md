---
slug: 58
title: 'Github へのアクセス拒否 Connection refused'
date: '2022-08-15T02:44:47+08:00'
author: yexca
# layout: post
# permalink: /archives/58
views:
    - '385'
categories:
    - やってみた
tags:
    - Github
---

{{< notice >}} この記事は Gemini-3-flash によって翻訳されました {{< /notice >}}

## はじめに

今日、Git でプッシュしようとしたら `fatal: unable to access 'https://github.com/yexca-VRChat/yexca-VRChat.github.io.git/': Failed to connect to 127.0.0.1 port 1081 after 2074 ms: Connection refused` ってエラーが出ちゃったんだ。PC を再起動してもダメだったから、解決策を探すことにしたよ（~~自分のリポジトリになんでアクセスさせてくれないんだよ~~）。

## 解決までの道のり

調べてみたところ、プロキシに関係があるみたいなんだけど、プロキシはルーター側で設定してるはずなんだよね。

そこで、別の普通のルーターに繋ぎ直してもう一度プッシュしてみたけど、やっぱり同じ問題が発生。

次に Git のプロキシ設定を解除してみたけど、これも効果なし。

```bash
git config --global --unset http.proxy
git config --global --unset https.proxy
```

最後に、そういえば WinXray を使ってたかも…？と思い出して確認してみたら、案の定 PAC モードがオンになってた。それをオフにしたら、無事にプッシュできたよ！

## 参考記事

[fatal: unable to access 'https://github.com/fmoraless/e-commerce.git/': Failed to connect to 127.0.0.1 port 56832: Connection refuse · Issue #11981 · desktop/desktop](https://github.com/desktop/desktop/issues/11981)

[解决git下载出现：Failed to connect to 127.0.0.1 port 1080: Connection refused拒绝连接错误_点亮～黑夜的博客-CSDN博客](https://blog.csdn.net/weixin_41010198/article/details/87929622)

[git 报错:解决拒接接入问题_Huang_milk的博客-CSDN博客](https://blog.csdn.net/Huang_milk/article/details/121291273?utm_medium=distribute.pc_relevant.none-task-blog-2~default~baidujs_baidulandingword~default-0-121291273-blog-87929622.pc_relevant_multi_platform_whitelistv4&spm=1001.2101.3001.4242.1&utm_relevant_index=3)
