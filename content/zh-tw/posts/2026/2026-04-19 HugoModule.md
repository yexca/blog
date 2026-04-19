---
slug: 277
title: 'Hugo Module 管理'
# draft: true
author: yexca
date: '2026-04-19T22:20:06+09:00'
categories:
    - 技術學習
tags:
    - Hugo
    - Go
---

{{< notice >}} 本文由 gemini-3-flash-preview 翻譯 {{< /notice >}}

首先需要安裝 `go` 環境

```bash
sudo apt install golang
```

然後初始化

```bash
hugo mod init github.com/<your_user>/<your_project>
```

在設定檔 `hugo.yml` 匯入需要新增的模組

```yaml
module:
  imports:
    - path: github.com/name/repo
```

更新設定

```bash
hugo mod get -u
```

## module 顯示

因為使用 go 的相依性，所以要看模組具體在哪使用命令

```bash
go env GOMODCACHE
```

將相依性 vendor 進自己的儲存庫

```bash
hugo mod vendor
```

這樣就會有一個 vendor 資料夾，顯示該專案的相依性

## 使用

如果是作為主題的話，只需要本地同名檔案即可，也就是修改本地的檔案，將覆蓋匯入的主題檔案

## 參考文章

<https://gohugo.io/hugo-modules/use-modules/>