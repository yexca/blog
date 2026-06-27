---
slug: 153
# layout: post
title: 'CentOS 7 に Xfce をインストールする'
author: yexca
date: 2024-02-17T22:51:34+08:00
# permalink: /archives/153
categories:
    - やってみた
tahs:
    - Linux
    - CentOS
---

{{< notice >}} この記事は gemini-3-flash-preview によって翻訳されました {{< /notice >}}

~~これ、いつ書いた記事だっけ（~~

## Xfce グループがあるか確認する

```bash
yum grouplist
```

もしなかったら、追加の yum リポジトリをインストールする必要があるよ。

```bash
yum install epel-release -y
```

## X Window system のインストール

```bash
yum groupinstall "X Window system"
```

## Xfce のインストール

```bash
yum groupinstall xfce
```

## 中国語フォント (楷書体) のインストール

```bash
yum install cjkuni-ukai-fonts
```

## Xfce デスクトップを起動する

```bash
systemctl isolate graphical.target
```

## 参考記事

[CentOS 7安装Xfce桌面环境过程_qq_28641401的博客-CSDN博客](https://blog.csdn.net/qq_28641401/article/details/99428192)
