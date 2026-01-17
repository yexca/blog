---
slug: 180
# layout: post
title: 'Onedriveでサイト作成 (oneindex)'
author: yexca
date: 2024-08-27T11:00:24+08:00
# permalink: /archives/180
categories:
    - 開発実践
tags:
    - OneDrive
    - サイト作成の実践
---  

{{< notice >}} この記事は gemini-3-flash-preview によって翻訳されました {{< /notice >}}

この記事は 2022年5月9日に書かれたもので、最新のアップデートには対応していないから、今は再現できないかもしれない。もっと新しいプロジェクトを使うのがおすすめだよ。

Onedriveを使えば、オンラインストレージサイトが作れるんだ。例えば、~~僕のVRChat用ストレージ~~（もうなくなっちゃったけど）みたいに、直接ウェブページとして公開したり、画像ホスティングとして使ったりできるよ。

## oneindex について

Github: <https://github.com/avedu/oneindex>

Onedrive Directory Indexといって、サーバーの容量を圧迫しないし、サーバー側の通信量も使わない。OneDriveのディレクトリを直接リスト表示して、ファイルを直リンクでダウンロードできる優れものなんだ。

## 環境

PHP 5.6以上が必要で、curlのサポートを有効にしておく必要があるよ。初心者（~~僕みたいにね~~）なら、[宝塔 (BT Panel)](https://bt.cn) を使ってデプロイするのが手軽で便利だと思う。

あと、宝塔のプライバシー問題が気になるなら、[宝塔純浄版](https://support.hostcli.com/) とかの別バージョンもあるから、自分で調べてインストールしてみてね。

## インストール

Githubからリポジトリをダウンロードして、サイトのルートディレクトリにアップロードして解凍しよう。

それからサイトにアクセスして、インストールプログラムを開始するよ。

### チェック

まずは規約への同意。もし「同意」をクリックして元のページに戻っちゃう場合は、アドレスバーの最後にある `&mdui-dialog` を削除してEnterを押してみて。

環境に問題がなければ「次へ」をクリック。

### プログラムのインストール

「アプリIDとシークレットを取得（2ページに分かれて表示されるから保存を忘れずに）」をクリックして、Microsoftアカウントでログインしてね。

表示された「アプリシークレット」を保存して、「わかった、クイックスタートに戻る」をクリックする。

**注意**：このシークレットは一度しか表示されないから、大切に保管してね。

次に、言語（例えば `Python` とか）を選んで「Get a client ID」をクリック。表示された `Client ID` をコピーしよう。

インストール画面に戻って、「アプリシークレット」と「Client ID」を入力して「次へ」をクリック。

「アカウントを紐付ける」をクリックして、「承諾」を選べばOK。

**もしエラーが出たら**

「アプリシークレット」と「Client ID」を入力する画面に戻って、[Azure のアプリ登録](https://portal.azure.com/#blade/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/RegisteredApps) を開いてみて。そこに2つアプリがあるはず。

`oneindex` という名前のアプリを探して、その「アプリケーション (クライアント) ID」をコピーして `Client ID` に入力してみて。

もう一つのいらないアプリは消しちゃって大丈夫。

## 管理

インストールが終わると、「管理画面」と「サイトを表示」の選択肢が出るよ。

管理画面に入れば、サイト名やテーマ、管理パスワード（初期パスワードは `oneindex`）を変更できる。

管理画面のURLは `君のドメイン/?/admin` になるよ。

## 擬似静的 (Rewrite)

ApacheやNginxのrewrite設定をする（Wordpressの設定をそのまま使えばOK）。

これは元の作者の説明（一部修正してるけど）なんだけど、僕は [宝塔](https://bt.cn) を使ってるから、その設定方法を書いておくね。

宝塔パネルの「サイト」設定から「擬似静的（URL書き換え）」を選んで、`wordpress` を選択して保存するだけ。

そのあと、サイトの管理画面で「擬似静的」にチェックを入れて保存すれば完了。

これでURLから `?` が消えて、管理画面にも `君のドメイン/admin` でアクセスできるようになるよ。

## 特殊ファイルで機能を追加

~~Markdownの書き方はこの記事を参考にしてみてね~~：[Markdownメモ](https://blog.yexca.net/archives/43)

**フォルダの下部に説明を追加する:**

> OneDriveのフォルダ内に `README.md` ファイルを作って、Markdown形式で書く。

**フォルダの上部に説明を追加する:**

> OneDriveのフォルダ内に `HEAD.md` ファイルを作って、Markdown形式で書く。

**フォルダにパスワードをかける:**

> OneDriveのフォルダ内に `.password` ファイルを作って、パスワードを書き込む（空欄はダメだよ）。

**直接ウェブページを表示する:**

> OneDriveのフォルダ内に `index.html` ファイルを置くと、ディレクトリ一覧を表示せずに、直接そのページが表示される。
> 「ファイル表示設定 - 直接出力」を合わせるともっと使いやすくなるよ。

直接ページを出せるから、そのままウェブサイトとして運用もできるんだ。

## 他のファイルは見れるのに、画像だけ404になる場合

これはサーバーソフト (Nginx/Apache) が画像の処理を横取りしちゃってるのが原因。設定を消せば直るよ。

宝塔を使っている場合はこんな感じ：

「サイト」の「設定ファイル」から、以下のコードをコメントアウトすればOK。

```nginx
location ~ .*\.(gif|jpg|jpeg|png|bmp|swf)$
{
  expires      30d;
  access_log on; 
}
```

こんな風に変更してね：

```nginx
#location ~ .*\.(gif|jpg|jpeg|png|bmp|swf)$
#{
#  expires      30d;
#  access_log on; 
#}
```

この問題は [部署 OneDrive for business (PHP) 客户端程序 OneIndex 详细教程 - VirCloud's Blog](https://vircloud.net/media/oneindex.html#selection-997.0-997.84) を参考にしたよ。

## コマンドライン機能

PHP CLI モードでのみ動作するよ。

**キャッシュをクリア:**

```bash
php one.php cache:clear
```

**キャッシュを更新:**

```bash
php one.php cache:refresh
```

**トークンを更新:**

```bash
php one.php token:refresh
```

**ファイルをアップロード:**

```bash
php one.php upload:file ローカルファイル [OneDrive上のパス]
```

**フォルダをアップロード:**

```bash
php one.php upload:folder ローカルフォルダ [OneDrive上のパス]
```

例：

```bash
// demo.zip を OneDrive のルートにアップロード
php one.php upload:file demo.zip  

// demo.zip を OneDrive の /test/ フォルダにアップロード
php one.php upload:file demo.zip /test/  

// demo.zip を OneDrive の /test/ に d.zip という名前でアップロード
php one.php upload:file demo.zip /test/d.zip  

// up/ フォルダを OneDrive の /test/ にアップロード
php one.php upload:file up/ /test/
```

## 定期実行 (Cron)

[オプション] **推奨設定**。必須じゃないけど、バックグラウンドでキャッシュを自動更新しておくと、サイトの表示が速くなるよ。

```bash
# 1時間ごとにトークンを更新
0 * * * * /phpのパス/php /プログラムのパス/one.php token:refresh

# 10分ごとにキャッシュを更新
*/10 * * * * /phpのパス/php /プログラムのパス/one.php cache:refresh
```

## Dockerでのインストール

こっちの [TimeBye/oneindex](https://github.com/TimeBye/oneindex) を参考にしてみて。
