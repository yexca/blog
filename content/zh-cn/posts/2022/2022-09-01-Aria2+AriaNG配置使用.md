---
slug: 62
title: Aria2+AriaNG 配置使用
date: '2022-09-01T23:06:38+08:00'
author: hiyoung
# layout: post
# permalink: /archives/62
views:
    - '1737'
categories:
    - 折腾经验
tags:
    - Aria2
    - 下载工具
---

> 该文章由 [Hiyoung](https://blog.hiyoung.icu/) 编写
>
> 其文章: <https://blog.hiyoung.icu/2022/09/01/906d191f9a59/>

Aria2是Linux下的一个下载工具,这里介绍Windows下的安装与配置,官方Aria2没有GUI界面所以配合AriaNG直接在Web界面进行操作.

AriaNg 是一个让 aria2 更容易使用的现代 Web 前端. AriaNg 使用纯 html &amp; javascript 开发, 所以其不需要任何编译器或运行环境.

## 下载Aria2+AriaNG最新安装包

首先先在官网下载安装包

- **[Aria2的Github地址](https://github.com/aria2/aria2/releases/)**

 – **[Aria2官方文档](https://aria2.github.io/)**

- **[AriaNG的Github地址](https://github.com/mayswind/AriaNg/releases)**

 – **[AriaNG官方文档](http://ariang.mayswind.net/zh_Hans/)**

Aria2选择对应的操作系统下载压缩包即可,AriaNG解压后放在Aria2文件夹即可

AriaNg 现在提供三种版本, 标准版、单文件版和 AriaNg Native.

> 标准版适合在 Web 服务器中部署, 提供资源缓存和按需加载的功能.
>
> 单文件版适合本地使用, 您下载后只要在浏览器中打开唯一的 html 文件即可.
>
> AriaNg Native 同样适合本地使用, 并且不需要使用浏览器.

## 添加配置文件

将文件解压至该目录下后，你需要再新创 4 个空文件(可以先建一个空 txt 文件然后修改后缀名)：

- **Aria2.log （日志文件）**
- **aria2.session （用于记录下载历史，以便断点续传）**
- **aria2.conf （配置文件）**
- **HideRun.vbs （隐藏 cmd 窗口运行用到的）**

### 修改配置文件

1. 打开刚才创建的 aria2.conf 空文件，将以下内容填入（用记事本打开即可）

```conf
## '#'开头为注释内容, 选项都有相应的注释说明, 根据需要修改 ##
## 被注释的选项填写的是默认值, 建议在需要修改时再取消注释  ##

## 文件保存相关 ##

# 文件的保存路径(可使用绝对路径或相对路径), 默认: 当前启动位置
dir=E:\Aria2Download
# 日志文件的保存路径
log=D:\aria2-1.36.0-win-64bit-build1\Aria2.log
log-level=notice
# 只想记录问题的话可以改为 log-level=warn
# 启用磁盘缓存, 0为禁用缓存, 需1.16以上版本, 默认:16M
#disk-cache=32M
# 文件预分配方式, 能有效降低磁盘碎片, 默认:prealloc
# 预分配所需时间: none < falloc ? trunc < prealloc
# falloc和trunc则需要文件系统和内核支持
# NTFS建议使用falloc, EXT3/4建议trunc, MAC 下需要注释此项
#file-allocation=none
# 断点续传
continue=true

## 下载连接相关 ##

# 最大同时下载任务数, 运行时可修改, 默认:5
#max-concurrent-downloads=5
# 同一服务器连接数, 添加时可指定, 默认:1
max-connection-per-server=5
# 最小文件分片大小, 添加时可指定, 取值范围1M -1024M, 默认:20M
# 假定size=10M, 文件为20MiB 则使用两个来源下载; 文件为15MiB 则使用一个来源下载
min-split-size=10M
# 单个任务最大线程数, 添加时可指定, 默认:5
#split=5
# 整体下载速度限制, 运行时可修改, 默认:0
#max-overall-download-limit=0
# 单个任务下载速度限制, 默认:0
#max-download-limit=0
# 整体上传速度限制, 运行时可修改, 默认:0
#max-overall-upload-limit=0
# 单个任务上传速度限制, 默认:0
#max-upload-limit=0
# 禁用IPv6, 默认:false
#disable-ipv6=true
# 连接超时时间, 默认:60
#timeout=60
# 最大重试次数, 设置为0表示不限制重试次数, 默认:5
#max-tries=5
# 设置重试等待的秒数, 默认:0
#retry-wait=0

## 进度保存相关 ##

# 从会话文件中读取下载任务
input-file=D:\aria2-1.36.0-win-64bit-build1\aria2.session
# 在Aria2退出时保存`错误/未完成`的下载任务到会话文件
save-session=D:\aria2-1.36.0-win-64bit-build1\aria2.session
# 定时保存会话, 0为退出时才保存, 需1.16.1以上版本, 默认:0
#save-session-interval=60

## RPC相关设置 ##

# 启用RPC, 默认:false
enable-rpc=true
# 允许所有来源, 默认:false
rpc-allow-origin-all=true
# 允许非外部访问, 默认:false
rpc-listen-all=true
# 事件轮询方式, 取值:[epoll, kqueue, port, poll, select], 不同系统默认值不同
#event-poll=select
# RPC监听端口, 端口被占用时可以修改, 默认:6800
#rpc-listen-port=6800
# 设置的RPC授权令牌, v1.18.4新增功能, 取代 --rpc-user 和 --rpc-passwd 选项
#rpc-secret=<TOKEN>
# 设置的RPC访问用户名, 此选项新版已废弃, 建议改用 --rpc-secret 选项
#rpc-user=<USER>
# 设置的RPC访问密码, 此选项新版已废弃, 建议改用 --rpc-secret 选项
#rpc-passwd=<PASSWD>
# 是否启用 RPC 服务的 SSL/TLS 加密,
# 启用加密后 RPC 服务需要使用 https 或者 wss 协议连接
#rpc-secure=true
# 在 RPC 服务中启用 SSL/TLS 加密时的证书文件,
# 使用 PEM 格式时，您必须通过 --rpc-private-key 指定私钥
#rpc-certificate=/path/to/certificate.pem
# 在 RPC 服务中启用 SSL/TLS 加密时的私钥文件
#rpc-private-key=/path/to/certificate.key

## BT/PT下载相关 ##

# 当下载的是一个种子(以.torrent结尾)时, 自动开始BT任务, 默认:true
#follow-torrent=true
# BT监听端口, 当端口被屏蔽时使用, 默认:6881-6999
listen-port=51413
# 单个种子最大连接数, 默认:55
#bt-max-peers=55
# 打开DHT功能, PT需要禁用, 默认:true
enable-dht=false
# 打开IPv6 DHT功能, PT需要禁用
#enable-dht6=false
# DHT网络监听端口, 默认:6881-6999
#dht-listen-port=6881-6999
# 本地节点查找, PT需要禁用, 默认:false
#bt-enable-lpd=false
# 种子交换, PT需要禁用, 默认:true
enable-peer-exchange=false
# 每个种子限速, 对少种的PT很有用, 默认:50K
#bt-request-peer-speed-limit=50K
# 客户端伪装, PT需要
peer-id-prefix=-TR2770-
user-agent=Transmission/2.77
# 当种子的分享率达到这个数时, 自动停止做种, 0为一直做种, 默认:1.0
seed-ratio=0.7
# 强制保存会话, 即使任务已经完成, 默认:false
# 较新的版本开启后会在任务完成后依然保留.aria2文件
#force-save=false
# BT校验相关, 默认:true
#bt-hash-check-seed=true
# 继续之前的BT任务时, 无需再次校验, 默认:false
bt-seed-unverified=true
# 保存磁力链接元数据为种子文件(.torrent文件), 默认:false
bt-save-metadata=true
```

**注意:你需要将下面四行的内容修改为你自己的对应文件位置**：

```conf
# 文件的保存路径(可使用绝对路径或相对路径), 默认: 当前启动位置
dir=E:\Aria2Download
# 日志文件的保存路径
log=D:\aria2-1.36.0-win-64bit-build1\Aria2.log
# 从会话文件中读取下载任务
input-file=D:\aria2-1.36.0-win-64bit-build1\aria2.session
# 在Aria2退出时保存`错误/未完成`的下载任务到会话文件
save-session=D:\aria2-1.36.0-win-64bit-build1\aria2.session
```

最后两行的内容是保存下载历史的，如果有时 Aria2 不能启动的话，清空里面的内容就可以了。

2. 修改 HideRun.vbs 文件

打开HideRun.vbs文件,向其中添加

```vbs
CreateObject("WScript.Shell").Run "aria2c.exe --conf-path=aria2.conf",0
```

接下来点击运行 HideRun.vbs 文件，（注意一定是 HideRun.vbs 文件而不是那个可执行文件！！），如果没有报错的话可以直接跳过下面这段：

注意一下，这里也可以在文件前添加具体的文件目录前缀，但是前缀的文件目录中一定不要有空格

例如:

```vbs
CreateObject("WScript.Shell").Run "C:\Users\he ne\Downloads\aria2c.exe --conf-path=aria2.conf",0
```

但是由于 he ne 这一文件夹里面包含空格，就导致了系统不识别，类似的常见错位位置还多见于：D:Program Files (x86)，这里也是存在空格的，解决方式就是将这一前缀去除即可（但需要该 vbs 文件位于该 aria2 文件夹下）

3. 打开index.html

![img](https://cdn.statically.io/gh/hiyoung3937/img_hiyoung@master/bolg/Aria2+AriaNG%E9%85%8D%E7%BD%AE%E4%BD%BF%E7%94%A8_1.1ohxweqn3ayo.jpg)

打开里面的 index.html 文件，如果显示 “已连接”，则表明搭建成功

4. 添加开机自启

创建 HideRun.vbs 文件的快捷方式，放入 windows 的开机自启目录即可：

在运行窗口中输入：`shell:startup`

这里便会打开自启目录文件夹，然后将该快捷方式拖入即可

- - - - - -

参考文章:

[Aria2+AriaNG 配置指南（Win10 篇）](https://www.higgs.xyz/archives/7/)

[AriaNG文档](http://ariang.mayswind.net/zh_Hans/)
