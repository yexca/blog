---
slug: 10
title: Adding a "Back to Previous Page" Button in WordPress
date: '2021-11-10T11:06:27+08:00'
author: yexca
# layout: post
# permalink: /archives/10
views:
    - '288'
categories:
    - Development Practice
tags:
    - WordPress
---

{{< notice >}} This article was translated by gemini-3-flash-preview {{< /notice >}}

Most of the time, we use the browser's built-in back button. However, some system interactions are clunky, and adding a dedicated "Back" button on the page can significantly improve the user experience.

First, go to the WordPress dashboard and navigate to **Appearance -> Customize**.

Find the **Additional CSS** option on the left side (usually at the bottom).

Enter the following code:

```css
.float-button {
position: fixed;
height: 90px;
width: 40px;
bottom: 90px;
right: 50px;
/* You can adjust these values yourself */
}
```

After saving, you need to edit the theme files.

If you don't have server access, you can use the **Theme Editor** under **Appearance** in the WordPress dashboard to find and modify the relevant template.

If you have server access, navigate to `/wp-content/themes/<your-theme-name>/` and open the appropriate file for editing.

Simply insert the following code into the page file and save:

```html
<div class="float-button">
<input type="button" name="Submit" value="Back" onclick="javascript:history.back(-1);">
</div>
<!-- Customize as needed -->
```

## References

[Several implementation codes for "Back to Previous Page" on a web page](https://www.cnblogs.com/Julia-Yuan/p/7978888.html)

[div tricks: floating buttons](https://blog.csdn.net/qq_34266804/article/details/88316086)
