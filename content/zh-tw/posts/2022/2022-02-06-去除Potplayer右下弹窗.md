---
slug: 23
title: 移除 Potplayer 右下角彈窗
date: '2022-02-06T21:37:45+08:00'
author: yexca
# layout: post
# permalink: /archives/23
views:
    - '690'
categories:
    - 開發實踐
tags:
    - Potplayer
---

{{< notice >}} 本文由 gemini-2.5-flash-lite 翻譯 {{< /notice >}}

## 引言

Potplayer 是非常優秀的影片播放軟體，但最近的版本右下角開始有彈出廣告，非常令人困擾。本文將介紹兩種方法來解決右下角彈窗問題。

## 使用無彈窗的舊版本（推薦）

最後一個沒有廣告彈窗的版本是 1.7.18958。

舊版本的所有 PotPlayer 都可以從以下網址下載：  
[PotPlayer 舊版本下載](https://www.videohelp.com/software/PotPlayer/old-versions)

1.7.18958 版本直接下載連結：[64 位元](https://www.videohelp.com/download/PotPlayerSetup64-1.7.18958.exe) | [32 位元](https://www.videohelp.com/download/PotPlayerSetup-1.7.18958.exe)

安裝完成後，開啟「設定」（按 F5），在「基本設定」->「自動更新」中選擇「不使用自動更新」。

## 使用綠色版

註：此版本的個人使用體驗感覺不是太好，例如無法靠近吸附視窗、以原始檔案比例開啟等。

[藍奏雲連結](https://xiaodao.lanzoux.com/b0dpu58zc) by zdBryan

一般執行 = 安裝版（包含開始選單捷徑及程式解除安裝捷徑）

右鍵解壓縮 = 綠色版（本身不提供便攜式軟體，需手動執行綠化處理）

版本特色

- 1、移除驗證，移除右下角空白廣告彈窗！解除安裝時可選擇備份設定。
- 2、禁止背景網路請求：境外廣告、傳送日誌、檢查升級。
- 3、整合額外的音訊解碼器及影片解碼器元件。
- 4、預設配置：一般設定 + 預設啟用自訂解碼器 H.265/HEVC 及硬體加速。
- 5、刪除 TV 直播列表、登入程式、日誌管理、訊息通知、多語言等不必要的檔案。

## 參考文章

- [關於 Potplayer 右下角彈窗解決方案](https://blog.csdn.net/luwieer/article/details/109590992)
- [PotPlayer v1.7.21589 綠色版](https://xd.x6d.com/i-wz-10120.html)
