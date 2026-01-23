---
slug: 10
title: WordPress 新增返回上一頁按鈕
date: '2021-11-10T11:06:27+08:00'
author: yexca
# layout: post
# permalink: /archives/10
views:
    - '288'
categories:
    - 開發實作
tags:
    - WordPress
---

> 該文章使用 Google 翻譯處理。

多數情況下，我們瀏覽網頁一般使用瀏覽器或系統自帶的返回，但有些系統的交互邏輯及其不好用，這時在網頁添加一個返回上一頁按鈕可以極大改善瀏覽體驗

首先，在 WordPress 的後台點擊“外觀-自定義”來到可視化編輯頁面

在左方找到“額外CSS”選項（一般在最後）

然後在裡面輸入下方代碼

```css
.float-button {
position: fixed;
height: 90px;
width: 40px;
bottom: 90px;
right: 50px;
/* 可以自行修改相關描述 */
}
```

輸入完成後儲存，然後編輯主題相關介面

如果您不能訪問服務器文件，可以在 WordPress 後台的“外觀-主題編輯器”中找到要添加的界面修改

如果您可以存取伺服器文件，可以開啟路徑 `網站根目錄/wp-content/themes/<您的主題名稱>/` 然後開啟相應頁面修改

只需在相關頁面文件插入下面代碼並保存即可

```html
<div class="float-button">
<input type="button" name="Submit" value="返回" onclick="javascript:history.back(-1);">
</div>
<!-- 可以自行修改相關描述 -->
```

## 參考文章

[網頁上的「返回上一頁」的幾種實作程式碼](https://www.cnblogs.com/Julia-Yuan/p/7978888.html)

[div 套路之懸浮的 button](https://blog.csdn.net/qq_34266804/article/details/88316086)
