---
slug: 10
title: WordPress に「前のページに戻る」ボタンを追加する方法
date: '2021-11-10T11:06:27+08:00'
author: yexca
# layout: post
# permalink: /archives/10
views:
    - '288'
categories:
    - 開発実践
tags:
    - WordPress
---

{{< notice >}} この記事は gemini-3-flash-preview によって翻訳されました {{< /notice >}}

だいたいの場合は、ブラウザやシステムに付いている「戻る」機能を使うと思うけど、たまにUIの動線がめちゃくちゃ使いにくいシステムってあるよね。そんな時、ページ内に「前のページに戻る」ボタンを自前で追加しておくと、ブラウジング体験がグッと良くなるよ。

まず、WordPress の管理画面から「外観 - カスタマイズ」をクリックして、カスタマイズ画面を開こう。

左側のメニューから「追加 CSS」を探してね（だいたい一番下にあるはず）。

そしたら、そこに下のコードを貼り付けて。

```css
.float-button {
position: fixed;
height: 90px;
width: 40px;
bottom: 90px;
right: 50px;
/* 数値は自分の好みに合わせて調整してね */
}
```

入力が終わったら保存して、次はテーマの該当する箇所を編集していくよ。

もしサーバーのファイルに直接アクセスできないなら、WordPress 管理画面の「外観 - テーマファイルエディター」から、ボタンを追加したいページを探して編集してね。

サーバーのファイルにアクセスできるなら、パス `サイトのルートディレクトリ/wp-content/themes/<あなたのテーマ名>/` を開いて、該当するページファイルを編集しよう。

あとは、ボタンを表示させたい場所に下のコードを挿入して保存するだけ。

```html
<div class="float-button">
<input type="button" name="Submit" value="戻る" onclick="javascript:history.back(-1);">
</div>
<!-- 必要に応じて説明文とかも修正してみてね -->
```

## 参考記事

[网页上的“返回上一页”的几种实现代码](https://www.cnblogs.com/Julia-Yuan/p/7978888.html)

[div 套路之悬浮的 button](https://blog.csdn.net/qq_34266804/article/details/88316086)
