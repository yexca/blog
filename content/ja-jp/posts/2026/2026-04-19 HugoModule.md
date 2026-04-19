---
slug: 277
title: 'Hugo Moduleの管理'
# draft: true
author: yexca
date: '2026-04-19T22:20:06+09:00'
categories:
    - 技術学習
tags:
    - Hugo
    - Go
---

{{< notice >}} この記事は gemini-3-flash-preview によって翻訳されました {{< /notice >}}

まずは `go` の環境をインストールする必要があるよ。

```bash
sudo apt install golang
```

それから初期化する。

```bash
hugo mod init github.com/<your_user>/<your_project>
```

設定ファイルの `hugo.yml` で、追加したいモジュールをインポートしよう。

```yaml
module:
  imports:
    - path: github.com/name/repo
```

設定を更新する。

```bash
hugo mod get -u
```

## モジュールの表示

go の依存関係を使っているから、モジュールが具体的にどこにあるかはこのコマンドで確認できるよ。

```bash
go env GOMODCACHE
```

依存関係を自分のリポジトリに vendor として取り込む。

```bash
hugo mod vendor
```

こうすると vendor フォルダができて、プロジェクトの依存関係が表示されるようになるんだ。

## 使い方

テーマとして使うなら、ローカルに同名のファイルを用意するだけでOK。つまり、ローカルのファイルを編集すれば、インポートしたテーマのファイルを上書きできるってことだね。

## 参考記事

<https://gohugo.io/hugo-modules/use-modules/>