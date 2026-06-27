---
slug: 155
# layout: post
title: 'GoLang 変数と定数'
author: yexca
date: 2024-02-20T06:41:18+08:00
lastmod: 2025-01-28T14:57:18+09:00
# permalink: /ja/archives/155
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
> GoLang (var and const) 変数と定数: この記事  
> GoLang (func) 関数: <https://blog.yexca.net/ja/archives/ja/156>  
> GoLang (slice and map) スライス: <https://blog.yexca.net/ja/ja/archives/160>  
> GoLang (OOP) オブジェクト指向: <https://blog.yexca.net/ja/ja/archives/162>  
> GoLang (reflect) リフレクション: <https://blog.yexca.net/ja/ja/archives/204>  
> GoLang (struct tag) 構造タグ: <https://blog.yexca.net/ja/ja/archives/205>  
> GoLang (goroutine) ゴルーチン: <https://blog.yexca.net/ja/ja/archives/206>  
> GoLang (channel) チャンネル: <https://blog.yexca.net/ja/ja/archives/207>  

## 変数

変数は通常 var キーワードを使用して宣言されます

### 単一変数

* タイプを定義する

初期値が指定されていない場合、デフォルトは 0 です。

```go
package main

import "fmt"

func main() {
    var a int
    fmt.Println("a =", a)
}
```

初期値を指定します。a は 100 です。

```go
package main

import "fmt"

func main() {
    var a int = 100
    fmt.Println("a =", a)
}
```

* 省略タイプ

宣言時に型がわからない場合、Go は変数の型を自動的に決定します。

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

省略に応じて型が自動的に決定され、:= を使用して変数を直接宣言できます。

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
 * 出力
 * p = 3.14
 * Type of p is float64
 */
```

### 多変量

* 同じタイプ

```go
package main

import "fmt"

func main() {
   var a, b int
   fmt.Println("a =", a)
   fmt.Println("b =", b)
}
```

* 同じタイプの割り当て

```go
package main

import "fmt"

func main() {
   var a, b int = 100, 200
   fmt.Println("a =", a)
   fmt.Println("b =", b)
}
```

* 異なるタイプ 1

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
 * 出力
 * a = 100
 * Type of a is int
 * b = 3.14
 * Type of b is float64
 */
```

* 異なるタイプ 2

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

> Go の文字列型は、基になる配列へのポインタと長さを含む構造体です。これら 2 つの部分はそれぞれ 8 バイトなので、文字列型のサイズは 16 バイトになります。
>
> unsafe.Sizeof()関数を使用して、タイプ占有率が見られます。

### グローバル変数

グローバル変数は := を使用して宣言することはできません

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

または、グローバル変数に一般的に使用される分解を使用します。

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

## 定数

定数は通常、const キーワードを使用して定義されます。

### 定義

```go
package main

import "fmt"

func main() {
    const c int = 9
    fmt.Println("c = ", c)
}
```

タイプを省略することもできます

```go
package main

import "fmt"

func main() {
    const c = 9
    fmt.Println("c = ", c)
}
```

### 列挙

定数定義は列挙に使用できる

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

### iota 自己増加

上記の列挙は 0 から始まり、増分で増加します。代わりに iota を使用できます。

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

> iota は式の中で使用できますが、通常は自動増分に使用されます
