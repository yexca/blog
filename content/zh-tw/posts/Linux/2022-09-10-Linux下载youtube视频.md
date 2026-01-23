---
slug: 68
title: Linux 下載 YouTube 影片
date: '2022-09-10T19:29:58+08:00'
author: yexca
# layout: post
# permalink: /zh-tw/archives/68
views:
    - '330'
categories:
    - 折騰經驗
tags:
    - YouTube
---

{{< notice >}} 本文由 gemini-3-flash-preview 翻譯 {{< /notice >}}

## 前言

既然都有 Win 命令列了，那怎麼能沒有 Linux 呢？

Windows 的文章：[命令列下載 YouTube 影片](http://blog.yexca.net/zh-tw/archives/52)

## 下載 yt-dlp

建議配置好 Python 環境，然後到 [Releases · yt-dlp/yt-dlp · GitHub](https://github.com/yt-dlp/yt-dlp/releases) 下載 *yt-dlp*，如果不想配置 Python 就下載 *yt-dlp_linux*。

下載完成後賦予執行權限並放在 `/usr/local/bin/` 下。

## 下載 FFmpeg

參考官網 [Download FFmpeg](https://ffmpeg.org/download.html#build-linux)

Fedora 下使用以下命令：

```bash
sudo dnf install ffmpeg
```

## 設定檔

切換設定目錄：

```bash
cd ~/.config
```

建立資料夾並進入：

```bash
mkdir yt-dlp
cd yt-dlp
```

建立設定檔：

```bash
vi config
```

我的設定檔如下：

```bash
-f bv+ba/b -o ~/Videos/%(uploader)s/%(upload_date)s%(title)s%(id)s.%(ext)s --continue --merge-output-format mp4
```

說明一下：

```bash
-f bv+ba/b # 最高畫質與音訊

-o # 輸出資料夾設定
/%(uploader)s/ # 依頻道名稱建立資料夾
%(upload_date)s # 上傳時間
%(title)s # 影片標題
%(id)s # 影片 ID
.%(ext)s # 影片副檔名

--continue # 斷點續傳

--merge-output-format mp4 # 合併為 mp4 影片
```

## 參考文章

[FFmpeg 批次轉換影片格式](http://blog.yexca.net/zh-tw/archives/65) ~~話說自己的文章有必要放連結嗎~~
