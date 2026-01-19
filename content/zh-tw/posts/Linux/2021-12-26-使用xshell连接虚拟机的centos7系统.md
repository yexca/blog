---
slug: 18
title: 使用 Xshell 連線虛擬機的 CentOS 7 系統
date: '2021-12-26T15:34:59+08:00'
author: yexca
# layout: post
# permalink: /archives/18
views:
    - '357'
categories:
    - 技術學習
tags:
    - Xshell
    - CentOS
---

{{< notice >}} 本文由 gemini-3-flash-preview 翻譯 {{< /notice >}}

注意：此方法為暫時連線，虛擬機重啟或關機後需要重新設定

## 虛擬機網路配接器設定

虛擬機的網路配接器共有三種設定：

- 橋接模式：指使用本機網路網段
- NAT 模式：使用 VMware Network Adapter VMnet8 的網段
- Host-only (僅主機模式)：使用 VMware Network Adapter VMnet1 的網段

## 查看 IP 網段

打開 VMware 左上角的「編輯 - 虛擬網路編輯器」即可看到 VMnet1 和 VMnet8 對應的網段位址 (子網路位址)

橋接模式的網段需要打開「設定 - 網路和網際網路 - 進階網路設定」，找到相對應的本機連線網路：

- 如果使用 WiFi 連線，點擊「WLAN - 查看其他內容」即可看到 IP 位址
- 如果使用有線連線，點擊「乙太網路 - 查看其他內容」即可看到 IP 位址

注意：如果本機同時連線了乙太網路和 WIFI，則可能需要對 VMware 左上角的「編輯 - 虛擬網路編輯器」進行相關設定。

需要給予 VMware 管理員權限，如圖所示選擇想要 VMware 連線的網路卡：

![image](https://cdn.statically.io/gh/yexca/picx-images-hosting@master/2021/12-xshell-连接虚拟机-centos7/vmware-网卡.6pvdvehvzz40.webp)

## 設定虛擬機的 IP 位址

註：我使用的是橋接模式，我的本機 IP 為 192.168.1.116，那麼我可以將虛擬機設定為 192.168.1.0-192.168.1.255 中的任意一個 (除 192.168.1.116)，即前三段相同，最後一段不同即可。

首先，打開虛擬機並登入 root 使用者，輸入 `ifconfig` 命令查看網路卡配置：

![image](https://cdn.statically.io/gh/yexca/picx-images-hosting@master/2021/12-xshell-连接虚拟机-centos7/虚拟机-IP-配置.56i9yy8tjfo0.webp)

如果如圖出現 「ens33」和「lo」或者「其他」和「lo」：

輸入命令：

```bash

# ifconfig 裝置名稱 (本例為 "ens33") 要分配的位址 (這裡選擇的是 192.168.1.110)
ifconfig ens33 192.168.1.110

```

如果僅出現「lo」：

輸入命令：

```bash

# ifconfig 裝置名稱 (一般為 "eth0") 要分配的位址 (這裡選擇的是 192.168.1.110)
ifconfig eth0 192.168.1.110

```

設定完成後，可再次輸入 `ifconfig` 命令查看網路卡配置：

![image](https://cdn.statically.io/gh/yexca/picx-images-hosting@master/2021/12-xshell-连接虚拟机-centos7/虚拟机-IP-配置-2.2fy0k801s03.webp)

如上圖 IP 成功改為 192.168.1.110。

可以打開「Windows 終端機」，輸入 `ping 192.168.1.110` 查看是否生效：

![image](https://cdn.statically.io/gh/yexca/picx-images-hosting@master/2021/12-xshell-连接虚拟机-centos7/ping-连接.5un7zgka3b00.webp)

如圖所示即表示 IP 修改成功且可以連通。

## 使用 Xshell 連線

打開 Xshell，點擊「新增」，名稱可自行決定，主機填寫 IP，然後點擊「連線」：

![image](https://cdn.statically.io/gh/yexca/picx-images-hosting@master/2021/12-xshell-连接虚拟机-centos7/xshell-连接界面.7jwpta0nork0.webp)

選擇「接受並儲存」，然後跟隨提示輸入使用者名稱 (root) 和密碼即可：

![image](https://cdn.statically.io/gh/yexca/picx-images-hosting@master/2021/12-xshell-连接虚拟机-centos7/xshell-连接成功.752g8y4vdsg0.webp)
