---
slug: 107
title: '《崩壞：星穹鐵道》國際服分流規則'
date: '2023-05-16T23:13:21+08:00'
author: yexca
layout: post
permalink: /archives/107
views:
    - '32'
categories:
    - 折騰經驗
tags:
    - Game
    - miHoYo
---

{{< notice >}} 本文由 gemini-3-flash-preview 翻譯 {{< /notice >}}

針對中國大陸無法進入遊戲的分流規則

## 核心原理

在進入遊戲時需要 UDP 連線，而多數協定不支援 UDP，即遇到 UDP 會自動拒絕，所以將 UDP 連線的 IP 設定為直連即可，以下是我擷取到的兩個 IP

```bash
8.209.196.179
# 第二個似乎直連不會連線，只需設定第一個即可
47.245.63.117
```

當然，為了安全起見（指 TCP 連線與 UDP 連線不一致可能造成的安全隱患），建議將相關網域都設定為直連，即以下這些

```bash
*.starrails.com
*.hoyoverse.com
8.209.196.179/8
```

## OpenClash

在「全域設定 - 規則設定」，啟用「自定義規則」，在第一個框的 `rules:` 下方輸入

```yaml
#rules:
- DOMAIN-SUFFIX, starrails.com, DIRECT
- DOMAIN-SUFFIX, hoyoverse.com, DIRECT
- IP-CIDR, 8.209.196.179/8, DIRECT
```

## Quantumult X

編輯設定檔，跳轉至 `[filter_local]` ，輸入以下內容

```conf
#SR
host-suffix, starrails.com, direct
host-suffix, hoyoverse.com, direct
ip-cidr, 8.209.196.179/8, direct
```
