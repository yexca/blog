---
slug: 206
# layout: post
title: "GoLang Goroutines"
author: yexca
date: 2024-12-17T21:16:31+08:00
lastmod: 2025-01-28T21:11:18+09:00
# permalink: /en/archives/206
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
> GoLang (var and const): <https://blog.yexca.net/en/archives/155>  
> GoLang (func): <https://blog.yexca.net/en/archives/156>  
> GoLang (slice and map): <https://blog.yexca.net/en/archives/160>  
> GoLang (OOP): <https://blog.yexca.net/en/archives/162>  
> GoLang (reflect): <https://blog.yexca.net/en/archives/204>  
> GoLang (struct tag): <https://blog.yexca.net/en/archives/205>  
> GoLang (goroutine): This Article  
> GoLang (channel): <https://blog.yexca.net/en/archives/207>  

---

Process -> Thread -> Coroutine

A coroutine is a "lightweight thread." You can easily spawn tens of thousands of them without exhausting system resources. Multiple coroutines share the resources allocated to their parent thread.

Go has native support for coroutines, which are called **goroutines**. Concurrency in Go is achieved through goroutines and channels.

## Creating a Goroutine

Use the `go` keyword to start a goroutine.

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

## Using Anonymous Functions

You can also use anonymous functions with goroutines.

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
        }() // executes this anonymous function

        fmt.Println("A")
    }()

    time.Sleep(2 * time.Second)
}
```

Anonymous functions can take parameters and return values. However, to get a return value from a goroutine, you need to use a channel. The example below shows only parameters:

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

## Exiting

When the `main` goroutine exits, all other worker goroutines are automatically terminated.

You can also use `runtime.Goexit()` to immediately stop the current goroutine (any `defer` statements will still execute).

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
            runtime.Goexit() // exit the goroutine
            fmt.Println("B")
        }() // executes this anonymous function

        fmt.Println("A")
    }()

    time.Sleep(2 * time.Second)
}

/*
 * Output:
 * B.defer
 * A.defer
 */
```
