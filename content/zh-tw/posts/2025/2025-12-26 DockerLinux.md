---
slug: 262
title: '利用 Docker 建立臨時 Linux 互動環境'
# draft: true
author: yexca
date: '2025-12-26T18:43:04+09:00'
categories:
    - 開發實踐
tags:
    - Docker
    - Linux
---

{{< notice >}} 本文由 gemini-3-flash-preview 翻譯 {{< /notice >}}

在 Windows 環境下執行一個 bash 腳本顯然難度稍大，在 Linux 環境下，執行另一個發行版本的特化腳本顯然也有點麻煩。利用 Docker 可以協助處理這個問題，同時還可以保護本地環境的純淨。

本文以 alpine 為例，列出如何使用 Docker 的 Linux 系統完成目前目錄的互動處理。

## 原理

事實上也就是透過掛載將目前目錄的所有檔案掛載到容器的一個目錄，指令範本為：

```bash
docker run --rm -it -v "$(pwd)":/data -w /data alpine sh
```

其中的參數含義如下：

| 參數 | 意義                                               |
| ---- | -------------------------------------------------- |
| --rm | 容器退出後刪除                                     |
| -it  | 表示 interactive 和 tty 輸出的組合，互動與看到輸出 |
| -v   | 對應路徑，參數表示將目前目錄對應到容器的 /data     |
| -w   | 設定工作路徑，這樣進入容器後就在 /data             |
| sh   | 最後的 sh 表示執行 sh 指令                         |

同時如果只是想要執行單次指令，不需要互動輸出，在最後輸入指令即可，例如：

```bash
docker run --rm -v "$(pwd)":/data -w /data alpine ls -la
```

## Windows

在 PowerShell 和 CMD 環境下指令不同，主要區別在於環境變數，以下是開啟 alpine 互動終端的指令：

- PowerShell

```bash
docker run --rm -it -v ${PWD}:/data -w /data alpine sh
```

- CMD

```bash
docker run --rm -it -v %cd%:/data -w /data alpine sh
```

## Linux

在 Linux 上，因為進入容器預設使用 root 權限，為防止容器中產生的檔案在宿主機是 root 權限導致無法修改，最好對應目前使用者的 UID 與 GID：

```bash
docker run --rm -it -u $(id -u):$(id -g) -v "$(pwd)":/data -w /data alpine sh
```

## MacOS

不需要處理權限問題，變數同 Linux：

```bash
docker run --rm -it -v "$(pwd)":/data -w /data alpine sh
```

## 注意事項 - Alpine

因為 alpine 是非常精簡的系統，所以可能需要自行安裝一些常用的指令，請使用 `apk add` 指令進行安裝。
