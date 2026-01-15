---
slug: 50
title: Windows ネットワークアドレス (FTPアドレス) クイックアクセスから削除
date: '2022-06-27T13:31:58+08:00'
author: yexca
# layout: post
# permalink: /archives/50
views:
    - '252'
categories:
    - 試行錯誤の記録
tags:
    - Windows
    - FTP
---

{{< notice >}} この記事は gemini-2.5-flash によって翻訳されました {{< /notice >}}

解決策はなさそうだけど、クイックアクセスに自分で追加したのを全部消すことはできるよ（デフォルトに戻すってことね）。

`C:\\Users\\ユーザー名\\AppData\\Roaming\\Microsoft\\Windows\\Recent\\AutomaticDestinations` の場所に行って、このフォルダの中身をバックアップしたら、全部消しちゃって大丈夫。

## 参考記事

[ftpアドレスがクイックアクセスから削除できない、他のフォルダはできる – Microsoft Community](https://answers.microsoft.com/zh-hans/windows/forum/all/ftp%E5%9C%B0%E5%9D%80%E4%B8%8D%E8%83%BD%E4%BB%8E/835ef23c-3d44-4fdd-8389-ae47bb96e73)
