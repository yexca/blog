---
slug: 257
title: '2025年 新サーバー構築の記録'
# draft: true
author: yexca
date: '2025-10-03T10:22:25+09:00'
lastmod: '2025-10-05T02:18:25+09:00'
categories:
    - サーバーいじり
tags:
    - 設定記録
    - Docker
---

{{< notice >}} この記事は Gemini-3-flash によって翻訳されたよ。 {{< /notice >}}

## はじめに

ちょうどサーバーの期限が切れそうだったんだ。去年も1年更新したんだけど、今年は色んなキャンペーンを見てたら更新料がちょっと高いなって感じて。色んな中小サーバー業者を見て回った後、アリババクラウドで「12ヶ月間請求なしなら割引」っていうのを見つけたんだ。大手を見てしまった流れで、ついでに Oracle（オラクル）も思い出しちゃってさ。

それで試してみたんだ。全部リアルの情報で申し込んだら、なんと一発で審査に通ったよ！おめでたい。

でも、ふと思い出したけど[最後にサーバーをいじったの](/archives/131/)は2023年だったんだね。あっという間に2年経っちゃった。月日が流れるのは本当に早いなあ。

## Oracle Linux

イメージを作る時に、僕のお気に入りの Debian がなかったんだ。だからこの Oracle Linux を試してみたんだけど……。まず MySQL がプリインストールされてるのはいいとして（Docker を使う派だから、ホストOSは綺麗にしておきたい潔癖症なんだけどね XD）、リソース消費が激しすぎる。無料枠の 1C1G だとメモリが足りなくて固まっちゃったから、結局別のイメージに変えることにしたよ。

{{< details "Oracle Linux 使用記録" >}}

まずはアップデート。`dnf` コマンドを使ってたら、昔 Fedora を使ってた頃を思い出したよ。

```bash
sudo dnf update -y
```

そうしたらアップデートリストに MySQL があって、サーバーが固まっちゃった。アンインストールするために、まずは MySQL サービスが動いているか確認。

```bash
sudo systemctl status mysqld
```

サービスが動いてるから、まずは停止させる。

```bash
sudo systemctl stop mysqld
```

自動起動を禁止にする。

```bash
sudo systemctl disable mysqld
```

アンインストール。

```bash
sudo dnf remove mysql-server
```

それでもソフトのアップデートでまだ固まるんだよね。Docker のインストールはここを参考にして： <https://oracle-base.com/articles/linux/docker-install-docker-on-oracle-linux-ol8>

{{< /details >}}

## CentOS7 のリポジトリ更新

まずはミラーサイト（源）の変更。Oracle の CentOS7 はどうやらソフトリストのパスが間違っているみたいで、`sudo yum update` を実行するとエラーが出るんだ。

```markdown
Could not retrieve mirrorlist http://mirrorlist.centos.org/?release=7&arch=x86_64&repo=os&infra=stock error was
14: curl#6 - "Could not resolve host: mirrorlist.centos.org; Unknown error"
```

ソフトウェアリストを更新する。

```bash
sed -i 's/mirror\.centos\.org/vault.centos.org/g' /etc/yum.repos.d/CentOS-*.repo
sed -i 's/^#.*baseurl=http/baseurl=http/g' /etc/yum.repos.d/CentOS-*.repo
sed -i 's/^mirrorlist=http/#mirrorlist=http/g' /etc/yum.repos.d/CentOS-*.repo
```

それからアップデートを実行。

```bash
sudo yum update
```

---

参考記事: [mirrorlist.centos.org no longer resolve?](https://serverfault.com/questions/1161816/mirrorlist-centos-org-no-longer-resolve)

---

## Docker のインストール

ツールをインストール。

```bash
sudo yum install -y yum-utils
```

公式リポジトリを設定。

```bash
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
```

インストール。

```bash
sudo yum install docker-ce docker-ce-cli docker-compose containerd.io
```

起動。

```bash
sudo systemctl start docker
```

自動起動を設定。

```bash
sudo systemctl enable docker
```

---

参考記事:[CentOS7 インストール docker (公式ドキュメント参照)](https://www.cnblogs.com/lambdadog/p/18323721)

---

## サーバーのポート管理

よく使う 80 番と 443 番ポートを開放するよ。まずはファイアウォールの状態を確認。

```bash
sudo systemctl status firewalld
```

出力が `Active: active (running)` なら動いてる。現在開放されているポート（恒久設定）を確認。

```bash
sudo firewalld-cmd --list-all --permanent
```

ポート開放を追加。

```bash
sudo firewall-cmd --zone=public --add-port=8080/tcp --permanent
```

設定を反映させるためにリロード。

```bash
sudo firewall-cmd --reload
```

ルールを削除したい場合はこれ。

```bash
sudo firewall-cmd --zone=public --remove-port=8080/tcp --permanent
```

## セキュリティ・リストのポート開放

サーバー内部での開放はOSレベルの話だけど、クラウド側のセキュリティ・リストでもインバウンドポートを許可してあげる必要があるんだ。

Instances - Networking - Subnet から、そのインスタンスの Subnet を管理する。

その中にある Security から具体的なセキュリティ・リストを管理する。

Security rules で Ingress Rules を追加。

Source Type は `CIDR` を選択、Source CIDR には `0.0.0.0/0` を入力。IP Protocol は `TCP`。Destination Port Range に `80, 443` を入れて、Description（説明）には任意で `HTTP/S` とか書いておく。

あとは Add Ingress Rules を押せばOK。

## Nginx-UI のインストール

以前の[サーバー Docker 構築記録](/archives/102/)でも使い方は紹介したけど、アップデートで新機能が追加されたんだ。

他のコンテナから Nginx を制御したり、更新をスムーズにするために、新しいディレクトリをマッピングする必要がある。だから `docker-compose.yml` はこんな感じになったよ。

```yaml
version: '3.1' 
services: 
  nginx-ui:
    restart: always
    image: uozi/nginx-ui:latest
    container_name: nginx_UI
    volumes:
      - /root/nginx/nginx:/etc/nginx
      - /root/nginx/nginx-ui:/etc/nginx-ui
      - /root/nginx/www:/www
      - /var/run/docker.sock:/var/run/docker.sock
    ports:
      - 80:80
      - 443:443
```

ここで `/var/run/docker.sock` をマッピングする理由について、Nginx-UI はこう説明しているよ：

> Nginx UI 公式イメージは、Docker Client API を通じてホストの Docker Engine と通信するために `/var/run/docker.sock` を使用します。この機能は、別のコンテナ内の Nginx を制御したり、Nginx UI の OTA アップグレード時にバイナリ置換ではなくコンテナの差し替えを行って、コンテナの依存関係も確実にアップグレードするために使われます。もしこの機能が不要なら、コンテナに環境変数 `NGINX_UI_IGNORE_DOCKER_SOCKET=true` を追加してください。

## その他のサービス

他に動かしてるものは、そのまま継続して使えそうかな。今回の移行はすごくスムーズだった気がする。ほとんどの時間はサーバー自体の設定に費やした感じだね。
