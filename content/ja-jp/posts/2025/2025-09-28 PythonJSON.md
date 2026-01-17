---
slug: 256
title: 'Python で JSON ファイルを扱う'
# draft: true
author: yexca
date: '2025-09-28T10:34:38+09:00'
categories:
    - 技術学習
tags:
    - Python
    - JSON
---

{{< notice >}} この記事は gemini-2.5-flash によって翻訳されました {{< /notice >}}

## はじめに

あるすごい人からRecord TreeのJSONファイルをもらったから、ついでに[サッと何か書いとこう](https://github.com/yexca/RecordTreeDownloader-SQLite)。便利だし、忘れちゃったことのメモにもなるしね～（そうそう、ちょうど256番目の記事なんだよね）

でもさ、[PixivDownloader](https://github.com/yexca/PixivDownloader-SQLite)でも使ったことあったのに、完全に忘れちゃってたんだよね。

## JSONファイルを読み込む

読み込んだ後に返ってくる値はJSONファイルによって違うんだけど、Pythonのリストか辞書型に対応してるよ。

```python
import json

with open(FILE_PATH, "r", encoding="utf-8") as f:
    jsonParse = json.load(f)
```

そしたら、`jsonParse`変数にいろんな操作ができるようになるんだ。

## リスト

もしJSONファイルがこんな感じだったら

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

そしたら、さっきの操作で`jsonParse`の外側はリストで、それぞれのリストの項目は辞書型になるよ。

## 辞書

もしJSONファイルがこんな感じだったら

```json
{
    "a": {
        "c": "d"
    }
}
```

そしたら、さっきの操作で`jsonParse`は2層にネストされた辞書になるんだ。

## 操作

型がわかれば、このファイルに対する操作はPythonでの辞書やリストに対する操作と同じで大丈夫。例えば、このファイルの場合ね。

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

1を出力するコード

```python
import json

with open(FILE_PATH, "r", encoding="utf-8") as f:
    s = json.load(f)
    print(s[0]["a"])
    # または
    print(s[0].get("a"))
```

4を100に修正するコード

```python
import json

with open(FILE_PATH, "r", encoding="utf-8") as f:
    s = json.load(f)
    s[1]["d"] = 100
```

項目を一つ追加して、ファイルをこんな感じにする

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

要はリストに辞書を追加するってことなんだけど、コードはこれね。

```python
import json

with open(FILE_PATH, "r", encoding="utf-8") as f:
    s = json.load(f)
    s.append({"e": 5})
```

## ループ処理

リストの場合は、リストのループ処理を使うよ。

```python
for i in s:
    print(i)
```

辞書の場合は、辞書のループ処理を使うよ。

```python
for key, value in s.items():
    print(key, value)

for key in s:
    print(key) 
```

## 保存

`json.dump`を使う

```python
with open(FILE_PATH, "r", encoding="utf-8") as f:
    s = json.load(f)
    # 変数sに何か修正を加える

with open(FILE_PATH, "w", encoding="utf-8") as f:
    json.dump(s, f, ensure_ascii=False, indent=2)
```

`ensure_ascii=False`は中国語文字が正しく書き込まれるようにするもので、`indent=2`はインデントがスペース2つ分になることを意味してるよ。
