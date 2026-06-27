---
slug: 288
title: 'Windows 保留連接埠的排除'
# draft: true
author: yexca
date: '2026-06-28T02:00:40+09:00'
categories:
    - 開發實踐
tags:
    - Windows
---

{{< notice >}} 本文由 gemini-3.5-flash 翻譯 {{< /notice >}}

在啟動服務的時候，時不時會出現連接埠被佔用的情況，但可能實際去查詢 `netstat -ano | findstr :[prot]` 卻發現沒有程式在佔用，這一般是被 Windows 作為保留連接埠佔用了

> 如果有程式在佔用的話，可以使用 `taskkill` 命令關閉處理程序

一般情況下換個連接埠就好了，可是當想要控制自己的連接埠時，就需要讓 Windows 不使用這些連接埠作為保留連接埠了

## 查看保留連接埠

以系統管理員身分開啟 cmd 或 powershell 使用命令查看

```powershell
netsh interface ipv4 show excludedportrange protocol=tcp
```

命令將會列出目前所有的保留連接埠

## 隨機重新整理

雖然每次重新啟動都會隨機重新整理連接埠，但在不重新啟動的情況下，可以使用以下命令重新啟動服務以重新整理連接埠

```powershell
net stop winnat
net start winnat
```

然後再次查看是否佔用了自己想要的連接埠

## 新增排除規則

不過為了穩定地使用某個喜歡的連接埠，還是加一個規則會比較穩，首先停止 WinNAT 服務

```powershell
net stop winnat
```

然後宣告自己喜歡的連接埠號

```powershell
netsh int ipv4 add excludedportrange protocol=tcp startport=7650 numberofports=10
```

這個命令是排除從 7650 開始的 10 個連接埠，也就是 7650~7659。然後重新啟動 WinNAT 服務即可

```powershell
net start winnat
```

## 移除排除規則

當不再使用的時候，同樣先停止，然後使用命令宣告

```powershell
netsh int ipv4 delete excludedportrange protocol=tcp startport=7650 numberofports=10
```

最後再重新啟動服務即可

## 原因

導致這個問題的根本原因，通常是 Windows 啟用了 Hyper-V 或 WSL2，Windows 會利用一個叫 WinNAT 的服務，為這些虛擬機器和容器動態分配一段連接埠作為動態連接埠範圍

糟糕的是，這個範圍通常很大（例如從 1024 到 50000 都有可能），而且每次重新啟動電腦都是隨機劃定的。這就導致昨天還能用的連接埠，今天可能就被系統佔用從而無法使用