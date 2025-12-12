---
slug: 258
title: '漫画与音声网站折腾'
# draft: true
author: yexca
date: '2025-10-05T01:58:35+09:00'
categories:
    - 折腾经验
tags:
    - 配置记录
    - Docker
---

## 引言

Google 的 Gemini Pro 订阅带 2TiB 的空间，那就又让我想到了折腾，那么说做就做吧

不过再一看，[之前的折腾](/archives/73)已经过去三年了啊，时间过的确实有点快捏

## 漫画 Komga

首先是看漫画的 Komga，虽然扫描的时候卡卡的，但使用体验其实还行吧

时隔多年，Komga 更新不少，[之前的文章](/archives/71) 已经无法复用，同时使用 docker-compose 更加便携，`docker-compose.yml` 如下

```yaml
version: '3.0'
services:
  komga:
    image: gotson/komga:1.23.4
    container_name: komga
    volumes:
      - type: bind
        source: /home/komga/config
        target: /config
      - type: bind
        source: /home/rclone/data
        target: /data
    ports:
      - 25600:25600
    restart: unless-stopped
```

另外有[专门的 IOS 软件 Komic](https://pruizlezcano.github.io/komic/) 属实挺方便的

## rclone 挂载 Google Drive

和[微软 OneDrive](/archives/105) 类似，需要先在 Windows 平台浏览器认证获得 Token

具体流程就是下载好后运行命令

```bash
rclone config
```

命名后选择 `Google Drive` (22) 后，给与 `Full access all files, excluding Application Data Folder` 权限，再回车到弹出浏览器登录，完成后退出即可

不过前期我不是太懂，申请了下软件 ID 与 Secret，好像没什么用，但记录下说不定之后可以用到

{{< details "Google 申请应用 API ID 与 Secret" >}}

打开 Google API 服务网站: <https://console.developers.google.com/>

选择 `Enable APIs and services` 搜索并开启 `Google Drive API`

在 Google Drive API 的 `Manage` 中 `Create credentials`

API 的类型选择 `User data` 也就是介绍包含 `Oauth` 的

在 OAuth Client ID 中类型选择 `Web application`，名字可输入 `rclone`，完成后出现 `Client ID`

然后完成创建，在 Credentials 选择刚才创建的应用 rclone 进入复制密钥 `Client secrets`

{{< /details >}}

接着把配置文件复制到服务器，本地目录在

```markdown
C:\Users\%USERNAME%\AppData\Roaming\rclone
```

服务器下载 fuse，我的服务器是 CentOS7，所以下载了这些

```bash
sudo yum install -y fuse fuse3 fuse-libs
```

较新的系统直接下载 fuse3 就行，接着用 docker 挂载

```bash
sudo docker run --rm \
    --volume /home/opc/rclone/config:/config/rclone \
    --volume /home/opc/rclone/data:/data:shared \
    --volume /etc/passwd:/etc/passwd:ro --volume /etc/group:/etc/group:ro \
    --device /dev/fuse --cap-add SYS_ADMIN --security-opt apparmor:unconfined \
    rclone/rclone \
    mount GoogleDrive:/ /data \
    --no-checksum \
    --use-server-modtime \
    --no-gzip-encoding \
    --no-update-modtime \
    --no-seek \
    --modify-window 2m \
    --allow-other \
    --allow-non-empty \
    --dir-cache-time 30m \
    --cache-read-retries 15 \
    --cache-db-purge \
    --timeout 30m \
    --vfs-cache-mode full \
    --vfs-read-chunk-size 2M \
    --vfs-read-chunk-size-limit 5M \
    --vfs-cache-max-age 30m \
    --attr-timeout 20s \
    --poll-interval 9m \
    --vfs-cache-poll-interval 10m&
```

后面那一堆的配置参考 [Komga 官方提供](https://komga.org/docs/installation/gdrive)，具体含义为

| 参数                             | 作用                           | 说明                                                         |
| -------------------------------- | ------------------------------ | ------------------------------------------------------------ |
| `--no-checksum`                  | 跳过校验和                     | 减少 API 调用，加快目录加载速度。适合视频等大文件。          |
| `--use-server-modtime`           | 使用服务器的文件修改时间       | 避免本地与远程时间差导致重复上传/同步。                      |
| `--no-gzip-encoding`             | 禁用 GZIP 编码                 | 某些云端（如 Drive）响应压缩后性能不佳，此项可降低 CPU 占用。 |
| `--no-update-modtime`            | 不更新文件修改时间             | 只读用途下防止 Drive 因时间变动触发版本更新。                |
| `--no-seek`                      | 禁用随机读                     | 减少对视频拖动操作的支持，但会提高顺序读取的稳定性。适合连续播放场景。 |
| `--modify-window 2m`             | 文件修改时间误差容忍范围       | 防止本地/远程时间差引起误判。                                |
| `--allow-other`                  | 允许系统内其他用户访问挂载内容 | 必须系统配置 `/etc/fuse.conf` 里允许。                       |
| `--allow-non-empty`              | 挂载非空目录                   | 若挂载点非空也可继续挂载。                                   |
| `--dir-cache-time 30m`           | 目录缓存时间                   | 减少频繁请求云端 API，默认适中。                             |
| `--cache-read-retries 15`        | 缓存读取失败时重试次数         | 提高稳定性。                                                 |
| `--cache-db-purge`               | 每次启动清空缓存数据库         | 防止旧缓存损坏导致错误。适合长时间开关挂载的环境。           |
| `--timeout 30m`                  | 单次传输超时上限               | 长视频或大文件读取时防止断线。                               |
| `--vfs-cache-mode full`          | 完全缓存模式                   | 读取写入都通过本地缓存。性能最平衡、最安全。                 |
| `--vfs-read-chunk-size 2M`       | 每次下载块大小                 | 越小越节省带宽，但越频繁。此配置适合低带宽环境。             |
| `--vfs-read-chunk-size-limit 5M` | 最大块大小限制                 | 限制增长幅度，防止一次请求太大导致超时。                     |
| `--vfs-cache-max-age 30m`        | 缓存文件最大存活时间           | 比较短的时间，适合节省空间。                                 |
| `--attr-timeout 20s`             | 文件属性缓存时间               | 防止频繁 stat() 调用；20s 为折中值。                         |
| `--poll-interval 9m`             | 云端变更轮询间隔               | 9 分钟检查一次变动，减轻 Google API 负担。                   |
| `--vfs-cache-poll-interval 10m`  | 本地缓存清理间隔               | 每 10 分钟清理一次过期缓存。                                 |

## Alpine Linux 的使用

因为占用过高，所以我想到了极其轻量化的 Alpine

### Docker 安装

首先更新软件

```bash
doas apk update
```

安装 Docker

```bash
doas apk add docker docker-cli-compose
```

配置开机启动

```bash
rc-update add docker default
```

启动 Docker，可能需要等一会

```bash
doas service docker start
```

添加自己到 Docker 用户组

```bash
doas addgroup ${USER} docker
```

---

参考文章

<https://wiki.alpinelinux.org/wiki/Docker>

---

### swap 创建

首先添加交换空间

```bash
doas fallocate -l 8G /swapfile
```

设置权限只能 root 访问

```bash
doas chmod 600 /swapfile
```

格式化 swap

```bash
doas mkswap /swapfile
```

启用 swap

```bash
doas swapon /swapfile
```

然后可以查看是否生效

```bash
free -h
```

### rclone 配置

因为过于轻量化，所以需要一些额外配置

首先安装 fuse

```bash
doas apk add fuse
```

挂载设备

```bash
doas modprobe fuse
```

然后需要修改根目录为 share 类型

```bash
doas mount --make-rshared /
```

之后就和 CentOS7 类似了

---

参考文章

- [How to Install Rclone on Alpine Linux Latest](https://ipv6.rs/tutorial/Alpine_Linux_Latest/rclone/)

- [Alpine Linux Wiki Rclone](https://wiki.alpinelinux.org/wiki/Rclone)

---

## Kikoeru

刚开始走了一点弯路，最后也失败了，就记录一下吧

{{< details "一下午的失败 TT" >}}

我顺着经典的 kikoeru project 的 fork 找最新提交的一个，虽然是找到了 [XunJiJiang/kikoeru-express](https://github.com/XunJiJiang/kikoeru-express) 但是我尝试构建镜像尝试了一下午，从 node.js 12 尝试到 16，各种错误，换镜像源等方法都试了，然后想着单独部署也都是构建失败，试着不使用 Docker 构建也失败，到最后我真的妥协了，用经典的 0.6.2 吧

哇，我真的，推荐 node.js 版本 12-14，但是实际构建的时候，运行到某一步骤，提示是 16 以上的特性，我直接用 14 以上 `npm i` 会报错，只好用 13 版本先安装依赖，完成后再复制过来，用 16 版本构建，没想到这样折腾了一下午，不过说实话，这让我学会熟练切换 node.js 版本了属于是 XD

我之前下的一个 IOS 软件，便打开试着连接异常，查看更新记录，提示使用 0.6.14 版本以上，我大受震撼，紧接着搜到了我已经 star 了的 [Number178/kikoeru-express](https://github.com/Number178/kikoeru-express) 😂

{{< /details >}}

使用在更新的 [Number178/kikoeru-express](https://github.com/Number178/kikoeru-express)，同时该作者还开发了 IOS 软件，非常方便

配置文件

```yaml
version: '3.0'
services:
    kikoeru:
        ports:
            - '8011:8888'
        container_name: kikoeru
        volumes:
            - type: bind
              source: /home/rclone/data/asmr
              target: /usr/src/kikoeru/VoiceWork
            - /home/kikoeru/sqlite:/usr/src/kikoeru/sqlite
            - /home/kikoeru/covers:/usr/src/kikoeru/covers
            - /home/kikoeru/config:/usr/src/kikoeru/config
        image: 'number17/kikoeru:v0.6.14-20250914'
        restart: always
```

然后就是，标签的语言是不能切换的，默认是简中，如果需要日语的话，需要在扫描前就切换
