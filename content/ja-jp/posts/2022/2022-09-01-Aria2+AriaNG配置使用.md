---
slug: 62
title: Aria2+AriaNG の設定と使い方
date: '2022-09-01T23:06:38+08:00'
author: hiyoung
# layout: post
# permalink: /archives/62
views:
    - '1737'
categories:
    - やってみた
tags:
    - Aria2
    - ダウンロードツール
---

{{< notice >}} この記事は Gemini-3-flash によって翻訳されました {{< /notice >}}

> この記事は [Hiyoung](https://blog.hiyoung.icu/) が執筆したよ。
>
> 元の記事はこちら: <https://blog.hiyoung.icu/2022/09/01/906d191f9a59/>

Aria2はLinux向けのダウンロードツールなんだけど、ここではWindowsでのインストールと設定方法を紹介するね。公式のAria2にはGUI（画面）がないから、AriaNGっていうWebインターフェースを組み合わせて、ブラウザから操作できるようにしていくよ。

AriaNgは、aria2をもっと使いやすくしてくれるモダンなWebフロントエンドなんだ。純粋なHTMLとJavaScriptで開発されているから、コンパイラや実行環境は一切不要だよ。

## Aria2+AriaNGの最新インストールパッケージをダウンロード

まずは公式サイトからインストールパッケージをダウンロードしよう。

- **[Aria2のGithubページ](https://github.com/aria2/aria2/releases/)**

 – **[Aria2公式ドキュメント](https://aria2.github.io/)**

- **[AriaNGのGithubページ](https://github.com/mayswind/AriaNg/releases)**

 – **[AriaNG公式ドキュメント](http://ariang.mayswind.net/zh_Hans/)**

Aria2は自分のOSに合った圧縮ファイルをダウンロードすればOK。AriaNGは解凍してAria2と同じフォルダに入れておこう。

AriaNgには現在、標準版、単一ファイル版、AriaNg Nativeの3つのバージョンがあるよ。

> 標準版：Webサーバーにデプロイするのに向いていて、リソースのキャッシュやオンデマンド読み込み機能がある。
>
> 単一ファイル版：ローカルで使うのに最適。ダウンロードした唯一のhtmlファイルをブラウザで開くだけで使える。
>
> AriaNg Native：これもローカル利用向け。ブラウザを使わずにアプリとして動かせるよ。

## 設定ファイルの追加

ファイルをディレクトリに解凍したら、新しく4つの空ファイルを作る必要があるよ（まずは空のtxtファイルを作ってから拡張子を変えるのが簡単）。

- **Aria2.log （ログファイル）**
- **aria2.session （ダウンロード履歴を記録して、レジュームできるようにするファイル）**
- **aria2.conf （設定ファイル）**
- **HideRun.vbs （cmdウィンドウを隠して実行するためのファイル）**

### 設定ファイルの編集

1. さっき作った空の `aria2.conf` を開いて、以下の内容を貼り付けてね（メモ帳で開けば大丈夫）。

```conf
## '#'で始まる行はコメントだよ。オプションには説明がついているから、必要に応じて変更してね ##
## コメントアウトされているオプションはデフォルト値。変更したい時だけコメントを外すのがおすすめ ##

## ファイル保存関連 ##

# ファイルの保存先パス(絶対パスか相対パスが使える)。デフォルト: 現在の起動位置
dir=E:\Aria2Download
# ログファイルの保存先パス
log=D:\aria2-1.36.0-win-64bit-build1\Aria2.log
# ディスクキャッシュを有効にする。0は無効。1.16以上が必要。デフォルト:16M
#disk-cache=32M
# ファイルの事前割り当て方式。ディスクの断片化を抑えられる。デフォルト:prealloc
# 割り当てにかかる時間: none < falloc ? trunc < prealloc
# fallocとtruncはファイルシステムとカーネルのサポートが必要
# NTFSならfalloc、EXT3/4ならtruncがおすすめ。MACの場合はこの項目をコメントアウトすること
#file-allocation=none
# 断点からの再開（レジューム）を有効にする
continue=true

## ダウンロード接続関連 ##

# 同時ダウンロードタスクの最大数。実行中に変更可能。デフォルト:5
#max-concurrent-downloads=5
# 同一サーバーへの接続数。タスク追加時に指定可能。デフォルト:1
max-connection-per-server=5
# 最小ファイル分割サイズ。タスク追加時に指定可能。範囲1M -1024M。デフォルト:20M
# 例: size=10Mでファイルが20MiBなら2つのソースからダウンロード、15MiBなら1つからダウンロードする
min-split-size=10M
# 1タスクあたりの最大スレッド数。タスク追加時に指定可能。デフォルト:5
#split=5
# 全体のダウンロード速度制限。実行中に変更可能。デフォルト:0
#max-overall-download-limit=0
# 1タスクあたりのダウンロード速度制限。デフォルト:0
#max-download-limit=0
# 全体のアップロード速度制限。実行中に変更可能。デフォルト:0
#max-overall-upload-limit=0
# 1タスクあたりのアップロード速度制限。デフォルト:0
#max-upload-limit=0
# IPv6を無効にする。デフォルト:false
#disable-ipv6=true
# タイムアウト時間。デフォルト:60
#timeout=60
# 最大リトライ回数。0は無制限。デフォルト:5
#max-tries=5
# リトライ待ち秒数。デフォルト:0
#retry-wait=0

## 進捗保存関連 ##

# セッションファイルからダウンロードタスクを読み込む
input-file=D:\aria2-1.36.0-win-64bit-build1\aria2.session
# Aria2終了時に「エラー/未完了」のタスクをセッションファイルに保存する
save-session=D:\aria2-1.36.0-win-64bit-build1\aria2.session
# セッションを定期的に保存する。0は終了時のみ。1.16.1以上が必要。デフォルト:0
#save-session-interval=60

## RPC関連の設定 ##

# RPCを有効にする。デフォルト:false
enable-rpc=true
# すべてのソースからのアクセスを許可する。デフォルト:false
rpc-allow-origin-all=true
# 外部以外のアクセスも許可する。デフォルト:false
rpc-listen-all=true
# イベントループ方式。システムによってデフォルトが異なる
#event-poll=select
# RPCリスニングポート。ポートが使われている場合は変更可能。デフォルト:6800
#rpc-listen-port=6800
# RPC認証トークンの設定。v1.18.4の新機能。--rpc-user と --rpc-passwd の代わり
#rpc-secret=<TOKEN>
# RPCユーザー名の設定。新バージョンでは非推奨。--rpc-secretを使うこと
#rpc-user=<USER>
# RPCパスワードの設定。新バージョンでは非推奨。--rpc-secretを使うこと
#rpc-passwd=<PASSWD>
# RPCサービスでSSL/TLS暗号化を有効にするかどうか
# 有効にするとRPC接続にはhttpsまたはwssプロトコルが必要になる
#rpc-secure=true
# RPCでSSL/TLS暗号化を使う時の証明書ファイル
# PEM形式の場合、--rpc-private-keyで秘密鍵を指定する必要がある
#rpc-certificate=/path/to/certificate.pem
# RPCでSSL/TLS暗号化を使う時の秘密鍵ファイル
#rpc-private-key=/path/to/certificate.key

## BT/PTダウンロード関連 ##

# torrentファイルをダウンロードした時、自動でBTタスクを開始する。デフォルト:true
#follow-torrent=true
# BTリスニングポート。ポートがブロックされている時に使用。デフォルト:6881-6999
listen-port=51413
# 1タスクあたりの最大ピア数。デフォルト:55
#bt-max-peers=55
# DHT機能を有効にする。PTの場合は無効にする。デフォルト:true
enable-dht=false
# IPv6 DHT機能を有効にする。PTの場合は無効にする
#enable-dht6=false
# DHTネットワークのリスニングポート。デフォルト:6881-6999
#dht-listen-port=6881-6999
# ローカルピア探索（LPD）。PTの場合は無効にする。デフォルト:false
#bt-enable-lpd=false
# ピア交換（PEX）。PTの場合は無効にする。デフォルト:true
enable-peer-exchange=false
# 各ピアの速度制限。シードが少ないPTで有用。デフォルト:50K
#bt-request-peer-speed-limit=50K
# クライアント偽装。PTで必要
peer-id-prefix=-TR2770-
user-agent=Transmission/2.77
# シードの共有率がこの値に達したら自動で停止する。0はずっとシードし続ける。デフォルト:1.0
seed-ratio=0.7
# タスク完了後でも強制的にセッションを保存する。デフォルト:false
# 新しめのバージョンで有効にすると、完了後も.aria2ファイルが残る
#force-save=false
# BTハッシュチェック関連。デフォルト:true
#bt-hash-check-seed=true
# 前回のBTタスクを再開する時、再度ハッシュチェックをしない。デフォルト:false
bt-seed-unverified=true
# マグネットリンクのメタデータをtorrentファイルとして保存する。デフォルト:false
bt-save-metadata=true
```

**注意：以下の4行は自分の環境に合わせて、実際のファイルがあるパスに書き換えてね**：

```conf
# ファイルの保存先パス
dir=E:\Aria2Download
# ログファイルの保存先パス
log=D:\aria2-1.36.0-win-64bit-build1\Aria2.log
# セッションファイルから読み込む
input-file=D:\aria2-1.36.0-win-64bit-build1\aria2.session
# セッションファイルへ保存する
save-session=D:\aria2-1.36.0-win-64bit-build1\aria2.session
```

最後の2行はダウンロード履歴を保存するためのものだよ。もしAria2が起動しなくなった時は、そのファイルの中身を空にすれば直ることがあるよ。

2. HideRun.vbs ファイルの編集

HideRun.vbsを開いて、これを追加してね。

```vbs
CreateObject("WScript.Shell").Run "aria2c.exe --conf-path=aria2.conf",0
```

次に `HideRun.vbs` をクリックして実行してみて（注意：実行ファイル本体じゃなくて、必ず `HideRun.vbs` を実行してね！）。エラーが出なければ、下の補足は読み飛ばして大丈夫だよ。

ちょっと注意点なんだけど、ここには実行ファイルのフルパスを書くこともできるんだ。でも、そのパスの中にスペースが入っていると動かないから気をつけて。

例えば：

```vbs
CreateObject("WScript.Shell").Run "C:\Users\he ne\Downloads\aria2c.exe --conf-path=aria2.conf",0
```

この場合、`he ne` というフォルダ名にスペースが入っているから、システムが認識できなくてエラーになるんだ。よくあるのは `D:\Program Files (x86)` とかだね。解決策は、vbsファイルをaria2のフォルダと同じ場所に置いて、パスの指定をファイル名だけにする（パスを除去する）ことだよ。

3. index.html を開く

![img](https://cdn.statically.io/gh/hiyoung3937/img_hiyoung@master/bolg/Aria2+AriaNG%E9%85%8D%E7%BD%AE%E4%BD%BF%E7%94%A8_1.1ohxweqn3ayo.jpg)

フォルダ内の `index.html` を開いて、「接続済み」と表示されていれば設定完了！

4. PC起動時に自動実行する

`HideRun.vbs` のショートカットを作成して、Windowsのスタートアップフォルダに入れておこう。

実行ウィンドウ（Win + R）で `shell:startup` と入力してみて。

これでスタートアップフォルダが開くから、そこにさっき作ったショートカットを放り込めばOKだよ。

- - - - - -

参考記事:

[Aria2+AriaNG 設定ガイド（Win10編）](https://www.higgs.xyz/archives/7/)

[AriaNGドキュメント](http://ariang.mayswind.net/zh_Hans/)
