---
slug: 35
title: 'Fix "Bad credentials" Error When Uploading Images with PicX'
date: '2022-03-22T16:30:12+08:00'
author: yexca
# layout: post
# permalink: /archives/35
views:
    - '374'
categories:
    - Tinkering Notes
tags:
    - GitHub
    - PicX
    - Image Hosting
---

{{< notice >}} This article was translated by Gemini-3-flash {{< /notice >}}

## Introduction

While writing a post today, I found that PicX was no longer working and showed a `Bad credentials` error. Here is how to fix it.

## Solution

The issue is simply that your GitHub Token has expired. You should have received an email titled `[GitHub] Your personal access token has expired`.

The email contains three lines. Look for the second line starting with `If this token is still needed`, click the link provided, and regenerate the token.

Make sure to check the `Expiration` setting for the token. After regenerating it, you'll need to update the configuration in PicX.

For more details, refer to: [Building a Free Image Host with PicX – yexca’Blog](https://blog.yexca.net/en/archives/27)
