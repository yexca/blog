---
slug: 30
title: 'Quest2 でコイカツを VR プレイする際の問題とその解決'
date: '2022-03-18T16:54:23+08:00'
lastmod: '2025-01-03T21:01:01+09:00'
author: yexca
categories:
    - やってみた
tags:
    - Game
    - VR
---

{{< notice >}} この記事は ChatGPT によって翻訳されました {{< /notice >}}

## はじめに

Beat Saber や VRChat などの VR ゲームをプレイしたあと、I社の一部ゲームが VR に対応していることを思い出し、一番好きな「恋活（Koikatu）」を試してみたところ、いくつか問題に直面しました。本記事はその記録です。なお、VR 版にはストーリーがなく、筆者は無改造のオリジナル版を使用しているため、発生する問題は少なめです。

## 前提条件

以下の画像と一部の説明は [Oculus 公式サポートページ](https://support.oculus.com/articles/headsets-and-accessories/oculus-link/index-oculus-link) から引用しています。翻訳は筆者によるものなので、正確な内容は公式を参照してください。

### ケーブル要件

Oculus Link には、データ転送と給電の両方に対応した高品質な USB ケーブルが必要です。快適にプレイするには、長さ 3m（10フィート）以上が推奨されています。

### PC 推奨スペック

| パーツ       | 推奨構成                                 |
|--------------|------------------------------------------|
| CPU          | Intel i5-4590 / AMD Ryzen 5 1500X 以上 |
| GPU          | 対応表を参照                             |
| メモリ       | 8GB 以上                                 |
| OS           | Windows 10                              |
| USB ポート   | 1つ必要                                  |

#### Oculus Link 対応 GPU

|      NVIDIA GPU                          |  スポット | スポットではない |
| ---------------------------------------- | -------- | -------------- |
| NVIDIA Titan Z                           |          | X              |
| NVIDIA Titan X                           | X        |                |
| NVIDIA GeForce GTX 970                   | X        |                |
| NVIDIA GeForce GTX 1060 **Desktop, 3GB** |          | X              |
| NVIDIA GeForce GTX 1060 **Desktop, 6GB** | X        |                |
| NVIDIA GeForce GTX 1060M                 |          | X              |
| NVIDIA GeForce GTX 1070(all)             | X        |                |
| NVIDIA GeForce GTX 1080(all)             | X        |                |
| NVIDIA GeForce GTX 1650                  |          | X              |
| NVIDIA GeForce GTX 1650 Super            | X        |                |
| NVIDIA GeForce GTX 1660                  | X        |                |
| NVIDIA GeForce GTX 1660 TI               | X        |                |
| NVIDIA GeForce RTX 20-series (all)       | X        |                |
| NVIDIA GeForce RTX 30-series (all)       | X        |                |

|     AMD GPU     | スポット  | スポットではない |
| --------------- | -------- | -------------- |
| AMD 200 Series  |          | X              |
| AMD 300 Series  |          | X              |
| AMD 400 Series  | X        |                |
| AMD 500 Series  | X        |                |
| AMD 5000 Series | X        |                |
| AMD 6000 Series | X        |                |
| AMD Vega Series | X        |                |

詳しくは [公式互換ページ](https://support.oculus.com/444256562873335) をご確認ください。

## 一、ゲーム起動について

Koikatu VR を起動するには、`KoikatuVR.exe` を直接実行してください。Steam のストリーミング機能を使っている場合は、事前に SteamVR を立ち上げておくとスムーズです。

### 問題1：SteamVR に入れない

#### 1. 必要ソフトの確認

##### SteamVR のインストール

Steam を開いた状態で `Win+R` を押し、`steam://run/250820` を入力して Enter を押すと自動でインストールが開始されます。

##### Oculus ソフトのインストール

[公式サイト](https://www.oculus.com/setup/) からダウンロード＆インストール。初回起動時にアカウントログインが必要です。支払い方法の入力を求められた場合、「スキップ」可能です。

###### ログインが終わらない・ずっと読み込み中

`hosts` ファイルを編集することで解決可能です。火絨（Huorong）などのツールが便利ですが、手動でも以下を追加してください。

```plaintext
157.240.11.49 graph.oculus.com
157.240.11.49 www2.oculus.com
157.240.8.49 scontent.oculuscdn.com
157.240.8.49 securecdn.oculus.com
````

ファイル：`C:\Windows\System32\drivers\etc\hosts` をメモ帳で開き、末尾に追加。

#### 2. Link ケーブルが正常か確認

Oculus ソフトで「Quest2 および Touch - USB 接続のテスト」を実行してください。接続時のポップアップでも確認可能です。

#### 3. 設定が正しいか確認

- **Quest2 本体のポップアップ**
  → 「データへのアクセスを許可」は「拒否」を選択

- **Oculus ソフトの「設定 > 一般 > 不明なソースを許可」をオンにする**

#### 4. それでもダメなら別ルートで起動

- Quest2 側で「Oculus Link を有効化」→「有効にする」
- SteamVR を手動で起動（Steam ライブラリ内にあります）

## 二、ゲーム開始

`KoikatuVR.exe` をダブルクリックすると自動で SteamVR が起動します。Oculus Link 接続後に直接起動すれば OK。

**注意：ゲーム画面がデスクトップにもウィンドウ表示されます。Win+D などで最小化可能ですが、HMD を一度外すと再表示される場合があります。**

### 問題2：ゲームが開始できない / 操作方法が不明

一部ネット上では「対応デバイスのみ有効」といった情報がありますが、実際には次のように操作可能です：

**「スティック押し込み」で選択レーザー表示、「トリガー」で決定。**

詳細操作は次項で紹介します。

### 問題3：白画面のまま開始できない、PC 側で読み込みが止まる

[コイカツ！DL 版の公式ページ](https://dlsoft.dmm.co.jp/detail/illusion_0023/) 下部から「コイカツ VR パッチ」をダウンロードしてください：

直リンク：[vr\_patch.zip](https://sample9.dmm.co.jp/digital/pcgame/illusion_0023/vr_patch.zip)

解凍後、`setup` フォルダの中身をゲームフォルダに上書きしてください。

**注：この方法では「体位数が3つに制限される」可能性があります。**

回避策：ストーリーモードで体位をすべて実行 → 夜にセーブ → VR モードでロードすれば、すべて解放されます。

参考スレッド：[兄弟们有没有玩了 vr 的](https://tieba.baidu.com/p/7620121778?prev=frs&source=frs#/)

## 三、基本操作

筆者がプレイして確認した範囲の操作を以下に記載します。

### 1）ゲーム起動後の選択

「スタート（Start）」「エンド（End）」の2つがあります。

- **スティック押し込み**：レーザー表示
- **前側トリガー**：決定

### 2）プレイ中の操作

両手コントローラーの手首あたりに表示が出ます。

| 日本語   | 英語     | 内容 | 操作                        |
| ----- | ------ | -- | ------------------------- |
| アクション | Action | 行動 | 前トリガー：メニュー表示・実行、側面トリガー：詳細 |
| システム  | System | 設定 | 前トリガー：位置リセット              |
| 移動    | Move   | 移動 | 前トリガー押しっぱなしで視点変更          |

※「アクション」中のみスティック押し込みで選択可能

## 参考リンク

- [Oculus Link 公式ページ](https://support.oculus.com/articles/headsets-and-accessories/oculus-link/index-oculus-link)
- [兄弟们有没有玩了 vr 的](https://tieba.baidu.com/p/7620121778?prev=frs&source=frs#/)
- [Oculus クライアントがログインできない時の対処法](https://blog.csdn.net/mo_qi_qi/article/details/83795668)

![yexca-30](https://count.getloli.com/@yexca-30)
