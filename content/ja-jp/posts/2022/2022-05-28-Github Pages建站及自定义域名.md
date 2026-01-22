---
slug: 44
title: Github Pages でのサイト構築と独自ドメインの設定
date: '2022-05-28T15:30:43+08:00'
lastmod: '2025-01-23T16:15:43+09:00'
author: yexca
categories:
  - 開発実践
tags:
  - Github Pages
  - サイト構築
---

{{< notice >}} この記事は ChatGPT によって翻訳されました {{< /notice >}}

## はじめに

最近 Github Pages を使って個人ページを作りました（今は削除済み）。この記事では Github Pages でのサイト構築方法および独自ドメインの設定について記録します。

本記事では CMS 等は使用せず、~~Markdown ファイル1つで書いた簡易なものです~~。

## Github リポジトリの作成

まず [Github](https://github.com) に登録し、[新しいリポジトリを作成](https://github.com/new) します。

このときの **Repository name** は `username.github.io` としてください。たとえば自分のユーザー名が `yexca` の場合、`yexca.github.io` とします。

## Git 環境のインストール

Windows では Git の公式サイトから [インストーラをダウンロード](https://git-scm.com/downloads) してインストールすればOKです。

インストール後、Git Bash を開き以下を入力します：

```bash
git config --global user.name "Your Name"
git config --global user.email "email@example.com"
````

自分の場合はこうです：

```bash
git config --global user.name "yexca"
git config --global user.email "yexca@duck.com"
```

## Github Desktop の利用

### インストール

Git 操作に慣れていればスキップしても構いません（~~慣れてる人はこの記事を読まない気がしますが~~）

[Github Desktop 公式サイト](https://desktop.github.com) からダウンロードしてインストールします。

### リポジトリをクローン

Github Desktop を起動し、ログイン後に空フォルダを選択し、先ほど作成したリポジトリをクローンします。

ソフトウェア右側に変更履歴と各種操作が表示されます。

![ソフト画面](https://cdn.jsdelivr.net/gh/yexca/picx-images-hosting@master/2022/05-GithubPages建站/image.43qnbq0gw800.webp)

ここでは `VS Code で開く`（`Open in Visual Studio Code`）を選びます。

### サイトの作成

`README.md` を作成して [Markdown](https://blog.yexca.net/ja/archives/43) で編集します（~~ついでに自分の Markdown ノートも見てね~~）。

編集後に保存し、`Github Desktop` で `Commit to main` を押し、続けて `Push origin` をクリックします。

これで `https://username.github.io` にアクセスすれば自分のサイトが表示されます（~~しばらく反映に時間がかかることがあります~~）

## 独自ドメインの設定

### Github Pages 側設定

リポジトリページの `Settings` → 左側 `Pages` → `Custom domain` 欄に独自ドメインを入力し `Save`。

※同画面で Jekyll テーマも選べます。

### DNS 側設定

ドメイン管理パネルにて `CNAME` レコードを追加し、`username.github.io` に向けます（`username` は自分の Github アカウント名）

### HTTPS の設定

Github 公式の HTTPS がうまく機能しなかったため、[Cloudflare](https://cloudflare.com/zh-cn/) を使用しました。

Cloudflare の DNS 管理で「プロキシを有効化」し、「SSL/TLS」→「エッジ証明書」→「常時 HTTPS」をオンにします。

## 他の構築方法

私はブログ用途ではないため、Markdown 1枚の簡易ページで済ませましたが、本格的なブログを作る場合は以下のような静的サイトジェネレータを使うと便利です。

* [Jekyll](http://jekyllrb.com/)：Github 公式サポート
* [VuePress 日本語](http://caibaojian.com/vuepress/)
* Gitbook：ドキュメント向き
* [LOFFER](https://fromendworld.github.io/LOFFER/)
* [Gridea](https://gridea.dev/)：GUI ベースの静的ブログクライアント
* [Hexo](https://hexo.io/zh-cn/)：高速・簡潔なブログフレームワーク
* [Hugo](https://gohugo.io/)：ビルド速度最強クラス

## 参考リンク

* [GitHub Pages クイックスタート - GitHub Docs](https://docs.github.com/ja/pages/quickstart)
* [GitHub Pages ブログ：独自ドメイン・HTTPS・CAA](https://last2win.com/2020/02/21/github-pages-https/)
* [GitHub Pages 構築チュートリアル](https://sspai.com/post/54608)
* [Git インストール - 廖雪峰の公式サイト](https://www.liaoxuefeng.com/wiki/896043488029600/896067074338496)
