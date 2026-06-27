---
slug: 7
title: '關於在使用 navicat 連接 SQL server 的一些問題'
date: '2021-11-07T23:41:46+08:00'
author: hiyoung
# layout: post
# permalink: /archives/7
views:
    - '200'
categories:
    - 技術學習
tags:
    - 資料庫
---

> 該文章使用 Google 翻譯處理。
>
> 該文章由 [Hiyoung](https://blog.hiyoung.icu/) 編寫，翻譯自 yexca

在安裝完 SQL server 和 navicat 後在 navicat 中添加數據庫：

1.連接名無要求，按照自己需要命名

2.打開安裝好的 SQL server 配置管理器

注意 SQL Server（SQLEXPRESS）要保證在運行中，否則 navicat 無法連接  
雙擊開啟後點選服務，可以看到自己的主機名

3.此時打開 navicat 在主機的地方填上：主機名 \\SQLEXPRESS (格式)

4.用戶名填 sa (為安裝 SQL server 時的預設用戶名，具體 SQL server 網路教學很多可以自己參考) ，密碼是自己設定的 (同樣在 SQL server 安裝時設定的密碼)

5.測試連接成功即可使用

注：僅個人在安裝過程中遇到的問題，具體安裝教程請參考網絡

附上 navicat 15 及註冊機：<https://pan.baidu.com/s/1cJ1EZ9Gyz6Jp6J03VqcDHA>

提取碼：3n7g
