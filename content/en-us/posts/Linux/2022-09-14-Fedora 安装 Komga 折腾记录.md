---
slug: 71
title: 'Installing Komga on Fedora'
date: '2022-09-14T18:47:16+08:00'
author: yexca
# layout: post
# permalink: /archives/71
views:
    - '472'
categories:
    - Tinkering Notes
tags:
    - Docker
    - Komga
---

{{< notice >}} This article was translated by gemini-3-flash-preview {{< /notice >}}

## Introduction

Setting this up to make reading manga easier on my local network.

## IP Settings

My router runs OpenWRT.

### Router Setup

Go to *Network - IP/MAC Binding* and bind a static IP to the computer.

### Fedora Setup

Since the static IP I want is different from the auto-assigned one (wired connection), I need to change it manually.

In *Network - Settings*, under the *Identity* tab, add the *MAC Address*. Change *IPv4* to *Manual*. Set the addresses as *IP, 255.255.255.0, Router IP*. For *DNS*, add the *Router IP*. I kept the automatic toggle checked.

### Local DNS

While IP access works, a domain name is much easier to remember.

On the router, go to *Network - Hostnames*. Enter your desired domain in the *Hostname* field and the computer's IP in the *IP Address* field.

## Installing Docker

I went with Docker Desktop for the GUI.

### Set up the Repository

```bash
dnf -y install dnf-plugins-core
```

```bash
sudo dnf config-manager \
    --add-repo \
    https://download.docker.com/linux/fedora/docker-ce.repo
```

### Download the RPM Package

Download it from the [Official Website](https://docs.docker.com/desktop/install/linux-install/).

Once downloaded, double-click to install.

## Installing Komga

### Docker Configuration

* **File Sharing**

    In Docker Desktop, go to *Settings - Resources - File sharing* and add the path to your manga.

    Note: *If the shared directory is missing (not mounted) on the next boot, Docker will fail to start.*

* **Network Settings**

    Not sure if this is strictly necessary, but I set the subnet to match my own in *Settings - Resources - Network*.

### Installation via CLI

Run this directly in the shell:

```bash
docker run \
  --name=komga \
  --user 1000:1000 \
  -p 2333:8080 \
  -v /home/yexca/komga/config:/config \
  -v /home/yexca/komga/data:/data \
  --restart unless-stopped \
  gotson/komga:latest
```

* `-p`: Maps the host port (left) to the container port (right).
* `-v`: Volume mapping. Maps a host directory (`/home/yexca/komga/config`) to the container (`/config`).

Note: You cannot map hidden files (files starting with `.`) from the host.

### Installation via GUI

After the previous step, `gotson/komga` will appear in the *Images* tab of Docker Desktop. Click *run* and configure:

* **First line**: Name.
* **Ports**: Host port mapping. Set to 80 if you want to access it directly via the domain name.
* **Volumes**: Path mappings.
* **Environment variables**: Not needed for this setup.

### Verify Running Status

Check the status with:

```bash
docker ps -a
```

## Firewall Configuration

Open the port:

```bash
firewall-cmd --zone=public --add-port=80/tcp
```

Reload the configuration:

```bash
firewall-cmd --reload
```

Check if the port is open:

```bash
firewall-cmd --zone=public --query-port=80/tcp
```

You might need to add the HTTP service:

```bash
firewall-cmd --add-service=http
```

If you hate CLI, just use the GUI—it's probably faster anyway:

```bash
sudo yum install firewall-config
```

## References

[Install Docker Desktop on Fedora - Docker Documentation](https://docs.docker.com/desktop/install/fedora/)

[【Docker】Error response from daemon: invalid mount config for type "bind": bind source path does not exist - Qiita](https://qiita.com/ucan-lab/items/7c0ca7db70deb56ad4fa)

[Run with Docker - Komga](https://komga.org/installation/docker.html#version-tags)

[简约但绝不简单的Komga-老苏的blog](https://laosu.ml/2021/08/02/%E7%AE%80%E7%BA%A6%E4%BD%86%E7%BB%9D%E4%B8%8D%E7%AE%80%E5%8D%95%E7%9A%84Komga/)

[fedora 28 , firewalld 防火墙控制，firewall-cmd 管理防火墙规则 - xuyaowen - 博客园](https://www.cnblogs.com/xuyaowen/p/linxu_firewalld.html)

[Fedora防火墙配置 - 上官飞鸿 - 博客园](https://www.cnblogs.com/jackadam/p/9483381.html)

[原神自动签到(Linux服务器Docker) - yexca'Blog](http://blog.yexca.net/en/archives/47)

[Fedora 打开8080端口_chunqi zhi的博客-CSDN博客](https://blog.csdn.net/zhichunqi/article/details/80488567)
