---
slug: 160
# layout: post
title: 'GoLang Slices'
author: yexca
date: 2024-02-27T20:00:00+08:00
lastmod: 2025-01-28T15:30:18+09:00
# permalink: /archives/160
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
> Hello GoLang: <https://blog.yexca.net/archives/154>  
> GoLang (var and const) Variables and Constants: <https://blog.yexca.net/archives/155>  
> GoLang (func) Functions: <https://blog.yexca.net/archives/156>  
> GoLang (slice and map) Slices: This article  
> GoLang (OOP) Object-Oriented Programming: <https://blog.yexca.net/archives/162>  
> GoLang (reflect) Reflection: <https://blog.yexca.net/archives/204>  
> GoLang (struct tag) Struct Tags: <https://blog.yexca.net/archives/205>  
> GoLang (goroutine) Goroutines: <https://blog.yexca.net/archives/206>  
> GoLang (channel) Channels: <https://blog.yexca.net/archives/207>  

---

Go slices are an abstraction over arrays.

## Arrays

Array length is fixed.

```go
package main

import "fmt"

func main() {
    // Definition Method 1
    var arr1 [10]int
    // Iteration
    for i := 0; i < len(arr1); i++ {
        fmt.Println("arr1[", i, "]:", arr1[i])
    }

    // Definition Method 2, with assignment
    arr2 := [10]int{0, 1, 2, 3}
    // Iteration using range
    for index, value := range arr2 {
        fmt.Println("index =", index, "value =", value)
    }

    // Defining different lengths
    var arr3 [4]int

    fmt.Printf("type of arr1 is %T\n", arr1) // [10]int
    fmt.Printf("type of arr1 is %T\n", arr2) // [10]int
    fmt.Printf("type of arr1 is %T", arr3)   // [4]int
}
```

After compiling and running, you'll see that `arr3` is a different type than `arr1` and `arr2`. This means when defining function parameters, you must specify the exact type.

```go
func test(arr [4]int) {
    for i := 0; i < len(arr); i++ {
        fmt.Println("fmt_arr[", i, "]:", arr[i])
    }
}
```

The function above can only accept `arr3`. It is pass-by-value, so modifying the data inside the function doesn't affect the original data.

## Defining Slices

Unlike arrays, slices have dynamic lengths and support appending elements (dynamic arrays). Appending may increase the slice's capacity.

You can define a slice by declaring an array without specifying its size:

```go
var name []type
// Example
var s []int
```

Or use the `make()` function to create a slice:

```go
var slice []type = make([]type, len) // len is the initial length
// Or the shorthand
slice := make([]type, len)
```

You can use the optional `capacity` parameter to specify capacity. If omitted, it defaults to the length.

```go
var slice []type = make([]type, length, capacity)
```

![image](https://cdn.jsdelivr.net/gh/yexca/picx-images-hosting@master/2024/02-go/image.13li74f5h3.webp)

## Slice Initialization

Direct initialization:

```go
s := []int {1, 2, 3}
```

Initialize a slice from an array, from `startIndex` to `endIndex-1`. Both values are optional.

```go
s := arr[startIndex:endIndex]
```

Omitting `startIndex` defaults to the first element; omitting `endIndex` goes to the last element.

## len() and cap()

Slices are indexable. Use `len()` to get the current length.

`cap()` calculates the capacity, measuring the maximum size the slice can reach.

```go
package main

import "fmt"

// Slices are passed by reference; modifications inside affect original data
func printSlice(slice []int) {
    fmt.Printf("len=%d, cap=%d, slice=%v", len(slice), cap(slice), slice)
}

func main() {
    s := make([]int, 3, 5)
    printSlice(s)
}

/*
 * Output:
 * len=3, cap=5, slice=[0 0 0]
 */
```

## Nil Slices

An uninitialized slice defaults to `nil` (nil slice) with a length of 0.

```go
package main

import "fmt"

func printSlice(slice []int) {
    fmt.Printf("len=%d, cap=%d, slice=%v\n", len(slice), cap(slice), slice)
}

func main() {
    var s []int
    printSlice(s)
    // Check if nil
    if s == nil {
        fmt.Println("slice is empty")
    }
}
```

## Slice Slicing

Slice a slice by setting lower and upper bounds.

```go
package main

import "fmt"

func printSlice(slice []int) {
    fmt.Printf("len=%d, cap=%d, slice=%v\n", len(slice), cap(slice), slice)
}

func main() {
    s := []int{0, 1, 2, 3, 4, 5, 6, 7}

    // Print original slice
    fmt.Println(s)
    
    // From index 2 (inclusive) to 5 (exclusive)
    printSlice(s[2:5])
    // From start to 5 (exclusive)
    printSlice(s[:5])
    // From index 2 to end
    printSlice(s[2:])

    // This assignment means modifying subS will affect s
    subS := s[1:6]
    printSlice(subS)
}
```

## append() and copy()

Increasing slice capacity and copying slices.

```go
package main

import "fmt"

func printSlice(slice []int) {
    fmt.Printf("len=%d, cap=%d, slice=%v\n", len(slice), cap(slice), slice)
}

func main() {
    var s []int
    printSlice(s)

    // Add one element
    s = append(s, 0)
    printSlice(s)

    // Add multiple elements
    s = append(s, 1, 2, 3, 4)
    printSlice(s)

    // Create s2 with twice the capacity of s
    s2 := make([]int, len(s), cap(s)*2)
    // Copy s to s2. Modifying s2 won't affect s.
    copy(s2, s)
    printSlice(s2)
}
```

> Slice expansion: If the appended values exceed the capacity, the capacity is usually doubled.

## map

There are two ways to declare a map.

```go
package main

import "fmt"

func main() {
    var map1 = make(map[string]string)
    // Insert data
    map1["one"] = "1"
    map1["two"] = "2"
    fmt.Println(map1) // map[one:1 two:2]
}
```

Method 2:

```go
package main

import "fmt"

func main() {
    map1 := map[string]string{
        "one": "1",
        "two": "2",
    }
    fmt.Println(map1)
}
```

### Nested Maps

```go
package main

import "fmt"

func main() {
    map1 := make(map[string]map[string]string)
    map1["first"] = make(map[string]string, 2)
    map1["first"]["one"] = "1"
    map1["first"]["two"] = "2"
    fmt.Println(map1)
}

/*
 * Output:
 * map[first:map[one:1 two:2]]
 */
```

### Update, Iterate, and Delete

```go
package main

import "fmt"

func main() {
    map1 := make(map[string]map[string]string)
    map1["first"] = make(map[string]string, 2)
    map1["first"]["one"] = "1"
    map1["first"]["two"] = "2"
    // Update
    map1["first"]["one"] = "one"
    fmt.Println(map1)
    // Iterate
    for key, value := range map1{
        fmt.Println("key =", key, "value =", value)
    }
    // Delete
    delete(map1, "first")
    fmt.Println(map1)
}
```

### Check if a key exists

```go
package main

import "fmt"

func main() {
    map1 := make(map[string]string)
    map1["one"] = "1"
    val, key := map1["one"]
    if key {
        fmt.Println(val)
    } else {
        fmt.Println("empty")
    }
}
```
