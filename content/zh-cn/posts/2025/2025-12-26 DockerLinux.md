---
slug: 262
title: '利用 Docker 构建临时 Linux 交互环境'
# draft: true
author: yexca
date: '2025-12-26T18:43:04+09:00'
categories:
    - 开发实践
tags:
    - Docker
    - Linux
---

在 Windows 环境下运行一个 bash 脚本显然是难度略大，在 Linux 环境下，运行另一个发行版本的特化脚本显然也是有点麻烦，利用 Docker 可以帮助处理这个问题，同时还可以保护本地环境的纯净

本文以 alpine 为例列出如何使用 Docker 的 Linux 系统完成当前目录的交互处理

## 原理

事实上也就是通过挂载把当前目录的所有文件挂载到容器的一个目录，命令模板为

```bash
docker run --rm -it -v "$(pwd)":/data -w /data alpine sh
```

其中的参数含义如下

| 参数 | 含义                                               |
| ---- | -------------------------------------------------- |
| --rm | 容器退出后删除                                     |
| -it  | 表示 interactive 和 tty 输出的组合，交互与看到输出 |
| -v   | 映射路径，参数表示将当前目录映射到容器的 /data     |
| -w   | 设置工作路径，这样进入容器就在 /data               |
| sh   | 最后的 sh 表明运行 sh 命令                         |

同时也有只是想要运行单次命令的话，不需要交互输出，在最后输入命令即可，例如

```bash
docker run --rm -v "$(pwd)":/data -w /data alpine ls -la
```

## Windows

在 PowerShell 和 CMD 环境下命令不同，主要区别是环境变量，以下是打开 alpine 的交互端的命令

- PowerShell

```bash
docker run --rm -it -v ${PWD}:/data -w /data alpine sh
```

- CMD

```bash
docker run --rm -it -v %cd%:/data -w /data alpine sh
```

## Linux

在 Linux 上，因为进入容器默认使用 root 权限，为防止容器中生成的文件在宿主机是 root 权限导致无法修改，最好映射当前用户的 UID 与 GID

```bash
docker run --rm -it -u $(id -u):$(id -g) -v "$(pwd)":/data -w /data alpine sh
```

## MacOS

不需要处理权限问题，变量同 Linux

```bash
docker run --rm -it -v "$(pwd)":/data -w /data alpine sh
```

## 注意事项 - Alpine

因为 alpine 是非常精简的系统，所以可能需要自行安装一些常用的命令，还请使用 `apk add` 命令进行安装
