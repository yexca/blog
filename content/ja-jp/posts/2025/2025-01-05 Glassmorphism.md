---
slug: 212
title: 'すりガラス効果'
# draft: true
author: yexca
date: '2025-01-05T16:19:36+09:00'
categories:
    - 開発実践
tags:
    - フロントエンド
---

> この記事の一部は機械翻訳を使ったよ

## まえがき

今日は最近設計した半透明、すりガラスと丸みを帯びた角についてまとめようと思っていたけど、突然2023年12月01日何かを作ったことを思い出したので、それも一緒に再編成しようと思う

## ウェブサイトの背景

現代の ~~(アニメ風)~~ ウェブページは背景が必要だ

```css
body{
    background-image: url('../img/77194247_p0.jpg');
    background-size: cover;
    background-attachment: fixed; /* 固定 */
    background-repeat: no-repeat; /* 繰り返さない */
    padding: 0;
    margin: 0;
}
```

## 半透明とすりガラス

そして、背景にマスクを加えて、半透明効果とすりガラス効果を実現する

```css
.layout {
    /* display: flex; */
    margin: 0;
    padding: 0;
    display: flex;
    width: 100vw;
    height: 100vh;
    backdrop-filter: blur(2px); /* 背景ぼかし効果 */
    -webkit-backdrop-filter: blur(2px); /* Safari サポート */
    background: rgba(0, 0, 0, 0.4); /* 半透明黒い背景 */
}
```

## ウェブページのリニューアル

そういえば、文章を書くのは面倒だな。プログラムしていると邪魔されて、プログラムが終わった時はとても疲れてしまったので、書きたくなくなった。だから今は気軽に文章を書いている

プロジェクトのリング: <https://github.com/yexca/MusicPlayer-Twinkle>

顺便更新了下之前的文章 <https://blog.yexca.net/ja/archives/116/> 用此方法加了个示例: <https://twinkle.yexca.net>

ところで、以前の文章も更新したよ (簡体字中国語で) <https://blog.yexca.net/ja/archives/116/> その方法で例を作った: <https://twinkle.yexca.net>

## カード効果

これも現代的な設計だよねー

```css
.card {
  width: 300px;
  padding: 20px;
  background-color: rgba(255, 255, 255, 0.5); /* 半透明白い背景 */
  border-radius: 15px; /* 丸みを帯びた角 */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* 影 */
  backdrop-filter: blur(10px); /* 背景ぼかし効果 */
  border: 1px solid rgba(255, 255, 255, 0.3); /* ボーダー */
  color: pink; /* 文字の色 */
}
```

まあ、時間があればカードのデザインを基にしてプロジェクトを進めよう ~~(また新しい沼にハマっちゃった)~~

## Twinkle

ちなみに、プロジェクトの内容は Twinkle の音楽、詳しくはこちら

* <https://twinkle130527.wixsite.com/twinkle>
* <https://www.dojin-music.info/circle/1255>

SoundCloud

* <https://soundcloud.com/twintwinkles>
