---
slug: 237
title: 'OneDrive の直リンクを取得する方法'
# draft: true
author: yexca
date: '2025-03-02T12:58:57+09:00'
categories:
    - やってみた
tags:
    - OneDrive
---

{{< notice >}} この記事は Gemini-3-flash によって翻訳されました {{< /notice >}}

## はじめに

最近、OneDrive で共有されたファイルをダウンロードしようとしたんだけど、IDM（Internet Download Manager）が自動でキャッチしてくれなかったんだ。おまけにブラウザのダウンロードは不安定ですぐ失敗しちゃうし……。そこで、なんとかして直リンクを取得する方法がないか調べてみたよ。

## 拡張機能の問題

最初は「サポートが終わっちゃったのかな？」と思って再インストールしようとしたんだ。でも、一度削除してから Chrome ウェブストアに見に行ったら、なんと「インストール不可」の表示。あちゃー、消すのが早すぎた。

IDM は有料ソフトなのに、アップデートが追いついてないのはちょっと意外だよね。

[Simpread（簡悦）のプロジェクトの Issue](https://github.com/Kenshin/simpread/discussions/6633) を見てわかったんだけど、どうやらボタンに `disabled` 属性が付けられて無効化されているだけみたい。その属性を削除すれば、普通にインストールできたよ。

## 直リンクを取得する

それでも IDM がキャッチしてくれないから、結局は直リンクを探すことにした。

共有ページに入ってファイルをプレビューし、右上の `Share` - `Copy link` を押すと共有リンクが取得できる。こんな感じのリンクだね：

```markdown
https://xxx-my.sharepoint.com/:u:/r/personal/xxx/Documents/xxx/xxx.rar?csf=1&web=1&e=OTZZbx
```

このリンクの中にある `web` という部分を `download` に書き換えるんだ。するとこんな感じになる：

```markdown
https://xxx-my.sharepoint.com/:u:/r/personal/xxx/Documents/xxx/xxx.rar?csf=1&download=1&e=OTZZbx
```

これをコピーして IDM の `Add URL` に貼り付ければ、無事にダウンロードが始まるよ。

---

参考記事: <https://techcommunity.microsoft.com/discussions/onedriveforbusiness/onedrive-direct-download-link/4226744>

---

![yexca-237](https://count.getloli.com/@yexca-237)
