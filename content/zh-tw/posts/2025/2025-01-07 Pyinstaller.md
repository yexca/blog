---
slug: 213
title: 'Python pyinstaller 打包'
# draft: true
author: yexca
date: '2025-01-07T17:26:09+09:00'
categories:
    - 技術學習
tags:
    - Python
    - 程式基礎
    - 程式語言
---

{{< notice >}} 本文由 gemini-2.5-flash 翻譯 {{< /notice >}}

Python 打包是依據目前的作業系統環境而定的，在 Windows 下會打包出 .exe 執行檔，在 Linux 下則會打包出 ELF 格式的二進位檔案，不支援跨平台打包。

## 安裝

透過 pip 安裝

```bat
pip install pyinstaller
```

## 打包成單一檔案

使用參數 `--onefile`

```bat
pyinstaller --onefile main.py
```

## 常用參數

對於 Windows 程式的打包，常用參數有：

* `--windowed`: 不顯示終端機視窗 (如果是自行實作圖形使用者介面 (GUI) 的話)
* `--icon=icon.ico`: 為程式加入圖示
* `--hidden-import`: 明確指定所需的相依套件 (避免自動分析遺漏)
* `--add-data`: 加入額外的資源檔到打包中
* `--debug`: 啟用偵錯資訊

## 打包成多個檔案

打包成多個檔案時，使用 `--onedir` 參數

```bash
pyinstaller --onedir main.dy
```

相依檔案會放在 `_internal` 資料夾下，非常不友善

只有 pyinstaller 6.1.0 以上版本才能使用此參數

```bat
pyinstaller --contents-directory . .\main.py
```

這樣打包後的相依檔案和進入點就會在同一個目錄中。

## 打包設定項目

假設目前專案的設定檔放在 `project/conf/settings.json`

打包時想把這個檔案也包含進去，首先打包成多個檔案

```bash
pyinstaller --name my_program --contents-directory . .\main.py
```

會在目前目錄產生 `my_program.spec` 檔案，修改 `a` 的 `data`，以元組 (tuple) 的方式輸入想打包的檔案，例如：

```groovy
datas=[('conf/settings.json', 'conf/')],
```

然後刪除 `dist/` 資料夾下所有檔案後執行指令 (不刪除也可以，後續問題同意即可)

```bash
pyinstaller my_program.spec
```

## 專案

透過這種方式，已經把 <https://blog.yexca.net/zh-tw/archives/211> 的軟體打包成執行檔了 ~~(雖然還是沒做錯誤處理)~~

## 參考文章

<https://www.cnblogs.com/yqbaowo/p/17863429.html>
