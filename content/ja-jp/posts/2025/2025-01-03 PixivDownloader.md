---
slug: 211
title: 'Pixiv ダウンローダー'
# draft: true
author: yexca
date: '2025-01-03T20:05:44+09:00'
lastmod: '2025-05-18T16:20:33+09:00'
categories:
    - 開発実践
tags:
    - Pixiv
    - Python
    - PyQt6
---

{{< notice >}} この記事は ChatGPT によって翻訳されました {{< /notice >}}

> 2025-05-18 更新  
> SQLite版も書いた。もうデータベース設定しなくていい：<https://blog.yexca.net/ja/archives/248>

3日かけてとりあえず動くやつを作ってみた。  
ただしエラー処理はしてないから、バグったら ~~再起動してね~~。

GitHub リポジトリはこちら：<https://github.com/yexca/PixivDownloader-MySQL>

## はじめに

これは [ダウンロード済みのイラストを DB に記録する](https://blog.yexca.net/ja/archives/94/) ってところから始まってて、  
ずっと同じ作業してるのアホらしくなって「コンピュータにやらせよう」ってなったんだよね。

たまたま最近「プログラム作りたいな」って思ってたし、  
ついでにこの前作ってたやつ（<https://github.com/yexca/yasumiProject>）にも満足してなかったし、  
年末年始で時間あったから、よっしゃやるかって感じで。

## 説明

一応形にはなったけど、エラー処理はないし、  
GUI アプリとしては初めてちゃんと作ったやつだから、コードはぐちゃぐちゃ。  
なので整理も多言語対応も放棄した（笑）

しかも作ってる途中で「これ SQLite でよくね？」って気づいたんだけど、  
もう半分以上作っちゃったから「まあ最後までやるか」って流れに。

本当は exe にもしたかったけど、設定ファイル使ってるから面倒だし、  
~~しかも最初ビルドしたやつがウイルス扱いされて焦ったし~~  
ってことで放置。

## UI

背景画像出典：<https://www.pixiv.net/artworks/83273073>

- ホーム画面：

![home](https://github.com/yexca/picx-images-hosting/raw/master/2025/01-PixivDownloader/home.4ckyo63bny.webp)

- 設定画面：

![settings](https://github.com/yexca/picx-images-hosting/raw/master/2025/01-PixivDownloader/settings.5fknz20gje.webp)

## 設定

もともとの DB をベースに作ったので、カスタマイズ性はほぼない。

DB のテーブル作成 SQL は以下：

```sql
CREATE TABLE pic (
    ID varchar(99),
    -- 一意な識別子
    name varchar(255),
    -- 作者の名前
    downloadedDate datetime,
    -- ダウンロード／更新日
    lastDownloadID varchar(255),
    -- 最新の作品ID
    platform varchar(50),
    -- プラットフォーム名
    url varchar(255),
    -- リンク
    PRIMARY KEY(ID)
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
~~~

Pixiv の API はログインが必要だけど、
 IDとパスワードでのログインは不可。
 この方法で Auth Token を取得する：https://gist.github.com/ZipFile/c9ebedb224406f4f11845ab700124362

背景画像は Git に入れてない。パスは `app\resources\images\background.png`

あと Python が必要。依存関係は pip で：

```bash
pip install -r requirements.txt
```

## 使い方

実行：

```bash
python main.py
```

Pixiv の認証画面と設定画面で必要な設定を済ませたらホームへ戻る。

画面に Pixiv の **ユーザーID** または **作品ID** を入力すると、
 そのユーザーのすべての作品を自動で取得してくれる。

## おわりに

正直、自分でもこのアプリ使ってないけど、
 開発経験の一歩としてはなかなか良かったと思ってる。

![yexca-211](https://count.getloli.com/@yexca-211)
