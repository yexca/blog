---
slug: 154
# layout: post
title: 'Hello GoLang'
author: yexca
date: 2024-02-19T07:58:37+08:00
lastmod: 2025-01-28T13:57:18+09:00
# permalink: /ja/archives/154
categories:
    - 技術研修
tags:
    - Go
    - プログラミング言語
    - プログラミングの基礎
---

> この記事の一部は機械翻訳を使ったよ
>
> **Golang シリーズ**
>
> Hello GoLang: この記事  
> GoLang (var and const) 変数と定数: <https://blog.yexca.net/ja/ja/archives/155>  
> GoLang (func) 関数: <https://blog.yexca.net/ja/ja/archives/156>  
> GoLang (slice and map) スライス: <https://blog.yexca.net/ja/ja/archives/160>  
> GoLang (OOP) オブジェクト指向: <https://blog.yexca.net/ja/ja/archives/162>  
> GoLang (reflect) リフレクション: <https://blog.yexca.net/ja/ja/archives/204>  
> GoLang (struct tag) 構造タグ: <https://blog.yexca.net/ja/ja/archives/205>  
> GoLang (goroutine) ゴルーチン: <https://blog.yexca.net/ja/ja/archives/206>  
> GoLang (channel) チャンネル: <https://blog.yexca.net/ja/ja/archives/207>  

---

Go のダウンロード：<https://go.dev/dl/>

JetBrains GoLand：<https://www.jetbrains.com/go/>

## Go の紹介

Go は直接コンパイルして直接実行し、デプロイできる静的型付け言語です。

```bash
# 直接実行
go run hello.go

# コンパイル
go build hello.go
# コンパイル後に実行
./hello
```

Go の応用例

(1)、クラウドコンピューティングインフラ

代表的なプロジェクト：docker、kubernetes、etcd、consul、cloudflare CDN、"七牛云存储(中国語)"など

(2)、基本的なバックエンドソフトウェア

代表的なプロジェクト：tidb、influxdb、cockroachdb など

(3)、マイクロサービス

代表的なプロジェクト：go-kit、micro、monzo bank的typhon、bilibili など

(4)、インターネットインフラ

代表的なプロジェクト：Ethereum、hyperledger など

## Hello Go

```go
package main // パッケージ名を定義する
/* 
 * ソースファイルの最初の非コメント行で、ファイルが属するパッケージを指定する必要があります。
 * main は独立して実行可能なプログラムを表します。すべての Go アプリケーションには、main という名前のパッケージが含まれています。
 */

import "fmt" // IO フォーマットの関数を実装するために fmt パッケージをインポートします

func main(){ // 関数
    fmt.println("Hello Go")
}
```

一般的に、main 関数は起動後に最初に実行される関数です。init関数がある場合は、init 関数が最初に実行されます。

> 関数を定義するときは `{` が関数名と同じ行になければなりません
