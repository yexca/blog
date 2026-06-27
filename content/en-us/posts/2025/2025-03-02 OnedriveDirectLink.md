---
slug: 237
title: 'Get OneDrive Direct Download Links'
# draft: true
author: yexca
date: '2025-03-02T12:58:57+09:00'
categories:
    - Tinkering Notes
tags:
    - OneDrive
---

{{< notice >}} This article was translated by gemini-3-flash-preview {{< /notice >}}

## Introduction

Recently, I found that IDM couldn't automatically capture files shared via OneDrive. Browser downloads were unstable and kept failing, so I decided to find a way to get direct download links.

## Extension Issue

I initially thought the IDM extension was no longer supported and needed a reinstall. But after deleting it, the Chrome Web Store showed it couldn't be installed. Well, I deleted it too early.

It's surprising that IDM, as paid software, hasn't kept up with updates.

Based on a [Simpread discussion](https://github.com/Kenshin/simpread/discussions/6633), it turns out the install button just has a `disabled` attribute. You can install it normally by simply removing that attribute.

## Getting the Direct Link

Even so, IDM still couldn't capture the download, so I had to find the direct link manually.

Go to the share page, preview a file, and click `Share` - `Copy link` in the top right to get the sharing link. It looks something like this:

```markdown
https://xxx-my.sharepoint.com/:u:/r/personal/xxx/Documents/xxx/xxx.rar?csf=1&web=1&e=OTZZbx
```

Change the `web` parameter to `download`:

```markdown
https://xxx-my.sharepoint.com/:u:/r/personal/xxx/Documents/xxx/xxx.rar?csf=1&download=1&e=OTZZbx
```

Copy this into IDM's `Add URL` to start the download.

---

Reference: <https://techcommunity.microsoft.com/discussions/onedriveforbusiness/onedrive-direct-download-link/4226744>

---

![yexca-237](https://count.getloli.com/@yexca-237)
