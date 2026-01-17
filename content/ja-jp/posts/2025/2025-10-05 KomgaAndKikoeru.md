---
slug: 258
title: '漫画と音声サイトいじり'
# draft: true
author: yexca
date: '2025-10-05T01:58:35+09:00'
categories:
    - いじり経験
tags:
    - 設定記録
    - Docker
---

{{< notice >}} この記事は gemini-2.5-flash によって翻訳されました {{< /notice >}}

## はじめに

Google の Gemini Pro サブスクリプションには2TBのストレージが付いてるんだ。それを見たら、また何か試したくなっちゃったんだよね。ってことで、早速やっちゃおうかなと。

でも、よく見たら[前回のいじり](/archives/73)からもう3年も経ってるんだね。時間ってホントあっという間だなぁ。

## 漫画 Komga

まずは漫画を読むためのKomgaね。スキャンするときはちょっともたつくけど、使い心地自体は悪くないよ。

何年も経って、Komgaもかなりアップデートされてるんだ。[前の記事](/archives/71)の内容はもう使えないし、docker-composeを使う方がもっと手軽だから、`docker-compose.yml`はこんな感じ。

```yaml
version: '3.0'
services:
  komga:
    image: gotson/komga:1.23.4
    container_name: komga
    volumes:
      - type: bind
        source: /home/komga/config
        target: /config
      - type: bind
        source: /home/rclone/data
        target: /data
    ports:
      - 25600:25600
    restart: unless-stopped
```

