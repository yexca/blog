---
slug: 50
title: Windows 網路位址 (FTP 位址) 取消快速存取
date: '2022-06-27T13:31:58+08:00'
author: yexca
# layout: post
# permalink: /archives/50
views:
    - '252'
categories:
    - 折騰經驗
tags:
    - Windows
    - FTP
---
{{< notice >}} 本文由 gemini-2.5-flash 翻譯 {{< /notice >}}

似乎沒有解決方法，不過可以將快速存取中自己加入的全部刪除 (恢復預設)

前往 `C:\\Users\\使用者名稱\\AppData\\Roaming\\Microsoft\\Windows\\Recent\\AutomaticDestinations`，將此資料夾目錄下的檔案備份後全部刪除

## 參考文章

[FTP 位址無法從快速存取中移除，但其他資料夾可以 – Microsoft Community](https://answers.microsoft.com/zh-hans/windows/forum/all/ftp%E5%9C%B0%E5%9D%80%E4%B8%8D%E8%83%BD%E4%BB%8E/835ef23c-3d44-4fdd-8389-ae47bb696e73)
