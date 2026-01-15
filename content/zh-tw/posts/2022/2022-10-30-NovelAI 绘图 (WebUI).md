---
slug: 77
title: 'NovelAI 繪圖 (WebUI)'
date: '2022-10-30T16:23:07+08:00'
author: yexca
# layout: post
# permalink: /archives/77
views:
    - '1092'
categories:
    - 折騰經驗
tags:
    - AI
    - NovelAI
---

{{< notice >}} 本文由 gemini-2.5-flash-lite 翻譯 {{< /notice >}}

使用 Windows11 部署，其他系統 (如 Linux ) 請參考：[AUTOMATIC1111/stable-diffusion-webui: Stable Diffusion web UI](https://github.com/AUTOMATIC1111/stable-diffusion-webui#automatic-installation-on-linux)

## 空間佔用

程式：5.3GiB (不含模型)

運行：5.5GiB 以上

請確保 C 碟空間至少 6GiB 再運行，否則電腦可能黑屏卡死

## 環境

首先是網路環境，請確保連接上網際網路

1. Git

   官網：<https://git-scm.com/>

2. Python 3.10.6 以上 *(最新版本可能不穩定)*

   建議 3.10.8：<https://www.python.org/downloads/release/python-3108/>

   **勾選 `Add python.exe to PATH`**

3. 模型下載

   1. 官方模型 (偏寫實)

      * 透過磁力下載（請使用正規種子客戶端）

        ```bash
        magnet:?xt=urn:btih:3a4a612d75ed088ea542acac52f9f45987488d1c&dn=sd-v1-4.ckpt&tr=udp%3a%2f%2ftracker.openbittorrent.com%3a6969%2fannounce&tr=udp%3a%2f%2ftracker.opentrackr.org%3a1337
        ```

      * 其他下載方式

        訪問 [AUTOMATIC1111/stable-diffusion-webui Wiki](https://github.com/AUTOMATIC1111/stable-diffusion-webui/wiki/Dependencies)

   2. Waifu 模型(二次元啦)

      訪問 [hakurei/waifu-diffusion-v1-3 at main](https://huggingface.co/hakurei/waifu-diffusion-v1-3/tree/main) 選擇下載

   3. 其他

      [Stable Diffusion Models (cyberes.github.io)](https://cyberes.github.io/stable-diffusion-models/)

## 克隆倉庫

選擇一個合適的位置，右鍵選擇 *在終端機中開啟* ，然後輸入以下指令

```bash
git clone https://github.com/AUTOMATIC1111/stable-diffusion-webui.git
```

更新時可以進入該目錄 (stable-diffusion-webui) 後使用 `git pull` 指令

## 設定

1. 將下載的模型放入 `/models/Stable-diffusion` 目錄

2. 設定 `/webui-user.bat` 檔案
   在`set VENV_DIR=` 後任意輸入字串，然後儲存退出

3. 運行 `/webui-user.bat` 檔案

   > 下載檔案過大 (6GiB 左右) ，可能會運行較長時間，期間無進度條提示（若感覺程式終止之類的，可透過網路頻寬使用情況以判斷是否正在下載）

---

* 如果您的顯示卡是 GTX1660 或者算出來的圖是黑色的

  編輯 `webui.bat` ，在開頭加入以下文字

  ```bash
  set COMMANDLINE_ARGS=--precision full --no-half
  ```

---

## 其他

詳細了解：[hua1995116/awesome-ai-painting: AI绘画资料合集（包含国内外可使用平台、使用教程、参数教程、部署教程、业界新闻等等） stable diffusion tutorial、disco diffusion tutorial、 AI Platform](https://github.com/hua1995116/awesome-ai-painting)

訓練模型：[NovelAI hypernetwork 自訓練教程 - 知乎](https://zhuanlan.zhihu.com/p/576041621)

[NovelAI軟體獲取 - novelai 資源站 咩小咩壁紙|NovelAI資源站](https://novelai.club/archives/js)

關鍵字例子

```bash
NSFW, Prhololive, uruha_rushia, 1girl, bangs, bare shoulders, red eyes, blue dress, blue green hair, blue sleeves, blush, bow, breasts, chick, collarbone, detached
collar, detached sleeves, double bun, eyebrows visible through hair, frills, hair orhament, medium hair, off-shoulder dress
```

## 參考文章

[最火的AI绘画教程！免费开源，包教会 - 零度解说](https://www.freedidi.com/6727.html)

[【心得】(NSFW) AI 色圖製作體驗 + 關鍵字 @場外休憩區 哈啦板 - 巴哈姆特](https://forum.gamer.com.tw/C.php?page=1&bsn=60076&snA=7378038)
