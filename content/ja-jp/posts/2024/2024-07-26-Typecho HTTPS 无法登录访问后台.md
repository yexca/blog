---
slug: 175
title: 'Typecho で HTTPS 化後に管理画面へログインできない問題'
author: yexca
date: 2024-07-26T22:22:22+08:00
categories:
    - やってみた
tags:
    - Typecho
    - トラブルシュート
---

{{< notice >}} この記事は ChatGPT によって翻訳されました {{< /notice >}}

## はじめに

以前 Typecho を Docker コンテナへ移行したとき、HTTPS を有効化すると管理画面にログインできなくなった。  
HTTPS を無効化すれば正常にアクセスできる。

Docker 以前の通常構成では問題なかったので、Docker ネットワークのせいかと思ってとりあえず HTTPS を切って編集して、そのまま放置してた。  
今回改めて Typecho を使うことになり、再び同じ症状に遭遇。今後の運用のためにも原因を調査して解決策を記録しておく。

## 解決方法

解決方法はめっちゃシンプル。  
`data/config.inc.php` の末尾に以下のコードを追加するだけ：

```php
define('__TYPECHO_SECURE__', true);
```

これでコンテナを再起動すれば OK。

## 原因について

参考記事によると、ユーザーとブラウザ間の通信は HTTPS だけど、Typecho 側 (PHP) が受け取るのは Cloudflare 経由の HTTP リクエスト。
その結果、PHP が HTTP ベースでレスポンスを返してしまい、セッションエラーやログイン不可になるらしい。

## 参考記事

[Typecho HTTPS 无法登陆后台](https://blog.lucien.ink/archives/523/)
