---
slug: 76
title: 'Arch Linux Installation Log in a VM'
date: '2022-10-02T13:39:26+08:00'
author: yexca
# layout: post
# permalink: /archives/76
views:
    - '260'
categories:
    - Tech Learning
tags:
    - Arch Linux
---

{{< notice >}} This article was translated by gemini-2.5-flash {{< /notice >}}

## Intro

Installing in a VM, using Fedora's *Boxes* software.

## Pre-install Setup

### Download Image

Grab it from the [official download page](https://archlinux.org/download/). BT download is recommended (use a proper torrent client, like [qBittorrent](https://www.qbittorrent.org/)).

Then drop it into your VM.

### Verify Boot Mode

List the efivars directory:

```bash
ls /sys/firmware/efi/efivars
```

If the directory shows up correctly with no errors, your system is booting in UEFI mode. If it's missing, you're likely in [BIOS](https://zh.wikipedia.org/wiki/BIOS) mode (or CSM mode).

This VM uses BIOS mode.

### Connect to the Internet

Network interface and DHCP service are enabled by default, no config needed.

### Update System Time

Enable sync with Network Time Protocol (NTP) server:

```bash
timedatectl set-ntp true
```

You can check service status with `timedatectl status`.

### Create Disk Partitions

Used the classic `fdisk` command for partitioning (MBR). Since it's BIOS boot, I followed the official partitioning example, making only two partitions (swap and one for everything else).

Use `fdisk -l` to list all disks (you can ignore devices ending in rom, loop, or airoot).

Start partitioning with `fdisk /dev/device_name`.

| Command | Description         |
| ------- | ------------------- |
| n       | Create new partition |
| p       | Check partitions    |
| t       | Change partition type |
| w       | Save changes        |

Specify partition size using `+`+`num`+`K/M/G/T/P`. If no suffix (`K/M/G/T/P`), it allocates sectors.

### Format Partitions

* Create swap partition

```bash
mkswap /dev/swap_partition
```

* Create filesystem

Commands vary based on filesystem. For example, ext4:

```bash
mkfs -t ext4 /dev/partition
```

### Mount Partitions

Mount the root partition to `/mnt`. If you have multiple partitions, make sure to mount the root partition first.

```bash
mount /dev/partition /mnt
```

Enable swap:

```bash
swapon /dev/swap_partition
```

## Installation

### Select Mirrors

The `/etc/pacman.d/mirrorlist` file defines where packages are downloaded from. It updates automatically once connected to the internet, or you can change it manually. I'm leaving it as is.

### Install Packages

Use the `pacstrap` script to install the `base` package, Linux kernel, and `vim`. If you need other packages, just add their names to the command below. You can always install more later with `pacman`.

```bash
pacstrap /mnt base linux vim
```

## System Config

### Fstab

The `/etc/fstab` file describes how partitions are automatically mounted at system startup. You can generate it automatically with the following command (use `-U` or `-L` for UUIDs or labels; using UUIDs helps prevent boot issues).

```bash
genfstab -U /mnt >> /mnt/etc/fstab
```

Check if auto-config is correct:

```bash
cat /mnt/etc/fstab
```

### Chroot

Chroot into the newly installed system:

```bash
arch-chroot /mnt
```

### Time Zone

Taking Shanghai time as an example:

```bash
ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
```

Generate `/etc/adjtime`:

```bash
hwclock --systohc
```

Now you can use the `date` command to check if the time is correct.

### Localization

Edit `/etc/locale.gen` and uncomment `en_GB.UTF-8`.

Then generate locale info:

```bash
locale-gen
```

Create `/etc/locale.conf` and edit the `LANG` variable, e.g., `LANG=en_GB.UTF-8`.

### Network Configuration

Create `/etc/hostname` and enter your hostname.

Since the VM uses DHCP, I'm skipping [network configuration](https://wiki.archlinux.org/title/%E7%BD%91%E7%BB%9C%E9%85%8D%E7%BD%AE).

### Root Password

```bash
passwd
```

### Install Bootloader

Typically, you'd install GRUB. My VM is BIOS+MBR, so I'm installing the `grub` package.

```bash
pacman -S grub
```

Install GRUB (for the command below, use `/dev/device`, not a partition):

```bash
grub-install --target=i386-pc /dev/device
```

Generate config file:

```bash
grub-mkconfig -o /boot/grub/grub.cfg
```

## Reboot

Use `exit` or `Ctrl+D` to leave the chroot environment.

Use `umount -R /mnt` to unmount the mounted partitions.

Reboot with `reboot`.

## References

[Installation guide (Simplified Chinese) - ArchWiki](https://wiki.archlinux.org/title/Installation_guide_(%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87))
