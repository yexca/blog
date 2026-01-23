---
slug: 155
# layout: post
title: 'GoLang 變數與常數'
author: yexca
date: 2024-02-20T06:41:18+08:00
lastmod: 2025-01-28T14:57:18+09:00
# permalink: /zh-tw/archives/155
categories:
    - 技術學習
tags:
    - Go
    - 程式語言
    - 程式基礎
---

{{< notice >}} 本文由 gemini-3-flash-preview 翻譯 {{< /notice >}}

> **Golang 系列**
>
> Hello GoLang: <https://blog.yexca.net/zh-tw/archives/154>  
> GoLang (var and const) 變數與常數: 本文  
> GoLang (func) 函式: <https://blog.yexca.net/zh-tw/archives/156>  
> GoLang (slice and map) 切片: <https://blog.yexca.net/zh-tw/archives/160>  
> GoLang (OOP) 物件導向: <https://blog.yexca.net/zh-tw/archives/162>  
> GoLang (reflect) 反射: <https://blog.yexca.net/zh-tw/archives/204>  
> GoLang (struct tag) 結構體標籤: <https://blog.yexca.net/zh-tw/archives/205>  
> GoLang (goroutine) Goroutine: <https://blog.yexca.net/zh-tw/archives/206>  
> GoLang (channel) 通道: <https://blog.yexca.net/zh-tw/archives/207>  

## 變數

宣告變數一般使用 var 關鍵字

### 單一變數

* 定義型別

不指定初始值的宣告，預設為 0

```go
package main

import "fmt"

func main() {
    var a int
    fmt.Println("a =", a)
}
```

指定初始值，a 為 100

```go
package main

import "fmt"

func main() {
    var a int = 100
    fmt.Println("a =", a)
}
```

* 省略型別

在宣告時不指定型別的話，Go 會自動推導變數型別

```go
package main

import (
    "fmt"
    "reflect"
)

func main() {
    var a = 100
    fmt.Println("a =", a)
    fmt.Printf("Type of a = %s", reflect.TypeOf(a))
}
```

* :=

基於省略型別會自動推導，可以使用 := 直接宣告變數

```go
package main

import (
    "fmt"
    "reflect"
)

func main() {
    p := 3.14
    fmt.Println("p =", p)
    fmt.Printf("Type of p is %s", reflect.TypeOf(p))
}

/*
 * 輸出
 * p = 3.14
 * Type of p is float64
 */
```

### 多重變數

* 相同型別

```go
package main

import "fmt"

func main() {
    var a, b int
    fmt.Println("a =", a)
    fmt.Println("b =", b)
}
```

* 相同型別賦值

```go
package main

import "fmt"

func main() {
    var a, b int = 100, 200
    fmt.Println("a =", a)
    fmt.Println("b =", b)
}
```

* 不同型別 1

```go
package main

import (
    "fmt"
    "reflect"
)

func main() {
    var a, b = 100, 3.14
    fmt.Println("a =", a)
    fmt.Printf("Type of a is %s\n", reflect.TypeOf(a))
    fmt.Println("b =", b)
    fmt.Printf("Type of b is %s", reflect.TypeOf(b))
}

/*
 * 輸出
 * a = 100
 * Type of a is int
 * b = 3.14
 * Type of b is float64
 */
```

* 不同型別 2

```go
package main

import (
    "fmt"
    "reflect"
)

func main() {
    a, b := 100, "Hello"
    fmt.Println("a =", a)
    fmt.Printf("Type of a is %s\n", reflect.TypeOf(a))
    fmt.Println("b =", b)
    fmt.Printf("Type of b is %s", reflect.TypeOf(b))
}
```

> 字串型別在 Go 裡面是一個結構，包含指向底層陣列的指標和長度，這兩部分各佔 8 個位元組，所以字串型別大小為 16 個位元組
>
> 可以使用 unsafe.Sizeof() 函式查看型別佔用空間

### 全局變數

全局變數的宣告不能使用 :=

```go
package main

import (
    "fmt"
    "reflect"
)

var a, b int

func main() {
    fmt.Println("a =", a)
    fmt.Printf("Type of a is %s\n", reflect.TypeOf(a))
    fmt.Println("b =", b)
    fmt.Printf("Type of b is %s", reflect.TypeOf(b))
}
```

或者使用分解的寫法，這種寫法一般用於全局變數

```go
package main

import (
    "fmt"
    "reflect"
)

var (
    a int    = 1
    b string = "Go"
)

func main() {
    fmt.Println("a =", a)
    fmt.Printf("Type of a is %s\n", reflect.TypeOf(a))
    fmt.Println("b =", b)
    fmt.Printf("Type of b is %s", reflect.TypeOf(b))
}
```

## 常數

常數一般用 const 關鍵字定義

### 定義

```go
package main

import "fmt"

func main() {
    const c int = 9
    fmt.Println("c = ", c)
}
```

也可以省略型別

```go
package main

import "fmt"

func main() {
    const c = 9
    fmt.Println("c = ", c)
}
```

### 列舉

常數定義可用於列舉

```go
package main

func main() {
    const (
        BEIJING = 0
        SHANGHAI = 1
        SHENZHEN = 2
    )
}
```

### iota 自增

上述列舉以 0 開始遞增，可以使用 iota 代替

```go
package main

import "fmt"

func main() {
    const (
        BEIJING = iota // 0
        SHANGHAI // 1
        SHENZHEN // 2
    )

    fmt.Println(BEIJING, SHANGHAI, SHENZHEN)
}
```

> iota 可以用於運算式，但一般用於自增
