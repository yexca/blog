---
slug: 248
title: 'Pixiv 下載器重構記：從亂寫到理解混亂'
# draft: true
author: yexca
date: '2025-05-18T16:20:33+09:00'
categories:
  - 開發實踐
tags:
  - Pixiv
  - Python
  - PyQt6
---

{{< notice >}} 本文由 ChatGPT 翻譯。并且，該軟件只有簡體字 {{< /notice >}}

原本只是想隨便寫個小工具，打算用兩天就放著（以前大多都是這樣），沒想到在沒出錯的情況下幫我省下不少時間，越用越順手。

慢慢地也喚起我以前那個「為什麼不用 SQLite 呢」的想法。確實，每次開 MySQL 真的太麻煩了，於是就誕生了這個版本，終於不用每次都啟動資料庫服務了 ~~（也終於變得比較像給人用的了）~~

## 使用方法

專案位址：<https://github.com/yexca/PixivDownloader-SQLite>

GUI 跟前一代差不多，可以參考 <https://blog.yexca.net/zh-tw/archives/211/>

### 設定說明

使用前需要先設定以下項目：

* `refresh token`（Pixiv 登入驗證，參考：[Pixiv OAuth Flow](https://gist.github.com/ZipFile/c9ebedb224406f4f11845ab700124362)）
* 下載路徑（預設 `D:\Downloads`）

### 下載說明

使用時只需輸入：

* 畫師 ID，或是
* 作品 ID（若兩者皆輸入，將以畫師 ID 為主）

點擊下載即可下載所有作品並記錄到資料庫（若該畫師尚無記錄則下載所有作品，已有記錄則只下載未下載的部分）

### 錯誤處理

目前僅對爬取錯誤進行處理。若出現錯誤提示，有可能是以下原因：

* 未設定 `refresh token` 或 token 已失效
* 畫師帳號不存在
* 作品不存在

我沒有加上詳細錯誤說明，如出錯請先檢查以上三點。

至於其他錯誤（例如軟體直接閃退），可以將 `程式根目錄/logs/app_*-*-*.log` 中最新的 log 檔寄給我，並說明情況。

聯絡方式：`PixivDownloader#yexca.net`（請將 # 換成 @）

## 新特性：從 MySQL 改為 SQLite

這次最大變動就是不再需要自建 MySQL，改用輕量化的 SQLite。

因此也移除了原本不必要的資料庫設定，將設定與 Pixiv 的驗證 Token 整合在一起。

加了個 icon（隨便請 ChatGPT 畫的），UI 稍作調整，變動不大。

程式碼初步進行架構化處理……雖然寫到最後又有點亂了就是了 ~~不過說不定哪天我又回來重構一次啦~~。

## 舊版 MySQL 資料庫的遷移方法

雖然我覺得應該沒人用上一版，但還是說一下：由於資料結構不同，最推薦的方式是查詢導出並轉為 INSERT 語法，例如：

```sql
SELECT ID, name, downloadedDate, lastDownloadID, url
FROM pic 
WHERE platform = 'pixiv';
```

將結果導出為 SQL 語法（我使用的是 Dataflare，它支援這個功能）。

然後建立一個 Python 檔案，寫入以下內容：

```python
import sqlite3

conn = sqlite3.connect("pixiv.db")
cursor = conn.cursor()

cursor.execute('''
        Create Table If Not Exists pic (
               ID TEXT PRIMARY KEY,
               name TEXT,
               downloadedDate TEXT,
               lastDownloadID TEXT,
               url TEXT
               )               
               ''')

conn.commit()

cursor.execute("""
INSERT INTO `pic` (`ID`, `name`, `downloadedDate`, `lastDownloadID`, `url`) VALUES
('123', 'name1', '2024-06-08 00:00:00', '1234', 'https://www.pixiv.net/users/123'),
('234', 'name2', '2025-02-12 00:05:36', '2345', 'https://www.pixiv.net/users/234'),
('345', 'name3', '2025-01-11 17:26:17', '3456', 'https://www.pixiv.net/users/345');
"""
)

conn.commit()

cursor.execute("""
Select * from pic
"""
)

rows = cursor.fetchall()
for row in rows:
    print(row)

conn.close()
```

其中 `cursor.execute` 的內容請自行替換為你的備份資料。我這裡提供三筆示範資料。

最後，將產生的資料庫檔案 `pixiv.db` 放到 `程式根目錄/resources` 即可。

一點開發感想：從「亂寫」到「理解混亂」
老實說這次重構是因為上次寫得太亂，覺得非整頓不可，結果改著改著我終於明白為什麼上次會那麼亂了 😂

不如說，這次的結構也沒好到哪去，寫到一半直接放棄重構，乾脆複製貼上，導致現在有駝峰式命名也有底線命名，真是懶得再改，唉。

總之算是一個能正常運作的半成品，能用就好了啦～

![yexca-248](https://count.getloli.com/@yexca-248)
