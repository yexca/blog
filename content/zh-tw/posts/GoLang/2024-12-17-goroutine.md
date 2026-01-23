---
slug: 206
# layout: post
title: "GoLang Go 程"
author: yexca
date: 2024-12-17T21:16:31+08:00
lastmod: 2025-01-28T21:11:18+09:00
# permalink: /zh-tw/archives/206
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
> Hello GoLang: <https://blog.yexca.net/zh-tw/archives/154>  
> GoLang (var and const) 變數與常數: <https://blog.yexca.net/zh-tw/archives/155>  
> GoLang (func) 函式: <https://blog.yexca.net/zh-tw/archives/156>  
> GoLang (slice and map) 切片: <https://blog.yexca.net/zh-tw/archives/160>  
> GoLang (OOP) 物件導向: <https://blog.yexca.net/zh-tw/archives/162>  
> GoLang (reflect) 反射: <https://blog.yexca.net/zh-tw/archives/204>  
> GoLang (struct tag) 結構體標籤: <https://blog.yexca.net/zh-tw/archives/205>  
> GoLang (goroutine) Go 程: 本文  
> GoLang (channel) 通道: <https://blog.yexca.net/zh-tw/archives/207>  

---

行程 (Process) -> 執行緒 (Thread) -> 協程 (Coroutine)

協程 (coroutine) 也稱為輕量級執行緒，可以輕鬆建立上萬個而不會導致系統資源耗盡，多個協程共享該執行緒分配到的電腦資源。

Go 語言原生支援協程，稱為 goroutine，Go 的並發透過 goroutine 和 channel 實作。

## 建立 goroutine

透過 `go` 關鍵字開啟一個 goroutine

```go
package main

import (
    "fmt"
    "time"
)

func newTask() {
    i := 0
    for {
        fmt.Println("newTask goroutine i =", i)
        i++
        time.Sleep(1 * time.Second)
    }
}

func main() {
    go newTask()

    i := 0
    for {
        fmt.Println("main goroutine i =", i)
        i++
        time.Sleep(1 * time.Second)
    }
}
```

## 使用匿名函式

當然也可以使用匿名函式

```go
package main

import (
    "fmt"
    "time"
)

func main() {
    go func() {
        defer fmt.Println("A.defer")
        func() {
            defer fmt.Println("B.defer")

            fmt.Println("B")
        }() // 表示執行該匿名函式

        fmt.Println("A")
    }()

    time.Sleep(2 * time.Second)
}
```

匿名函式也可以有參數與回傳值，不過 goroutine 的回傳值需要透過 channel 傳輸，下例僅示範帶有參數的情況：

```go
package main

import (
    "fmt"
    "time"
)

func main() {
    go func(a, b int) {
        fmt.Println("a =", a, "b =", b)
    }(10, 20)

    time.Sleep(2 * time.Second)
}
```

## 結束

主 goroutine 結束後，其他的工作 goroutine 也會自動結束。

不過也可以使用 `runtime.Goexit()` 立即終止當前 goroutine 的執行 (defer 仍會執行)。

```go
package main

import (
    "fmt"
    "runtime"
    "time"
)

func main() {
    go func() {
        defer fmt.Println("A.defer")
        func() {
            defer fmt.Println("B.defer")
            runtime.Goexit() // 結束 goroutine
            fmt.Println("B")
        }() // 表示執行該匿名函式

        fmt.Println("A")
    }()

    time.Sleep(2 * time.Second)
}

/*
 * 輸出
 * B.defer
 * A.defer
 */
```
