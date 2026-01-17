---
slug: 71
title: 'Fedora 安裝 Komga 折騰紀錄'
date: '2022-09-14T18:47:16+08:00'
author: yexca
# layout: post
# permalink: /archives/71
views:
    - '472'
categories:
    - 折騰經驗
tags:
    - Docker
    - Komga
---

{{< notice >}} 本文由 gemini-3-flash-preview 翻譯 {{< /notice >}}

## 前言

為了在區域網路內更方便地看漫畫。

## IP 設定

路由器為 OpenWRT 系統。

### 路由器設定

在 *網路 - IP/MAC 綁定* 將電腦綁定一個固定的 IP。

### Fedora 設定

因為我設定的 IP 與自動分配的不一致（有線連接），故需要手動修改。

在 *網路 - 設定* 的 *身分* 加上 *MAC 位址*，*IPv4* 改為 *手動*，位址依序為 *IP、255.255.255.255、路由器 IP*，*DNS* 加上 *路由器 IP*，未取消勾選自動。

### 網域劫持

儘管可以透過 IP 直接存取，但是有一個網域名稱會更加好記吧。

在路由器 *網路 - 主機名稱* 的 *主機名稱* 處填入網域名稱，*IP 位址* 處填入電腦的 IP。

## 安裝 Docker

安裝了有 GUI 的 Docker Desktop。

### 設定儲存庫

```bash
dnf -y install dnf-plugins-core
```

```bash
sudo dnf config-manager \
    --add-repo \
    https://download.docker.com/linux/fedora/docker-ce.repo
```

### 下載 RPM 套件

在 [官網 Download 處](https://docs.docker.com/desktop/install/linux-install/) 下載。

下載完成後直接雙擊安裝。

## 安裝 Komga

### Docker 設定

* 檔案共享設定

在 Docker Desktop 的 *設定 - Resources - File sharing* 加入漫畫路徑。

註：*如果共享的目錄在下次啟動時不存在 (未掛載)，Docker 將無法正常啟動。*

* 網路設定

不清楚是否非必須，在 *設定 - Resources - Network* 設定為自己的網段。

### 命令列安裝

直接在 Shell 執行：

```bash
docker run \
  --name=komga \
  --user 1000:1000 \
  -p 2333:8080 \
  -v /home/yexca/komga/config:/config \
  -v /home/yexca/komga/data:/data \
  --restart unless-stopped \
  gotson/komga:latest
```

* -p

前一個為本機映射埠號，後一個為容器埠號。

* -v

檔案映射，將本機的目錄 (/home/yexca/komga/config) 映射到容器的 (/config)。

註：無法映射本機的隱藏檔案（以 `.` 開頭的檔案）。

### GUI 安裝

在上一步完成後，Docker Desktop 的 *Images* 會多出一個 *gotson/komga*，點擊 *run*，然後進行配置：

* 第一行：名稱

* Ports：映射到本機的埠號，比如 80，這樣就可以直接以網域名稱存取了。

* Volumes：路徑映射。

* Environment variables：環境變數，此處用不到。

### 檢查是否執行

使用指令查看：

```bash
docker ps -a
```

## 防火牆配置

開啟埠號：

```bash
firewall-cmd --zone=public --add-port=80/tcp
```

載入設定：

```bash
firewall-cmd --reload
```

查看埠號開啟狀態：

```bash
firewall-cmd --zone=public --query-port=80/tcp
```

可能需要新增服務：

```bash
firewall-cmd --add-service=http
```

如果真的無法開啟就用 GUI 吧 ~~(一開始就用會更快吧)~~：

```bash
sudo yum install firewall-config
```

## 參考文章

[Install Docker Desktop on Fedora - Docker Documentation](https://docs.docker.com/desktop/install/fedora/)

[【Docker】Error response from daemon: invalid mount config for type "bind": bind source path does not exist - Qiita](https://qiita.com/ucan-lab/items/7c0ca7db70deb56ad4fa)

[Run with Docker - Komga](https://komga.org/installation/docker.html#version-tags)

[簡約但絕不簡單的 Komga - 老蘇的 blog](https://laosu.ml/2021/08/02/%E7%AE%80%E7%BA%A6%E4%BD%86%E7%BB%9D%E4%B8%8D%E7%AE%80%E5%8D%95%E7%9A%84Komga/)

[fedora 28 , firewalld 防火牆控制，firewall-cmd 管理防火牆規則 - xuyaowen - 博客園](https://www.cnblogs.com/xuyaowen/p/linxu_firewalld.html)

[Fedora 防火牆配置 - 上官飛鴻 - 博客園](https://www.cnblogs.com/jackadam/p/9483381.html)

[原神自動簽到 (Linux 伺服器 Docker) - yexca'Blog](http://blog.yexca.net/archives/47)

[Fedora 打開 8080 端口_chunqi zhi 的博客 - CSDN 博客](https://blog.csdn.net/zhichunqi/article/details/80488567)
