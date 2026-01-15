---
slug: 72
title: 'Disable WordPress Plugin via Database'
date: '2022-09-15T22:17:02+08:00'
author: yexca
# layout: post
# permalink: /archives/72
views:
    - '207'
categories:
    - 'Tweaking'
tags:
    - WordPress
---

{{< notice >}} This article was translated by gemini-2.5-flash-lite {{< /notice >}}

## Intro

Activated a plugin, now the backend is throwing a 502.

## Accessing the Database

1. Navigate to the `wp_options` table.
2. Find the `active_plugins` entry. It's usually on page two.
3. Edit the `option_value` row for this entry.

## Removing Unwanted Plugins

***Heads up: Back up before you delete anything!***

1. Locate the name of the plugin you don't need.
    Delete from the starting `i` up to the semicolon `;`. For example, `i:1;s:23:"elementor/elementor.php";`
2. Update the sequence number, which is the digit after `i,`.
3. Update the total count, which is the digit after `a:` at the very beginning.

## Reference

[Disable one WordPress plugin from the database - WordPress - GoDaddy Help SG](https://sg.godaddy.com/zh/help/disable-one-wordpress-plugin-from-the-database-41199)
