---
slug: 63
title: 'Fedora に Java 8 (Oracle JDK) を入れる'
date: '2022-09-02T17:37:51+08:00'
author: yexca
# layout: post
# permalink: /archives/63
views:
    - '752'
categories:
    - 技術学習
tags:
    - Fedora
    - Java
---

{{< notice >}} この記事は gemini-2.5-flash によって翻訳されました {{< /notice >}}

## はじめに

FedoraにはJava環境が最初から入ってるけど、それはOpenJDKなんだよね。時々、Oracle版を使いたくなることもあるでしょ？

## ダウンロード

公式サイトからダウンロードするよ：[Java Downloads | Oracle](https://www.oracle.com/java/technologies/downloads/) (ダウンロードにはログインが必要だよ)

*java8-Linux* を見つけて、*x64 Compressed Archive* (64ビットの圧縮ファイル版) をダウンロードしよう。

この記事を書いた時のファイル名は *jdk-8u341-linux-x64.tar.gz* だったよ。

## 適切なディレクトリに移動する

1. まず、*/usr/local* にJava用のディレクトリを作ろう。

```bash
sudo mkdir -p /usr/local/java
```

2. ファイルをこのディレクトリにコピーする。

ダウンロードしたファイルが *~/Downloads* にあると仮定して、ダウンロードディレクトリに移動するよ。

```bash
cd Downloads
```

そしたら、さっき作ったディレクトリにコピーするんだ。

```bash
sudo cp -r jdk-8u341-linux-x64.tar.gz /usr/local/java
```

## インストールファイルを解凍する

3. Javaディレクトリに移動する。

```bash
cd /usr/local/java
```

4. インストールファイルを解凍する。

```bash
sudo tar xvzf jdk-8u341-linux-x64.tar.gz
```

## $PATHを設定する

5. */etc/profile* の最後に以下の内容を追加する。

```bash
JAVA_HOME=/usr/local/java/jdk1.8.0_341
PATH=$PATH:$HOME/bin:$JAVA_HOME/bin
export JAVA_HOME
export PATH
```

## 利用可能なJavaバージョンのリストを更新する

6. 直接以下のコマンドを実行するよ。

```bash
sudo update-alternatives --install "/usr/bin/java" "java" "/usr/local/java/jdk1.8.0_341/bin/java" 1
```

```bash
sudo update-alternatives --install "/usr/bin/javac" "javac" "/usr/local/java/jdk1.8.0_341/bin/javac" 1
```

```bash
sudo update-alternatives --install "/usr/bin/javaws.itweb" "javaws.itweb" "/usr/local/java/jdk1.8.0_341/bin/javaws.itweb" 1
```

## 設定ファイルを有効にする

7. まず、システム全体のPATHファイルを再読み込みする。

```bash
source /etc/profile
```

8. システムを再起動する。

```bash
reboot
```

## Javaバージョンを切り替える

Javaバージョンを確認するには、コマンドを実行すればいいよ。

```bash
java -version
```

9. 以下のコマンドで切り替える。

```bash
sudo alternatives --config java
```

現在使ってるJavaバージョンの前には`+`が付いてるから、該当するバージョンを見つけて、数字を入力して選ぶだけだよ。

## 参考記事

[Fedora {OpenJDK と Oracle JDK} に Java をインストールする方法](https://www.lsbin.com/9422.html)
