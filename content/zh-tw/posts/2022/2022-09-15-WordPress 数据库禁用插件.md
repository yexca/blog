---
slug: 72
title: 'WordPress 停用資料庫外掛'
date: '2022-09-15T22:17:02+08:00'
author: yexca
# layout: post
# permalink: /archives/72
views:
    - '207'
categories:
    - 折騰經驗
tags:
    - WordPress
---

{{< notice >}} 本文由 gemini-2.5-flash-lite 翻譯 {{< /notice >}}

## 前言

啟用某外掛後台出現 502 錯誤。

## 進入資料庫

1. 選擇進入 `wp_options` 資料表。

2. 找到 `active_plugins` 項目，一般在第二頁。

3. 編輯此項目的 `option_value` 行。

## 刪除不需要的外掛

***注意：刪除前請務必備份！！！***

1. 找到不需要的外掛名稱。

   刪除從 `i:` 開始到 `;` 為止的字串，例如 `i:1;s:23:"elementor/elementor.php";`

2. 更改序號，也就是 `i:` 後面的數字。

3. 更改總數，也就是最開頭 `a:` 後面的數字。

## 參考文章

[從資料庫停用單一 WordPress 外掛 - WordPress - GoDaddy 說明 SG](https://sg.godaddy.com/zh/help/disable-one-wordpress-plugin-from-the-database-41199)
