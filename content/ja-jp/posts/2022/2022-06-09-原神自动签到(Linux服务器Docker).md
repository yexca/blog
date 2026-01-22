---
slug: 47
title: 原神自動ログイン (Linux サーバー Docker)
date: '2022-06-09T13:33:42+08:00'
author: yexca
# layout: post
# permalink: /archives/47
views:
    - '700'
categories:
    - 試行錯誤の記録
tags:
    - Docker
    - miHoYo
---

{{< notice >}} この記事は Gemini-3-flash によって翻訳されました {{< /notice >}}

## はじめに

テンセントクラウド（Tencent Cloud Function）が6月から有料になったから、使うのをやめて自分のサーバーに構築することにしたよ。

なんで6月から有料なのに今さら記事を書いてるかって？ それは、~~まだ3ヶ月の無料トライアルがあるかもしれないから~~ 米遊社（miHoYo BBS）のCookieが切れて更新したついでに、忘れないように記録しておこうと思ったからなんだ。

## ツール＆元のチュートリアル

[原神签到小助手 每日福利不用愁 - 银弾ブログ](https://www.yindan.me/tutorial/genshin-impact-helper.html)

原文では色々な使い方が紹介されているんだけど、ちょっと読むのが大変だったから、自分用にまとめてみたよ。

## テンセントクラウド関数の処理

料金が発生しないように、テンセントクラウド関数を凍結（停止）しておこう。

もちろん、他に使う予定がなければアカウントごと解約してもいいけど、解約には身分証を持った写真が必要になるから注意してね。

## 前提条件

サーバーからミホヨのサーバー <https://mihoyo.com> に接続できる必要があるよ。

SSHのコマンドラインで `ping mihoyo.com` と入力して、接続できるか確認してみて。

~~僕のサーバーの一つが繋がらなくて、結局別のサーバーに変えたんだよね、やれやれ。~~

## Dockerのインストール

ワンクリックでインストールできるスクリプトを使うのが楽だよ。Debian 10 と CentOS 7 で動作確認済み（rootアカウントで実行してね）。

インストールコマンドはこれ：

```bash
curl -fsSL https://get.docker.com | bash -s docker --mirror Aliyun
```

中国国内の daocloud を使う場合はこっち：

```bash
curl -sSL https://get.daocloud.io/docker | sh
```

## スクリプトのインストール

以下のコマンドを実行するだけ。

```bash
docker pull yindan/genshinhelper
```

### CentOS でのエラー

CentOS でインストールしたときに `Can't Connect to Docker Daemon` というエラーが出たことがあったんだ。

その時は、rootアカウントを使っているか確認してから、次のコマンドを入力してみて。

```bash
systemctl start docker
```

## 簡単な使い方

### Cookie の取得

米遊社のCookie取得方法については、この記事を参考にしてね：[原神 樹脂確認/通知 – yexca'Blog](https://yexca.xyz/ja/archives/12)

**注意**：Cookie には `account_id` と `cookie_token` の2つのフィールドが含まれている必要があるよ。

複数アカウントがある場合は、Cookie同士を `#` で繋げばOK。例：`Cookie1#Cookie2#Cookie3`

### 簡単な設定

```bash
docker run -d --name=genshinhelper \
-e COOKIE_MIHOYOBBS="<COOKIE_MIHOYOBBS>" \
--restart always \
yindan/genshinhelper:latest
```

`<COOKIE_MIHOYOBBS>` の部分を自分の `Cookie` に書き換えて実行してね。

### 再設定・Cookieの更新

再設定したいときは、一度アンインストールしてから再インストールして設定し直すのが確実かな。

もしくは、設定ファイルを使っていればCookieを書き換えるだけでいいはず（僕は使ったことないけど、~~Cookieの有効期限は長いからね~~）。

### よく使うコマンド

```bash
# Docker の全コンテナを表示
docker ps -a

# ログを確認
docker logs -f genshinhelper --tail 100

# 再起動
docker restart genshinhelper

# 更新
docker pull yindan/genshinhelper
docker rm -f genshinhelper
# この後、簡単な使い方か高度な使い方の手順で再デプロイ

# アンインストール
docker rm -f genshinhelper
docker image rm yindan/genshinhelper
```

## 高度な使い方

サンプルファイルをダウンロードして編集して使うこともできるよ。

> * Github: [config.json](https://gitlab.com/y1ndan/genshin-checkin-helper/-/raw/main/genshincheckinhelper/config/config.example.json)
> * Telegram: <https://t.me/genshinhelperupdates/5>

### インストール

設定ファイルがサーバーの `/etc/genshin/config.json` にあると仮定して、以下のコマンドで設定をマッピングして実行するよ。

```bash
docker run -d --name=genshinhelper \
-v /etc/genshin:/app/genshincheckinhelper/config \
--restart always \
yindan/genshinhelper:latest
```

### 設定

設定ファイルは必要なパラメータだけ残して、不要なものは削除しても大丈夫。例えば `Cookie` だけ必要な場合とか。

完全に書く以外に、こんな感じでシンプルにも書けるよ：

```json
{
  "COOKIE_MIHOYOBBS": "<COOKIE_MIHOYOBBS>",
}
```

### 設定ファイルの項目

*   **RANDOM_SLEEP_SECS_RANGE**: ランダム待機秒数の範囲。単位は秒。"0-0" にすると遅延なし。
*   **CHECK_IN_TIME**: 毎日の自動ログイン実行時間。実行環境の時間に依存するよ。Dockerなら `TZ=Asia/Tokyo` でタイムゾーンを設定できる。
*   **CHECK_RESIN_SECS**: 原神の「天然樹脂」確認の間隔。単位は秒。
*   **COOKIE_RESIN_TIMER**: 樹脂確認を有効にするアカウントのCookie。
*   **SHOPTOKEN**: WeChatポイントモールのトークン（パケットキャプチャで取得）。
*   **ONEPUSH**: 通知設定。`notifier` に通知サービス名、`params` に必要なパラメータを入れるよ。詳細は後述。

### OnePush 通知パラメータ一覧

通知名 / notifier: bark  
パラメータ / params:  
{'required': ['key'], 'optional': ['title', 'content', 'sound', 'isarchive', 'icon', 'group', 'url', 'copy', 'autocopy']}

通知名 / notifier: custom  
パラメータ / params:  
{'required': ['url'], 'optional': ['method', 'datatype', 'data']}

通知名 / notifier: dingtalk  
パラメータ / params:  
{'required': ['token'], 'optional': ['title', 'content', 'secret', 'markdown']}

通知名 / notifier: discord  
パラメータ / params:  
{'required': ['webhook'], 'optional': ['title', 'content', 'username', 'avatar_url', 'color']}

通知名 / notifier: pushplus  
パラメータ / params:  
{'required': ['token', 'content'], 'optional': ['title', 'topic', 'markdown']}

通知名 / notifier: qmsg  
パラメータ / params:  
{'required': ['key'], 'optional': ['title', 'content', 'mode', 'qq']}

通知名 / notifier: serverchan  
パラメータ / params:  
{'required': ['sckey', 'title'], 'optional': ['content']}

通知名 / notifier: serverchanturbo  
パラメータ / params:  
{'required': ['sctkey', 'title'], 'optional': ['content', 'channel', 'openid']}

通知名 / notifier: telegram  
パラメータ / params:  
{'required': ['token', 'userid'], 'optional': ['title', 'content', 'api_url']}

通知名 / notifier: wechatworkapp  
パラメータ / params:  
{'required': ['corpid', 'corpsecret', 'agentid'], 'optional': ['title', 'content', 'touser', 'markdown']}

通知名 / notifier: wechatworkbot  
パラメータ / params:  
{'required': ['key'], 'optional': ['title', 'content', 'markdown']}

### 通知設定の例

```conf
telegram  
ONEPUSH={"notifier":"telegram","params":{"markdown":false,"token":"xxxx","userid":"xxx"}}

discord  
ONEPUSH={"notifier":"discord","params":{"markdown":true,"webhook":"https://discord.com/api/webhooks/xxxxxx"}}
```

Docker の設定ファイルマッピングディレクトリは `/etc/genshin:/app/genshincheckinhelper/config` だよ。