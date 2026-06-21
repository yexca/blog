---
slug: 287
title: '遠端控制 Windows 電腦'
# draft: true
author: yexca
date: '2026-06-22T01:26:59+09:00'
categories:
    - 折騰經驗
tags:
    - RDP
    - Windows
    - VS Code
---

{{< notice >}} 本文由 gemini-3.5-flash 翻譯 {{< /notice >}}

近期因為自己的電腦在進行訓練（模型訓練）時，我完全無法進行其他工作。如果使用自己的 Mac 或 Linux 裝置的話，也多少會有點不太順手，畢竟這些裝置有自己的用途。於是想著把實驗室的電腦利用起來，讓我在準備好後，可以使用它來進行訓練，然後繼續做自己的事情。

稍微研究了一下，決定使用三種方式以較為保險地連接。首先是微軟官方的 RDP，然後是 VS Code 的遠端開發，最後是 Chrome 的遠端桌面作為備用。

## Tailscale

使用 RDP 或者 VS Code 的終端機都需要建置在同一個區域網路，或是被控端電腦有實體 IP（公網）環境。如果透過內網穿透到我的伺服器，會有環境污染的風險，所以這裡還是選擇使用虛擬區域網路。

這裡便使用 Tailscale 來建立虛擬區域網路。在 Windows 上，造訪[官網](https://tailscale.com)下載安裝即可；在 Mac 上可以使用 Homebrew 進行安裝 `brew install --cask tailscale`。

安裝完成後登入同一個帳號即可。在被控端電腦上開啟 `Run unattended` 可以確保電腦重新啟動、未登入桌面時，網路也能連通。

## RDP

首先這個功能 Windows 家用版（Home）無法使用，具體需要在 `設定 - 系統 - 遠端桌面`（Settings - System - Remote Desktop）中開啟。

然後在 Mac 的 App Store 安裝 Windows App 後，輸入被控端電腦的 IP 和使用者名稱即可連線。

## VS Code - SSH

這個需要在被控端 Windows 上開啟 OpenSSH 功能，具體在 `設定 - 系統 - 選用功能`（Settings - System - Optional features），新增選用功能並搜尋、選擇 `OpenSSH 伺服器`（OpenSSH Server）。

家用版可能不會顯示，可以開啟系統管理員權限的 PowerShell 執行指令進行安裝：

```powershell
Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0
```

安裝完成後檢視安裝狀態：

```powershell
Get-WindowsCapability -Online | Where-Object Name -like 'OpenSSH*'
```

若 `State` 顯示為 `Installed` 則表示安裝成功，接著啟動並設定為開機自動啟動：

```powershell
Start-Service sshd
Set-Service -Name sshd -StartupType 'Automatic'
```

若 `State` 是 `Staged` 則表示未安裝成功，可以先重新啟動 Windows 後檢視安裝狀態。如果依然是該狀態，則需要重新安裝：先解除安裝，然後重新執行上述的安裝步驟。

```powershell
Remove-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0
```

我實際在安裝時遇到以下報錯：

```markdown
Add-WindowsCapability: The Component store has been corrupted.
```

該錯誤表示 Windows 元件儲存區損壞了，先檢查系統映像：

```powershell
DISM /Online /Cleanup-Image /CheckHealth
```

輸出顯示 Repairable（可修復），所以進行自動修復即可：

```powershell
DISM /Online /Cleanup-Image /RestoreHealth
```

自動修復完成後，重新啟動電腦並重新安裝即可。

---

啟動 SSH 服務成功後，在主控端開啟 VS Code 安裝 `Remote Development` 延伸模組。

安裝完成後，按下 `Ctrl/Cmd + Shift + P` 輸入並選擇 `Remote-SSH: Connect to Host...` 設定新的主機，輸入連線指令 `ssh username@100.x.x.x`（其中請替換為被控端主機的使用者名稱和 Tailscale 的 IP 位址），等待元件安裝完成即可。

## VS Code - Tunnel

如果 SSH 一直設定失敗的話，可以透過 VS Code Remote Tunnels 免去 SSH 設定來進行連線。如果是家用版使用者，甚至可以不用安裝 Tailscale 來建立虛擬區域網路。

使用時需要登入相同的 GitHub 帳號。首先在被控端電腦的 VS Code 登入 GitHub 帳號，然後點擊頭像或搜尋並選擇 `Turn on Remote Tunnel Access`，選擇 `Install as a service` 後，根據提示等待安裝完成。

接著可以在日誌的最後查看造訪的網址，連至該網址並登入 GitHub 即可使用。

或者在主控端安裝 `Remote - Tunnels` 延伸模組後，叫出命令面板輸入 `Remote-Tunnels: Connect to Tunnel`，接著登入同一個 GitHub 帳號即可。

## Chrome

這個非常方便，使用 Chrome 開啟網站 <https://remotedesktop.google.com/access> 並登入 Google 帳號後，在被控端電腦新增服務即可，期間會自動引導安裝擴充功能和程式。

安裝完成後，在其他電腦使用 Chrome 登入相同的 Google 帳號並開啟該網址即可。