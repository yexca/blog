---
slug: 61
title: Fiddler 攔截 HTTPS 封包
date: '2022-09-01T08:17:32+08:00'
author: yexca
# layout: post
# permalink: /archives/61
views:
    - '181'
categories:
    - 技術學習
tags:
    - Fiddler
---

notify: {{< notice >}} 本文由 gemini-2.5-flash-lite 翻譯 {{< /notice >}}

## 引言

預設情況下 Fiddler 僅能攔截 HTTP 封包，需要進行設定後才能捕獲 HTTPS 流量。目前大部分網站都使用 HTTPS 或 HSTS，因此開啟 HTTPS 封包攔截功能是很有必要的。

## Fiddler 設定

在「設定」-「HTTPS」頁面中，勾選「Capture HTTPS traffic」即可。下方的「Ignore server certificate errors(unsafe)」也可以勾選，但可能存在安全風險，之後請儲存設定。

## 瀏覽器設定

啟用 HTTPS 攔截後，使用瀏覽器可能會出現憑證錯誤，提示「連線不安全」或「連線不是私密連線」等訊息。此時需要匯入相關憑證。以 Firefox 為例：

首先下載 Fiddler 憑證。在上一部的設定頁面中，點擊「Export root cerificate to Desktop」即可將憑證匯出至桌面 (`~/Desktop/`)。

然後進入 Firefox 的設定，在「隱私與安全性」-「憑證」頁面中匯入剛剛下載的憑證，並在彈出的視窗中全選信任相關選項。

匯入完成後，即可正常瀏覽網頁，Fiddler 也能正常攔截 HTTPS 的請求與回應。
