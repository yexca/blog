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
    - 設定経験
tags:
    - Aria2
    - ダウンロードツール
---

{{< notice >}} この記事は deepseek-v4-flash によって翻訳されました {{< /notice >}}

> この記事は [Hiyoung](https://blog.hiyoung.icu/) によって書かれました。
>
> 記事: <https://blog.hiyoung.icu/2022/09/01/906d191f9a59/>

Aria2はLinux向けのダウンロードツールですが、ここではWindowsでのインストールと設定について紹介します。公式のAria2にはGUIがないため、AriaNGと組み合わせてWebブラウザ上で操作できます。

AriaNgは、aria2をより使いやすくするモダンなWebフロントエンドです。AriaNgは純粋なHTMLとJavaScriptで開発されているため、コンパイラやランタイム環境は必要ありません。

## Aria2+AriaNGの最新インストールパッケージのダウンロード

まず公式サイトからインストールパッケージをダウンロードします。

- **[Aria2のGitHubリポジトリ](https://github.com/aria2/aria2/releases/)**

 – **[Aria2公式ドキュメント](https://aria2.github.io/)**

- **[AriaNGのGitHubリポジトリ](https://github.com/mayswind/AriaNg/releases)**

 – **[AriaNG公式ドキュメント](http://ariang.mayswind.net/zh_Hans/)**

Aria2は対応するOSの圧縮ファイルをダウンロードし、AriaNGは解凍後、Aria2のフォルダに配置します。

AriaNgには現在、標準版、単一ファイル版、AriaNg Nativeの3つのバージョンがあります。

> 標準版はWebサーバーへのデプロイに適しており、リソースキャッシュとオンデマンドロード機能を提供します。
>
> 単一ファイル版はローカル使用に適しており、ダウンロード後はブラウザでHTMLファイルを開くだけです。
>
> AriaNg Nativeもローカル使用に適しており、ブラウザを必要としません。

## 設定ファイルの追加

ファイルをこのディレクトリに解凍した後、さらに4つの空ファイルを作成する必要があります（最初に空のテキストファイルを作成し、拡張子を変更しても構いません）。

- **Aria2.log （ログファイル）**
- **aria2.session （ダウンロード履歴を記録し、レジューム機能を有効にするため）**
- **aria2.conf （設定ファイル）**
- **HideRun.vbs （CMDウィンドウを非表示にして実行するために使用）**

### 設定ファイルの編集

1. 先ほど作成した空の aria2.conf ファイルを開き、以下の内容を記入します（メモ帳で開いて構いません）。

```conf
## '#'で始まる行はコメントです。各オプションにはコメントによる説明があります。必要に応じて変更してください ##
## コメントアウトされたオプションはデフォルト値です。変更する際はコメントを解除してください ##

## ファイル保存関連 ##

# ファイルの保存先パス（絶対パスまたは相対パスを使用可能）、デフォルト：現在の起動位置
dir=E:\Aria2Download
# ログファイルの保存先パス
log=D:\aria2-1.36.0-win-64bit-build1\Aria2.log
log-level=notice
# 問題のみ記録したい場合は log-level=warn に変更してください
# ディスクキャッシュを有効化、0で無効、1.16以降のバージョンが必要、デフォルト：16M
#disk-cache=32M
# ファイル事前割り当て方式、ディスク断片化を効果的に低減、デフォルト：prealloc
# 事前割り当てに必要な時間：none < falloc ? trunc < prealloc
# fallocとtruncはファイルシステムとカーネルのサポートが必要
# NTFSではfalloc推奨、EXT3/4ではtrunc推奨、Macではこの行をコメントアウト
#file-allocation=none
# 断点レジューム
continue=true

## ダウンロード接続関連 ##

# 最大同時ダウンロード数、実行時に変更可能、デフォルト：5
#max-concurrent-downloads=5
# 同一サーバーへの接続数、追加時に指定可能、デフォルト：1
max-connection-per-server=5
# 最小ファイル分割サイズ、追加時に指定可能、範囲1M -1024M、デフォルト：20M
# size=10M、ファイルが20MiBの場合は2つのソース、15MiBの場合は1つのソースを使用
min-split-size=10M
# 単一タスクの最大スレッド数、追加時に指定可能、デフォルト：5
#split=5
# 全体のダウンロード速度制限、実行時に変更可能、デフォルト：0
#max-overall-download-limit=0
# 単一タスクのダウンロード速度制限、デフォルト：0
#max-download-limit=0
# 全体のアップロード速度制限、実行時に変更可能、デフォルト：0
#max-overall-upload-limit=0
# 単一タスクのアップロード速度制限、デフォルト：0
#max-upload-limit=0
# IPv6を無効化、デフォルト：false
#disable-ipv6=true
# 接続タイムアウト時間、デフォルト：60
#timeout=60
# 最大リトライ回数、0で無制限、デフォルト：5
#max-tries=5
# リトライ待機秒数、デフォルト：0
#retry-wait=0

## 進捗保存関連 ##

# セッションファイルからダウンロードタスクを読み込む
input-file=D:\aria2-1.36.0-win-64bit-build1\aria2.session
# Aria2終了時に「エラー/未完了」のダウンロードタスクをセッションファイルに保存
save-session=D:\aria2-1.36.0-win-64bit-build1\aria2.session
# 定期的にセッションを保存、0は終了時のみ保存、1.16.1以降必要、デフォルト：0
#save-session-interval=60

## RPC設定 ##

# RPCを有効化、デフォルト：false
enable-rpc=true
# 全ての送信元を許可、デフォルト：false
rpc-allow-origin-all=true
# 外部からのアクセスを許可、デフォルト：false
rpc-listen-all=true
# イベントポーリング方式、値：[epoll, kqueue, port, poll, select]、システムによりデフォルト異なる
#event-poll=select
# RPCリッスンポート、ポート競合時は変更可能、デフォルト：6800
#rpc-listen-port=6800
# RPC認証トークン、v1.18.4で追加、--rpc-user と --rpc-passwd オプションの代替
#rpc-secret=<TOKEN>
# RPCアクセスユーザー名、このオプションは新バージョンで非推奨、--rpc-secret を使用推奨
#rpc-user=<USER>
# RPCアクセスパスワード、このオプションは新バージョンで非推奨、--rpc-secret を使用推奨
#rpc-passwd=<PASSWD>
# RPCサービスのSSL/TLS暗号化を有効化
# 暗号化有効時、RPCサービスはhttpsまたはwssプロトコルで接続
#rpc-secure=true
# SSL/TLS暗号化時の証明書ファイル
# PEM形式使用時、--rpc-private-key で秘密鍵を指定
#rpc-certificate=/path/to/certificate.pem
# SSL/TLS暗号化時の秘密鍵ファイル
#rpc-private-key=/path/to/certificate.key

## BT/PTダウンロード関連 ##

# ダウンロードがトレントファイル（.torrentで終わる）の場合、自動でBTタスク開始、デフォルト：true
#follow-torrent=true
# BTリッスンポート、ポートがブロックされている場合に使用、デフォルト：6881-6999
listen-port=51413
# 単一トレントの最大ピア接続数、デフォルト：55
#bt-max-peers=55
# DHT機能を有効化、PTでは無効化必須、デフォルト：true
enable-dht=false
# IPv6 DHT機能を有効化、PTでは無効化
#enable-dht6=false
# DHTネットワークリッスンポート、デフォルト：6881-6999
#dht-listen-port=6881-6999
# ローカルノード検索、PTでは無効化、デフォルト：false
#bt-enable-lpd=false
# ピア交換、PTでは無効化、デフォルト：true
enable-peer-exchange=false
# 各トレントの速度制限、種の少ないPTで有用、デフォルト：50K
#bt-request-peer-speed-limit=50K
# クライアント偽装、PTで必要
peer-id-prefix=-TR2770-
user-agent=Transmission/2.77
# トレントの共有率がこの値に達したら自動でシード停止、0は永続シード、デフォルト：1.0
seed-ratio=0.7
# セッションを強制保存、タスク完了後も、デフォルト：false
# 新しいバージョンでは有効にするとタスク完了後も.aria2ファイルを保持
#force-save=false
# BTチェック関連、デフォルト：true
#bt-hash-check-seed=true
# 以前のBTタスクを継続時、再チェック不要、デフォルト：false
bt-seed-unverified=true
# マグネットリンクのメタデータをトレントファイル（.torrentファイル）として保存、デフォルト：false
bt-save-metadata=true
```

**注意：以下の4行の内容を、ご自身の環境に合わせて変更してください。**

```conf
# ファイルの保存先パス（絶対パスまたは相対パスを使用可能）、デフォルト：現在の起動位置
dir=E:\Aria2Download
# ログファイルの保存先パス
log=D:\aria2-1.36.0-win-64bit-build1\Aria2.log
# セッションファイルからダウンロードタスクを読み込む
input-file=D:\aria2-1.36.0-win-64bit-build1\aria2.session
# Aria2終了時に「エラー/未完了」のダウンロードタスクをセッションファイルに保存
save-session=D:\aria2-1.36.0-win-64bit-build1\aria2.session
```

最後の2行はダウンロード履歴を保存するためのものです。Aria2が起動しない場合は、これらのファイルの中身を空にしてください。

2. HideRun.vbs ファイルを編集

HideRun.vbsファイルを開き、以下を追加します。

```vbs
CreateObject("WScript.Shell").Run "aria2c.exe --conf-path=aria2.conf",0
```

次に、HideRun.vbs ファイルを実行します（注意：必ず HideRun.vbs ファイルであって、実行可能ファイルではないことを確認してください！！）。エラーが出なければ、以下の部分はスキップして問題ありません。

注意：ここではファイルの前に具体的なディレクトリパスを追加することもできますが、そのパスにスペースを含めてはいけません。

例:

```vbs
CreateObject("WScript.Shell").Run "C:\Users\he ne\Downloads\aria2c.exe --conf-path=aria2.conf",0
```

しかし、he ne フォルダにスペースが含まれているため、システムが認識できません。同様の問題は D:Program Files (x86) などでもよく発生します。この場合の解決方法は、パスプレフィックスを削除することです（ただし、vbsファイルは aria2 フォルダ内に配置されている必要があります）。

3. index.html を開く

![img](https://cdn.statically.io/gh/hiyoung3937/img_hiyoung@master/bolg/Aria2+AriaNG%E9%85%8D%E7%BD%AE%E4%BD%BF%E7%94%A8_1.1ohxweqn3ayo.jpg)

中の index.html ファイルを開き、「已连接」（接続済み）と表示されれば、セットアップ成功です。

4. 自動起動の設定

HideRun.vbs ファイルのショートカットを作成し、Windowsの自動起動フォルダに配置します。

ファイル名を指定して実行（Win+R）で `shell:startup` と入力します。

これで自動起動フォルダが開くので、先ほどのショートカットをドラッグ＆ドロップします。

- - - - - -

参考記事:

[Aria2+AriaNG 設定ガイド（Win10編）](https://www.higgs.xyz/archives/7/)

[AriaNGドキュメント](http://ariang.mayswind.net/zh_Hans/)