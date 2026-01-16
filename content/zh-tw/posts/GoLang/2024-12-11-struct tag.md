---
slug: 205
# layout: post
title: "GoLang 結構體標籤"
author: yexca
date: 2024-12-11T18:31:18+08:00
lastmod: 2025-01-28T21:04:18+09:00
# permalink: /archives/205
categories:
    - 技術學習
tags:
    - Go
    - 程式語言
    - 程式基礎
--- 

{{< notice >}} 本文由 gemini-3-flash-preview 翻譯 {{< /notice >}}

> **Golang Series**
>
> Hello GoLang: <https://blog.yexca.net/archives/154>  
> GoLang (var and const) 變數與常數: <https://blog.yexca.net/archives/155>  
> GoLang (func) 函式: <https://blog.yexca.net/archives/156>  
> GoLang (slice and map) 切片: <https://blog.yexca.net/archives/160>  
> GoLang (OOP) 物件導向: <https://blog.yexca.net/archives/162>  
> GoLang (reflect) 反射: <https://blog.yexca.net/archives/204>  
> GoLang (struct tag) 結構體標籤: 本文  
> GoLang (goroutine) Goroutine: <https://blog.yexca.net/archives/206>  
> GoLang (channel) 通道: <https://blog.yexca.net/archives/207>  

---

透過結構體標籤可以描述該類別在某套件的作用。

## 獲取標籤值

透過 ` 符號來定義 tag (Markdown 程式碼區塊的按鍵)

```go
package main

import (
    "fmt"
    "reflect"
)

type User struct {
    // 多個 tag 用空格分隔
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

## JSON 轉換

```go
package main

import (
    "encoding/json"
    "fmt"
)

type User struct {
    // 注意必須是公有屬性才可轉換 JSON
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
