---
slug: 49
title: OpenWRT Wireless Relaying
date: '2022-06-23T14:50:21+08:00'
author: yexca
# layout: post
# permalink: /archives/49
views:
    - '256'
categories:
    - Tech Setup
tags:
    - OpenWRT
---

{{< notice >}} This article was translated by Gemini-3-flash {{< /notice >}}

## Introduction

I tried setting up a wireless relay again today and realized I'd forgotten how to do it. It's definitely better to write these things down for future reference.

In this article, the Wi-Fi that the OpenWRT router connects to is referred to as the "upstream router," and the OpenWRT device itself is the "router."

## Prerequisites

Ensure the LAN IP address of your router (the one used to access the web UI) is different from the upstream router's address. If they conflict, you won't be able to access the internet.

### Changing the Router's LAN Address

Go to `Network` -> `Interfaces`, click `Edit` for the `LAN` interface, and change its `IPv4 address`.

For example, if the upstream router is at `192.168.1.1`, you can change your router to `192.168.5.1`.

After clicking `Save & Apply`, use the new address in your browser to access the router's backend.

## Connecting the Router to Wi-Fi

Go to `Network` -> `Wireless`, click `Scan`, find the Wi-Fi you want to connect to, and click `Join Network`. Enter the network name and password, click `Submit`, and then click `Save & Apply`.

## Setting up the Router's Wi-Fi Hotspot

If your router is dual-band (2.4G and 5G), it's best to create your hotspot on a different band than the one used for the relay for maximum compatibility. (If the other band already has a Wi-Fi network active, it might already be ready to use.)

If you only have a single band, you must create a new network on that same band. Note that this may not always work, as some hardware doesn't support simultaneous receiving and transmitting on a single radio.

Setting up the Wi-Fi follows the standard process: go to `Network` -> `Wireless`, add a network, enter the SSID (Wi-Fi name) and password, then `Save & Apply`.

## References

[OpenWrt Advanced Tutorial: Wireless Relay Configuration Guide - iyzm.net](https://iyzm.net/openwrt/512.html)