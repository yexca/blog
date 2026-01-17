---
slug: 258
title: '漫畫與音訊網站折騰'
# draft: true
author: yexca
date: '2025-10-05T01:58:35+09:00'
categories:
    - 折騰經驗
tags:
    - 設定紀錄
    - Docker
---

{{< notice >}} 本文由 gemini-2.5-flash 翻譯 {{< /notice >}}

## 前言

Google 的 Gemini Pro 訂閱附帶 2TiB 的空間，這又讓我想到了折騰，那就說做就做吧

不過再一看，[之前的折騰](/archives/73)已經過去三年了啊，時間過得確實有點快耶

## 漫畫 Komga

首先是看漫畫的 Komga，雖然掃描的時候卡卡的，但使用體驗其實還不錯吧

時隔多年，Komga 更新了不少，[之前的文章](/archives/71) 已經無法重複使用，同時使用 docker-compose 更加方便，`docker-compose.yml` 如下

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

另外有[專屬的 iOS 軟體 Komic](https://pruizlezcano.github.io/komic/) 確實挺方便的

## rclone 掛載 Google Drive

和[微軟 OneDrive](/archives/105) 類似，需要先在 Windows 平台瀏覽器認證取得 Token

具體流程就是下載好後執行指令

```bash
rclone config
```

命名後選擇 `Google Drive` (22) 後，給予 `Full access all files, excluding Application Data Folder` 權限，再按 Enter 鍵跳出瀏覽器登入，完成後退出即可

不過前期我不是很懂，申請了軟體 ID 與 Secret，好像沒什麼用，但記錄下來說不定之後可以用到

{{< details "Google 申請應用程式 API ID 與 Secret" >}}

開啟 Google API 服務網站: <https://console.developers.google.com/>

選擇 `Enable APIs and services` 搜尋並啟用 `Google Drive API`

在 Google Drive API 的 `Manage` 中 `Create credentials`

API 的類型選擇 `User data` 也就是說明包含 `OAuth` 的

在 OAuth Client ID 中類型選擇 `Web application`，名稱可輸入 `rclone`，完成後會出現 `Client ID`

然後完成建立，在 Credentials 選擇剛才建立的應用程式 rclone 進入複製金鑰 `Client secrets`

{{< /details >}}

接著把設定檔複製到伺服器，本地目錄在

```markdown
C:\Users\%USERNAME%\AppData\Roaming\rclone
```

伺服器下載 fuse，我的伺服器是 CentOS7，所以下載了這些

```bash
sudo yum install -y fuse fuse3 fuse-libs
```

較新的系統直接下載 fuse3 就行，接著用 docker 掛載

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

後面那一堆的設定參考 [Komga 官方提供](https://komga.org/docs/installation/gdrive)，具體含義為

| 參數                             | 作用                           | 說明                                                         |
| -------------------------------- | ------------------------------ | ------------------------------------------------------------ |
| `--no-checksum`                  | 跳過校驗和                     | 減少 API 呼叫，加快目錄載入速度。適合影片等大型檔案。          |
| `--use-server-modtime`           | 使用伺服器的檔案修改時間       | 避免本地與遠端時間差導致重複上傳/同步。                      |
| `--no-gzip-encoding`             | 停用 GZIP 編碼                 | 某些雲端（如 Drive）回應壓縮後效能不佳，此項目可降低 CPU 佔用率。 |
| `--no-update-modtime`            | 不更新檔案修改時間             | 唯讀用途下防止 Drive 因時間變動觸發版本更新。                |
| `--no-seek`                      | 停用隨機讀取                     | 減少對影片拖曳操作的支援，但會提高循序讀取的穩定性。適合連續播放情境。 |
| `--modify-window 2m`             | 檔案修改時間誤差容忍範圍       | 防止本地/遠端時間差引起誤判。                                |
| `--allow-other`                  | 允許系統內其他使用者存取掛載內容 | 必須系統設定 `/etc/fuse.conf` 裡允許。                       |
| `--allow-non-empty`              | 掛載非空目錄                   | 若掛載點非空也可繼續掛載。                                   |
| `--dir-cache-time 30m`           | 目錄快取時間                   | 減少頻繁請求雲端 API，預設適中。                             |
| `--cache-read-retries 15`        | 快取讀取失敗時重試次數         | 提高穩定性。                                                 |
| `--cache-db-purge`               | 每次啟動清空快取資料庫         | 防止舊快取損壞導致錯誤。適合長時間開關掛載的環境。           |
| `--timeout 30m`                  | 單次傳輸逾時上限               | 長影片或大型檔案讀取時防止斷線。                               |
| `--vfs-cache-mode full`          | 完整快取模式                   | 讀取寫入都透過本地快取。效能最平衡、最安全。                 |
| `--vfs-read-chunk-size 2M`       | 每次下載區塊大小                 | 越小越節省頻寬，但越頻繁。此設定適合低頻寬環境。             |
| `--vfs-read-chunk-size-limit 5M` | 最大區塊大小限制                 | 限制增長幅度，防止一次請求太大導致逾時。                     |
| `--vfs-cache-max-age 30m`        | 快取檔案最大存活時間           | 比較短的時間，適合節省空間。                                 |
| `--attr-timeout 20s`             | 檔案屬性快取時間               | 防止頻繁 stat() 呼叫；20s 為折衷值。                         |
| `--poll-interval 9m`             | 雲端變更輪詢間隔               | 9 分鐘檢查一次變動，減輕 Google API 負擔。                   |
| `--vfs-cache-poll-interval 10m`  | 本地快取清理間隔               | 每 10 分鐘清理一次過期快取。                                 |

## Alpine Linux 的使用

因為佔用過高，所以我想到了極其輕量化的 Alpine

### Docker 安裝

首先更新軟體

```bash
doas apk update
```

安裝 Docker

```bash
doas apk add docker docker-cli-compose
```

設定開機啟動

```bash
rc-update add docker default
```

啟動 Docker，可能需要等一下

```bash
doas service docker start
```

新增自己到 Docker 使用者群組

```bash
doas addgroup ${USER} docker
```

---

參考文章

<https://wiki.alpinelinux.org/wiki/Docker>

---

### swap 建立

首先新增交換空間

```bash
doas fallocate -l 8G /swapfile
```

設定權限只能 root 存取

```bash
doas chmod 600 /swapfile
```

格式化 swap

```bash
doas mkswap /swapfile
```

啟用 swap

```bash
doas swapon /swapfile
```

然後可以檢視是否生效

```bash
free -h
```

### rclone 設定

因為過於輕量化，所以需要一些額外設定

首先安裝 fuse

```bash
doas apk add fuse
```

掛載裝置

```bash
doas modprobe fuse
```

然後需要修改根目錄為 share 類型

```bash
doas mount --make-rshared /
```

之後就和 CentOS7 類似了

---

參考文章

- [How to Install Rclone on Alpine Linux Latest](https://ipv6.rs/tutorial/Alpine_Linux_Latest/rclone/)

- [Alpine Linux Wiki Rclone](https://wiki.alpinelinux.org/wiki/Rclone)

---

## Kikoeru

剛開始走了一點彎路，最後也失敗了，就記錄一下吧

{{< details "一整個下午的失敗 TT" >}}

我循著經典的 kikoeru project 的 fork 尋找最新提交的一個，雖然找到了 [XunJiJiang/kikoeru-express](https://github.com/XunJiJiang/kikoeru-express)，但我嘗試建構映像檔試了一整個下午，從 node.js 12 試到 16，各種錯誤，換映像檔來源等方法都試過了，然後想著單獨部署也都是建構失敗，試著不使用 Docker 建構也失敗，到最後我真的妥協了，用經典的 0.6.2 吧

哇，我真的，推薦 node.js 版本 12-14，但是實際建構的時候，執行到某個步驟，提示是 16 以上的特性，我直接用 14 以上 `npm i` 會報錯，只好用 13 版本先安裝依賴，完成後再複製過來，用 16 版本建構，沒想到這樣折騰了一整個下午，不過說實話，這讓我學會熟練切換 node.js 版本了，真是 XD

我之前下載的一個 iOS 軟體，便開啟試著連線異常，檢視更新紀錄，提示使用 0.6.14 版本以上，我大受震撼，緊接著搜尋到我已經 star 的 [Number178/kikoeru-express](https://github.com/Number178/kikoeru-express) 😂

{{< /details >}}

使用在更新的 [Number178/kikoeru-express](https://github.com/Number178/kikoeru-express)，同時該作者還開發了 iOS 軟體，非常方便

設定檔

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

然後就是，標籤的語言是不能切換的，預設是簡中，如果需要日語的話，需要在掃描前就切換