あと、[専用のiOSアプリKomic](https://pruizlezcano.github.io/komic/)があるのがマジで便利なんだよね。

## rclone Google Drive マウント

[Microsoft OneDrive](/archives/105)と同じように、まずはWindowsのブラウザで認証してトークンを手に入れる必要があるよ。

具体的な手順としては、ダウンロードしてからコマンドを実行するだけ。

```bash
rclone config
```

名前を付けたら`Google Drive` (22)を選んで、`Full access all files, excluding Application Data Folder`の権限を与えて、エンターを押してブラウザでログイン、終わったら終了って感じ。

ただ、最初はよく分からなくて、アプリIDとシークレットを申請してみたんだけど、あんまり意味なかったみたい。でも、一応記録しとけば後で使えるかもしれないしね。

{{< details "Google アプリケーションAPI IDとシークレットを申請" >}}

Google API サービスサイトを開く: <https://console.developers.google.com/>

`Enable APIs and services`を選んで`Google Drive API`を検索して有効にする。

Google Drive APIの`Manage`から`Create credentials`。

APIのタイプは`User data`、つまり`OAuth`を含むものを選択。

OAuth Client IDでタイプを`Web application`に選んで、名前は`rclone`って入力してもOK。終わったら`Client ID`が出てくるよ。

これで作成完了。Credentialsでさっき作ったrcloneアプリを選んで、秘密鍵の`Client secrets`をコピーしてね。

{{< /details >}}

次に設定ファイルをサーバーにコピーするんだけど、ローカルのディレクトリはこれ。

```markdown
C:\Users\%USERNAME%\AppData\Roaming\rclone
```

サーバーにはfuseをダウンロード。僕のサーバーはCentOS7だから、これをダウンロードしたよ。

```bash
sudo yum install -y fuse fuse3 fuse-libs
```

もっと新しいシステムならfuse3を直接ダウンロードすればOK。次にdockerでマウントするよ。

```bash
sudo docker run --rm \
    --volume /home/opc/rclone/config:/config/rclone \
    --volume /home/opc/rclone/data:/data:shared \
    --volume /etc/passwd:/etc/passwd:ro --volume /etc/group:/etc/group:ro \
    --device /dev/fuse --cap-add SYS_ADMIN --security-opt apparmor:unconfined \
    rclone/rclone \
    mount GoogleDrive:/ /data \
    --no-checksum \
    --use-server-modtime \
    --no-gzip-encoding \
    --no-update-modtime \
    --no-seek \
    --modify-window 2m \
    --allow-other \
    --allow-non-empty \
    --dir-cache-time 30m \
    --cache-read-retries 15 \
    --cache-db-purge \
    --timeout 30m \
    --vfs-cache-mode full \
    --vfs-read-chunk-size 2M \
    --vfs-read-chunk-size-limit 5M \
    --vfs-cache-max-age 30m \
    --attr-timeout 20s \
    --poll-interval 9m \
    --vfs-cache-poll-interval 10m&
```

後ろのたくさんある設定は[Komgaの公式提供](https://komga.org/docs/installation/gdrive)を参考にしてるんだけど、具体的な意味はこんな感じ。

| パラメーター                      | 機能                           | 説明                                                         |
| -------------------------------- | ------------------------------ | ------------------------------------------------------------ |
| `--no-checksum`                  | チェックサムをスキップ                     | API呼び出しを減らし、ディレクトリの読み込みを高速化。動画などの大きなファイルに適してる。          |
| `--use-server-modtime`           | サーバーのファイル更新時間を使用       | ローカルとリモートの時間差による重複アップロード/同期を防ぐ。                      |
| `--no-gzip-encoding`             | GZIPエンコーディングを無効化                 | 一部のクラウド（Driveなど）では、レスポンスが圧縮されるとパフォーマンスが良くない場合があるから、これでCPU使用率を下げられるよ。 |
| `--no-update-modtime`            | ファイル更新時間を更新しない             | 読み取り専用の用途で、時間変動によるDriveのバージョン更新を防ぐ。                |
| `--no-seek`                      | ランダム読み取りを無効化                     | 動画のシーク操作のサポートは減るけど、順次読み込みの安定性が向上するよ。連続再生シーンに適してる。 |
| `--modify-window 2m`             | ファイル更新時間の誤差許容範囲       | ローカル/リモートの時間差による誤判定を防ぐ。                                |
| `--allow-other`                  | システム内の他のユーザーがマウント内容にアクセスすることを許可 | `/etc/fuse.conf`で許可するようにシステム設定が必要。                       |
| `--allow-non-empty`              | 空でないディレクトリをマウント                   | マウントポイントが空でなくてもマウントを続けられる。                                   |
| `--dir-cache-time 30m`           | ディレクトリキャッシュ時間                   | 頻繁なクラウドAPIリクエストを減らす。デフォルトでちょうどいいくらい。                             |
| `--cache-read-retries 15`        | キャッシュ読み取り失敗時の再試行回数         | 安定性を高める。                                                 |
| `--cache-db-purge`               | 起動ごとにキャッシュデータベースをクリア         | 古いキャッシュの破損によるエラーを防ぐ。長時間マウントをオン/オフする環境に適してる。           |
| `--timeout 30m`                  | 単一転送のタイムアウト上限               | 長い動画や大きなファイルの読み取り時に接続切れを防ぐ。                               |
| `--vfs-cache-mode full`          | フルキャッシュモード                   | 読み書きはすべてローカルキャッシュを介して行う。最もパフォーマンスがバランスが取れていて、安全だよ。                 |
| `--vfs-read-chunk-size 2M`       | ダウンロードチャンクサイズ                 | 小さいほど帯域幅は節約できるけど、頻度が高くなる。この設定は低帯域幅環境に適してる。             |
| `--vfs-read-chunk-size-limit 5M` | 最大チャンクサイズ制限                 | 増大を制限して、一度に大きなリクエストがタイムアウトするのを防ぐ。                     |
| `--vfs-cache-max-age 30m`        | キャッシュファイルの最大生存時間           | 比較的短い時間で、スペース節約に適してる。                                 |
| `--attr-timeout 20s`             | ファイル属性キャッシュ時間               | 頻繁なstat()呼び出しを防ぐ。20秒が妥協点だね。                         |
| `--poll-interval 9m`             | クラウド変更ポーリング間隔               | 9分に1回変更をチェックして、Google APIの負担を軽減する。                   |
| `--vfs-cache-poll-interval 10m`  | ローカルキャッシュクリア間隔               | 10分ごとに期限切れキャッシュをクリアする。                                 |

## Alpine Linux の使い方

占有率が高すぎたから、めっちゃ軽量なAlpineを思いついたんだ。

### Dockerのインストール

まずはソフトウェアをアップデート。

```bash
doas apk update
```

Dockerをインストール。

```bash
doas apk add docker docker-cli-compose
```

起動時に設定。

```bash
rc-update add docker default
```

Dockerを起動。ちょっと待つ必要があるかも。

```bash
doas service docker start
```

自分をDockerユーザーグループに追加。

```bash
doas addgroup ${USER} docker
```

---

参考記事

<https://wiki.alpinelinux.org/wiki/Docker>

---

### swapの作成

まずスワップスペースを追加するよ。

```bash
doas fallocate -l 8G /swapfile
```

権限はrootだけがアクセスできるように設定。

```bash
doas chmod 600 /swapfile
```

swapをフォーマット。

```bash
doas mkswap /swapfile
```

swapを有効にする。

```bash
doas swapon /swapfile
```

そしたら、ちゃんと有効になったか確認できるよ。

```bash
free -h
```

### rcloneの設定

めっちゃ軽量だから、いくつか追加設定が必要なんだ。

まずはfuseをインストール。

```bash
doas apk add fuse
```

デバイスをマウント。

```bash
doas modprobe fuse
```

それから、ルートディレクトリを`share`タイプに変更する必要があるんだ。

```bash
doas mount --make-rshared /
```

あとはCentOS7と同じような感じ。

---

参考記事

- [How to Install Rclone on Alpine Linux Latest](https://ipv6.rs/tutorial/Alpine_Linux_Latest/rclone/)

- [Alpine Linux Wiki Rclone](https://wiki.alpinelinux.org/wiki/Rclone)

---

## Kikoeru

最初はちょっと遠回りしちゃって、結局失敗しちゃったんだ。だから、一応記録しとくね。

{{< details "午後いっぱいの失敗 TT" >}}

定番のkikoeruプロジェクトのフォークを辿って最新のコミットを探してたんだ。で、[XunJiJiang/kikoeru-express](https://github.com/XunJiJiang/kikoeru-express)は見つかったんだけど、イメージのビルドを午後いっぱい試しまくったよ。Node.js 12から16まで試して、いろんなエラーが出て、ミラーを変えたりとか色々やったんだ。単独デプロイもビルド失敗ばっかりで、Dockerなしでビルドしてみてもダメで、最終的にはもう諦めて、定番の0.6.2を使うことにしたんだ。

うわー、マジでね、Node.jsのバージョンは12-14が推奨されてるのに、実際にビルドを進めていくと、あるステップで16以上の機能が必要って出てくるんだ。直接14以上で`npm i`するとエラーになっちゃうから、仕方なく13で先に依存関係をインストールして、終わったらコピーしてきて16でビルドする、みたいなことになってね。まさかこんな感じで午後いっぱいかかっちゃったよ。でも正直、これでNode.jsのバージョン切り替えがめっちゃ得意になっちゃったかもXD

前にダウンロードしたiOSアプリを開いて接続してみたら異常だったんだ。更新履歴を見たら、0.6.14バージョン以上を使ってって書いてあって、マジで衝撃受けたよ。で、すぐに検索したら、すでにスターしてた[Number178/kikoeru-express](https://github.com/Number178/kikoeru-express)を見つけちゃった😂

{{< /details >}}

更新されてる[Number178/kikoeru-express](https://github.com/Number178/kikoeru-express)を使ってるんだけど、この作者がiOSアプリも開発してくれてて、それがめっちゃ便利なんだ。

設定ファイル

```yaml
version: '3.0'
services:
    kikoeru:
        ports:
            - '8011:8888'
        container_name: kikoeru
        volumes:
            - type: bind
              source: /home/rclone/data/asmr
              target: /usr/src/kikoeru/VoiceWork
            - /home/kikoeru/sqlite:/usr/src/kikoeru/sqlite
            - /home/kikoeru/covers:/usr/src/kikoeru/covers
            - /home/kikoeru/config:/usr/src/kikoeru/config
        image: 'number17/kikoeru:v0.6.14-20250914'
        restart: always
```

それでね、タグの言語は切り替えられないんだ。デフォルトが簡体中国語だから、日本語が必要ならスキャンする前に切り替えておく必要があるよ。
