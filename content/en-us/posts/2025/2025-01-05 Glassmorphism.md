---
slug: 212
title: 'Glassmorphism'
# draft: true
author: yexca
date: '2025-01-05T16:19:36+09:00'
categories:
    - Development Practice
tags:
    - Front-end
---

> This article was partially machine translated

## Introduction

Today, I want to summarize the things I recently designed, such as semi-transparent elements, frosted glass effects and rounded corners. But then It occurred to me that I created a webpage on December 1, 2023, so I decided to rebuild it by the way.

## webpage background

A modern ~~(anime style)~~ website needs a background image.

```css
body{
    background-image: url('../img/77194247_p0.jpg');
    background-size: cover;
    background-attachment: fixed; /* fixed image */
    background-repeat: no-repeat; /* no repeat image */
    padding: 0;
    margin: 0;
}
```

## Semi-transparent and Frosted Glass effects

Then apply a mask to the background in order to achieve the semi-transparent and frosted glass effects.

```css
.layout {
    /* display: flex; */
    margin: 0;
    padding: 0;
    display: flex;
    width: 100vw;
    height: 100vh;
    backdrop-filter: blur(2px); /* background blur effect */
    -webkit-backdrop-filter: blur(2px); /* Safari support */
    background: rgba(0, 0, 0, 0.4); /* semi-transparent black background */
}
```

## Webpage Rebuild

By the way, writing articles is troublesome. When I am programming, it distracts me, and I am too tried to write them after I finish programming, so I am just writing articles casually now.

Repository: <https://github.com/yexca/MusicPlayer-Twinkle>

I updated the previous article (Simplified Chinese) <https://blog.yexca.net/en/archives/116/> and created an example using that method: <https://twinkle.yexca.net>

## Card Effect

This is modern design too.

```css
.card {
  width: 300px;
  padding: 20px;
  background-color: rgba(255, 255, 255, 0.5); /* semi-transparent white background */
  border-radius: 15px; /* rounded corners */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* shadow effect */
  backdrop-filter: blur(10px); /* background blur effect */
  border: 1px solid rgba(255, 255, 255, 0.3); /* border */
  color: pink; /* color of text */
}
```

Well, I might complete this project if I have free time... (Digging a new hole, again)

## Twinkle

The content of the project is Twinkle's music, if you'd like to learn more, check it out here:

* <https://twinkle130527.wixsite.com/twinkle>
* <https://www.dojin-music.info/circle/1255>

SoundCloud

* <https://soundcloud.com/twintwinkles>
