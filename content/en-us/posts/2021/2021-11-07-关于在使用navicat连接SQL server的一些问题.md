---
slug: 7
title: 'Issues Connecting Navicat to SQL Server'
date: '2021-11-07T23:41:46+08:00'
author: hiyoung
# layout: post
# permalink: /archives/7
views:
    - '200'
categories:
    - Tinkering Notes
tags:
    - Database
    - Navicat
---

{{< notice >}} This article was translated by gemini-3-flash-preview {{< /notice >}}

> This article was written by [Hiyoung](https://blog.hiyoung.icu/)

Adding a database in Navicat after installing SQL Server:

1. **Connection Name**: Use any name you like.

2. **SQL Server Configuration Manager**: Open the manager and ensure that `SQL Server (SQLEXPRESS)` is running. Navicat cannot connect if the service is stopped. You can see your host name by double-clicking the service.

3. **Host**: In Navicat's host field, use the format: `HostName\SQLEXPRESS`.

4. **Credentials**: Use `sa` (the default SQL Server username) and the password you configured during the SQL Server installation.

5. **Test Connection**: Once the test succeeds, you are ready to go.

Note: These are just notes on issues I personally encountered. Please refer to online tutorials for a full installation guide.

Navicat 15 and Keygen: <https://pan.baidu.com/s/1cJ1EZ9Gyz6Jp6J03VqcDHA>

Extraction code: 3n7g
