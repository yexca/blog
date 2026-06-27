---
slug: 58
title: 'GitHub Connection Refused'
date: '2022-08-15T02:44:47+08:00'
author: yexca
# layout: post
# permalink: /archives/58
views:
    - '385'
categories:
    - Tinkering Notes
tags:
    - GitHub
---

{{< notice >}} This article was translated by Gemini-3-flash {{< /notice >}}

## Intro

Today I tried pushing via Git and got: `fatal: unable to access 'https://github.com/yexca-VRChat/yexca-VRChat.github.io.git/': Failed to connect to 127.0.0.1 port 1081 after 2074 ms: Connection refused`. Even a reboot didn't help, so it was time to find a fix ~~(why won't it let me access my own repo?)~~.

## Troubleshooting

Research suggested it was proxy-related, but my proxy is configured on the router.

I connected to a different standard router and tried pushing again, but the issue persisted.

Next, I tried unsetting the Git proxy configuration, which also did nothing:

```bash
git config --global --unset http.proxy
git config --global --unset https.proxy
```

Finally, I remembered I might have messed with WinXray. I checked, and sure enough, PAC mode was active. After turning it off, the push worked perfectly.

## References

[fatal: unable to access 'https://github.com/fmoraless/e-commerce.git/': Failed to connect to 127.0.0.1 port 56832: Connection refuse · Issue #11981 · desktop/desktop](https://github.com/desktop/desktop/issues/11981)

[Fixing Git download error: Failed to connect to 127.0.0.1 port 1080: Connection refused - CSDN Blog](https://blog.csdn.net/weixin_41010198/article/details/87929622)

[Git Error: Solving Connection Refused Issues - CSDN Blog](https://blog.csdn.net/Huang_milk/article/details/121291273?utm_medium=distribute.pc_relevant.none-task-blog-2~default~baidujs_baidulandingword~default-0-121291273-blog-87929622.pc_relevant_multi_platform_whitelistv4&spm=1001.2101.3001.4242.1&utm_relevant_index=3)
