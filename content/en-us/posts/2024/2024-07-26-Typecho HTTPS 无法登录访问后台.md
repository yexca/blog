---
slug: 175
# layout: post
title: 'Cannot Login to Typecho Admin via HTTPS'
author: yexca
date: 2024-07-26T22:22:22+08:00
# permalink: /archives/175
categories:
    - Tinkering Notes
tags:
    - Typecho
    - Troubleshooting
---  

{{< notice >}} This article was translated by gemini-3-flash-preview {{< /notice >}}

## Introduction

After migrating Typecho to a Docker container, enabling HTTPS caused errors when trying to log into the admin panel. It worked fine over HTTP. Since my previous non-Docker deployment didn't have this issue, I initially suspected a Docker networking problem. At the time, I only needed to make a one-off update, so I just disabled HTTPS, finished the changes, and left it. Now that I'm using Typecho again and need to post regularly, it's time to fix it properly.

## Solution

The fix is straightforward. Add the following line to the end of your `data/config.inc.php` file:

```php
define('__TYPECHO_SECURE__', true);
```

Then, restart the service.

## Root Cause Analysis

According to the reference materials, the issue stems from the interaction between the user, the browser, and the server. While the browser communicates with a proxy (like Cloudflare) via HTTPS, PHP receives an HTTP request from the proxy. PHP then responds using HTTP, which causes the login failure.

## References

[Typecho HTTPS 无法登陆后台](https://blog.lucien.ink/archives/523/)
