---
slug: 154
# layout: post
title: 'Hello GoLang'
author: yexca
date: 2024-02-19T07:58:37+08:00
lastmod: 2025-01-28T13:57:18+09:00
# permalink: /en/archives/154
categories:
    - Tech Learning
tags:
    - Go
    - Programming Language
    - Programming Basics
---

{{< notice >}} This article was translated by gemini-2.5-flash {{< /notice >}}

> **Golang Series**
>
> Hello GoLang: This Article  
> GoLang (var and const) Variables and Constants: <https://blog.yexca.net/en/archives/155>  
> GoLang (func) Functions: <https://blog.yexca.net/en/archives/156>  
> GoLang (slice and map) Slices: <https://blog.yexca.net/en/archives/160>  
> GoLang (OOP) Object-Oriented Programming: <https://blog.yexca.net/en/archives/162>  
> GoLang (reflect) Reflection: <https://blog.yexca.net/en/archives/204>  
> GoLang (struct tag) Struct Tags: <https://blog.yexca.net/en/archives/205>  
> GoLang (goroutine) Goroutines: <https://blog.yexca.net/en/archives/206>  
> GoLang (channel) Channels: <https://blog.yexca.net/en/archives/207>  

---

Go Download: <https://go.dev/dl/>

JetBrains GoLand: <https://www.jetbrains.com/go/>

## Go Intro

Go compiles directly and can be deployed by just running it; it's a static-typed language.

```bash
# Run directly
go run hello.go

# Compile
go build hello.go
# Run after compilation
./hello
```

Some Go Applications

(1). Cloud Infrastructure

Key projects: Docker, Kubernetes, etcd, Consul, Cloudflare CDN, Qiniu Cloud Storage, etc.

(2). Core Backend Software

Key projects: TiDB, InfluxDB, CockroachDB, etc.

(3). Microservices

Key projects: go-kit, micro, Monzo Bank's Typhon, Bilibili, etc.

(4). Internet Infrastructure

Key projects: Ethereum, Hyperledger, etc.

## Hello Go

```go
package main // Define package name
/* 
 * You must specify which package the file belongs to on the first non-comment line of the source file.
 * 'main' indicates an independently executable program; every Go application includes a package named 'main'.
 */

import "fmt" // Import fmt package, which implements formatted I/O functions.

func main(){ // Function
    fmt.println("Hello Go")
}
```

Generally, the `main` function is the first function executed after startup; if an `init` function exists, it will execute first.

> When defining a function, the `{` must be on the same line as the function name.
