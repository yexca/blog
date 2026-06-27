---
slug: 71
title: 'FedoraにKomgaをインストールしてみた記録'
date: '2022-09-14T18:47:16+08:00'
author: yexca
# layout: post
# permalink: /archives/71
views:
    - '472'
categories:
    - やってみた
tags:
    - Docker
    - Komga
---

{{< notice >}} この記事は gemini-3-flash-preview によって翻訳されました {{< /notice >}}

## はじめに

ローカルネットワークでもっと快適に漫画を読むために、サーバーを立ててみることにしたよ。

## IPの設定

ルーターは OpenWRT システムを使っている場合の設定。

### ルーターの設定

*ネットワーク - IP/MAC バインド* で、パソコンに固定IPを割り当てる。

### Fedoraの設定

自動割り当てとは違うIPに設定したから（有線接続）、手動で修正する必要があるんだ。

*ネットワーク - 設定* の *ID* に *MACアドレス* を追加して、*IPv4* を *手動* に変更。アドレスは順に *IP、255.255.255.255、ルーターのIP* を入力して、*DNS* にも *ルーターのIP* を追加。自動取得のチェックは外さないでおいたよ。

### ドメイン名の設定（DNSハイジャック）

IPアドレスで直接アクセスもできるけど、ドメイン名があったほうが覚えやすいよね。

ルーターの *ネットワーク - ホスト名* の *ホスト名* に好きなドメイン名を入れて、*IPアドレス* にパソコンのIPを入力する。

## Dockerのインストール

今回はGUIが使える Docker Desktop をインストールしたよ。

### リポジトリの設定

```bash
dnf -y install dnf-plugins-core
```

```bash
sudo dnf config-manager \
    --add-repo \
    https://download.docker.com/linux/fedora/docker-ce.repo
```

### RPMパッケージのダウンロード

[公式サイトのダウンロードページ](https://docs.docker.com/desktop/install/linux-install/) からダウンロード。

ダウンロードが終わったら、ダブルクリックしてそのままインストール。

## Komgaのインストール

### Dockerの設定

* ファイル共有の設定

Docker Desktopの *Settings - Resources - File sharing* で、漫画が置いてあるパスを追加する。

注：*もし共有したディレクトリが次回の起動時に存在しない（マウントされていない）場合、dockerが正常に起動できなくなるから注意してね。*

* ネットワークの設定

必須かどうかはわからないけど、*Settings - Resources - Network* で自分のネットワーク帯域に合わせて設定したよ。

### コマンドラインからインストール

シェルで直接これを実行する。

```bash
docker run \
  --name=komga \
  --user 1000:1000 \
  -p 2333:8080 \
  -v /home/yexca/komga/config:/config \
  -v /home/yexca/komga/data:/data \
  --restart unless-stopped \
  gotson/komga:latest
```

* `-p`

前がホスト側のポート、後ろがコンテナ側のポート。

* `-v`

ファイルマッピング。ホストのディレクトリ（/home/yexca/komga/config）をコンテナの（/config）に紐付ける。

注：ホスト側の隠しファイル（`.` で始まるファイル）はマッピングできないみたい。

### GUIでインストール

さっきのステップが終わると、Docker Desktopの *Images* に *gotson/komga* が追加されるから、*run* をクリックして設定する。

* 1行目：名前

* Ports：ホストに割り当てるポート。例えば 80 にすれば、ドメイン名だけでアクセスできるようになるよ。

* Volumes：パスのマッピング。

* Environment variables：環境変数。今回は使わない。

### 動作確認

コマンドで確認してみる。

```bash
docker ps -a
```

## ファイアウォールの設定

ポートを開放する。

```bash
firewall-cmd --zone=public --add-port=80/tcp
```

設定を反映させる。

```bash
firewall-cmd --reload
```

ポートが開いているか確認。

```bash
firewall-cmd --zone=public --query-port=80/tcp
```

必要ならサービスも追加しておく。

```bash
firewall-cmd --add-service=http
```

どうしてもコマンドでうまくいかないときは、GUIを使おう（最初から使えばよかったかもｗ）。

```bash
sudo yum install firewall-config
```

## 参考記事

[Install Docker Desktop on Fedora - Docker Documentation](https://docs.docker.com/desktop/install/fedora/)

[【Docker】Error response from daemon: invalid mount config for type "bind": bind source path does not exist - Qiita](https://qiita.com/ucan-lab/items/7c0ca7db70deb56ad4fa)

[Run with Docker - Komga](https://komga.org/installation/docker.html#version-tags)

[简约但绝不简单的Komga-老苏的blog](https://laosu.ml/2021/08/02/%E7%AE%80%E7%BA%A6%E4%BD%86%E7%BB%9D%E4%B8%8D%E7%AE%80%E5%8D%95%E7%9A%84Komga/)

[fedora 28 , firewalld 防火墙控制，firewall-cmd 管理防火墙规则 - xuyaowen - 博客园](https://www.cnblogs.com/xuyaowen/p/linxu_firewalld.html)

[Fedora防火墙配置 - 上官飞鸿 - 博客园](https://www.cnblogs.com/jackadam/p/9483381.html)

[原神自动签到(Linux服务器Docker) - yexca'Blog](http://blog.yexca.net/ja/archives/47)

[Fedora 打开8080端口_chunqi zhi的博客-CSDN博客](https://blog.csdn.net/zhichunqi/article/details/80488567)
