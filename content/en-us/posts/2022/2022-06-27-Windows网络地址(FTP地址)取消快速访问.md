---
slug: 50
title: Remove Windows Network Addresses (FTP) from Quick Access
date: '2022-06-27T13:31:58+08:00'
author: yexca
# layout: post
# permalink: /archives/50
views:
    - '252'
categories:
    - Tinkering Tips
tags:
    - Windows
    - FTP
---

{{< notice >}} This article was translated by gemini-2.5-flash {{< /notice >}}

No direct fix, but you can clear all custom Quick Access entries (resets to default).

Go to `C:\\Users\\YourUsername\\AppData\\Roaming\\Microsoft\\Windows\\Recent\\AutomaticDestinations`. Back up all files in that folder, then nuke 'em.

## References

[FTP address cannot be removed from Quick Access, other folders can – Microsoft Community](https://answers.microsoft.com/zh-hans/windows/forum/all/ftp%E5%9C%B0%E5%9D%80%E4%B8%8D%E8%83%BD%E4%BB%8E/835ef23c-3d44-4fdd-8389-ae47bb696e73)
