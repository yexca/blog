---
slug: 129
# layout: post
title: Linux 学習インデックス
author: yexca
date: 2023-10-21T14:18:15+08:00
# permalink: /ja/archives/129
categories:
    - 技術学習
tags:
    - Linux
    - 読書ノート
---

{{< notice >}} この記事は gemini-3-flash-preview によって翻訳されました {{< /notice >}}

この記事は 2022年12月に書いたものだけど、色んな理由で公開してなかったんだ。

この一連の記事は、僕が『Linux システム管理、サーバー設定、セキュリティ、クラウドデータセンター』を読んだ時に書いた関連ノートだよ。

## 第1部：入門

このセクションの記事はないよ。

* 第1章 Linux を使い始める

Linux の歴史。まとめ：Linux 最高。

* 第2章 完璧な Linux デスクトップを作る

で、その結果 [Fedora デスクトップいじり](https://blog.yexca.net/ja/archives/74) を書いたんだ。

---

## 第2部：Linux パワーユーザーになる

* [第3章 シェルを使う](https://blog.yexca.net/ja/archives/69)

シェルの使い方と変数について。

* [第4章 ファイルシステム内を移動する](https://blog.yexca.net/ja/archives/75)

ファイル関連のシェルコマンド、メタ文字、ファイルの権限。

* [第5章 テキストファイルを扱う](https://blog.yexca.net/ja/archives/78)

vi エディタ、ファイル検索 (`locate` 、`find` 、`grep`)。

* [第6章 実行中のプロセスを管理する](https://blog.yexca.net/ja/archives/79)

プロセスの一覧表示、プロセスの強制終了、プロセスの制限。

* [第7章 簡単なシェルスクリプトを書く](https://blog.yexca.net/ja/archives/81)

シェルスクリプトの構文をいくつか。

---

## 第3部 Linux システム管理者の仲間入り

* [第8章 システム管理を学ぶ](https://blog.yexca.net/ja/archives/82)

/etc 配下の設定ファイルについて。

* 第9章 Linux のインストール (*なし*)

記事はないよ。個人向けの GUI やコマンドラインでのインストール、企業での一括インストールについて。

* [第10章 ソフトウェアの入手と管理](https://blog.yexca.net/ja/archives/83)

RPM と DEB パッケージ、`yum` 、`rpm` 、`dnf` 、`apt` コマンド。

* [第11章 ユーザーアカウントの作成](https://blog.yexca.net/ja/archives/84)

ユーザーアカウントとグループアカウントの管理。

* [第12章 ディスクとファイルシステムの管理](https://blog.yexca.net/ja/archives/85)

ファイルシステムの作成、LVM 論理ボリューム、ファイルシステムのマウント。

---

> この後にはサーバー管理者、Linux セキュリティ技術、Linux のクラウド拡張についてもあったんだけど、諸事情でノートは書かないことにしたよ。
