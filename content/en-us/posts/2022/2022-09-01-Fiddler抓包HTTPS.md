---
slug: 61
title: Fiddler Capturing HTTPS
date: '2022-09-01T08:17:32+08:00'
author: yexca
# layout: post
# permalink: /archives/61
views:
    - '181'
categories:
    - Tech Learning
tags:
    - Fiddler
---

{{< notice >}} This article was translated by gemini-2.5-flash-lite {{< /notice >}}

## Introduction

By default, Fiddler only captures HTTP traffic. You need to configure it to capture HTTPS. Most websites now use HTTPS or HSTS, so enabling HTTPS capture is essential.

## Fiddler Settings

In `Settings -> HTTPS`, check `Capture HTTPS traffic`. You can also check `Ignore server certificate errors(unsafe)`, but this might not be secure. Then, save the settings.

## Browser Settings

After enabling HTTPS capture, your browser might show certificate errors, like "Connection is not secure" or "Your connection is not private." You need to import the relevant certificate. Here's how for Firefox:

First, download the Fiddler certificate. In the settings section mentioned above, click `Export root certificate to Desktop`. This will export the certificate to your desktop (`~/Desktop/`).

Then, go to Firefox settings. Under `Privacy & Security -> Certificates`, view certificates and import the one you just downloaded. In the pop-up window, select all trust options.

After importing, you should be able to access websites normally, and Fiddler will correctly capture HTTPS requests and responses.
