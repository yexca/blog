---
slug: 35
title: 'PicX で画像をアップロードする時に "Bad credentials" って出る問題'
date: '2022-03-22T16:30:12+08:00'
author: yexca
# layout: post
# permalink: /archives/35
views:
    - '374'
categories:
    - 技術メモ
tags:
    - Github
    - PicX
    - 画像ホスティング
---

{{< notice >}} この記事は Gemini-3-flash によって翻訳されました {{< /notice >}}

## はじめに

今日記事を書いてたら、PicX が使えなくなってて "Bad credentials" って表示されたんだよね。だから解決策を探してみたよ。

## 結論

結局、GitHub のトークンの有効期限が切れちゃっただけなんだ。メールボックスを確認すると、`[GitHub] Your personal access token has expired` っていう件名のメールが届いているはず。

メールは3行くらいで、2行目の `If this token is still needed` の後にリンクがあるから、そこをクリックしてトークンを再作成すればOK。

その時、`Expiration`（トークンの有効期限）の設定を忘れないようにね。
再作成した後は、PicX 側で画像ホスティングの設定を更新（リセット）する必要があるよ。

詳しい手順はここを参考にしてね：[PicX で自分専用の無料画像ホスティングを作る – yexca’Blog](https://blog.yexca.net/ja/archives/27)
