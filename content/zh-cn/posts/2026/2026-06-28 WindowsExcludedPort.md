---
slug: 288
title: 'Windows 保留端口的排除'
# draft: true
author: yexca
date: '2026-06-28T02:00:40+09:00'
categories:
    - 开发实践
tags:
    - Windows
---

在拉起一个服务的时候，时不时会出现端口被占用的情况，但可能实际去查询 `netstat -ano | findstr :[prot]` 却发现没有程序在占用，这一般是被 Windows 作为保留端口占用了

> 如果有程序在占用的话是用 `taskkill` 命令可关闭进程

一般情况下换个端口就好了，可是当想要控制自己的端口的时候，就需要让 Windows 不使用这些端口作为保留端口了

## 查看保留端口端

以管理员身份打开 cmd 或 powershell 使用命令查看

```powershell
netsh interface ipv4 show excludedportrange protocol=tcp
```

命令将会列出当前所有的保留端口

## 随机刷新

虽然每次重启都会随机刷新端口，但是在非重启的情况下可以用以下命令重新启动服务以刷新端口

```powershell
net stop winnat
net start winnat
```

然后再次查看是否占用了自己想要的端口

## 添加排除规则

不过为了稳定的使用某喜欢的端口，还是加一个规则会比较稳，首先赞同 WinNAT 服务

```powershell
net stop winnat
```

然后声明自己喜欢的端口号

```powershell
netsh int ipv4 add excludedportrange protocol=tcp startport=7650 numberofports=10
```

这个命令是排除从 7650 开始的 10 个端口，也就是 7650~7659。然后重启 WinNAT 服务即可

```powershell
net start winnat
```

## 去除排除规则

当不再使用的时候，同样先暂停，然后使用命令声明

```powershell
netsh int ipv4 delete excludedportrange protocol=tcp startport=7650 numberofports=10
```

最后再重启服务即可

## 原因

导致这个问题的根本原因，通常是 Windows 启用了 Hyper-V 或 WSL2，Windows 会利用一个叫 WinNAT 的服务，为这些虚拟机和容器动态分配一段端口作为动态端口范围

糟糕的是，这个范围通常很大（比如从 1024 到 50000 都有可能），而且每次重启电脑都是随机划定的。这就导致昨天还能用的端口，今天可能就被系统占用从而无法使用
