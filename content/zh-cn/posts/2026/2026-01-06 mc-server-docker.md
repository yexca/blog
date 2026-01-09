---
slug: 265
title: '使用 docker 搭建 minecraft 服务器'
# draft: true
author: yexca
date: '2026-01-06T20:38:41+09:00'
categories:
    - 折腾经验
tags:
    - minecraft
    - docker
---

## 使用镜像

image: <https://hub.docker.com/r/itzg/minecraft-server>

github: <https://github.com/itzg/docker-minecraft-server>

document: <https://docker-minecraft-server.readthedocs.io/en/latest/>

## 配置文件

原版

```yaml
services:
  mc:
    image: itzg/minecraft-server:java17
    container_name: mc
    ports:
      - "25565:25565"
    environment:
      EULA: "TRUE"
      TYPE: "VANILLA"
      VERSION: "1.20.1"
      MEMORY: "2G"
    volumes:
      - ./data:/data
    restart: unless-stopped

```

开启 forge 版本的配置

```yaml
services:
  mc:
    image: itzg/minecraft-server:stable-java17
    tty: true
    stdin_open: true
    ports:
      - "25565:25565"
    environment:
      EULA: "TRUE"
      VERSION: "1.20.1"
      TYPE: "FORGE"
      FORGE_VERSION: "47.4.10"
      MEMORY: "3G"
    volumes:
      - ./data:/data
```

版本可在网站查询 <https://files.minecraftforge.net/net/minecraftforge/forge/>

下载整合包

```yaml
services:
  mc:
    image: itzg/minecraft-server:java17
    container_name: mc
    ports:
      - "25565:25565"
    environment:
      EULA: "TRUE"
      TYPE: "CURSEFORGE"
      CF_API_KEY: "你的key"
      CF_MODPACK_SLUG: "modpack-slug"
      CF_MODPACK_VERSION: "47.4.10"
      MEMORY: "4G"
    volumes:
      - ./data:/data
```

## 服务器端口

获取当前 zone

```bash
firewall-cmd --get-active-zones
```

开放端口

```bash
sudo firewall-cmd --zone=public --permanent --add-port=25565/tcp
```

重载

```bash
sudo firewall-cmd --reload
```

查询确认

```bash
sudo firewall-cmd --zone=public --list-all
```

## 自定义域名

不可使用 cloudflare 代理，不可使用 nginx 反向代理

但是可以使用 SRV 记录让服务直接输入域名，不用输入端口

名称填入 `_minecraft._tcp.your-mc-server.yexca.net`，优先级为 `0`，权重常用 `5` 或 `10`，端口写服务器端口，比如 `25565`，目标写对应域名 `your-mc-server.yexca.net`

## 服务器配置

在启动完成后，`./data` 有配置文件，具体为 <https://wiki.biligame.com/mc/%E6%9C%8D%E5%8A%A1%E7%AB%AF%E9%85%8D%E7%BD%AE%E6%96%87%E4%BB%B6%E6%A0%BC%E5%BC%8F>
