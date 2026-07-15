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
    - 折腾經驗
tags:
    - Aria2
    - 下載工具
---

{{< notice >}} 本文由 deepseek-v4-flash 翻譯 {{< /notice >}}

> 該文章由 [Hiyoung](https://blog.hiyoung.icu/) 編寫
>
> 其文章: <https://blog.hiyoung.icu/2022/09/01/906d191f9a59/>

Aria2是Linux下的一個下載工具，這裡介紹Windows下的安裝與配置，官方Aria2沒有GUI介面所以配合AriaNG直接在Web介面進行操作。

AriaNg 是一個讓 aria2 更容易使用的現代 Web 前端。 AriaNg 使用純 html &amp; javascript 開發，所以其不需要任何編譯器或執行環境。

## 下載Aria2+AriaNG最新安裝包

首先先在官網下載安裝包

- **[Aria2的Github地址](https://github.com/aria2/aria2/releases/)**

 – **[Aria2官方文檔](https://aria2.github.io/)**

- **[AriaNG的Github地址](https://github.com/mayswind/AriaNg/releases)**

 – **[AriaNG官方文檔](http://ariang.mayswind.net/zh_Hans/)**

Aria2選擇對應的作業系統下載壓縮包即可，AriaNG解壓後放在Aria2資料夾即可

AriaNg 現在提供三種版本，標準版、單文件版和 AriaNg Native。

> 標準版適合在 Web 伺服器中部署，提供資源快取和按需載入的功能。
>
> 單文件版適合本地使用，您下載後只要在瀏覽器中開啟唯一的 html 文件即可。
>
> AriaNg Native 同樣適合本地使用，並且不需要使用瀏覽器。

## 添加配置檔案

將文件解壓至該目錄下後，你需要再新創 4 個空文件（可以先建一個空 txt 文件然後修改副檔名）：

- **Aria2.log （日誌文件）**
- **aria2.session （用於記錄下載歷史，以便斷點續傳）**
- **aria2.conf （配置檔案）**
- **HideRun.vbs （隱藏 cmd 視窗執行用到的）**

### 修改配置檔案

1. 開啟剛才建立的 aria2.conf 空文件，將以下內容填入（用記事本開啟即可）

```conf
## '#'開頭為註釋內容，選項都有相應的註釋說明，根據需要修改 ##
## 被註釋的選項填寫的是預設值，建議在需要修改時再取消註釋  ##

## 文件保存相關 ##

# 文件的保存路徑(可使用絕對路徑或相對路徑)，預設: 當前啟動位置
dir=E:\Aria2Download
# 日誌文件的保存路徑
log=D:\aria2-1.36.0-win-64bit-build1\Aria2.log
log-level=notice
# 只想記錄問題的話可以改為 log-level=warn
# 啟用磁碟快取，0為禁用快取，需1.16以上版本，預設:16M
#disk-cache=32M
# 文件預分配方式，能有效降低磁碟碎片，預設:prealloc
# 預分配所需時間: none < falloc ? trunc < prealloc
# falloc和trunc則需要文件系統和內核支援
# NTFS建議使用falloc，EXT3/4建議trunc，MAC 下需要註釋此項
#file-allocation=none
# 斷點續傳
continue=true

## 下載連接相關 ##

# 最大同時下載任務數，執行時可修改，預設:5
#max-concurrent-downloads=5
# 同一伺服器連接數，添加時可指定，預設:1
max-connection-per-server=5
# 最小文件分片大小，添加時可指定，取值範圍1M -1024M，預設:20M
# 假定size=10M，文件為20MiB 則使用兩個來源下載; 文件為15MiB 則使用一個來源下載
min-split-size=10M
# 單個任務最大執行緒數，添加時可指定，預設:5
#split=5
# 整體下載速度限制，執行時可修改，預設:0
#max-overall-download-limit=0
# 單個任務下載速度限制，預設:0
#max-download-limit=0
# 整體上傳速度限制，執行時可修改，預設:0
#max-overall-upload-limit=0
# 單個任務上傳速度限制，預設:0
#max-upload-limit=0
# 禁用IPv6，預設:false
#disable-ipv6=true
# 連接超時時間，預設:60
#timeout=60
# 最大重試次數，設定為0表示不限制重試次數，預設:5
#max-tries=5
# 設定重試等待的秒數，預設:0
#retry-wait=0

## 進度保存相關 ##

# 從會話文件中讀取下載任務
input-file=D:\aria2-1.36.0-win-64bit-build1\aria2.session
# 在Aria2退出時儲存`錯誤/未完成`的下載任務到會話文件
save-session=D:\aria2-1.36.0-win-64bit-build1\aria2.session
# 定時儲存會話，0為退出時才儲存，需1.16.1以上版本，預設:0
#save-session-interval=60

## RPC相關設定 ##

# 啟用RPC，預設:false
enable-rpc=true
# 允許所有來源，預設:false
rpc-allow-origin-all=true
# 允許非外部訪問，預設:false
rpc-listen-all=true
# 事件輪詢方式，取值:[epoll, kqueue, port, poll, select]，不同系統預設值不同
#event-poll=select
# RPC監聽埠，埠被佔用時可以修改，預設:6800
#rpc-listen-port=6800
# 設定的RPC授權令牌，v1.18.4新增功能，取代 --rpc-user 和 --rpc-passwd 選項
#rpc-secret=<TOKEN>
# 設定的RPC訪問使用者名稱，此選項新版已廢棄，建議改用 --rpc-secret 選項
#rpc-user=<USER>
# 設定的RPC訪問密碼，此選項新版已廢棄，建議改用 --rpc-secret 選項
#rpc-passwd=<PASSWD>
# 是否啟用 RPC 服務的 SSL/TLS 加密，
# 啟用加密後 RPC 服務需要使用 https 或者 wss 協議連接
#rpc-secure=true
# 在 RPC 服務中啟用 SSL/TLS 加密時的證書文件，
# 使用 PEM 格式時，您必須通過 --rpc-private-key 指定私鑰
#rpc-certificate=/path/to/certificate.pem
# 在 RPC 服務中啟用 SSL/TLS 加密時的私鑰文件
#rpc-private-key=/path/to/certificate.key

## BT/PT下載相關 ##

# 當下載的是一個種子(以.torrent結尾)時，自動開始BT任務，預設:true
#follow-torrent=true
# BT監聽埠，當埠被屏蔽時使用，預設:6881-6999
listen-port=51413
# 單個種子最大連接數，預設:55
#bt-max-peers=55
# 開啟DHT功能，PT需要禁用，預設:true
enable-dht=false
# 開啟IPv6 DHT功能，PT需要禁用
#enable-dht6=false
# DHT網路監聽埠，預設:6881-6999
#dht-listen-port=6881-6999
# 本地節點查找，PT需要禁用，預設:false
#bt-enable-lpd=false
# 種子交換，PT需要禁用，預設:true
enable-peer-exchange=false
# 每個種子限速，對少種的PT很有用，預設:50K
#bt-request-peer-speed-limit=50K
# 客戶端偽裝，PT需要
peer-id-prefix=-TR2770-
user-agent=Transmission/2.77
# 當種子的分享率達到這個數時，自動停止做種，0為一直做種，預設:1.0
seed-ratio=0.7
# 強制儲存會話，即使任務已經完成，預設:false
# 較新的版本開啟後會在任務完成後依然保留.aria2文件
#force-save=false
# BT校驗相關，預設:true
#bt-hash-check-seed=true
# 繼續之前的BT任務時，無需再次校驗，預設:false
bt-seed-unverified=true
# 儲存磁力連結元數據為種子文件(.torrent文件)，預設:false
bt-save-metadata=true
```

**注意:你需要將下面四行的內容修改為你自己的對應檔案位置**：

```conf
# 文件的保存路徑(可使用絕對路徑或相對路徑)，預設: 當前啟動位置
dir=E:\Aria2Download
# 日誌文件的保存路徑
log=D:\aria2-1.36.0-win-64bit-build1\Aria2.log
# 從會話文件中讀取下載任務
input-file=D:\aria2-1.36.0-win-64bit-build1\aria2.session
# 在Aria2退出時儲存`錯誤/未完成`的下載任務到會話文件
save-session=D:\aria2-1.36.0-win-64bit-build1\aria2.session
```

最後兩行的內容是儲存下載歷史的，如果有時 Aria2 不能啟動的話，清空裡面的內容就可以了。

2. 修改 HideRun.vbs 文件

開啟HideRun.vbs文件，向其中添加

```vbs
CreateObject("WScript.Shell").Run "aria2c.exe --conf-path=aria2.conf",0
```

接下來點擊執行 HideRun.vbs 文件，（注意一定是 HideRun.vbs 文件而不是那個可執行文件！！），如果沒有報錯的話可以直接跳過下面這段：

注意一下，這裡也可以在文件前添加具體的文件目錄前綴，但是前綴的文件目錄中一定不要有空格

例如:

```vbs
CreateObject("WScript.Shell").Run "C:\Users\he ne\Downloads\aria2c.exe --conf-path=aria2.conf",0
```

但是由於 he ne 這一資料夾裡面包含空格，就導致了系統不識別，類似的常見錯位位置還多見於：D:Program Files (x86)，這裡也是存在空格的，解決方式就是將這一前綴去除即可（但需要該 vbs 文件位於該 aria2 資料夾下）

3. 開啟index.html

![img](https://cdn.statically.io/gh/hiyoung3937/img_hiyoung@master/bolg/Aria2+AriaNG%E9%85%8D%E7%BD%AE%E4%BD%BF%E7%94%A8_1.1ohxweqn3ayo.jpg)

打開裡面的 index.html 文件，如果顯示 “已連接”，則表明搭建成功

4. 添加開機自啟

建立 HideRun.vbs 文件的快捷方式，放入 windows 的開機自啟目錄即可：

在執行視窗中輸入：`shell:startup`

這裡便會開啟自啟目錄資料夾，然後將該快捷方式拖入即可

- - - - - -

參考文章:

[Aria2+AriaNG 配置指南（Win10 篇）](https://www.higgs.xyz/archives/7/)

[AriaNG文檔](http://ariang.mayswind.net/zh_Hans/)