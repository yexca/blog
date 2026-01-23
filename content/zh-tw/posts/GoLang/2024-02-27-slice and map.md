---
slug: 160
# layout: post
title: 'GoLang 切片'
author: yexca
date: 2024-02-27T20:00:00+08:00
lastmod: 2025-01-28T15:30:18+09:00
# permalink: /zh-tw/archives/160
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
> GoLang (var and const) 變數與常數: <https://blog.yexca.net/zh-tw/archives/155>  
> GoLang (func) 函式: <https://blog.yexca.net/zh-tw/archives/156>  
> GoLang (slice and map) 切片: 本文  
> GoLang (OOP) 物件導向: <https://blog.yexca.net/zh-tw/archives/162>  
> GoLang (reflect) 反射: <https://blog.yexca.net/zh-tw/archives/204>  
> GoLang (struct tag) 結構體標籤: <https://blog.yexca.net/zh-tw/archives/205>  
> GoLang (goroutine) Go 協程: <https://blog.yexca.net/zh-tw/archives/206>  
> GoLang (channel) 通道: <https://blog.yexca.net/zh-tw/archives/207>  

---

Go 的切片 (Slice) 是對陣列 (Array) 的抽象

## 陣列

陣列的長度不可改變

```go
package main

import "fmt"

func main() {
    // 定義方式一
    var arr1 [10]int
    // 遍歷
    for i := 0; i < len(arr1); i++ {
        fmt.Println("arr1[", i, "]:", arr1[i])
    }

    // 定義方式二，賦值
    arr2 := [10]int{0, 1, 2, 3}
    // range 遍歷
    for index, value := range arr2 {
        fmt.Println("index =", index, "value =", value)
    }

    // 定義不同長度
    var arr3 [4]int

    fmt.Printf("type of arr1 is %T\n", arr1) // [10]int
    fmt.Printf("type of arr1 is %T\n", arr2) // [10]int
    fmt.Printf("type of arr1 is %T", arr3)   // [4]int
}
```

編譯執行後可以發現 arr3 與 arr1, arr2 型別不同，那麼在定義函式形式參數時也需要指定相應型別

```go
func test(arr [4]int) {
    for i := 0; i < len(arr); i++ {
        fmt.Println("fmt_arr[", i, "]:", arr[i])
    }
}
```

上述函式只能傳遞 arr3，且為值傳遞 (Pass by Value)，修改值不會影響原始資料

## 定義切片

與陣列相比，切片長度不固定，可以追加元素 (動態陣列)，在追加時可能會使切片的容量增大

定義切片可以透過宣告一個未指定大小的陣列

```go
var name []type
// 例如
var s []int
```

或者使用 make() 函式來建立切片

```go
var slice []type = make([]type, len) // len 為切片初始長度
// 也可以簡寫為
slice := make([]type, len)
```

可以使用選用參數 capacity 指定容量，省略時與 length 相同

```go
var slice []type = make([]type, length, capacity)
```

![image](https://cdn.jsdelivr.net/gh/yexca/picx-images-hosting@master/2024/02-go/image.13li74f5h3.webp)

## 切片初始化

直接初始化

```go
s := []int {1, 2, 3}
```

將陣列區間初始化為切片，從 startIndex 到 endIndex-1，這兩個值都可以省略

```go
s := arr[startIndex:endIndex]
```

省略 startIndex 或 endIndex 表示從第一個元素開始索引或索引到最後一個元素

## len() 和 cap()

切片是可以透過索引存取的，透過 len() 函式獲取長度

而 cap() 為計算容量的方法，可以測量切片最長可以達到多少

```go
package main

import "fmt"

// 切片傳遞為參考傳遞 (引用傳遞)，函式內修改會影響原始資料
func printSlice(slice []int) {
    fmt.Printf("len=%d, cap=%d, slice=%v", len(slice), cap(slice), slice)
}

func main() {
    s := make([]int, 3, 5)
    printSlice(s)
}

/*
 * 輸出
 * len=3, cap=5, slice=[0 0 0]
 */
```

## 空切片

一個切片在未初始化之前預設為 nil (空切片)，長度為 0

```go
package main

import "fmt"

func printSlice(slice []int) {
    fmt.Printf("len=%d, cap=%d, slice=%v\n", len(slice), cap(slice), slice)
}

func main() {
    var s []int
    printSlice(s)
    // 判斷是否為空
    if s == nil {
        fmt.Println("slice is empty")
    }
}
```

## 切片截取

透過設定上下限截取切片

```go
package main

import "fmt"

func printSlice(slice []int) {
    fmt.Printf("len=%d, cap=%d, slice=%v\n", len(slice), cap(slice), slice)
}

func main() {
    s := []int{0, 1, 2, 3, 4, 5, 6, 7}

    // 打印原始切片
    fmt.Println(s)
    
    // 從 2 (包含) 到 5 (不包含)
    printSlice(s[2:5])
    // 從第一個到 5 (不包含)
    printSlice(s[:5])
    // 從第二個到最後一個
    printSlice(s[2:])

    // 這樣賦值修改 subS 將會影響到 s
    subS := s[1:6]
    printSlice(subS)
}
```

## append() 和 copy()

增加切片的容量與複製切片

```go
package main

import "fmt"

func printSlice(slice []int) {
    fmt.Printf("len=%d, cap=%d, slice=%v\n", len(slice), cap(slice), slice)
}

func main() {
    var s []int
    printSlice(s)

    // 增加一個元素
    s = append(s, 0)
    printSlice(s)

    // 增加多個元素
    s = append(s, 1, 2, 3, 4)
    printSlice(s)

    // 建立一個容量為 s 兩倍的 s2
    s2 := make([]int, len(s), cap(s)*2)
    // 複製 s 到 s2，此時修改 s2 不影響 s
    copy(s2, s)
    printSlice(s2)
}
```

> 切片的擴充：如果追加的值超過容量，則容量通常會增加為原來的兩倍

## map

map 有兩種宣告方式

```go
package main

import "fmt"

func main() {
    var map1 = make(map[string]string)
    // 插入資料
    map1["one"] = "1"
    map1["two"] = "2"
    fmt.Println(map1) // map[one:1 two:2]
}
```

第二種

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

### map 巢狀

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
 * 輸出
 * map[first:map[one:1 two:2]]
 */
```

### 修改、遍歷與刪除

```go
package main

import "fmt"

func main() {
    map1 := make(map[string]map[string]string)
    map1["first"] = make(map[string]string, 2)
    map1["first"]["one"] = "1"
    map1["first"]["two"] = "2"
    // 修改
    map1["first"]["one"] = "one"
    fmt.Println(map1)
    // 遍歷
    for key, value := range map1{
        fmt.Println("key =", key, "value =", value)
    }
    // 刪除
    delete(map1, "first")
    fmt.Println(map1)
}
```

### 判斷是否有某值

```go
package main

import "fmt"

func main() {
    map1 := make(map[string]string)
    map1["one"] = "1"
    val, ok := map1["one"]
    if ok {
        fmt.Println(val)
    } else {
        fmt.Println("empty")
    }
}
```
