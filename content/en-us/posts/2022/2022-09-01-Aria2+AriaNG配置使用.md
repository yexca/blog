---
slug: 62
title: Aria2 + AriaNG Configuration and Usage
date: '2022-09-01T23:06:38+08:00'
author: hiyoung
# layout: post
# permalink: /archives/62
views:
    - '1737'
categories:
    - Tinkering Experience
tags:
    - Aria2
    - Download Tool
---

{{< notice >}} This article was translated by deepseek-v4-flash {{< /notice >}}

> This article was written by [Hiyoung](https://blog.hiyoung.icu/)
>
> Original article: <https://blog.hiyoung.icu/2022/09/01/906d191f9a59/>

Aria2 is a download tool on Linux. Here we introduce its installation and configuration under Windows. The official Aria2 does not have a GUI, so we use AriaNG to operate it directly via a web interface.

AriaNg is a modern web frontend that makes aria2 easier to use. AriaNg is developed using pure HTML &amp; javascript, so it does not require any compiler or runtime environment.

## Download the Latest Aria2 + AriaNG Package

First, download the installation packages from the official websites.

- **[Aria2 GitHub Repository](https://github.com/aria2/aria2/releases/)**

 – **[Aria2 Official Documentation](https://aria2.github.io/)**

- **[AriaNG GitHub Repository](https://github.com/mayswind/AriaNg/releases)**

 – **[AriaNG Official Documentation](http://ariang.mayswind.net/zh_Hans/)**

For Aria2, select the compressed package corresponding to your operating system. After extracting AriaNG, place it in the Aria2 folder.

AriaNg now offers three versions: Standard, Single File, and AriaNg Native.

> The standard version is suitable for deployment on web servers, providing resource caching and on-demand loading.
>
> The single file version is suitable for local use – just open the single HTML file in a browser after downloading.
>
> AriaNg Native is also suitable for local use and does not require a browser.

## Add Configuration Files

After extracting the files to the target directory, you need to create 4 new empty files (you can first create empty .txt files and then rename them):

- **Aria2.log** (log file)
- **aria2.session** (used to record download history for resume support)
- **aria2.conf** (configuration file)
- **HideRun.vbs** (used to hide the command prompt window when running)

### Modify the Configuration File

1. Open the empty `aria2.conf` file you just created, and fill in the following content (open it with Notepad).

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

**Note: You need to modify the following four lines to match your own file paths**:

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

The last two lines are for saving download history. If Aria2 cannot start sometimes, clearing the content inside will fix it.

2. Modify the `HideRun.vbs` file

Open the `HideRun.vbs` file and add the following content:

```vbs
CreateObject("WScript.Shell").Run "aria2c.exe --conf-path=aria2.conf",0
```

Next, double-click to run the `HideRun.vbs` file (note: it must be the `.vbs` file, not the executable). If no error occurs, you can skip the following paragraph:

Note: You can also add a specific directory prefix before the file path, but ensure that there are no spaces in the directory path of the prefix.

For example:

```vbs
CreateObject("WScript.Shell").Run "C:\Users\he ne\Downloads\aria2c.exe --conf-path=aria2.conf",0
```

However, because the folder `he ne` contains a space, the system cannot recognize it. Similar common problematic locations include: `D:Program Files (x86)`, which also has spaces. The solution is to remove this prefix (but the `.vbs` file must be located in the same Aria2 folder).

3. Open `index.html`

![img](https://cdn.statically.io/gh/hiyoung3937/img_hiyoung@master/bolg/Aria2+AriaNG%E9%85%8D%E7%BD%AE%E4%BD%BF%E7%94%A8_1.1ohxweqn3ayo.jpg)

Open the `index.html` file inside. If it displays "Connected", the setup is successful.

4. Add to Startup

Create a shortcut of the `HideRun.vbs` file and place it in Windows' startup directory:

Enter the following in the Run dialog: `shell:startup`

This will open the startup folder. Then drag the shortcut into it.

- - - - - -

Reference articles:

[Aria2 + AriaNG Configuration Guide (Win10)](https://www.higgs.xyz/archives/7/)

[AriaNG Documentation](http://ariang.mayswind.net/zh_Hans/)