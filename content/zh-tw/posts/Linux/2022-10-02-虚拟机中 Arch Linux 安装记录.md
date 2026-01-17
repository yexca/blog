---
slug: 76
title: '虛擬機中 Arch Linux 安裝紀錄'
date: '2022-10-02T13:39:26+08:00'
author: yexca
# layout: post
# permalink: /archives/76
views:
    - '260'
categories:
    - 技術學習
tags:
    - Arch Linux
---

{{< notice >}} 本文由 gemini-2.5-flash 翻譯 {{< /notice >}}

## 引言

使用虛擬機安裝，軟體為 Fedora 的 *盒子*

## 安裝前準備

### 下載映像檔

從[官方下載頁面](https://archlinux.org/download/)下載，推薦使用 BT 下載 (請使用正規 torrent 客戶端，例如 [qBittorrent](https://www.qbittorrent.org/))

然後放到虛擬機裡

### 驗證開機模式

列出 efivars 目錄

```bash
ls /sys/firmware/efi/efivars
```

如果正確顯示目錄並且沒有回報錯誤，則系統以 UEFI 模式開機，如果目錄不存在，則可能以 [BIOS](https://zh.wikipedia.org/wiki/BIOS) 模式開機 (或 CSM 模式)

這個虛擬機中使用 BIOS 模式

### 連接到網際網路

預設開啟網路介面與 DHCP 服務，無需設定

### 更新系統時間

開啟與網路時間伺服器 (NTP) 同步

```bash
timedatectl set-ntp true
```

可使用 `timedatectl status` 檢查服務狀態

### 建立硬碟分割

使用了傳統的 `fdisk` 指令分割 (MBR 分割)，因為開機模式是 BIOS，採用官方的分割範例，只做了兩個分割區 (swap 交換分割區與其他)

使用 `fdisk -l` 列出所有磁碟 (以 rom、loop 或 airoot 結尾的裝置可以忽略)

使用 `fdisk /dev/裝置名` 開始分割

| 指令 | 描述         |
| ---- | ------------ |
| n    | 建立分割區     |
| p    | 檢查分割區     |
| t    | 變更分割區類型 |
| w    | 儲存變更     |

指定分割區大小使用 `+`+`num`+`K/M/G/T/P` ，若無後綴 (`K/M/G/T/P`) 則分配磁區

### 格式化分割區

* 建立交換分割區

```bash
mkswap /dev/交換空間分割區
```

* 建立檔案系統

根據檔案系統不同指令不同，例如 ext4 檔案系統

```bash
mkfs -t ext4 /dev/分割區
```

### 掛載分割區

將根分割區掛載到 `/mnt`，若有多個分割區，請務必先掛載根分割區

```bash
mount /dev/分割區 /mnt
```

啟用交換空間

```bash
swapon /dev/交換空間分割區
```

## 安裝

### 選擇映像檔

檔案 `/etc/pacman.d/mirrorlist` 定義了套件從何處下載，在連接到網際網路後會自動更新，也可手動更改，我就不更改了

### 安裝套件

使用 pacstrap 腳本，安裝 base 套件和 Linux 核心以及 vim，如果安裝其他套件，在下方指令後加上名稱即可，當然也可以之後使用 pacman 安裝

```bash
pacstrap /mnt base linux vim
```

## 設定系統

### Fstab

`/etc/fstab` 檔案描述系統啟動時如何自動掛載分割區，可以使用以下指令自動產生 (使用 `-U` 或 `-L` 選項設定 UUID 或磁碟區標籤，使用 UUID 以確保系統開機不會出錯)

```bash
genfstab -U /mnt >> /mnt/etc/fstab
```

檢查自動設定是否正確

```bash
cat /mnt/etc/fstab
```

### Chroot

Chroot 至新安裝的系統

```bash
arch-chroot /mnt
```

### 時區

以上海時間為例

```bash
ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
```

產生 `/etc/adjtime`

```bash
hwclock --systohc
```

此時可使用指令 `date` 查看時間是否正確

### 本土化

編輯 `/etc/locale.gen` ，取消 `en_GB.UTF-8` 的註解

然後產生 locale 資訊

```bash
locale-gen
```

建立 `/etc/locale.conf` 檔案，編輯 LANG 變數，例如 `LANG=en_GB.UTF-8`

### 網路設定

建立 `/etc/hostname` 檔案並輸入主機名稱

因為虛擬機使用 DHCP，就不[設定網路](https://wiki.archlinux.org/title/%E7%BD%91%E7%BB%9C%E9%85%8D%E7%BD%AE)了

### Root 密碼

```bash
passwd
```

### 安裝開機載入程式

一般安裝 GRUB，我使用的虛擬機是 BIOS+MBR，安裝 grub 套件

```bash
pacman -S grub
```

安裝 grub (下方指令 `/dev/裝置`，請注意不是分割區)

```bash
grub-install --target=i386-pc /dev/裝置
```

產生設定檔

```bash
grub-mkconfig -o /boot/grub/grub.cfg
```

## 重新啟動

使用 `exit` 或 `Ctrl+D` 離開 chroot 環境

使用 `umount -R /mnt` 卸載被掛載的分割區

重新啟動 `reboot`

## 參考資料

[Installation guide (繁體中文) - ArchWiki](https://wiki.archlinux.org/title/Installation_guide_(Traditional_Chinese))
