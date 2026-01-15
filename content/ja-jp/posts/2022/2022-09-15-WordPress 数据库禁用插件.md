---
slug: 72
title: 'WordPress のデータベースからプラグインを無効化する'
date: '2022-09-15T22:17:02+08:00'
author: yexca
# layout: post
# permalink: /archives/72
views:
    - '207'
categories:
    - 試行錯誤
tags:
    - WordPress
---

{{< notice >}}この記事は gemini-2.5-flash-lite によって翻訳されました {{< /notice >}}

## はじめに

あるプラグインを有効にしたら、管理画面が 502 エラーになっちゃったんだ。

## データベースにアクセス

1. `wp_options` テーブルを選択して入るよ。

2. `active_plugins` っていう項目を探す。だいたい2ページ目あたりにあるはず。

3. この項目の `option_value` の行を編集するんだ。

## 不要なプラグインを削除

***注意：削除する前に必ずバックアップを取ってね！！！***

1. いらないプラグインの名前を探す。

   `i` から `;` までを削除するんだ。例えば `i:1;s:23:"elementor/elementor.php";` みたいな感じ。

2. 連番を書き換える。つまり `i,` の後の数字だね。

3. 合計数を書き換える。つまり一番最初の `a:` の後の数字だよ。

## 参考記事

[WordPress のデータベースから 1 つのプラグインを無効化する - WordPress - GoDaddy ヘルプ SG](https://sg.godaddy.com/zh/help/disable-one-wordpress-plugin-from-the-database-41199)
