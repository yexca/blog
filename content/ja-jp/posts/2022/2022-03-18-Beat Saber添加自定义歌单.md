---
slug: 31
title: 'Beat Saber にカスタム楽曲を追加する方法'
date: '2022-03-18T17:46:00+08:00'
author: yexca
# layout: post
# permalink: /archives/31
views:
    - '1049'
categories:
    - 試行錯誤
tags:
    - Game
    - Beat Saber
---

{{< notice >}} この記事は gemini-2.5-flash-lite によって翻訳されました {{< /notice >}}

## はじめに

最近、Beat Saber を購入した（もちろん、アルゼンチンリージョンでね）。それで、カスタム楽曲を追加したいなと思って、Steam のコメント欄で、WGzeyu さんっていうすごい人がチュートリアルを出してるって知ったんだ。でも、俺の目的はシンプルだから、そのチュートリアルはちょっと詳細すぎるんだよね。だから、この記事で要点をまとめてみることにしたよ。

## 一、準備

※注： **2022.03.25 追記：今日、関連ファイルをチェックしたら、バージョン 1.20.0 でも Mod が使えるようになったみたい！だから、直接ステップ 2 を見てね。あと、データ復旧の部分も更新したよ。**

### 1）ダウングレード

現在最新のバージョン 1.20.0 では Mod が使えないから、まずはダウングレードする必要があるんだ。Mod が更新されたら、またアップグレードすればいいからね。

#### ＜1＞バージョン 1.19.0 またはそれ以前をダウンロード

