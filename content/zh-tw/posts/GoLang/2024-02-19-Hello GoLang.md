---
slug: 154
# layout: post
title: 'Hello GoLang'
author: yexca
date: 2024-02-19T07:58:37+08:00
lastmod: 2025-01-28T13:57:18+09:00
# permalink: /zh-tw/archives/154
categories:
    - 技術學習
tags:
    - Go
    - 程式語言
    - 程式基礎
---

{{< notice >}} 本文由 gemini-2.5-flash 翻譯 {{< /notice >}}

> **Golang 系列**
>
> Hello GoLang: 本文  
> GoLang (var and const) 變數與常數: <https://blog.yexca.net/zh-tw/archives/155>  
> GoLang (func) 函式: <https://blog.yexca.net/zh-tw/archives/156>  
> GoLang (slice and map) 切片: <https://blog.yexca.net/zh-tw/archives/160>  
> GoLang (OOP) 物件導向: <https://blog.yexca.net/zh-tw/archives/162>  
> GoLang (reflect) 反射: <https://blog.yexca.net/zh-tw/archives/204>  
> GoLang (struct tag) 結構體標籤: <https://blog.yexca.net/zh-tw/archives/205>  
> GoLang (goroutine) Go 協程: <https://blog.yexca.net/zh-tw/archives/206>  
> GoLang (channel) 通道: <https://blog.yexca.net/zh-tw/archives/207>  

---

Go 下載：<https://go.dev/dl/>

JetBrains GoLand：<https://www.jetbrains.com/go/>

## Go 簡介

Go 可以直接編譯，直接執行即可部署，靜態型別語言

```bash
# 直接執行
go run hello.go

# 編譯
go build hello.go
# 編譯後執行
./hello
```

Go 的一些應用

(1)、雲端運算基礎建設領域

代表專案：docker、kubernetes、etcd、consul、cloudflare CDN、七牛雲儲存等

(2)、基礎後端軟體

代表專案：tidb、influxdb、cockroachdb 等

(3)、微服務

代表專案：go-kit、micro、monzo bank的typhon、bilibili 等

(4)、網際網路基礎建設

代表專案：以太坊、hyperledger 等

## Hello Go

```go
package main // 定義套件名稱
/* 
 * 必須在原始碼檔案非註解的第一行指明檔案屬於哪個套件
 * main 表示一個可獨立執行的程式，每個 Go 應用程式都包含一個名為 main 的套件
 */

import "fmt" // 匯入 fmt 套件，實作了格式化 IO 的函式

func main(){ // 函式
    fmt.println("Hello Go")
}
```

一般 main 函式是啟動後第一個執行的函式，如果有 init 函式會先執行 init 函式

> 定義函式時，`{` 必須與函式名稱在同一行
