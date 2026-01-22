---
slug: 53
title: Gitを使ってファイルをGithubにアップロードする方法
date: '2022-08-03T12:49:27+08:00'
author: hiyoung
# layout: post
# permalink: /archives/53
views:
    - '231'
categories:
    - 技術学習
tags:
    - Git
    - Github
---

{{< notice >}} この記事は Gemini-3-flash によって翻訳されました {{< /notice >}}

> この記事は [Hiyoung](https://blog.hiyoung.icu/) が書いたものだよ。
>
> 元の記事はこちら: <https://blog.hiyoung.icu/2022/08/03/0b5e2db181ab/>

最近、勉強したコードを保存するのにGithubをよく使ってるんだけど、フォルダをそのまま直接アップロードできないことに気づいたんだ。それでネットでGitを使ったアップロード方法を調べてみたから、忘れないようにブログにまとめておくね。

## Github側の操作

### 1. リポジトリのURLをコピーする

![使用Git上传文件至Github_1](https://cdn.statically.io/gh/hiyoung3937/img_hiyoung@master/bolg/%E4%BD%BF%E7%94%A8Git%E4%B8%8A%E4%BC%A0%E6%96%87%E4%BB%B6%E8%87%B3Github_1.3syztscmys80.jpg)

## ローカル側の操作

### 1. ローカルに新しい空のフォルダを作る

![使用Git上传文件至Github_2](https://cdn.statically.io/gh/hiyoung3937/img_hiyoung@master/bolg/%E4%BD%BF%E7%94%A8Git%E4%B8%8A%E4%BC%A0%E6%96%87%E4%BB%B6%E8%87%B3Github_2.5nufudqca7w0.jpg)

僕はもうクローンしちゃった状態だけど、こんな感じ。

### 2. フォルダの中で Git Bash を開く

![使用Git上传文件至Github_3](https://cdn.statically.io/gh/hiyoung3937/img_hiyoung@master/bolg/%E4%BD%BF%E7%94%A8Git%E4%B8%8A%E4%BC%A0%E6%96%87%E4%BB%B6%E8%87%B3Github_3.5l2lii1fkd80.jpg)

### 3. リモートリポジトリをクローン（Clone）する

```html
<pre class="language-bash" data-info="bash" data-role="codeBlock"><span class="token function">git</span> clone + 君のリポジトリURL
<span class="token function">git</span> clone https://github.com/hiyoung3937/study_code.git  //例だよ
```

### 4. アップロードしたいファイルをそのままドラッグ＆ドロップで入れる

### 5. アップロード実行

```html
<pre class="language-bash" data-info="bash" data-role="codeBlock"><span class="token builtin class-name">cd</span>  study_code.git   //自分のリモートリポジトリ名を入力してね
<span class="token function">git</span> init
<span class="token function">git</span> <span class="token function">add</span> <span class="token builtin class-name">.</span>
<span class="token function">git</span> commit -m “君のコミットメッセージ”
<span class="token function">git</span> push
```

- - - - - -

## コマンドの説明

| コマンド | 説明 |
| --- | --- |
| clone + リポジトリURL | リポジトリをローカルに複製するよ |
| cd + リモートリポジトリ名 | リモートリポジトリのフォルダに入る（自分のリポジトリ名を入れてね） |
| git init | Gitを初期化するよ |
| git add . | ファイルをステージングエリアに追加する（"." は今のディレクトリにある全ファイルのこと。フォルダ名だけ指定もできるよ） |
| git commit -m “メッセージ” | ステージングしたファイルをローカルリポジトリに記録するよ |
| git push | リモートリポジトリに送信する（ユーザー名とパスワードを聞かれるかもしれないよ） |
