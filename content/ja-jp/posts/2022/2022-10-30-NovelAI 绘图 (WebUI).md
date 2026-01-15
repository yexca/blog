---
slug: 77
title: 'NovelAI 描画 (WebUI)'
date: '2022-10-30T16:23:07+08:00'
author: yexca
# layout: post
# permalink: /archives/77
views:
    - '1092'
categories:
    - 試行錯誤
tags:
    - AI
    - NovelAI
---

{{< notice >}} この記事は gemini-2.5-flash-lite によって翻訳されました {{< /notice >}}

Windows11 での導入方法だよ。他のシステム（Linux とか）は、[AUTOMATIC1111/stable-diffusion-webui: Stable Diffusion web UI](https://github.com/AUTOMATIC1111/stable-diffusion-webui#automatic-installation-on-linux) を参照してね。

## 容量について

プログラム：5.3GiB (モデル含まず)

実行時：5.5GiB 以上

C ドライブの空き容量が最低でも 6GiB あることを確認してから実行してね。そうじゃないと、PC がブラックアウトして固まっちゃうかもしれないから。

## 環境構築

まず、インターネットに繋がってることを確認してね。

1. Git

   公式サイト：<https://git-scm.com/>

2. Python 3.10.6 以上 *(最新バージョンは不安定な場合があるよ)*

   3.10.8 がおすすめ：<https://www.python.org/downloads/release/python-3108/>

   **「`Add python.exe to PATH`」にチェックを入れるのを忘れずに！**

3. モデルのダウンロード

   1. 公式モデル (リアル寄り)

      * マグネットリンクからダウンロード (ちゃんとした torrent クライアントを使ってね)

        ```bash
        magnet:?xt=urn:btih:3a4a612d75ed088ea542acac52f9f45987488d1c&dn=sd-v1-4.ckpt&tr=udp%3a%2f%2ftracker.openbittorrent.com%3a6969%2fannounce&tr=udp%3a%2f%2ftracker.opentrackr.org%3a1337
        ```

      * その他のダウンロード方法

        [AUTOMATIC1111/stable-diffusion-webui Wiki](https://github.com/AUTOMATIC1111/stable-diffusion-webui/wiki/Dependencies) を見てみて。

   2. Waifu モデル (二次元系だよ)

      [hakurei/waifu-diffusion-v1-3 at main](https://huggingface.co/hakurei/waifu-diffusion-v1-3/tree/main) にアクセスしてダウンロードしてね。

   3. その他

      [Stable Diffusion Models (cyberes.github.io)](https://cyberes.github.io/stable-diffusion-models/)

## リポジトリのクローン

適当な場所を選んで、右クリックして「ターミナルで開く」を選んで、以下のコマンドを入力してね。

```bash
git clone https://github.com/AUTOMATIC1111/stable-diffusion-webui.git
```

更新したいときは、このディレクトリ (stable-diffusion-webui) に移動してから `git pull` コマンドを使えば OK。

## 設定

1. ダウンロードしたモデルを `/models/Stable-diffusion` ディレクトリに入れてね。

2. `/webui-user.bat` ファイルを設定しよう。
   `set VENV_DIR=` の後に適当な文字列を入れて、保存して終了してね。

3. `/webui-user.bat` ファイルを実行しよう。

   > ダウンロードするファイルが大きい (6GiB くらい) から、結構時間がかかるかもしれない。その間、進捗バーとかは出ないよ (もしプログラムが終了したように見えても、ネットワーク帯域の使用状況でダウンロード中か判断できるはず)。

---

* もし、グラフィックカードが GTX1660 だったり、生成される画像が真っ黒だったら…

  `webui.bat` を編集して、一番最初に追加するテキストはこれだよ。

  ```bash
  set COMMANDLINE_ARGS=--precision full --no-half
  ```

---

## その他

もっと詳しく知りたいなら：[hua1995116/awesome-ai-painting: AI绘画资料合集（包含国内外可使用平台、使用教程、参数教程、部署教程、业界新闻等等） stable diffusion tutorial、disco diffusion tutorial、 AI Platform](https://github.com/hua1995116/awesome-ai-painting)

モデルのトレーニング：[NovelAI hypernetwork 自訓練教程 - 知乎](https://zhuanlan.zhihu.com/p/576041621)

[NovelAI软件获取 - novelai 资源站 咩小咩壁纸|NovelAI资源站](https://novelai.club/archives/js)

プロンプトの例

```bash
NSFW, Prhololive, uruha_rushia, 1girl, bangs, bare shoulders, red eyes, blue dress, blue green hair, blue sleeves, blush, bow, breasts, chick, collarbone, detached
collar, detached sleeves, double bun, eyebrows visible through hair, frills, hair orhament, medium hair, off-shoulder dress
```

## 参考記事

[最火的AI绘画教程！免费开源，包教会 - 零度解说](https://www.freedidi.com/6727.html)

[【心得】(NSFW) AI 色圖製作體驗 + 關鍵字 @場外休憩區 哈啦板 - 巴哈姆特](https://forum.gamer.com.tw/C.php?page=1&bsn=60076&snA=7378038)
