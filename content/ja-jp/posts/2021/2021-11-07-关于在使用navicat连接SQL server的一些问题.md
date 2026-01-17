---
slug: 7
title: 'Navicat で SQL Server に接続する際に困ったこといくつか'
date: '2021-11-07T23:41:46+08:00'
author: hiyoung
# layout: post
# permalink: /archives/7
views:
    - '200'
categories:
    - 技術学習
tags:
    - データベース
    - Navicat
---

{{< notice >}} この記事は gemini-3-flash-preview によって翻訳されました {{< /notice >}}

> この記事は [Hiyoung](https://blog.hiyoung.icu/) が書いたよ。

SQL Server と Navicat をインストールした後、Navicat にデータベースを追加する手順はこんな感じ：

1. 接続名は特に決まりはないから、自分の好きな名前を付けてね。

2. インストールした SQL Server 構成マネージャーを開く。

注意：SQL Server（SQLEXPRESS）が実行中であることを確認してね。そうじゃないと Navicat から接続できないんだ。
ダブルクリックで開いて「サービス」をクリックすると、自分のホスト名が確認できるよ。

3. Navicat を開いて、ホストのところに「ホスト名 \SQLEXPRESS」の形式で入力する。

4. ユーザー名は「sa」を入力してね（これは SQL Server インストール時のデフォルトのユーザー名。具体的な SQL Server の使い方はネットにたくさんチュートリアルがあるから、そっちを参考にしてみて）。パスワードは自分で設定したもの（これもインストール時に決めたやつだね）を入力。

5. 接続テストをして成功すれば、もう使えるよ。

注：これはあくまで僕がインストール中に遭遇した問題についてのメモだから、詳しいインストール手順はネットで調べてみてね。

Navicat 15 とレジストリツールのリンクも貼っておくよ：<https://pan.baidu.com/s/1cJ1EZ9Gyz6Jp6J03VqcDHA>

抽出コード：3n7g
