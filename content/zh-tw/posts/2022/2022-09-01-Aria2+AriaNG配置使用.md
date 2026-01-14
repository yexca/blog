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
    - 實作經驗
tags:
    - Aria2
    - 下載工具
---

{{< notice >}} 本文由 Gemini-3-flash 翻譯 {{< /notice >}}

> 該文章由 [Hiyoung](https://blog.hiyoung.icu/) 編寫
>
> 其文章: <https://blog.hiyoung.icu/2022/09/01/906d191f9a59/>

Aria2 是 Linux 下的一個下載工具，這裡介紹 Windows 下的安裝與設定，官方 Aria2 沒有 GUI 介面，所以配合 AriaNG 直接在 Web 介面進行操作。

AriaNg 是一個讓 aria2 更容易使用的現代 Web 前端。AriaNg 使用純 html &amp; javascript 開發，所以它不需要任何編譯器或執行環境。

## 下載 Aria2+AriaNG 最新安裝包

首先先在官網下載安裝包

- **[Aria2 的 Github 地址](https://github.com/aria2/aria2/releases/)**

 – **[Aria2 官方文件](https://aria2.github.io/)**

- **[AriaNG 的 Github 地址](https://github.com/mayswind/AriaNg/releases)**

 – **[AriaNG 官方文件](http://ariang.mayswind.net/zh_Hans/)**

Aria2 選擇對應的作業系統下載壓縮檔即可，AriaNG 解壓縮後放在 Aria2 資料夾即可。

AriaNg 現在提供三種版本：標準版、單檔案版和 AriaNg Native。

> 標準版適合在 Web 伺服器中部署，提供資源快取和按需載入的功能。
>
> 單檔案版適合本地使用，您下載後只要在瀏覽器中打開唯一的 html 檔案即可。
>
> AriaNg Native 同樣適合本地使用，並且不需要使用瀏覽器。

## 新增設定檔

將檔案解壓縮至該目錄下後，你需要再新建立 4 個空檔案 (可以先建一個空 txt 檔案然後修改副檔名)：

- **Aria2.log （日誌檔案）**
- **aria2.session （用於記錄下載歷史，以便斷點續傳）**
- **aria2.conf （設定檔）**
- **HideRun.vbs （隱藏 cmd 視窗執行時用到的）**

### 修改設定檔

1. 打開剛才建立的 aria2.conf 空檔案，將以下內容填入（用記事本打開即可）

```conf
## '#'開頭為註解內容, 選項都有相應的註解說明, 根據需要修改 ##
## 被註解的選項填寫的是預設值, 建議在需要修改時再取消註解  ##

## 檔案儲存相關 ##

# 檔案的儲存路徑(可使用絕對路徑或相對路徑), 預設: 當前啟動位置
dir=E:\Aria2Download
# 日誌檔案的儲存路徑
log=D:\aria2-1.36.0-win-64bit-build1\Aria2.log
# 啟用磁碟快取, 0為停用快取, 需1.16以上版本, 預設:16M
#disk-cache=32M
# 檔案預先分配方式, 能有效降低磁碟碎片, 預設:prealloc
# 預先分配所需時間: none < falloc ? trunc < prealloc
# falloc和trunc則需要檔案系統和核心支援
# NTFS建議使用falloc, EXT3/4建議trunc, MAC 下需要註解此項
#file-allocation=none
# 斷點續傳
continue=true

## 下載連線相關 ##

# 最大同時下載任務數, 執行時可修改, 預設:5
#max-concurrent-downloads=5
# 同一伺服器連線數, 新增時可指定, 預設:1
max-connection-per-server=5
# 最小檔案分片大小, 新增時可指定, 取值範圍1M -1024M, 預設:20M
# 假定size=10M, 檔案為20MiB 則使用兩個來源下載; 檔案為15MiB 則使用一個來源下載
min-split-size=10M
# 單個任務最大執行緒數, 新增時可指定, 預設:5
#split=5
# 整體下載速度限制, 執行時可修改, 預設:0
#max-overall-download-limit=0
# 單個任務下載速度限制, 預設:0
#max-download-limit=0
# 整體上傳速度限制, 執行時可修改, 預設:0
#max-overall-upload-limit=0
# 單個任務上傳速度限制, 預設:0
#max-upload-limit=0
# 停用IPv6, 預設:false
#disable-ipv6=true
# 連線逾時時間, 預設:60
#timeout=60
# 最大重試次數, 設定為0表示不限制重試次數, 預設:5
#max-tries=5
# 設定重試等待的秒數, 預設:0
#retry-wait=0

## 進度儲存相關 ##

# 從工作階段檔案中讀取下載任務
input-file=D:\aria2-1.36.0-win-64bit-build1\aria2.session
# 在Aria2退出時儲存`錯誤/未完成`的下載任務到工作階段檔案
save-session=D:\aria2-1.36.0-win-64bit-build1\aria2.session
# 定時儲存工作階段, 0為退出時才儲存, 需1.16.1以上版本, 預設:0
#save-session-interval=60

## RPC相關設定 ##

# 啟用RPC, 預設:false
enable-rpc=true
# 允許所有來源, 預設:false
rpc-allow-origin-all=true
# 允許非外部存取, 預設:false
rpc-listen-all=true
# 事件輪詢方式, 取值:[epoll, kqueue, port, poll, select], 不同系統預設值不同
#event-poll=select
# RPC監聽通訊埠, 通訊埠被佔用時可以修改, 預設:6800
#rpc-listen-port=6800
# 設定的RPC授權權杖, v1.18.4新增功能, 取代 --rpc-user 和 --rpc-passwd 選項
#rpc-secret=<TOKEN>
# 設定的RPC存取用戶名, 此選項新版已廢棄, 建議改用 --rpc-secret 選項
#rpc-user=<USER>
# 設定的RPC存取密碼, 此選項新版已廢棄, 建議改用 --rpc-secret 選項
#rpc-passwd=<PASSWD>
# 是否啟用 RPC 服務的 SSL/TLS 加密,
# 啟用加密後 RPC 服務需要使用 https 或者 wss 協定連線
#rpc-secure=true
# 在 RPC 服務中啟用 SSL/TLS 加密時的憑證檔案,
# 使用 PEM 格式時，您必須通過 --rpc-private-key 指定私鑰
#rpc-certificate=/path/to/certificate.pem
# 在 RPC 服務中啟用 SSL/TLS 加密時的私鑰檔案
#rpc-private-key=/path/to/certificate.key

## BT/PT下載相關 ##

# 當下載的是一個種子(以.torrent結尾)時, 自動開始BT任務, 預設:true
#follow-torrent=true
# BT監聽通訊埠, 當通訊埠被封鎖時使用, 預設:6881-6999
listen-port=51413
# 單個種子最大連線數, 預設:55
#bt-max-peers=55
# 打開DHT功能, PT需要停用, 預設:true
enable-dht=false
# 打開IPv6 DHT功能, PT需要停用
#enable-dht6=false
# DHT網路監聽通訊埠, 預設:6881-6999
#dht-listen-port=6881-6999
# 本地節點查找, PT需要停用, 預設:false
#bt-enable-lpd=false
# 種子交換, PT需要停用, 預設:true
enable-peer-exchange=false
# 每個種子限速, 對少種的PT很有用, 預設:50K
#bt-request-peer-speed-limit=50K
# 用戶端偽裝, PT需要
peer-id-prefix=-TR2770-
user-agent=Transmission/2.77
# 當種子的分享率達到這個數時, 自動停止做種, 0為一直做種, 預設:1.0
seed-ratio=0.7
# 強制儲存工作階段, 即使任務已經完成, 預設:false
# 較新的版本開啟後會在任務完成後依然保留.aria2檔案
#force-save=false
# BT校驗相關, 預設:true
#bt-hash-check-seed=true
# 繼續之前的BT任務時, 無需再次校驗, 預設:false
bt-seed-unverified=true
# 儲存磁力連結元數據為種子檔案(.torrent檔案), 預設:false
bt-save-metadata=true
```

**注意：你需要將下面四行的內容修改為你自己對應的檔案位置**：

```conf
# 檔案的儲存路徑(可使用絕對路徑或相對路徑), 預設: 當前啟動位置
dir=E:\Aria2Download
# 日志檔案的儲存路徑
log=D:\aria2-1.36.0-win-64bit-build1\Aria2.log
# 從工作階段檔案中讀取下載任務
input-file=D:\aria2-1.36.0-win-64bit-build1\aria2.session
# 在Aria2退出時儲存`錯誤/未完成`的下載任務到工作階段檔案
save-session=D:\aria2-1.36.0-win-64bit-build1\aria2.session
```

最後兩行的內容是儲存下載歷史的，如果有時 Aria2 不能啟動的話，清空裡面的內容就可以了。

2. 修改 HideRun.vbs 檔案

打開 HideRun.vbs 檔案，向其中新增

```vbs
CreateObject("WScript.Shell").Run "aria2c.exe --conf-path=aria2.conf",0
```

接下來點擊執行 HideRun.vbs 檔案，（注意一定是 HideRun.vbs 檔案而不是那個執行檔！！），如果沒有報錯的話可以直接跳過下面這段：

注意一下，這裡也可以在檔案前新增具體的檔案目錄前綴，但是前綴的檔案目錄中一定不要有空格。

例如：

```vbs
CreateObject("WScript.Shell").Run "C:\Users\he ne\Downloads\aria2c.exe --conf-path=aria2.conf",0
```

但是由於 `he ne` 這一資料夾裡面包含空格，就導致了系統不辨識，類似的常見錯誤位置還多見於：`D:\Program Files (x86)`，這裡也是存在空格的，解決方式就是將這一前綴去除即可（但需要該 vbs 檔案位於該 aria2 資料夾下）。

3. 打開 index.html

![img](https://cdn.statically.io/gh/hiyoung3937/img_hiyoung@master/bolg/Aria2+AriaNG%E9%85%8D%E7%BD%AE%E4%BD%BF%E7%94%A8_1.1ohxweqn3ayo.jpg)

打開裡面的 index.html 檔案，如果顯示 「已連線」，則表明搭建成功。

4. 新增開機自啟動

建立 HideRun.vbs 檔案的捷徑，放入 Windows 的開機自啟動目錄即可：

在執行視窗中輸入：`shell:startup`

這裡便會打開自啟動目錄資料夾，然後將該捷徑拖入即可。

- - - - - -

參考文章：

[Aria2+AriaNG 配置指南（Win10 篇）](https://www.higgs.xyz/archives/7/)

[AriaNG 文檔](http://ariang.mayswind.net/zh_Hans/)