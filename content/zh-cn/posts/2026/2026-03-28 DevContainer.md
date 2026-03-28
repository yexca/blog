---
slug: 274
title: '拥抱 Dev Container: 彻底摆脱环境依赖'
# draft: true
author: yexca
date: '2026-03-28T16:12:02+09:00'
categories:
    - 开发实践
tags:
    - Dev Container
    - Docker
    - Git
---

在开发的时候，尤其是前端开发，环境配置可谓是相当重要，每次执行 `npm install` 的时候都非常紧张，依赖拉取失败的次数太多啦。同时为了复现一个项目，而去适配和原项目开发时相同的环境也是较为麻烦的

之前了解前端情况的时候，接触了像是 Astro 或 Qwik 这样较为新的岛坞架构 (Islands Architecture)，同时又对自己使用 Hugo Book 的网站不是很满意，于是便试着迁移

不过这次迁移为了可复现性，我开始接触可以在容器内开发的 Dev Container 技术，同时因为我换新电脑的原因，事实上我的博客也进行了 Dev Container 化

## 配置

说到配置还是很方便的，在项目根目录创建 `.devcontainer` 文件夹，然后在里面编写 `Dockerfile` 构建镜像，然后在 `devcontainer.json` 配置相关选项即可

Dockerfile 就是很常规的 Dockerfie 语法，拉取和安装自己需要的镜像和依赖即可

关于 json 文件的所有配置项可参考: <https://containers.dev/implementors/json_reference/>，对于我的博客来说很简单，可以参考下：

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
                "budparr.language-hugo-vscode", // Hugo 语法高亮
                "ritwickdey.LiveServer"         // 实时预览辅助
            ]
        }
    },

    "remoteUser": "vscode"
}
```

## 设置时区

刚开始我直接推送，但是很快就发现了奇怪的事情，也就是 GitHub 上显示提交的时间和我本地对不上，我经过多次排查终于发现了容器默认是 UTC 时间，所以最好还是要在构建完成后手动设置一下比较好

因为可能运行的系统不一样难以构造时候配置，所以这部分我选择使用命令来定义时区

一般设置时间的方法为

```bash
sudo timedatectl set-timezone Asia/Tokyo
```

但容器使用的精简版 Linux 一般没有该指令，所以可用

```bash
sudo ln -sf /usr/share/zoneinfo/Asia/Tokyo /etc/localtime
```

验证设置

```bash
date -R
```

## Git

因为容器也相当于是一个新的机器，所以使用 git 推送的时候还是有点问题，虽然 VS Code 是说使用和本地仓库会没有问题，但是我使用 1password 代理的情况下是没有自动识别的

这里有两种方法解决，第一种非常简单，就是直接把自己的 `~/.ssh` 复制到容器，虽然有很大风险，但是自己用不推送的话倒也没什么，第二种就是先本地构建好 Dev Container 后推送到 GitHub，然后在 VS Code 选择从 GitHub 克隆仓库，登陆自己的 GitHub 账户后拉取构造，之后推送直接就可以推送

## 体验

因为之前我其实就已经在使用 Dev Container 了所以已经是感受到了便携性，这次尝试不使用官方的例子，自己尝试去构造自定义的镜像明显感觉真的很丝滑，完美解决了跨设备环境的问题，换设备的时候，什么都不需要安装，直接克隆然后就可以直接开发，用过就知道很爽，同时也算是达成了开发部署全环境一致了属于是 (因为都是通过容器)

## 参考文章

<https://vscode.js.cn/docs/devcontainers/containers#_working-with-git>
