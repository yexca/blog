---
slug: 212
title: '毛玻璃效果'
# draft: true
author: yexca
date: '2025-01-05T16:19:36+09:00'
categories:
    - 開發實作
tags: 
    - 前端技術
---

> 此頁面有使用機器翻譯喲

## 引言

今天想對最近設計的半透明、毛玻璃和圓角進行總結，突然想到 2023-12-01 好像做過一個什麼東西，就順便重整一下好了

## 頁面背景

現代的 ~~(二次元)~~ 網頁要有一個背景

```css
body{
    background-image: url('../img/77194247_p0.jpg');
    background-size: cover;
    background-attachment: fixed; /* 固定 */
    background-repeat: no-repeat; /* 不重複 */
    padding: 0;
    margin: 0;
}
```

## 半透明與毛玻璃

然後在背景上加一個蒙版，實現半透明與毛玻璃效果

```css
.layout {
    /* display: flex; */
    margin: 0;
    padding: 0;
    display: flex;
    width: 100vw;
    height: 100vh;
    backdrop-filter: blur(2px); /* 背景模糊效果 */
    -webkit-backdrop-filter: blur(2px); /* Safari 支援 */
    background: rgba(0, 0, 0, 0.4); /* 半透明黑色背景 */
}
```

## 網頁的重構

說起來寫文章還是很傷腦筋，做的時候寫會被打斷，做完再寫又會很累不想動，所以我就折衷一下，隨便寫寫就好

專案地址: <https://github.com/yexca/MusicPlayer-Twinkle>

順便更新了之前的文章 <https://blog.yexca.net/zh-tw/archives/116/> 用這個方法加了一個範例: <https://twinkle.yexca.net>

## 卡片效果

這也屬於現代的設計

```css
.card {
  width: 300px;
  padding: 20px;
  background-color: rgba(255, 255, 255, 0.5); /* 半透明白色背景 */
  border-radius: 15px; /* 圓角 */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* 陰影 */
  backdrop-filter: blur(10px); /* 背景模糊效果 */
  border: 1px solid rgba(255, 255, 255, 0.3); /* 邊框 */
  color: pink; /* 前景文字顏色 */
}
```

嗯，之後有時間再以卡片為設計來完善這個專案 ~~(又開新坑了)~~

## Twinkle

另外，專案的內容是 Twinkle 的音樂，具體介紹請參閱

* <https://twinkle130527.wixsite.com/twinkle>
* <https://www.dojin-music.info/circle/1255>

SoundCloud

* <https://soundcloud.com/twintwinkles>
