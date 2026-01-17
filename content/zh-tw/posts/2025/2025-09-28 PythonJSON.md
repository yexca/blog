---
slug: 256
title: 'Python 處理 JSON 檔案'
# draft: true
author: yexca
date: '2025-09-28T10:34:38+09:00'
categories:
    - 技術學習
tags:
    - Python
    - JSON
---

{{< notice >}} 本文由 gemini-2.5-flash 翻譯 {{< /notice >}}

## 前言

某位高手給了 Record Tree 的 JSON 檔案，那順便[隨手寫了點東西](https://github.com/yexca/RecordTreeDownloader-SQLite)方便一下，也記錄一下忘記的內容 ~~(嗯，正好還是第 256 篇文章呢)~~

不過我在 [PixivDownloader](https://github.com/yexca/PixivDownloader-SQLite) 也有用到過，完全忘光了。

## 讀取 JSON 檔案

讀取後傳回的值會因 JSON 檔案不同而異，會對應到 Python 的列表 (list) 或字典 (dictionary) 型別。

```python
import json

with open(FILE_PATH, "r", encoding="utf-8") as f:
    jsonParse = json.load(f)
```

接著就可以對 `jsonParse` 變數進行各種操作了。

## 列表 (List)

假如 JSON 檔案是這種情況：

```json
[
    {
        "a": "b"
    },
    {
        "c": "d"
    }
]
```

那麼上述操作的 `jsonParse` 最外層是列表，每個列表項都是字典型別。

## 字典 (Dictionary)

假如 JSON 檔案是這種情況：

```json
{
    "a": {
        "c": "d"
    }
}
```

那麼上述操作的 `jsonParse` 是巢狀的兩層字典。

## 操作

知道型別後，對這個檔案的操作就跟 Python 中對字典或列表的操作一樣，例如這個檔案：

```json
[
  {
    "a": 1,
    "b": 2
  },
  {
    "c": 3,
    "d": 4
  }
]
```

印出 `1` 的程式碼：

```python
import json

with open(FILE_PATH, "r", encoding="utf-8") as f:
    s = json.load(f)
    print(s[0]["a"])
    # 或者
    print(s[0].get("a"))
```

將 `4` 修改為 `100` 的程式碼：

```python
import json

with open(FILE_PATH, "r", encoding="utf-8") as f:
    s = json.load(f)
    s[1]["d"] = 100
```

新增一個項目，使檔案變成如下所示：

```json
[
  {
    "a": 1,
    "b": 2
  },
  {
    "c": 3,
    "d": 4
  },
  {
    "e": 5
  }
]
```

其實就是為列表追加一個字典，程式碼如下：

```python
import json

with open(FILE_PATH, "r", encoding="utf-8") as f:
    s = json.load(f)
    s.append({"e": 5})
```

## 走訪 (Iteration)

對於列表，使用列表的走訪：

```python
for i in s:
    print(i)
```

對於字典，使用字典的走訪：

```python
for key, value in s.items():
    print(key, value)

for key in s:
    print(key) 
```

## 儲存

使用 `json.dump`：

```python
with open(FILE_PATH, "r", encoding="utf-8") as f:
    s = json.load(f)
    # 對變數 s 做一些修改

with open(FILE_PATH, "w", encoding="utf-8") as f:
    json.dump(s, f, ensure_ascii=False, indent=2)
```

其中 `ensure_ascii=False` 確保中文字元正確寫入，`indent=2` 表示縮排為 2 個空白字元。
