---
slug: 107
title: 'Honkai: Star Rail Global Server Split Tunneling Rules'
date: '2023-05-16T23:13:21+08:00'
author: yexca
layout: post
permalink: /archives/107
views:
    - '32'
categories:
    - Tech Tips
tags:
    - Game
    - miHoYo
---

{{< notice >}} This article was translated by gemini-3-flash-preview {{< /notice >}}

Split tunneling rules for addressing connection issues from mainland China.

## Key

Entering the game requires a UDP connection. Many proxy protocols don't support UDP and will automatically reject it. To fix this, simply set the UDP connection IPs to direct. Here are the two IPs I captured:

```bash
8.209.196.179
# The second one doesn't seem to trigger a direct connection; setting the first one might be enough
47.245.63.117
```

For security reasons (preventing potential issues caused by inconsistent TCP and UDP routes), I recommend setting all related domains to direct:

```bash
*.starrails.com
*.hoyoverse.com
8.209.196.179/8
```

## OpenClash

Go to `Global Settings - Rule Settings`, enable `Custom Rules`, and enter the following under `rules:` in the first text box:

```yaml
#rules:
- DOMAIN-SUFFIX, starrails.com, DIRECT
- DOMAIN-SUFFIX, hoyoverse.com, DIRECT
- IP-CIDR, 8.209.196.179/8, DIRECT
```

## Quantumult X

Edit the configuration file, navigate to `[filter_local]`, and enter the following:

```conf
#SR
host-suffix, starrails.com, direct
host-suffix, hoyoverse.com, direct
ip-cidr, 8.209.196.179/8, direct
```
