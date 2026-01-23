---
slug: 211
title: 'Pixiv 下載器'
# draft: true
author: yexca
date: '2025-01-03T20:05:44+09:00'
lastmod: '2025-05-18T16:20:33+09:00'
categories:
    - 開發實踐
tags:
    - Pixiv
    - Python
    - PyQt6
---

{{< notice >}} 本文由 gemini-3-flash-preview 翻譯 {{< /notice >}}

> 2025-05-18 更新  
> 我寫了一個 SQLite 版的，不用設定資料庫了，詳細資訊請訪問: <https://blog.yexca.net/zh-tw/archives/248>

耗時三天寫出了一個大概能用的版本，不過沒有做錯誤處理 ~~遇到錯誤直接重啟吧~~

專案網址: <https://github.com/yexca/PixivDownloader-MySQL>

## 引言

這要從[資料庫紀錄已下載繪師作品](https://blog.yexca.net/zh-tw/archives/94/)開始說起了，當時我弄了一個資料庫紀錄我下載過的作品，時間久了之後，覺得這玩意是在做重複作業啊，說到重複作業那必然是交給電腦來做啊，正好最近不經意間產生了撰寫程式的想法，也正好對其不滿意: <https://github.com/yexca/yasumiProject>，同時又是過年比較空閒，這就開寫。

## 說明

雖說我是寫出來了，不過沒有錯誤處理之類的，只能說勉強能用吧。同時程式碼很亂 (第一次開發比較大的 GUI 軟體啦)，亂到我不想去整理和做國際化支援了。

並且開發過程中突然想到都寫程式了為什麼不用 SQLite 呢，這還要開一個 MySQL 多麻煩，不過都做了，就做到最後吧。

最後本來想打包的，因為使用設定檔，打包好麻煩 ~~(剛開始不知道打包出來被 Windows 當成病毒了)~~，我實在懶得折騰了，就這樣吧。

## 介面

背景圖: <https://www.pixiv.net/artworks/83273073>

- 首頁

![home](https://github.com/yexca/picx-images-hosting/raw/master/2025/01-PixivDownloader/home.4ckyo63bny.webp)

- 設定

![settings](https://github.com/yexca/picx-images-hosting/raw/master/2025/01-PixivDownloader/settings.5fknz20gje.webp)

## 設定

因為基於我現有資料庫開發，所以幾乎沒有自定義程度，資料庫建立資料表語句為：

```sql
CREATE TABLE pic (
    ID varchar(99),
    # 唯一識別
    name varchar(255),
    # 繪師暱稱
    downloadedDate datetime,
    # 下載/更新時間
    lastDownloadID varchar(255),
    # 最新作品ID
    platform varchar(50),
    # 平台
    url varchar(255),
    # 連結
    PRIMARY KEY(ID)
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

然後因為 API 的使用需要登入並且不可以用帳號密碼登入，根據 <https://gist.github.com/ZipFile/c9ebedb224406f4f11845ab700124362> 取得 Auth Token 後使用。

背景圖片我並沒有上傳到 git 倉庫，路徑為 `app\resources\images\background.png`

然後是需要安裝 Python，安裝相依套件：

```bash
pip install -r requirements.txt
```

## 使用

執行程式

```bash
python main.py
```

在 Pixiv 驗證介面和設定介面完成相關配置後返回首頁。

填入繪師 ID **或者** 某一作品的 ID 就會自動爬取該繪師全部作品了。

## 結尾

我其實都覺得自己都不去使用它，這算是我開發經歷的一小步吧。

![yexca-211](https://count.getloli.com/@yexca-211)
