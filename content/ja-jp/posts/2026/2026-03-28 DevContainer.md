---
slug: 274
title: 'Dev Container を使ってみよう：環境依存から完全にサヨナラ'
# draft: true
author: yexca
date: '2026-03-28T16:12:02+09:00'
categories:
    - 開発プラクティス
tags:
    - Dev Container
    - Docker
    - Git
---

{{< notice >}} この記事は gemini-3-flash-preview によって翻訳されました {{< /notice >}}

開発しているとき、特にフロントエンドの開発だと、環境構築ってかなり重要だよね。毎回 `npm install` を実行するたびにすごく緊張しちゃうんだ。依存関係の取得に失敗することが多すぎるからね。それに、あるプロジェクトを再現するために、元のプロジェクトと同じ環境を整えるのも結構面倒だったりする。

以前フロントエンドの状況を調べていたときに、Astro や Qwik みたいに比較的新しいアイランドアーキテクチャ（Islands Architecture）に触れる機会があったんだ。それと同時に、Hugo Book を使っている自分のサイトにちょっと満足いかなくなって、移行してみることにした。

でも今回の移行では、再現性を高めるために、コンテナ内で開発できる Dev Container 技術を使い始めたんだ。ちょうどパソコンを新しくしたこともあって、実は僕のブログも Dev Container 化したよ。

## 設定

設定はすごく簡単。プロジェクトのルートディレクトリに `.devcontainer` フォルダを作って、その中にイメージ構築用の `Dockerfile` を書いて、`devcontainer.json` で関連するオプションを設定するだけ。

Dockerfile はごく普通の Dockerfile 構文で、必要なイメージや依存関係をプルしてインストールすれば OK。

json ファイルのすべての設定項目については、ここを参考にしてみて：<https://containers.dev/implementors/json_reference/>。僕のブログ用のはすごくシンプルだから、参考にどうぞ：

```json
{
    "name": "yexca-blog",
    "build": {
        "dockerfile": "Dockerfile",
        "args": {
            "HUGO_VERSION": "0.140.1"
        }
    },
    "customizations": {
        "vscode": {
            "extensions": [
                "budparr.language-hugo-vscode", // Hugo 構文ハイライト
                "ritwickdey.LiveServer"         // ライブプレビュー補助
            ]
        }
    },

    "remoteUser": "vscode"
}
```

## タイムゾーンの設定

最初にプッシュしたとき、すぐに変なことに気づいたんだ。GitHub 上に表示されるコミット時間がローカルと合わない。いろいろ調べたら、コンテナのデフォルトが UTC 時間だったのが原因だった。だから、ビルドが終わった後に手動で設定し直すのがベストだね。

実行するシステムによって設定方法が違って構築時に書くのが難しいかもしれないから、この部分はコマンドでタイムゾーンを定義する方法を選んだよ。

一般的な時間設定の方法はこれ：

```bash
sudo timedatectl set-timezone Asia/Tokyo
```

でも、コンテナで使われる軽量版 Linux にはこのコマンドが入っていないことが多いから、こっちが使えるよ：

```bash
sudo ln -sf /usr/share/zoneinfo/Asia/Tokyo /etc/localtime
```

設定の確認：

```bash
date -R
```

## Git

コンテナも新しいマシンのようなものだから、git でプッシュするときにちょっと問題が起きるんだ。VS Code はローカルリポジトリの設定を使えば大丈夫って言ってるけど、僕みたいに 1password エージェントを使っている場合は自動で認識されなかった。

解決策は2つある。1つ目はすごく簡単で、自分の `~/.ssh` をそのままコンテナにコピーする方法。リスクはあるけど、自分用で他人に渡さないならまあいいかな。2つ目は、まずローカルで Dev Container を構築してから GitHub にプッシュして、VS Code で「GitHub からリポジトリをクローン」を選択する方法。自分の GitHub アカウントでログインして構築すれば、その後のプッシュはそのままできるようになるよ。

## 使ってみて

前から Dev Container は使っていたから便利さは知っていたけど、今回は公式の例を使わずに、自分でカスタムイメージを作ってみて、本当にスムーズだと感じた。デバイスをまたぐ環境問題が完璧に解決されたよ。パソコンを買い替えたときも、何もインストールする必要がなくて、クローンすればすぐに開発を始められる。一度使ってみるとその快適さがわかるはず。開発からデプロイまで、全環境が一致した（全部コンテナ経由だからね）って感じだね。

## 参考記事

<https://vscode.js.cn/docs/devcontainers/containers#_working-with-git>
