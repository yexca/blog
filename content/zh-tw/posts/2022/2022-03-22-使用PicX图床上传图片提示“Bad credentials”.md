---
slug: 35
title: '使用 PicX 圖床上傳圖片提示 "Bad credentials"'
date: '2022-03-22T16:30:12+08:00'
author: yexca
# layout: post
# permalink: /archives/35
views:
    - '374'
categories:
    - 折騰經驗
tags:
    - GitHub
    - PicX
    - 圖床
---

{{< notice >}} 本文由 Gemini-3-flash 翻譯 {{< /notice >}}

## 前言

今日我在撰寫文章時，發現 PicX 圖床無法使用並提示 `Bad credentials`，於是便尋找解決方法。

## 結論

其實就是 GitHub 的 Token 到期了，然後在電子信箱裡會收到一封郵件，標題為 `[GitHub] Your personal access token has expired`  
郵件有三行，第二行 `If this token is still needed` 後面有個連結，點擊打開並重新建立即可。

注意設定 `Expiration` 即 Token 期限。  
重新建立後需要在 PicX 將圖床設定重置一下。

具體參考：[使用PicX自建免費圖床 – yexca’Blog](https://blog.yexca.net/archives/27)