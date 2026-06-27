---
slug: 265
title: 'Dockerを使ってMinecraftサーバーを立てる方法'
# draft: true
author: yexca
date: '2026-01-06T20:38:41+09:00'
categories:
    - やってみた
tags:
    - minecraft
    - docker
---

{{< notice >}}　この記事は Gemini-3-flash によって翻訳されました　{{< /notice >}}

## 利用するイメージ

image: <https://hub.docker.com/r/itzg/minecraft-server>

github: <https://github.com/itzg/docker-minecraft-server>

document: <https://docker-minecraft-server.readthedocs.io/en/latest/>

## 設定ファイル

バニラ（純正版）

```yaml
services:
  mc:
    image: itzg/minecraft-server:java17
    container_name: mc
    ports:
      - "25565:25565"
    environment:
      EULA: "TRUE"
      TYPE: "VANILLA"
      VERSION: "1.20.1"
      MEMORY: "2G"
    volumes:
      - ./data:/data
    restart: unless-stopped

```

Forge版を立ち上げる時の設定

```yaml
services:
  mc:
    image: itzg/minecraft-server:stable-java17
    tty: true
    stdin_open: true
    ports:
      - "25565:25565"
    environment:
      EULA: "TRUE"
      VERSION: "1.20.1"
      TYPE: "FORGE"
      FORGE_VERSION: "47.4.10"
      MEMORY: "3G"
    volumes:
      - ./data:/data
```

バージョンは公式サイトで確認できるよ： <https://files.minecraftforge.net/net/minecraftforge/forge/>

Modパックをダウンロードする場合

```yaml
services:
  mc:
    image: itzg/minecraft-server:java17
    container_name: mc
    ports:
      - "25565:25565"
    environment:
      EULA: "TRUE"
      TYPE: "CURSEFORGE"
      CF_API_KEY: "君のAPIキー"
      CF_MODPACK_SLUG: "modpack-slug"
      CF_MODPACK_VERSION: "47.4.10"
      MEMORY: "4G"
    volumes:
      - ./data:/data
```

## サーバーのポート開放

現在のゾーンを確認する。

```bash
firewall-cmd --get-active-zones
```

ポートを開放する。

```bash
sudo firewall-cmd --zone=public --permanent --add-port=25565/tcp
```

設定をリロードする。

```bash
sudo firewall-cmd --reload
```

確認。

```bash
sudo firewall-cmd --zone=public --list-all
```

## 独自ドメインの設定

Cloudflareのプロキシ（オレンジ色の雲）やNginxのリバースプロキシは使えないから注意してね。

でも、SRVレコードを使えばポート番号を入力しなくてもドメインだけで接続できるようになるんだ。

名前（Name）には `_minecraft._tcp.your-mc-server.yexca.net` を入力して、優先順位（Priority）は `0`、重み（Weight）はよく使われる `5` か `10` に設定。ポート（Port）はサーバーのポート（例えば `25565`）、ターゲット（Target）には対応するドメイン `your-mc-server.yexca.net` を書けばOK。

## サーバーの設定

起動が終わると、`./data` の中に設定ファイルが出来上がっているよ。詳しい項目についてはここを参考にしてみて： <https://wiki.biligame.com/mc/%E6%9C%8D%E5%8A%A1%E7%AB%AF%E9%85%8D%E7%BD%AE%E6%96%87%E4%BB%B6%E6%A0%BC%E5%BC%8F>
