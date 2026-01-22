---
slug: 206
# layout: post
title: "GoLang ゴルーチン"
author: yexca
date: 2024-12-17T21:16:31+08:00
lastmod: 2025-01-28T21:11:18+09:00
# permalink: /ja/archives/205
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
> Hello GoLang: <https://blog.yexca.net/ja/ja/archives/154>  
> GoLang (var and const) 変数と定数: <https://blog.yexca.net/ja/ja/archives/155>  
> GoLang (func) 関数: <https://blog.yexca.net/ja/ja/archives/156>  
> GoLang (slice and map) スライス: <https://blog.yexca.net/ja/ja/archives/160>  
> GoLang (OOP) オブジェクト指向: <https://blog.yexca.net/ja/ja/archives/162>  
> GoLang (reflect) リフレクション: <https://blog.yexca.net/ja/ja/archives/204>  
> GoLang (struct tag) 構造タグ: <https://blog.yexca.net/ja/ja/archives/205>  
> GoLang (goroutine) ゴルーチン: この記事  
> GoLang (channel) チャンネル: <https://blog.yexca.net/ja/ja/archives/207>  

---

プロセス -> スレッド -> コルーチン

コルーチン (coroutine) は軽量スレッドとも呼ばれます。システム リソースを使い果たすことなく、数万のコルーチンを簡単に作成できます。複数のコルーチンは、スレッドに割り当てられたコンピューター リソースを共有します。

Go 言語は、ゴルーチン (goroutine) と呼ばれるコルーチンをネイティブにサポートしています。Go の並行性は、goroutine と channel を通じて実装されます。

## goroutine を作成する

`go` キーワードでゴルーチンを開始する

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

## 匿名関数の使用

もちろん、匿名関数を使用することもできます

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
        }() // 匿名関数の実行を示します

        fmt.Println("A")
    }()

    time.Sleep(2 * time.Second)
}
```

匿名関数は戻り値に実体パラメータを持つこともできますが、goroutine の戻り値は channel を介して送信する必要があります。次の例では、実体パラメータのみを示しています。

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

## 退出

メインの goroutine が終了すると、他の動作中の goroutine も自動的に終了します。

ただし、`runtime.Goexit()` を使用して、現在の goroutine の実行を直ちに終了することもできます (defer が実行されます)

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
            runtime.Goexit() // ゴルーチンを終了する
            fmt.Println("B")
        }() // 匿名関数の実行を示します

        fmt.Println("A")
    }()

    time.Sleep(2 * time.Second)
}

/*
 * 出力
 * B.defer
 * A.defer
 */
```
