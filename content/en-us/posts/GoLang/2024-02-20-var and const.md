---
slug: 155
# layout: post
title: 'GoLang Variables and Constants'
author: yexca
date: 2024-02-20T06:41:18+08:00
lastmod: 2025-01-28T14:57:18+09:00
# permalink: /en/archives/155
categories:
    - Tech Learning
tags:
    - Go
    - Programming Language
    - Programming Basics
---

{{< notice >}} This article was translated by gemini-3-flash-preview {{< /notice >}}

> **GoLang Series**
>
> Hello GoLang: <https://blog.yexca.net/en/archives/154>  
> GoLang (var and const) Variables and Constants: This article  
> GoLang (func) Functions: <https://blog.yexca.net/en/archives/156>  
> GoLang (slice and map) Slices: <https://blog.yexca.net/en/archives/160>  
> GoLang (OOP) Object-Oriented Programming: <https://blog.yexca.net/en/archives/162>  
> GoLang (reflect) Reflection: <https://blog.yexca.net/en/archives/204>  
> GoLang (struct tag) Struct Tags: <https://blog.yexca.net/en/archives/205>  
> GoLang (goroutine) Goroutines: <https://blog.yexca.net/en/archives/206>  
> GoLang (channel) Channels: <https://blog.yexca.net/en/archives/207>  

## Variables

Variables are generally declared using the `var` keyword.

### Single Variables

* **Explicit Type**

Declarations without an initial value default to 0.

```go
package main

import "fmt"

func main() {
    var a int
    fmt.Println("a =", a)
}
```

Specifying an initial value; `a` is 100.

```go
package main

import "fmt"

func main() {
    var a int = 100
    fmt.Println("a =", a)
}
```

* **Omitting Type**

If you don't specify the type during declaration, Go will infer it automatically.

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

* **Short Declaration (:=)**

Since type inference works, you can use `:=` to declare and initialize variables directly.

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
 * Output
 * p = 3.14
 * Type of p is float64
 */
```

### Multiple Variables

* **Same Type**

```go
package main

import "fmt"

func main() {
    var a, b int
    fmt.Println("a =", a)
    fmt.Println("b =", b)
}
```

* **Same Type Assignment**

```go
package main

import "fmt"

func main() {
    var a, b int = 100, 200
    fmt.Println("a =", a)
    fmt.Println("b =", b)
}
```

* **Different Types 1**

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
 * Output
 * a = 100
 * Type of a is int
 * b = 3.14
 * Type of b is float64
 */
```

* **Different Types 2**

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

> A string type in Go is a structure containing a pointer to the underlying array and its length. Each part is 8 bytes, so the total size of a string header is 16 bytes.
>
> You can use the `unsafe.Sizeof()` function to check the memory usage of a type.

### Global Variables

Global variables cannot be declared using `:=`.

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

Alternatively, use the factored block syntax, which is common for global variables.

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

## Constants

Constants are defined using the `const` keyword.

### Definition

```go
package main

import "fmt"

func main() {
    const c int = 9
    fmt.Println("c = ", c)
}
```

You can also omit the type.

```go
package main

import "fmt"

func main() {
    const c = 9
    fmt.Println("c = ", c)
}
```

### Enums

Constant definitions can be used to simulate enumerations.

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

### iota Increment

The above enumeration increments starting from 0. You can use `iota` to automate this.

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

> `iota` can be used in expressions, but it's typically used for simple auto-incrementing.
