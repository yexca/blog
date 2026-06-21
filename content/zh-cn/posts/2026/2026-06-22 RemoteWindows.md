---
slug: 287
title: '远程控制 Windows 电脑'
# draft: true
author: yexca
date: '2026-06-22T01:26:59+09:00'
categories:
    - 折腾经验
tags:
    - RDP
    - Windows
    - VS Code
---

近期因为自己的电脑在训练的时候，我完全无法进行其他工作，如果使用自己的 Mac 或 Linux 设备的话也多少会有点不太顺手，毕竟这些设备有自己的用途，于是想着把研究室的电脑利用起来，让我在准备好后，可以使用其进行训练，然后可以继续做自己的事情

稍微调查了一下，决定使用三种方式以较为保险地连接，首先是微软官方的 RDP，然后是 VS Code 的远程开发，最后是 Chrome 的远程桌面作为保险

## Tailscale

使用 RDP 或者 VSCode 的终端都需要搭建同一个局域网或被控电脑有公网环境，如果内网穿透到我的服务器的话会有环境污染的风险，所以这里还是选择使用虚拟局域网

这里便使用 Tailscale 进行组建虚拟局域网，在 Windows 上，访问[官网](https://tailscale.com)下载安装即可，在 Mac 上可以使用 brew 进行安装 `brew install --cask tailscale`

安装完成后登陆同一个账户即可，在被控电脑上开启 `Run unattended` 可以保证电脑重启未登陆桌面时网络也能连通

## RDP

首先这个功能 Windows Home 版本无法使用，具体需要在 `settings - system - remote desktop` 中打开

然后在 Mac 的 App Store 安装 Windows App 后，输入被控电脑的 IP 和用户名即可连接

## VS Code - SSH

这个需要在被控 Windows 上开启 Open SSH 功能，具体在 `settings - system - optional features` ，追加功能搜索并选择 `Open SSH Server`

Home 版本可能不会显示，可以打开管理员权限的 PowerShell 运行命令安装

```powershell
Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0
```

安装完成后查看安装状态

```powershell
Get-WindowsCapability -Online | Where-Object Name -like 'OpenSSH*'
```

若 `State` 是 `Installed` 则表明安装成功，继续启动并设置为开机自启

```powershell
Start-Service sshd
Set-Service -Name sshd -StartupType 'Automatic'
```

若 `state` 是 `Staged` 则未安装成功，可以先重启 Windows 后查看安装状态，还是该状态的话需要重新安装，先卸载，然后走一遍上面的安装流程

```powershell
Remove-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0
```

我实际在安装的时候报错如下

```markdown
Add-WindowsCapability: The Component store has been corrupted.
```

该错误表明 Windows 组件库损坏了，先检查系统映像

```powershell
DISM /Online /Cleanup-Image /CheckHealth
```

输出显示 Repairable，所以自动修复即可

```powershell
DISM /Online /Cleanup-Image /RestoreHealth
```

自动修复完成后，重启电脑重新安装即可

---

启动 SSH 服务成功后，在控制端打开 VS Code 安装 `Remote Development`

安装完成后，按 `Ctrl/Cmd + Shift + P` 输入并选择 `Remote-SSH: Connect to Host...` 配置新的主机，输入连接命令 `ssh username@100.x.x.x` 其中替换为被控主机的用户名和 Tailscale 的 IP 地址，等待组件安装完成即可

## VS Code - Tunnel

如果 SSH 一直配置失败的话，可以通过 VS Code Remote Tunnels 免 SSH 配置进行连接，如果是 Home 用户，甚至可以不用安装 Tailscale 组建虚拟局域网了

使用需要登陆相同的 GitHub 账户，首先在被控电脑上的 VS Code 登陆 GitHub 账户，然后点击头像或搜索选择 `Turn on Remote Tunnel Access`，选择 `Install as a service` 后根据提示等待安装完成

然后可以在日志的最后查看访问的网址，访问该网址后登陆 GitHub 可以使用

或者在控制端安装 `Remote - Tunnels` 拓展后调出命令窗口输入 `Remote-Tunnels: Connect to Tunnel` 后，登陆同一个 GitHub 账户即可

## Chrome

这个非常方便，使用 Chrome 打开网站 <https://remotedesktop.google.com/access> 登陆谷歌账户后，在被控电脑追加服务即可，期间需要安装拓展和程序会自动引导

安装完成后在其他电脑使用 Chrome 登陆相同 Google 账户打开该网址即可
