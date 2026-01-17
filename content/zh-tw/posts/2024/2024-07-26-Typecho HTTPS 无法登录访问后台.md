---
slug: 175
# layout: post
title: 'Typecho HTTPS 無法登入存取後台'
author: yexca
date: 2024-07-26T22:22:22+08:00
# permalink: /archives/175
categories:
    - 實作經驗
tags:
    - Typecho
    - 故障排除
---  

{{< notice >}} 本文由 gemini-3-flash-preview 翻譯 {{< /notice >}}

## 前言

先前在將 Typecho 遷移至 Docker 容器後，開啟 HTTPS 時登入後台會報錯，而將 HTTPS 關閉後則可以正常存取。由於先前在非 Docker 部署時可以正常存取，我原以為是 Docker 網路的問題，且當時的修改是一次性的，不會再進行更新，因此我在關閉 HTTPS 完成修改後便不再處理。如今再次使用 Typecho 又遇到相同問題，考量到需要更新文章，於是尋找解決方法。

## 解決方法

解決方法非常簡單，在 `data/config.inc.php` 檔案最後加入以下程式碼：

```php
define('__TYPECHO_SECURE__', true);
```

接著重新啟動即可。

## 成因分析

參考資料中推測是因為使用者與瀏覽器之間是透過 HTTPS 互動，但實際上 PHP 接收到的是來自 Cloudflare 的 HTTP 請求，因此 PHP 使用 HTTP 進行回應，進而導致了這個問題。

## 參考文章

[Typecho HTTPS 無法登入後台](https://blog.lucien.ink/archives/523/)
