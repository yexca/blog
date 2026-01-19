---
slug: 18
title: Connecting to a CentOS 7 VM via Xshell
date: '2021-12-26T15:34:59+08:00'
author: yexca
# layout: post
# permalink: /archives/18
views:
    - '357'
categories:
    - Tech Learning
tags:
    - Xshell
    - CentOS
---

{{< notice >}} This article was translated by gemini-3-flash-preview {{< /notice >}}

Note: This method is for a temporary connection. You will need to reconfigure it if the virtual machine restarts or shuts down.

## VM Network Adapter Settings

There are three main network adapter modes for virtual machines:

- **Bridged Mode**: Uses the same network segment as the host machine.
- **NAT Mode**: Uses the network segment assigned to VMware Network Adapter VMnet8.
- **Host-only Mode**: Uses the network segment assigned to VMware Network Adapter VMnet1.

## Checking the IP Segment

In VMware, go to **Edit -> Virtual Network Editor** to see the subnet addresses for VMnet1 and VMnet8.

For Bridged mode, you need to check your host's network: go to **Settings -> Network & Internet -> Advanced network settings** and find your active connection.

- If using WiFi: Click **WLAN -> View additional properties** to see the IP address.
- If using Ethernet: Click **Ethernet -> View additional properties** to see the IP address.

Note: If your host is connected to both Ethernet and WiFi, you might need to manually configure the bridge in the Virtual Network Editor.

You'll need admin rights. Select the specific network card you want VMware to bridge to, as shown below:

![image](https://cdn.statically.io/gh/yexca/picx-images-hosting@master/2021/12-xshell-连接虚拟机-centos7/vmware-网卡.6pvdvehvzz40.webp)

## Setting the VM's IP Address

Example: I'm using Bridged mode. My host IP is `192.168.1.116`. I can set the VM to any address between `192.168.1.0` and `192.168.1.255` (except `192.168.1.116`). The first three segments must match.

First, log in to the VM as `root` and run `ifconfig` to check the current configuration.

![image](https://cdn.statically.io/gh/yexca/picx-images-hosting@master/2021/12-xshell-连接虚拟机-centos7/虚拟机-IP-配置.56i9yy8tjfo0.webp)

If you see `ens33` and `lo` (or another name and `lo`):

Run:

```bash
# ifconfig [device_name] [ip_address]
ifconfig ens33 192.168.1.110
```

If only `lo` appears:

Run:

```bash
# Usually the device is eth0
ifconfig eth0 192.168.1.110
```

After configuring, run `ifconfig` again to verify.

![image](https://cdn.statically.io/gh/yexca/picx-images-hosting@master/2021/12-xshell-连接虚拟机-centos7/虚拟机-IP-配置-2.2fy0k801s03.webp)

The IP is now successfully changed to `192.168.1.110`.

Test the connection from your Windows terminal using `ping 192.168.1.110`.

![image](https://cdn.statically.io/gh/yexca/picx-images-hosting@master/2021/12-xshell-连接虚拟机-centos7/ping-连接.5un7zgka3b00.webp)

If you get a response, the IP is reachable.

## Connecting via Xshell

Open Xshell, click **New**. Give it a name, enter the IP address in the **Host** field, and click **Connect**.

![image](https://cdn.statically.io/gh/yexca/picx-images-hosting@master/2021/12-xshell-连接虚拟机-centos7/xshell-连接界面.7jwpta0nork0.webp)

Select **Accept and Save** for the host key, then enter your username (`root`) and password when prompted.

![image](https://cdn.statically.io/gh/yexca/picx-images-hosting@master/2021/12-xshell-连接虚拟机-centos7/xshell-连接成功.752g8y4vdsg0.webp)
