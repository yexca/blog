---
slug: 153
# layout: post
title: 'CentOS 7 安裝 Xfce'
author: yexca
date: 2024-02-17T22:51:34+08:00
# permalink: /archives/153
categories:
    - 折騰經驗
tahs:
    - Linux
    - CentOS
---

{{< notice >}} 本文由 gemini-3-flash-preview 翻譯 {{< /notice >}}

~~這什麼時候寫的文章啊（~~

## 檢查是否有 Xfce 群組

```bash
yum grouplist
```

如果沒有，需要安裝額外套件的 yum 來源

```bash
yum install epel-release -y
```

## 安裝 X Window system

```bash
yum groupinstall "X Window system"
```

## 安裝 Xfce

```bash
yum groupinstall xfce
```

## 安裝中文字型 (楷體)

```bash
yum install cjkuni-ukai-fonts
```

## 進入 Xfce 桌面

```bash
systemctl isolate graphical.target
```

## 參考文章

[CentOS 7安装Xfce桌面环境过程_qq_28641401的博客-CSDN博客](https://blog.csdn.net/qq_28641401/article/details/99428192)
