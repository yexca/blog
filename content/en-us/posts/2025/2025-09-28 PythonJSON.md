---
slug: 256
title: 'Python: Handling JSON Files'
# draft: true
author: yexca
date: '2025-09-28T10:34:38+09:00'
categories:
    - Tech Learning
tags:
    - Python
    - JSON
---

{{< notice >}} This article was translated by gemini-2.5-flash {{< /notice >}}

## Intro

Got some Record Tree JSON files from a senior dev. So I quickly [coded up this thing](https://github.com/yexca/RecordTreeDownloader-SQLite) to make life easier and jot down what I always forget. ~~(Hey, fitting that this is article #256!)~~

I even used it in [PixivDownloader](https://github.com/yexca/PixivDownloader-SQLite) before, but completely blanked on it.

## Reading JSON Files

After reading, the returned value changes based on the JSON file structure. It'll be either a Python list or a dictionary.

```python
import json

with open(FILE_PATH, "r", encoding="utf-8") as f:
    jsonParse = json.load(f)
```

Now you can mess with the `jsonParse` variable.

## Lists

If your JSON file looks like this:

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

Then, `jsonParse` will be an outer list, with each item inside being a dictionary.

## Dictionaries

If your JSON file looks like this:

```json
{
    "a": {
        "c": "d"
    }
}
```

Then, `jsonParse` will be a two-level nested dictionary.

## Operations

Once you know the type, you just treat it like any Python dictionary or list. For example, given this file:

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

Code to print `1`:

```python
import json

with open(FILE_PATH, "r", encoding="utf-8") as f:
    s = json.load(f)
    print(s[0]["a"])
    # Or
    print(s[0].get("a"))
```

Code to change `4` to `100`:

```python
import json

with open(FILE_PATH, "r", encoding="utf-8") as f:
    s = json.load(f)
    s[1]["d"] = 100
```

Add an item to make the file look like this:

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

Basically, just append a dictionary to the list. Here's the code:

```python
import json

with open(FILE_PATH, "r", encoding="utf-8") as f:
    s = json.load(f)
    s.append({"e": 5})
```

## Iteration

For lists, use list iteration:

```python
for i in s:
    print(i)
```

For dictionaries, use dictionary iteration:

```python
for key, value in s.items():
    print(key, value)

for key in s:
    print(key)
```

## Saving

Use `json.dump`:

```python
with open(FILE_PATH, "r", encoding="utf-8") as f:
    s = json.load(f)
    # Make some changes to variable s

with open(FILE_PATH, "w", encoding="utf-8") as f:
    json.dump(s, f, ensure_ascii=False, indent=2)
```

`ensure_ascii=False` makes sure non-ASCII chars (like Chinese) are written correctly. `indent=2` pretty-prints it with 2-space indents.
