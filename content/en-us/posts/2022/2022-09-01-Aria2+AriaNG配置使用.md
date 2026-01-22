---
slug: 62
title: Aria2+AriaNG Setup and Configuration
date: '2022-09-01T23:06:38+08:00'
author: hiyoung
# layout: post
# permalink: /archives/62
views:
    - '1737'
categories:
    - Tech Setup
tags:
    - Aria2
    - Download Tools
---

> This article was written by [Hiyoung](https://blog.hiyoung.icu/)
>
> Original post: <https://blog.hiyoung.icu/2022/09/01/906d191f9a59/>

{{< notice >}} This article was translated by Gemini-3-flash {{< /notice >}}

Aria2 is a CLI-based download tool for Linux. This guide covers installation and configuration for Windows. Since the official Aria2 has no GUI, we'll use AriaNG as a web interface for operations.

AriaNg is a modern web frontend that makes Aria2 easier to use. Built with pure HTML and JavaScript, it doesn't require any compiler or runtime environment.

## Download the Latest Aria2+AriaNG Packages

First, download the packages from the official sites:

- **[Aria2 GitHub](https://github.com/aria2/aria2/releases/)**
 – **[Aria2 Official Docs](https://aria2.github.io/)**

- **[AriaNG GitHub](https://github.com/mayswind/AriaNg/releases)**
 – **[AriaNG Official Docs](http://ariang.mayswind.net/zh_Hans/)**

Download the Aria2 archive for your OS. Extract AriaNG and place it inside the Aria2 folder.

AriaNg offers three versions: Standard, Single-file, and AriaNg Native.

> Standard: Best for web server deployment; features resource caching and lazy loading.
>
> Single-file: Best for local use; just open the single HTML file in a browser.
>
> AriaNg Native: Also for local use, but doesn't require a browser.

## Add Configuration Files

After extracting the files into a directory, create 4 empty files (create a .txt and change the extension):

- **Aria2.log** (Log file)
- **aria2.session** (Records download history for resuming)
- **aria2.conf** (Configuration file)
- **HideRun.vbs** (Used to run Aria2 without a visible CMD window)

### Modify Configuration

1. Open `aria2.conf` and paste the following content (use Notepad or any text editor):

```conf
## '#' starts a comment. Modify options as needed. ##
## Commented options use default values. Un-comment to change. ##

## File Saving ##

# Save path (absolute or relative). Default: current directory
dir=E:\Aria2Download
# Log file path
log=D:\aria2-1.36.0-win-64bit-build1\Aria2.log
# Enable disk cache. 0 to disable. Requires v1.16+. Default: 16M
#disk-cache=32M
# File allocation method. Reduces fragmentation. Default: prealloc
# Speed: none < falloc ? trunc < prealloc
# falloc/trunc require filesystem/kernel support.
# Use 'falloc' for NTFS, 'trunc' for EXT3/4. Comment out for macOS.
#file-allocation=none
# Resume downloads
continue=true

## Download Connections ##

# Max concurrent downloads. Default: 5
#max-concurrent-downloads=5
# Connections per server. Default: 1
max-connection-per-server=5
# Min split size. Range 1M-1024M. Default: 20M
# If size=10M and file is 20MiB, two sources are used.
min-split-size=10M
# Max threads per task. Default: 5
#split=5
# Global download limit. 0 for unlimited. Default: 0
#max-overall-download-limit=0
# Task download limit. Default: 0
#max-download-limit=0
# Global upload limit. Default: 0
#max-overall-upload-limit=0
# Task upload limit. Default: 0
#max-upload-limit=0
# Disable IPv6. Default: false
#disable-ipv6=true
# Connection timeout. Default: 60
#timeout=60
# Max retries. 0 for unlimited. Default: 5
#max-tries=5
# Seconds between retries. Default: 0
#retry-wait=0

## Progress Saving ##

# Load tasks from session file
input-file=D:\aria2-1.36.0-win-64bit-build1\aria2.session
# Save error/unfinished tasks to session file on exit
save-session=D:\aria2-1.36.0-win-64bit-build1\aria2.session
# Interval to save session. 0 to save only on exit. Default: 0
#save-session-interval=60

## RPC Settings ##

# Enable RPC. Default: false
enable-rpc=true
# Allow all origins. Default: false
rpc-allow-origin-all=true
# Allow non-external access. Default: false
rpc-listen-all=true
# Event polling method. [epoll, kqueue, port, poll, select]
#event-poll=select
# RPC port. Default: 6800
#rpc-listen-port=6800
# RPC secret token (v1.18.4+). Replaces user/passwd.
#rpc-secret=<TOKEN>
# RPC username (Deprecated)
#rpc-user=<USER>
# RPC password (Deprecated)
#rpc-passwd=<PASSWD>
# Enable SSL/TLS for RPC. Requires https/wss.
#rpc-secure=true
# Certificate file for RPC SSL/TLS
#rpc-certificate=/path/to/certificate.pem
# Private key for RPC SSL/TLS
#rpc-private-key=/path/to/certificate.key

## BT/PT Download ##

# Auto-start BT task for .torrent files. Default: true
#follow-torrent=true
# BT port. Default: 6881-6999
listen-port=51413
# Max peers per torrent. Default: 55
#bt-max-peers=55
# Enable DHT. Disable for PT. Default: true
enable-dht=false
# Enable IPv6 DHT. Disable for PT.
#enable-dht6=false
# DHT port. Default: 6881-6999
#dht-listen-port=6881-6999
# Local Peer Discovery. Disable for PT. Default: false
#bt-enable-lpd=false
# Peer Exchange. Disable for PT. Default: true
enable-peer-exchange=false
# BT peer request speed limit. Default: 50K
#bt-request-peer-speed-limit=50K
# Client spoofing. Needed for PT.
peer-id-prefix=-TR2770-
user-agent=Transmission/2.77
# Seed ratio. Stop seeding at this ratio. 0 for infinite. Default: 1.0
seed-ratio=0.7
# Force save session even if task is finished. Default: false
# If true, .aria2 files remain after completion.
#force-save=false
# BT hash check seed. Default: true
#bt-hash-check-seed=true
# Skip hash check when resuming BT. Default: false
bt-seed-unverified=true
# Save magnet metadata as .torrent files. Default: false
bt-save-metadata=true
```

**Note: Update these four lines to match your local file paths**:

```conf
# File save path
dir=E:\Aria2Download
# Log file path
log=D:\aria2-1.36.0-win-64bit-build1\Aria2.log
# Input session file
input-file=D:\aria2-1.36.0-win-64bit-build1\aria2.session
# Output session file
save-session=D:\aria2-1.36.0-win-64bit-build1\aria2.session
```

The last two lines handle download history. If Aria2 fails to start, try clearing the contents of the session file.

2. Modify `HideRun.vbs`

Open `HideRun.vbs` and add:

```vbs
CreateObject("WScript.Shell").Run "aria2c.exe --conf-path=aria2.conf",0
```

Run `HideRun.vbs` (ensure you run the VBS, not the EXE). If there are no errors, skip the next part.

**Warning:** You can add absolute paths in the VBS script, but the path **must not** contain spaces.

Example of what NOT to do:

```vbs
CreateObject("WScript.Shell").Run "C:\Users\he ne\Downloads\aria2c.exe --conf-path=aria2.conf",0
```

Because "he ne" contains a space, the system won't recognize it. This often happens with `C:\Program Files (x86)`. To fix this, either remove spaces from the directory or just keep the VBS in the same folder as Aria2 and use the relative path (as shown in the first VBS example).

3. Open `index.html`

![img](https://cdn.statically.io/gh/hiyoung3937/img_hiyoung@master/bolg/Aria2+AriaNG%E9%85%8D%E7%BD%AE%E4%BD%BF%E7%94%A8_1.1ohxweqn3ayo.jpg)

Open the `index.html` file from the AriaNG folder. If it shows "Connected," the setup is successful.

4. Add to Startup

Create a shortcut for `HideRun.vbs` and place it in the Windows Startup folder:

Press `Win + R`, type `shell:startup`, and press Enter.

This opens the Startup folder. Drag the `HideRun.vbs` shortcut into this folder to enable auto-start.

- - - - - -

References:
[Aria2+AriaNG Configuration Guide (Win10)](https://www.higgs.xyz/en/archives/7/)
[AriaNG Documentation](http://ariang.mayswind.net/zh_Hans/)
