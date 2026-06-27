---
slug: 205
# layout: post
title: "GoLang 構造タグ"
author: yexca
date: 2024-12-11T18:31:18+08:00
lastmod: 2025-01-28T21:04:18+09:00
# permalink: /ja/archives/205
categories:
    - 技術学習
tags:
    - Go
    - プログラミング言語
    - プログラミングの基礎
--- 

> この記事の一部は機械翻訳を使ったよ
>
> **Golang シリーズ**
>
> Hello GoLang: <https://blog.yexca.net/ja/ja/archives/154>  
> GoLang (var and const) 変数と定数: <https://blog.yexca.net/ja/ja/archives/155>  
> GoLang (func) 関数: <https://blog.yexca.net/ja/ja/archives/156>  
> GoLang (slice and map) スライス: <https://blog.yexca.net/ja/ja/archives/160>  
> GoLang (OOP) オブジェクト指向: <https://blog.yexca.net/ja/ja/archives/162>  
> GoLang (reflect) リフレクション: <https://blog.yexca.net/ja/ja/archives/204>  
> GoLang (struct tag) 構造タグ: この記事  
> GoLang (goroutine) ゴルーチン: <https://blog.yexca.net/ja/ja/archives/206>  
> GoLang (channel) チャンネル: <https://blog.yexca.net/ja/ja/archives/207>  

---

構造タグはパッケージ内のクラスの役割を記述するために使用できます。

## タグの値を取得する

tag を定義するには ` を使用します (markdown コードブロックのキー)

```go
package main

import (
    "fmt"
    "reflect"
)

type User struct {
    // 複数の tag はスペースで区切られます
    name string `doc:"name" info:"nameOfUser"`
    age  int    `info:"ageOfUser"`
}

func main() {
    user := User{"zhangSan", 18}

    findTag(&user)
}

func findTag(input interface{}) {
    t := reflect.TypeOf(input).Elem()

    for i := 0; i < t.NumField(); i++ {
        tagInfo := t.Field(i).Tag.Get("info")
        tagDoc := t.Field(i).Tag.Get("doc")
        fmt.Println("info:", tagInfo, "doc:", tagDoc)
    }
}
```

## JSON 変換

```go
package main

import (
    "encoding/json"
    "fmt"
)

type User struct {
    // パブリックプロパティのみが JSON に変換できることに注意してください
    Name string `json:"name"`
    Age  int    `json:"age"`
}

func main() {
    user := User{"zhangSan", 18}

    // struct --> json
    jsonStr, err := json.Marshal(user)
    if err != nil {
        fmt.Println("error", err)
    } else {
        fmt.Printf("jsonStr : %s\n", jsonStr)
    }

    // json --> struct
    var user2 User
    err = json.Unmarshal(jsonStr, &user2)
    if err != nil {
        fmt.Println("error", err)
    } else {
        fmt.Println(user2)
    }
}
```
