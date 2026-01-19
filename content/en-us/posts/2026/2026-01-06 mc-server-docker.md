---
slug: 265
title: 'Setting Up a Minecraft Server with Docker'
# draft: true
author: yexca
date: '2026-01-06T20:38:41+09:00'
categories:
    - Tech Log
tags:
    - minecraft
    - docker
---

{{< notice >}} This article was translated by gemini-3-flash-preview {{< /notice >}}

## Using the Image

Image: <https://hub.docker.com/r/itzg/minecraft-server>

GitHub: <https://github.com/itzg/docker-minecraft-server>

Documentation: <https://docker-minecraft-server.readthedocs.io/en/latest/>

## Configuration

### Vanilla

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

### Forge

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

Check versions here: <https://files.minecraftforge.net/net/minecraftforge/forge/>

### Modpacks

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
      CF_API_KEY: "your-api-key"
      CF_MODPACK_SLUG: "modpack-slug"
      CF_MODPACK_VERSION: "47.4.10"
      MEMORY: "4G"
    volumes:
      - ./data:/data
```

## Server Ports

Get the current zone:

```bash
firewall-cmd --get-active-zones
```

Open the port:

```bash
sudo firewall-cmd --zone=public --permanent --add-port=25565/tcp
```

Reload firewall:

```bash
sudo firewall-cmd --reload
```

Verify:

```bash
sudo firewall-cmd --zone=public --list-all
```

## Custom Domain

Cloudflare proxying and Nginx reverse proxying are not supported for standard Minecraft traffic.

However, you can use an SRV record to allow connecting via a domain without specifying a port.

Fill in the record as follows:

- Name: `_minecraft._tcp.your-mc-server.yexca.net`
- Priority: `0`
- Weight: `5` or `10`
- Port: `25565` (or your server port)
- Target: `your-mc-server.yexca.net`

## Server Settings

After the first startup, configuration files will be generated in `./data`. For specific settings, refer to the documentation: <https://minecraft.wiki/w/Server.properties>
