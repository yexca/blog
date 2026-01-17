---
slug: 68
title: LinuxでYouTube動画をダウンロードする方法
date: '2022-09-10T19:29:58+08:00'
author: yexca
# layout: post
# permalink: /archives/68
views:
    - '330'
categories:
    - いじくり記録
tags:
    - YouTube
---

{{< notice >}} この記事は gemini-3-flash-preview によって翻訳されました {{< /notice >}}

## はじめに

Windowsのコマンドライン版があるなら、Linux版がないわけないよね。

Windows版の記事はこちら：[コマンドラインでYouTube動画をダウンロードする](http://blog.yexca.net/archives/52)

## yt-dlpをダウンロードする

Python環境を整えてから、[Releases · yt-dlp/yt-dlp · GitHub](https://github.com/yt-dlp/yt-dlp/releases) で *yt-dlp* をダウンロードするのがおすすめ。Pythonの設定が面倒なら *yt-dlp_linux* をダウンロードすればOK。

ダウンロードが終わったら、実行権限を与えて `/usr/local/bin/` に置いておこう。

## ffmpegをダウンロードする

公式サイトの [Download FFmpeg](https://ffmpeg.org/download.html#build-linux) を参考にしてね。

Fedoraなら以下のコマンドを使うよ。

```bash
sudo dnf install ffmpeg
```

## 設定ファイル

設定ディレクトリに移動する。

```bash
cd ~/.config
```

フォルダを作って中に入る。

```bash
mkdir yt-dlp
cd yt-dlp
```

設定ファイルを作成。

```bash
vi config
```

僕の設定はこんな感じ。

```bash
-f bv+ba/b -o ~/Videos/%(uploader)s/%(upload_date)s%(title)s%(id)s.%(ext)s --continue --merge-output-format mp4
```

ちょっと解説するね。

```bash
-f bv+ba/b # 最高画質と最高音質をターゲットに

-o # 出力フォルダの設定
/%(uploader)s/ # チャンネル名ごとにフォルダを作成
%(upload_date)s # アップロード日
%(title)s # 動画タイトル
%(id)s # 動画ID
.%(ext)s # 拡張子

--continue # レジューム（中断したところから再開）

--merge-output-format mp4 # mp4形式にマージする
```

## 参考記事

[ffmpegで動画形式を一括変換する](http://blog.yexca.net/archives/65) ~~というか、自分の記事をわざわざリンクする意味あるのかな（笑）~~
