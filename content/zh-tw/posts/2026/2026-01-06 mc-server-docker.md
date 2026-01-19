---
slug: 265
title: '使用 Docker 架設 Minecraft 伺服器'
# draft: true
author: yexca
date: '2026-01-06T20:38:41+09:00'
categories:
    - 折騰經驗
tags:
    - minecraft
    - docker
---

{{< notice >}} 本文由 gemini-3-flash-preview 翻譯 {{< /notice >}}

## 使用映像檔

映像檔 (Image): <https://hub.docker.com/r/itzg/minecraft-server>

GitHub: <https://github.com/itzg/docker-minecraft-server>

文件 (Document): <https://docker-minecraft-server.readthedocs.io/en/latest/>

## 設定檔

原版 (Vanilla)

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

開啟 Forge 版本的設定

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

版本可在網站查詢 <https://files.minecraftforge.net/net/minecraftforge/forge/>

下載整合包 (Modpack)

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
      CF_API_KEY: "你的金鑰"
      CF_MODPACK_SLUG: "modpack-slug"
      CF_MODPACK_VERSION: "47.4.10"
      MEMORY: "4G"
    volumes:
      - ./data:/data
```

## 伺服器連接埠

取得目前區域 (Zone)

```bash
firewall-cmd --get-active-zones
```

開放連接埠

```bash
sudo firewall-cmd --zone=public --permanent --add-port=25565/tcp
```

重新載入

```bash
sudo firewall-cmd --reload
```

查詢確認

```bash
sudo firewall-cmd --zone=public --list-all
```

## 自定義網域名稱

不可使用 Cloudflare 代理，不可使用 Nginx 反向代理。

但可以使用 SRV 紀錄讓服務直接輸入網域即可連線，不需輸入連接埠。

名稱填入 `_minecraft._tcp.your-mc-server.yexca.net`，優先級為 `0`，權重常用 `5` 或 `10`，連接埠填寫伺服器連接埠（例如 `25565`），目標填寫對應的網域 `your-mc-server.yexca.net`。

## 伺服器配置

在啟動完成後，`./data` 目錄下會有設定檔，具體設定可參考：<https://wiki.biligame.com/mc/%E6%9C%8D%E5%8A%A1%E7%AB%AF%E9%85%8D%E7%BD%AE%E6%96%87%E4%BB%B6%E6%A0%BC%E5%BC%8F>
