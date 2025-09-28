---
slug: 256
title: 'Python 处理 JSON 文件'
# draft: true
author: yexca
date: '2025-09-28T10:34:38+09:00'
categories:
    - 技术学习
tags:
    - Python
    - JSON
---

## 引言

某大佬给了 Record Tree 的 JSON 文件，那顺势[随便写点东西](https://github.com/yexca/RecordTree_Link)方便一下，记录下忘了的东西 ~~(嗯，还正好是第 256 个文章呢)~~

不过我在 [PixivDownloader](https://github.com/yexca/PixivDownloader-SQLite) 也用到了来着，都忘完了属于是

## 读取 JSON 文件

读取后返回的值因 JSON 文件不同而不同，对应于 Python 的列表或者字典类型

```python
import json

with open(FILE_PATH, "r", encoding="utf-8") as f:
    jsonParse = json.load(f)
```

然后就可以对 `jsonParse` 变量进行各种操作了

## 列表

假如 JSON 文件是这种情况

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

那么上述操作的 `jsonParse` 外层是列表，每个列表项是字典类型

## 字典

假如 JSON 文件是这种情况

```json
{
    "a": {
        "c": "d"
    }
}
```

那么上述操作的 `jsonParse` 是嵌套的两层字典

## 操作

知道类型后，对这个文件的操作就是和 python 中对字典或者列表的操作就行了，例如这个文件

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

打印出 `1` 的代码

```python
import json

with open(FILE_PATH, "r", encoding="utf-8") as f:
    s = json.load(f)
    print(s[0]["a"])
    # 或者
    print(s[0].get("a"))
```

修改 `4` 为 `100` 的代码

```python
import json

with open(FILE_PATH, "r", encoding="utf-8") as f:
    s = json.load(f)
    s[1]["d"] = 100
```

增添一个项，使文件变为如下

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

其实就是为列表追加一个字典，代码为

```python
import json

with open(FILE_PATH, "r", encoding="utf-8") as f:
    s = json.load(f)
    s.append({"e": 5})
```

## 遍历

对于列表，使用列表的遍历

```python
for i in s:
    print(i)
```

对于字典，使用字典的遍历

```python
for key, value in s.items():
    print(key, value)

for key in s:
    print(key) 
```

## 保存

使用 `json.dump`

```python
with open(FILE_PATH, "r", encoding="utf-8") as f:
    s = json.load(f)
    # 对变量 s 做一些修改

with open(FILE_PATH, "w", encoding="utf-8") as f:
    json.dump(s, f, ensure_ascii=False, indent=2)
```

其中 `ensure_ascii=False` 确保中文字符正确写入，`indent=2` 表示缩进为 2 个空格