WGzeyu さんが提供してるネットワークドライブからダウンロードできるよ。[WGzeyu大佬提供的网盘](https://zfile.imoto.love/#/1/main/%E6%B8%B8%E6%88%8F%E5%A4%87%E4%BB%BD%E4%B8%8E%E6%87%92%E4%BA%BA%E5%8C%85) で、欲しいバージョンを選んでダウンロードしてね。

ファイル直リンク：[1.19.0](https://zfile.backend.imoto.love/BeatSaber%E8%B5%84%E6%BA%90/%E6%B8%B8%E6%88%8F%E5%A4%87%E4%BB%BD%E4%B8%8E%E6%87%92%E4%BA%BA%E5%8C%85/%E6%9B%B4%E6%96%B0%E4%BA%8E%5B2021-12-10%5D_BS1.19.0-Steam%E5%8E%9F%E7%89%88%E5%A4%87%E4%BB%BD.7z?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20220318T091129Z&X-Amz-SignedHeaders=host&X-Amz-Expires=1800&X-Amz-Credential=0021598ce5a9e88000000000a/20220318/us-west-002/s3/aws4_request&X-Amz-Signature=cc2be80e633bee85d365eeae7eecc84246daeea5cc1b54d8cdb1e090aaf3cd16)[steam版](https://zfile.backend.imoto.love/BeatSaber%E8%B5%84%E6%BA%90/%E6%B8%B8%E6%88%8F%E5%A4%87%E4%BB%BD%E4%B8%8E%E6%87%92%E4%BA%BA%E5%8C%85/%E6%9B%B4%E6%96%B0%E4%BA%8E%5B2021-12-10%5D_BS1.19.0-Steam%E5%8E%9F%E7%89%88%E5%A4%87%E4%BB%BD.7z?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20220318T091129Z&X-Amz-SignedHeaders=host&X-Amz-Expires=1800&X-Amz-Credential=0021598ce5a9e88000000000a/20220318/us-west-002/s3/aws4_request&X-Amz-Signature=cc2be80e633bee85d365eeae7eecc84246daeea5cc1b54d8cdb1e090aaf3cd16)

#### ＜2＞バージョン 1.20.0 を置き換える

ダウンロードしたファイルを解凍して、Steam でゲームのインストールフォルダを開く。一つ上の階層に戻って、「Beat Saber」フォルダの名前を「Beat Saber 1.20.0」に変更する。そして、さっきダウンロードしたファイルを「Beat Saber」にリネームして、このフォルダに移動させるんだ。

#### ＜3＞データの復旧方法

＜1＞Steam でゲームのフォルダを開いて、`UserData` フォルダの中にある `Beat Saber IPA` を削除する。
＜2＞以下のフォルダをコピーする（必要に応じてコピーしてね）。

* `UserData` （Mod の設定）
* `CustomSabers` （ライトセーバーのモデル）
* `CustomPlatforms` （ステージのモデル）
* `CustomAvatars` （アバターのモデル）
* `CustomNotes` （ブロックのモデル）

＜3＞次に、「Beat Saber 1.20.0」フォルダを開いて、コピーしたフォルダを貼り付ける。確認画面が出たら、「置き換える」を選択する。
＜4＞「Beat Saber」フォルダを開いて、「Beat Saber\_Data」フォルダに入る。`CustomLevels` フォルダを切り取る。
＜5＞「Beat Saber 1.20.0」フォルダを開いて、「Beat Saber\_Data」フォルダに入る。切り取ったフォルダを貼り付ける。確認画面が出たら、「置き換える」を選択する。

最後に、「Beat Saber」フォルダを削除して、「Beat Saber 1.20.0」フォルダの名前を「Beat Saber」に変更する。

### 2）関連ソフトウェア

#### ＜1＞Mod マネージャー「ModAssistant」

このソフトウェアには英語版と中国語版があるから、好きな方を選んでダウンロードしてね。ネットワークドライブからダウンロードできるよ：[網盤連結](https://zfile.imoto.love/#/1/main/%E5%B7%A5%E5%85%B7%EF%BC%88%E5%A6%82Mod%E5%AE%89%E8%A3%85%E5%99%A8%E3%80%81%E8%B0%B1%E9%9D%A2%E7%BC%96%E8%BE%91%E5%99%A8%E7%AD%89BS%E7%9B%B8%E5%85%B3%E8%BD%AF%E4%BB%B6%EF%BC%89)

ファイル直リンク：[ModAssistant中国語拡張版Modインストーラー、PC対応Quest非対応](https://zfile.backend.imoto.love/BeatSaber%E8%B5%84%E6%BA%90/%E5%B7%A5%E5%85%B7%EF%BC%88%E5%A6%82Mod%E5%AE%89%E8%A3%85%E5%99%A8%E3%80%81%E8%B0%B1%E9%9D%A2%E7%BC%96%E8%BE%91%E5%99%A8%E7%AD%89BS%E7%9B%B8%E5%85%B3%E8%BD%AF%E4%BB%B6%EF%BC%89/ModAssistant%E4%B8%AD%E6%96%87%E5%A2%9E%E5%BC%B7%E7%89%88Mod%E5%AE%89%E8%A3%85%E5%99%A8%EF%BC%8C%E6%94%AF%E6%8C%81PC%E4%B8%8D%E6%94%AF%E6%8C%81Quest.exe?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20220318T092216Z&X-Amz-SignedHeaders=host&X-Amz-Expires=1800&X-Amz-Credential=0021598ce5a9e88000000000a/20220318/us-west-002/s3/aws4_request&X-Amz-Signature=e26018f6434606a63ca2bc428fa1c87d1d60cfbbdbf8afb6375aa282308f0405)

#### ＜2＞BeatSaber 楽曲パスマネージャー

これもさっきのネットワークドライブからダウンロードできるよ。ファイル直リンク：[BeatSaber 楽曲パスマネージャー](https://zfile.backend.imoto.love/BeatSaber%E8%B5%84%E6%BA%90/%E5%B7%A5%E5%85%B7%EF%BC%88%E5%A6%82Mod%E5%AE%89%E8%A3%85%E5%99%A8%E3%80%81%E8%B0%B1%E9%9D%A2%E7%BC%96%E8%BE%91%E5%99%A8%E7%AD%89BS%E7%9B%B8%E5%85%B3%E8%BD%AF%E4%BB%B6%EF%BC%89/BeatSaber%E6%AD%8C%E6%9B%B2%E8%B7%AF%E5%BE%84%E7%AE%A1%E7%90%86%E5%99%A8-5.3.exe?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20220318T092357Z&X-Amz-SignedHeaders=host&X-Amz-Expires=1800&X-Amz-Credential=0021598ce5a9e88000000000a/20220318/us-west-002/s3/aws4_request&X-Amz-Signature=bef28996aa91b4c2caebc67e9fc85bc6c5287060682159bb1e421a0be2df1dd6) （バージョン 5.3、アップデートで使えなくなってるかも）

#### ＜3＞ResilioSync

これもさっきのネットワークドライブからダウンロードできるよ。公式サイトはこちら：[ResilioSync](https://www.resilio.com/individuals/)

ファイル直リンク：[ResilioSync 64bit](https://zfile.backend.imoto.love/BeatSaber%E8%B5%84%E6%BA%90/%E5%B7%A5%E5%85%B7%EF%BC%88%E5%A6%82Mod%E5%AE%89%E8%A3%85%E5%99%A8%E3%80%81%E8%B0%B1%E9%9D%A2%E7%BC%96%E8%BE%91%E5%99%A8%E7%AD%89BS%E7%9B%B8%E5%85%B3%E8%BD%AF%E4%BB%B6%EF%BC%89/Resilio-Sync_64bit.exe?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20220318T093036Z&X-Amz-SignedHeaders=host&X-Amz-Expires=1800&X-Amz-Credential=0021598ce5a9e88000000000a/20220318/us-west-002/s3/aws4_request&X-Amz-Signature=35909c49580c01baa00f853fb4d7a77a1344cd2cc618d8584997dc3be85df0a0)

### 3）フォルダ

さっき紹介したソフトウェアは、ResilioSync 以外は単一ファイルで動くものが多いから、よく使うフォルダにまとめておくといいよ。

あとは、曲を置きたい場所にフォルダを作っておこう。例えば、「E:\\games\\Beat Saber Song\\」みたいに、好きな場所でOK。

## 二、手順

### 1）Beat Saber を一度起動する

### 2）「ModAssistant」を開く

「同意する」をクリックすると、左側の「Mod」画面に入れるよ。画面左下でゲームのバージョンを選択して、Mod をインストールするか、そのままインストールを開始してね。

もしダウンロードが遅い場合は、「オプション」からソフトウェアのソースを国内のものに変更するといいよ。

### 3）Beat Saber をもう一度起動する

### 4）ResilioSync を開く

この部分の手順は、こちらの記事を参考にしてね：[Beat Saber 曲パックリソース同期 – ResilioSync (wgzeyu.com)](https://bs.wgzeyu.com/songs/)
どうせこのウェブサイトは開くことになるから、すでに手順が書いてあるし、俺は書かないよ（めんどくさがり）。

フォルダのダウンロード先は、さっき作ったフォルダを選ぶんだ。

### 5）BeatSaber 楽曲パスマネージャーを開く

初めて開くときは、指示に従って進んでね。「ディレクトリを追加」をクリックして、曲を置くディレクトリ（さっきダウンロードしたフォルダの場所）を選択する。

そして、「リストを保存」をクリックすれば完了！

## 三、その後

もし他にやりたいことがあるなら、[WGzeyu](https://bs.wgzeyu.com/) さんの[チュートリアル](https://bs.wgzeyu.com/pc-guide/) を参考にしてみてね。
