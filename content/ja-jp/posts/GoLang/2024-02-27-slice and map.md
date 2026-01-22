---
slug: 160
# layout: post
title: 'GoLang スライス'
author: yexca
date: 2024-02-27T20:00:00+08:00
lastmod: 2025-01-28T15:30:18+09:00
# permalink: /ja/archives/160
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
> GoLang (slice and map) スライス: この記事  
> GoLang (OOP) オブジェクト指向: <https://blog.yexca.net/ja/ja/archives/162>  
> GoLang (reflect) リフレクション: <https://blog.yexca.net/ja/ja/archives/204>  
> GoLang (struct tag) 構造タグ: <https://blog.yexca.net/ja/ja/archives/205>  
> GoLang (goroutine) ゴルーチン: <https://blog.yexca.net/ja/ja/archives/206>  
> GoLang (channel) チャンネル: <https://blog.yexca.net/ja/ja/archives/207>  

---

Go のスライスは配列の抽象化である

## 配列

配列の長さは変更できません

```go
package main

import "fmt"

func main() {
    // 定義方法 1
    var arr1 [10]int
    // トラバース
    for i := 0; i < len(arr1); i++ {
        fmt.Println("arr1[", i, "]:", arr1[i])
    }

    // 定義方法 2、代入
    arr2 := [10]int{0, 1, 2, 3}
    // range トラバーサル
    for index, value := range arr2 {
        fmt.Println("index =", index, "value =", value)
    }

    // 異なる長さを定義する
    var arr3 [4]int

    fmt.Printf("type of arr1 is %T\n", arr1) // [10]int
    fmt.Printf("type of arr1 is %T\n", arr2) // [10]int
    fmt.Printf("type of arr1 is %T", arr3)   // [4]int
}
```

コンパイルして実行すると、arr3 が arr1 および arr2 とは異なる型であることがわかります。そのため、関数パラメータを定義するときにも対応する型を指定する必要があります。

```go
func test(arr [4]int) {
    for i := 0; i < len(arr); i++ {
        fmt.Println("fmt_arr[", i, "]:", arr[i])
    }
}
```

上記の関数は arr3 を値で渡すことしかできず、値を変更しても元のデータには影響しません。

## スライスを定義する

配列と比較すると、スライスは固定長ではなく、要素を追加することができます（動的配列）。追加するとスライスの容量が増加する可能性があります。

スライスは、サイズが指定されていない配列を宣言することによって定義できます。

```go
var name []type
// 例えば
var s []int
```

または make() 関数を使用してスライスを作成する

```go
var slice []type = make([]type, len) // len はスライスの初期の長さです
// 次のように省略することもできます
slice := make([]type, len)
```

オプションの capacity パラメータを使用して容量を指定できます。省略した場合は、length と同じになります。

```go
var slice []type = make([]type, length, capacity)
```

![image](https://cdn.jsdelivr.net/gh/yexca/picx-images-hosting@master/2024/02-go/image.13li74f5h3.webp)

## スライスの初期化

直接初期化

```go
s := []int {1, 2, 3}
```

配列の値を startIndex から endIndex-1 までのスライスとして初期化します。両方の値は省略できます。

```go
s := arr[startIndex:endIndex]
```

startIndex または endIndex を省略すると、最初の要素からインデックス付けするか、最後の要素までインデックス付けすることを意味します。

## len() と cap()

スライスはインデックス可能であり、その長さは len() 関数を使用して取得できます。

cap() は容量を計算するメソッドであり、スライスが到達できる長さを測定できます。

```go
package main

import "fmt"

// スライス渡しは参照渡しであり、関数内の変更は元のデータに影響します
func printSlice(slice []int) {
    fmt.Printf("len=%d, cap=%d, slice=%v", len(slice), cap(slice), slice)
}

func main() {
    s := make([]int, 3, 5)
    printSlice(s)
}

/*
 * 出力
 * len=3, cap=5, slice=[0 0 0]
 */
```

## 空のスライス

スライスは初期化前はデフォルトで nil (空のスライス) であり、その長さは 0 です。

```go
package main

import "fmt"

func printSlice(slice []int) {
    fmt.Printf("len=%d, cap=%d, slice=%v\n", len(slice), cap(slice), slice)
}

func main() {
    var s []int
    printSlice(s)
    // 空かどうか確認する
    if s == nil {
        fmt.Println("slice is empty")
    }
}
```

## スライスインターセプション

上限と下限を設定してスライスをカットする

```go
package main

import "fmt"

func printSlice(slice []int) {
    fmt.Printf("len=%d, cap=%d, slice=%v\n", len(slice), cap(slice), slice)
}

func main() {
    s := []int{0, 1, 2, 3, 4, 5, 6, 7}

    // 元のスライスを印刷する
    fmt.Println(s)
    
    // 2(含む) から 5(含まない) まで
    printSlice(s[2:5])
    // 1 番目から 5 まで (含まない)
    printSlice(s[:5])
    // 2 番目から最後まで
    printSlice(s[2:])

    // この割り当てと subS の変更は s に影響します
    subS := s[1:6]
    printSlice(subS)
}
```

## append() と copy()

スライスの容量を増やし、スライスをコピーする

```go
package main

import "fmt"

func printSlice(slice []int) {
    fmt.Printf("len=%d, cap=%d, slice=%v\n", len(slice), cap(slice), slice)
}

func main() {
    var s []int
    printSlice(s)

    // 要素を追加する
    s = append(s, 0)
    printSlice(s)

    // 複数の要素を追加する
    s = append(s, 1, 2, 3, 4)
    printSlice(s)

    // s の 2 倍の容量を持つ s2 を作成します
    s2 := make([]int, len(s), cap(s)*2)
    // s を s2 にコピーします。s2 を変更しても s には影響しません。
    copy(s2, s)
    printSlice(s2)
}
```

> スライス拡張: 追加された値が容量を超える場合、容量は2倍になります

## map

map を宣言する方法は 2 つあります

```go
package main

import "fmt"

func main() {
    var map1 = make(map[string]string)
    // データを挿入
    map1["one"] = "1"
    map1["two"] = "2"
    fmt.Println(map1) // map[one:1 two:2]
}
```

2 番目

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

### map のネスト

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
 * 出力
 * map[first:map[one:1 two:2]]
 */
```

### トラバーサルを変更して削除する

```go
package main

import "fmt"

func main() {
    map1 := make(map[string]map[string]string)
    map1["first"] = make(map[string]string, 2)
    map1["first"]["one"] = "1"
    map1["first"]["two"] = "2"
    // 改訂
    map1["first"]["one"] = "one"
    fmt.Println(map1)
    // トラバース
    for key, value := range map1{
        fmt.println("key =", key, "value =", value)
    }
    // 消去
    delete(map1, "first")
    fmt.Println(map1)
}
```

### 特定の値があるかどうかを判定する

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
