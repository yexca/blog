---
slug: 77
title: 'NovelAI Image Generation (WebUI)'
date: '2022-10-30T16:23:07+08:00'
author: yexca
# layout: post
# permalink: /archives/77
views:
    - '1092'
categories:
    - Tinkering Experience
tags:
    - AI
    - NovelAI
---

{{< notice >}} This article was translated by gemini-2.5-flash-lite {{< /notice >}}

Deploying on Windows 11. For other systems (like Linux), refer to: [AUTOMATIC1111/stable-diffusion-webui: Stable Diffusion web UI](https://github.com/AUTOMATIC1111/stable-diffusion-webui#automatic-installation-on-linux)

## Disk Space Usage

Program: 5.3 GiB (models not included)
Runtime: 5.5 GiB+
Ensure you have at least 6 GiB free on your C: drive before running. Otherwise, your computer might freeze or crash.

## Environment

First, your network environment. Make sure you're connected to the internet.

1. **Git**
    Official site: <https://git-scm.com/>

2. **Python 3.10.6 or newer** *(Latest versions might be unstable)*
    Recommended: 3.10.8: <https://www.python.org/downloads/release/python-3108/>
    **Check `Add python.exe to PATH`**

3. **Model Downloads**

(1) **Official Models (Realistic)**

* Download via magnet link (use a legitimate torrent client)

```bash
magnet:?xt=urn:btih:3a4a612d75ed088ea542acac52f9f45987488d1c&dn=sd-v1-4.ckpt&tr=udp%3a%2f%2ftracker.openbittorrent.com%3a6969%2fannounce&tr=udp%3a%2f%2ftracker.opentrackr.org%3a1337
```

* Other download methods

Visit [AUTOMATIC1111/stable-diffusion-webui Wiki](https://github.com/AUTOMATIC1111/stable-diffusion-webui/wiki/Dependencies)

(2) **Waifu Models (Anime Style)**

Visit [hakurei/waifu-diffusion-v1-3 at main](https://huggingface.co/hakurei/waifu-diffusion-v1-3/tree/main) and select downloads.

(3) **Other Models**

[Stable Diffusion Models (cyberes.github.io)](https://cyberes.github.io/stable-diffusion-models/)

## Clone the Repository

Choose a suitable location, right-click and select *Open in Terminal*, then enter the following command:

```bash
git clone https://github.com/AUTOMATIC1111/stable-diffusion-webui.git
```

For updates, navigate to this directory (stable-diffusion-webui) and use the `git pull` command.

## Configuration

1. Place downloaded models into the `/models/Stable-diffusion` directory.
2. Configure the `/webui-user.bat` file:
    Enter any string after `set VENV_DIR=`, then save and exit.
3. Run the `/webui-user.bat` file:
    > Downloads are large (around 6 GiB) and may take a while. There's no progress bar during this time. (If it seems like the program has stopped, check your network bandwidth usage to see if downloads are active.)

---

* If your graphics card is a GTX 1660 or the generated images are black:
    Edit `webui.bat`. Add the following text at the beginning:

```bash
set COMMANDLINE_ARGS=--precision full --no-half
```

---

## More Info

Learn more: [hua1995116/awesome-ai-painting: AI绘画资料合集（包含国内外可使用平台、使用教程、参数教程、部署教程、业界新闻等等） stable diffusion tutorial、disco diffusion tutorial、 AI Platform](https://github.com/hua1995116/awesome-ai-painting)

Training Models: [NovelAI hypernetwork 自训练教程 - 知乎](https://zhuanlan.zhihu.com/p/576041621)

[NovelAI软件获取 - novelai 资源站 咩小咩壁纸|NovelAI资源站](https://novelai.club/archives/js)

Example Prompt Keywords:

```bash
NSFW, Prhololive, uruha_rushia, 1girl, bangs, bare shoulders, red eyes, blue dress, blue green hair, blue sleeves, blush, bow, breasts, chick, collarbone, detached
collar, detached sleeves, double bun, eyebrows visible through hair, frills, hair orhament, medium hair, off-shoulder dress
```

## References

[最火的AI绘画教程！免费开源，包教会 - 零度解说](https://www.freedidi.com/6727.html)

[【心得】(NSFW) AI 色圖製作體驗 + 關鍵字 @場外休憩區 哈啦板 - 巴哈姆特](https://forum.gamer.com.tw/C.php?page=1&bsn=60076&snA=7378038)
