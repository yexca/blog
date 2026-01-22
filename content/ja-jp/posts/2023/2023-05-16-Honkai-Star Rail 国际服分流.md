---
slug: 107
title: '『崩壊：スターレイル』国際サーバーの分流ルール'
date: '2023-05-16T23:13:21+08:00'
author: yexca
layout: post
# permalink: /archives/107
views:
    - '32'
categories:
    - 試行錯誤の記録
tags:
    - ゲーム
    - miHoYo
---

{{< notice >}} この記事は gemini-3-flash-preview によって翻訳されました {{< /notice >}}

中国大陸からゲームに入れない時のための分流（スプリット・トンネリング）ルールだよ。

## ポイント

ゲームにログインする時にUDP接続が必要なんだけど、多くのプロトコルはUDPをサポートしていないんだ。つまり、UDPに遭遇すると自動的に拒否されちゃう。だから、UDP接続で使うIPを「直連（ダイレクト）」に設定すれば解決するよ。僕がキャプチャした2つのIPはこれ：

```bash
8.209.196.179
# 2つ目は直連だと繋がらないっぽいから、基本的には1つ目だけ設定すれば大丈夫
47.245.63.117
```

もちろん、安全のため（TCP接続とUDP接続が一致しないことで起こりうるリスクを避けるため）、関連するドメインも全部直連に設定しておくのがおすすめ。具体的にはこれらだね：

```bash
*.starrails.com
*.hoyoverse.com
8.209.196.179/8
```

## OpenClash

「全局設置（グローバル設定）- 規則設置（ルール設定）」で、「自定義規則（カスタムルール）」を有効にして、最初の枠の `rules:` の下に入力してね。

```yaml
#rules:
- DOMAIN-SUFFIX, starrails.com, DIRECT
- DOMAIN-SUFFIX, hoyoverse.com, DIRECT
- IP-CIDR, 8.209.196.179/8, DIRECT
```

## Quantumult X

設定ファイルを編集して、`[filter_local]` のセクションまで移動してから、以下の内容を入力してね。

```conf
#SR
host-suffix, starrails.com, direct
host-suffix, hoyoverse.com, direct
ip-cidr, 8.209.196.179/8, direct
```
