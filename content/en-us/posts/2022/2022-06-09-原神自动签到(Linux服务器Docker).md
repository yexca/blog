---
slug: 47
title: Genshin Impact Auto Check-in (Docker on Linux Server)
date: '2022-06-09T13:33:42+08:00'
author: yexca
# layout: post
# permalink: /archives/47
views:
    - '700'
categories:
    - Tech Tinkering
tags:
    - Docker
    - miHoYo
---

{{< notice >}} This article was translated by Gemini-3-flash {{< /notice >}}

## Introduction

Since Tencent Cloud Functions started charging in June, I've moved my setup to my own server.

Why write this now? Well, my miHoYo BBS cookies expired and needed replacing, so I'm documenting the process for future reference.

## Tools & Original Tutorial

[Genshin Impact Helper - Yindan's Blog](https://www.yindan.me/tutorial/genshin-impact-helper.html)

The original post covers many methods, which can be a bit cluttered. This post focuses on the specific method I use.

## Tencent Cloud Function Cleanup

Make sure to freeze your Tencent Cloud Functions to avoid any unexpected charges.

If you don't need the service anymore, you can cancel your account, but be aware that account deletion requires a photo of you holding your ID.

## Prerequisites

Your server must be able to reach miHoYo's servers: <https://mihoyo.com>

Run `ping mihoyo.com` in your SSH terminal to verify connectivity.

~~One of my servers couldn't connect, so I had to switch to another one.~~

## Docker Installation

Use the official one-click script. It's verified to work on Debian 10 and CentOS 7 (use the root account).

Installation command:

```bash
curl -fsSL https://get.docker.com | bash -s docker --mirror Aliyun
```

For users in Mainland China, you can use the DaoCloud mirror:

```bash
curl -sSL https://get.daocloud.io/docker | sh
```

## Script Installation

Pull the image with the following command:

```bash
docker pull yindan/genshinhelper
```

### CentOS Error

I encountered a `Can't Connect to Docker Daemon` error on CentOS. 

Ensure you are root, then run:

```bash
systemctl start docker
```

## Basic Usage

### Getting the Cookie

To get your miHoYo Cookie, refer to: [Genshin Resin Tracker/Push – yexca'Blog](https://blog.yexca.net/en/archives/12)

**Note**: The Cookie must include the `account_id` and `cookie_token` fields.

For multiple accounts, separate Cookies with a `#`, for example: `Cookie1#Cookie2#Cookie3`.

### Simple Configuration

```bash
docker run -d --name=genshinhelper \
-e COOKIE_MIHOYOBBS="<COOKIE_MIHOYOBBS>" \
--restart always \
yindan/genshinhelper:latest
```

Just replace `<COOKIE_MIHOYOBBS>` with your actual Cookie.

### Reconfiguring/Updating Cookies

To reconfigure, you usually need to remove and redeploy the container. 

Alternatively, if using a configuration file, you just need to swap the Cookie (though Cookies tend to last a long time).

### Common Commands

```bash
# View all Docker containers
docker ps -a

# View logs
docker logs -f genshinhelper --tail 100

# Restart
docker restart genshinhelper

# Update
docker pull yindan/genshinhelper
docker rm -f genshinhelper
# Then redeploy using the basic or advanced method

# Uninstall
docker rm -f genshinhelper
docker image rm yindan/genshinhelper
```

## Advanced Usage

You can download the example file and modify it.

> * Github: [config.json](https://gitlab.com/y1ndan/genshin-checkin-helper/-/raw/main/genshincheckinhelper/config/config.example.json)
> * Telegram: <https://t.me/genshinhelperupdates/5>

### Installation

Assuming your config file is at `/etc/genshin/config.json`, use this command to map the volume:

```bash
docker run -d --name=genshinhelper \
-v /etc/genshin:/app/genshincheckinhelper/config \
--restart always \
yindan/genshinhelper:latest
```

### Configuration

You can strip the config file down to only the parameters you need. If you only need the `Cookie`, it can look like this:

```json
{
  "COOKIE_MIHOYOBBS": "<COOKIE_MIHOYOBBS>"
}
```

### Config Parameters

*   `RANDOM_SLEEP_SECS_RANGE`: Random sleep range in seconds before check-in. Set to "0-0" to disable.
*   `CHECK_IN_TIME`: Daily check-in time. This depends on the environment time, not the timezone. For Docker, set the timezone using `TZ=Asia/Shanghai`.
*   `CHECK_RESIN_SECS`: Interval for checking Genshin Original Resin (in seconds).
*   `COOKIE_RESIN_TIMER`: Cookies for accounts that need resin tracking.
*   `SHOPTOKEN`: WeChat points mall token (obtained via packet capture).
*   `ONEPUSH`: Notification configuration. `notifier` is the service name, `params` are the required arguments.

### OnePush Parameters Overview

*   **bark** / `notifier: bark`
    `params`: `{'required': ['key'], 'optional': ['title', 'content', 'sound', 'isarchive', 'icon', 'group', 'url', 'copy', 'autocopy']}`

*   **custom** / `notifier: custom`
    `params`: `{'required': ['url'], 'optional': ['method', 'datatype', 'data']}`

*   **dingtalk** / `notifier: dingtalk`
    `params`: `{'required': ['token'], 'optional': ['title', 'content', 'secret', 'markdown']}`

*   **discord** / `notifier: discord`
    `params`: `{'required': ['webhook'], 'optional': ['title', 'content', 'username', 'avatar_url', 'color']}`

*   **pushplus** / `notifier: pushplus`
    `params`: `{'required': ['token', 'content'], 'optional': ['title', 'topic', 'markdown']}`

*   **qmsg** / `notifier: qmsg`
    `params`: `{'required': ['key'], 'optional': ['title', 'content', 'mode', 'qq']}`

*   **serverchan** / `notifier: serverchan`
    `params`: `{'required': ['sckey', 'title'], 'optional': ['content']}`

*   **serverchanturbo** / `notifier: serverchanturbo`
    `params`: `{'required': ['sctkey', 'title'], 'optional': ['content', 'channel', 'openid']}`

*   **telegram** / `notifier: telegram`
    `params`: `{'required': ['token', 'userid'], 'optional': ['title', 'content', 'api_url']}`

*   **wechatworkapp** / `notifier: wechatworkapp`
    `params`: `{'required': ['corpid', 'corpsecret', 'agentid'], 'optional': ['title', 'content', 'touser', 'markdown']}`

*   **wechatworkbot** / `notifier: wechatworkbot`
    `params`: `{'required': ['key'], 'optional': ['title', 'content', 'markdown']}`

### Push Examples

```conf
# Telegram
ONEPUSH={"notifier":"telegram","params":{"markdown":false,"token":"xxxx","userid":"xxx"}}

# Discord
ONEPUSH={"notifier":"discord","params":{"markdown":true,"webhook":"https://discord.com/api/webhooks/xxxxxx"}}
```

Docker config mapping directory: `/etc/genshin:/app/genshincheckinhelper/config`
