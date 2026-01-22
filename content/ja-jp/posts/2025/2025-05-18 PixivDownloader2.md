---
slug: 248
title: 'Pixiv ダウンローダー再構築記：グチャグチャから混乱の理解へ'
# draft: true
author: yexca
date: '2025-05-18T16:20:33+09:00'
categories:
    - 開発実践
tags:
    - Pixiv
    - Python
    - PyQt6
---

{{< notice >}}　この記事は ChatGPT によって翻訳されました。また、このソフトウェアは中国語簡体字のみです。　{{< /notice >}}

元々はちょっとしたものを適当に書くつもりで、二三日で飽きる予定だった（いつも大体そう）。でもバグらずに動いてくれることで時間めっちゃ節約できたし、どんどん使いやすくなっていった。

そうすると以前思ってた「SQLite 使えばよくない？」って発想がよみがえってきた。確かに、毎回 MySQL 起動するのはめんどすぎるって話。で、今回のバージョンが生まれたわけ。やっと DB サービス起動しなくても使えるようになった～ ~~（やっと人間が使えるものになった）~~

## 使用方法

項目地址: <https://github.com/yexca/PixivDownloader-SQLite>

GUI は前バージョンと似てるから、<https://blog.yexca.net/ja/archives/211/> を見ればわかる。

### 設定について

使う前に設定が必要：

- `refresh token`（Pixiv のログイン認証。参考: [Pixiv OAuth Flow](https://gist.github.com/ZipFile/c9ebedb224406f4f11845ab700124362)）
- ダウンロード先（デフォルトは `D:\Downloads`）

### ダウンロードの仕方

その後は以下のどちらかを入力すれば OK：

- イラストレーター ID、または
- 作品 ID（両方入れた場合はイラストレーター ID 優先）

「下载」ボタンを押せば、全作品をダウンロードして DB に記録してくれる（記録がない場合は全部、記録がある場合は未ダウンロードのやつだけ）。

### エラー処理

プログラムのエラー処理は基本的にクローリング関係だけやってる。エラーポップアップが出たら、以下の問題が考えられる：

- `refresh token` が設定されてない、または無効
- イラストレーターアカウントが存在しない
- 作品が存在しない

エラーの内容は詳しく出してないから、この3点をチェックしてみて。

それ以外（ソフトごとクラッシュとか）のエラーは `程序根目录/logs/app_*-*-*.log` にある最新ログを送ってもらえれば、こっちで見ます。

連絡先：`PixivDownloader#yexca.net`（@ に変えてね）

## 新機能：MySQL から SQLite へ

一番の変更点は、MySQL を自分で用意しなくていいってところ。軽量な SQLite に切り替えた。

それで DB 設定とか全部いらなくなって、Pixiv の認証トークンとかと一緒に設定ファイルにした。

あと icon も入れた（ChatGPT に適当に描かせたやつ）。UI も少しだけ調整したけど、そんなに変えてない。

コードも一応構造化し始めたけど、最後の方はまたグチャった。~~まあ、いつかまた書き直すかもね~~

## 旧 MySQL データベースからの移行方法

まあ前バージョン使ってる人いないと思うけど、一応書いとく。

DB 構造の違いで、直接 SELECT して INSERT 文として出力するのが一番楽。こんな感じ：

```sql
SELECT ID, name, downloadedDate, lastDownloadID, url
FROM pic 
WHERE platform = 'pixiv';
```

出力は SQL の INSERT 文にしてね（Dataflare ってツールがその機能ある）。

そのあと、Python ファイルを用意して以下を入れる：

```python
import sqlite3

conn = sqlite3.connect("pixiv.db")
cursor = conn.cursor()

cursor.execute('''
        Create Table If Not Exists pic (
               ID TEXT PRIMARY KEY,
               name TEXT,
               downloadedDate TEXT,
               lastDownloadID TEXT,
               url TEXT
               )               
               ''')

conn.commit()

cursor.execute("""
INSERT INTO `pic` (`ID`, `name`, `downloadedDate`, `lastDownloadID`, `url`) VALUES
('123', 'name1', '2024-06-08 00:00:00', '1234', 'https://www.pixiv.net/users/123'),
('234', 'name2', '2025-02-12 00:05:36', '2345', 'https://www.pixiv.net/users/234'),
('345', 'name3', '2025-01-11 17:26:17', '3456', 'https://www.pixiv.net/users/345');
"""
)

conn.commit()

cursor.execute("""
Select * from pic
"""
)

rows = cursor.fetchall()
for row in rows:
    print(row)

conn.close()
```

`cursor.execute` の中身を自分のバックアップ SQL に差し替えて、例として3件残しておいた。

その後、できた `pixiv.db` を `程序根目录/resources` に置けば OK。

## ちょっとした開発感想：「グチャグチャ」から「混乱の理解」へ

そういえば今回の開発、前回コードがグチャグチャすぎたのが気になって手を入れようとしたんだけど、途中で「あ～そりゃ前回グチャるわ」って理解した😂

むしろ今回の方がさらにグチャったまである。途中から「もうリファクタやめてコピペでいいか」ってなって、キャメルケースとスネークケースが混ざるカオスが爆誕した。もう触りたくない。はぁ。

とはいえ、動いてるし、使えるならまぁいいか～

![yexca-248](https://count.getloli.com/@yexca-248)
