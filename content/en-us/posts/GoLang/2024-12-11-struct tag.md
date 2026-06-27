---
slug: 205
# layout: post
title: "GoLang Struct Tags"
author: yexca
date: 2024-12-11T18:31:18+08:00
lastmod: 2025-01-28T21:04:18+09:00
# permalink: /en/archives/205
categories:
    - Tech Learning
tags:
    - Go
    - Programming Language
    - Programming Basics
--- 

{{< notice >}} This article was translated by gemini-3-flash-preview {{< /notice >}}

> **Golang Series**
>
> Hello GoLang: <https://blog.yexca.net/en/archives/154>  
> GoLang (var and const) Variables and Constants: <https://blog.yexca.net/en/archives/155>  
> GoLang (func) Functions: <https://blog.yexca.net/en/archives/156>  
> GoLang (slice and map) Slices and Maps: <https://blog.yexca.net/en/archives/160>  
> GoLang (OOP) Object-Oriented Programming: <https://blog.yexca.net/en/archives/162>  
> GoLang (reflect) Reflection: <https://blog.yexca.net/en/archives/204>  
> GoLang (struct tag) Struct Tags: This Article  
> GoLang (goroutine) Goroutines: <https://blog.yexca.net/en/archives/206>  
> GoLang (channel) Channels: <https://blog.yexca.net/en/archives/207>  

---

Struct tags allow you to describe how a field behaves when used by specific packages.

## Getting Tag Values

Define tags using backticks `` ` `` (the same key used for Markdown code blocks).

```go
package main

import (
    "fmt"
    "reflect"
)

type User struct {
    // Separate multiple tags with spaces
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

## JSON Conversion

```go
package main

import (
    "encoding/json"
    "fmt"
)

type User struct {
    // Fields must be exported (capitalized) to be converted to JSON
    Name string `json:"name"`
    Age  int    `json:"age"`
}

func main() {
    user := User{"zhangSan", 18}

    // struct -> json
    jsonStr, err := json.Marshal(user)
    if err != nil {
        fmt.Println("error", err)
    } else {
        fmt.Printf("jsonStr : %s\n", jsonStr)
    }

    // json -> struct
    var user2 User
    err = json.Unmarshal(jsonStr, &user2)
    if err != nil {
        fmt.Println("error", err)
    } else {
        fmt.Println(user2)
    }
}
```
