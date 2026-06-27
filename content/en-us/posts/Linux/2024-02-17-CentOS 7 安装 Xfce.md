---
slug: 153
# layout: post
title: 'Installing Xfce on CentOS 7'
author: yexca
date: 2024-02-17T22:51:34+08:00
# permalink: /archives/153
categories:
    - Tinkering Notes
tahs:
    - Linux
    - CentOS
---

{{< notice >}} This article was translated by gemini-3-flash-preview {{< /notice >}}

~~When did I even write this? (~~

## Check for Xfce Group

```bash
yum grouplist
```

If it's not listed, you need to install the EPEL repository.

```bash
yum install epel-release -y
```

## Install X Window System

```bash
yum groupinstall "X Window system"
```

## Install Xfce

```bash
yum groupinstall xfce
```

## Install Chinese Fonts (KaiTi)

```bash
yum install cjkuni-ukai-fonts
```

## Launch Xfce Desktop

```bash
systemctl isolate graphical.target
```

## References

[CentOS 7安装Xfce桌面环境过程_qq_28641401的博客-CSDN博客](https://blog.csdn.net/qq_28641401/article/details/99428192)
