---
slug: 262
title: 'Docker を使って一時的な Linux インタラクティブ環境を作る'
# draft: true
author: yexca
date: '2025-12-26T18:43:04+09:00'
categories:
    - 開発実践
tags:
    - Docker
    - Linux
---

{{< notice >}}　この記事は Gemini-2.5-pro によって翻訳されました　{{< /notice >}}

Windows 環境で bash スクリプトを動かすのは、明らかにちょっとハードルが高いよね。Linux 環境であっても、別のディストリビューションに特化したスクリプトを動かすのは少し面倒だったりする。そんな時、Docker を使えばこの問題を解決できるし、ローカル環境をクリーンに保つこともできるんだ。

この記事では alpine を例に、Docker の Linux システムを使ってカレントディレクトリでインタラクティブな処理を行う方法を紹介するよ。

## 原理

実のところ、カレントディレクトリのすべてのファイルをコンテナ内のディレクトリにマウントしているだけなんだ。コマンドのテンプレートはこんな感じ。

```bash
docker run --rm -it -v "$(pwd)":/data -w /data alpine sh
```

それぞれの引数の意味は以下の通りだよ。

| 引数 | 意味 |
| ---- | -------------------------------------------------- |
| --rm | コンテナ終了後に削除する |
| -it | interactive と tty 出力の組み合わせ。対話操作と出力を表示するために必要 |
| -v | パスのマッピング。カレントディレクトリをコンテナの /data にマッピングする |
| -w | ワーキングディレクトリの設定。コンテナに入った時に最初から /data にいられるようにする |
| sh | 最後に sh コマンドを実行することを指定 |

また、単発のコマンドを実行したいだけで対話的な出力が必要ない場合は、最後にそのコマンドを入力すればいいよ。例えばこんな感じ。

```bash
docker run --rm -v "$(pwd)":/data -w /data alpine ls -la
```

## Windows

PowerShell と CMD 環境ではコマンドが異なるんだ。主な違いは環境変数の書き方だよ。以下は alpine の対話型端末を開くコマンド。

- PowerShell

```bash
docker run --rm -it -v ${PWD}:/data -w /data alpine sh
```

- CMD

```bash
docker run --rm -it -v %cd%:/data -w /data alpine sh
```

## Linux

Linux の場合、コンテナに入るとデフォルトで root 権限になる。コンテナ内で生成されたファイルがホスト側で root 権限になってしまい、編集できなくなるのを防ぐために、現在のユーザーの UID と GID をマッピングしておくのがベストだよ。

```bash
docker run --rm -it -u $(id -u):$(id -g) -v "$(pwd)":/data -w /data alpine sh
```

## MacOS

権限の問題を気にする必要はないから、変数は Linux と同じで大丈夫。

```bash
docker run --rm -it -v "$(pwd)":/data -w /data alpine sh
```

## 注意事項 - Alpine

alpine は非常に軽量化されたシステムだから、よく使うコマンドでも自分でインストールする必要があるかもしれない。その時は `apk add` コマンドを使ってインストールしてね。
