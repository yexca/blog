---
slug: 30
title: 'Issues and Solutions When Playing Koikatsu in VR with Quest 2'
date: '2022-03-18T16:54:23+08:00'
lastmod: '2025-01-03T21:01:01+09:00'
author: yexca
# layout: post
# permalink: /archives/30
views:
    - '7351'
categories:
    - Tinkering Notes
tags:
    - Game
    - VR
---

{{< notice >}} This article was translated by ChatGPT {{< /notice >}}

## Introduction

After playing VR games like Beat Saber and VRChat, I suddenly remembered that some Illusion games support VR. Since Koikatu is my favorite, I decided to give it a try. However, I encountered several issues, so I’m documenting them here. Note: the VR version has no story mode, and I used the vanilla version of the game, so there were fewer problems overall.

## Prerequisites / Conditions

Some of the following images and text are from the [official Oculus Support page](https://support.oculus.com/articles/headsets-and-accessories/oculus-link/index-oculus-link). I translated some parts myself, but since my English isn't great, please refer to the official content for accuracy. For full details, see [Oculus Link compatibility requirements](https://support.oculus.com/444256562873335).

### Cable Requirements

Oculus Link requires a high-quality USB cable that supports both data and power. For comfort and usability, the cable should be at least 3 meters (10 feet) long.

### PC Requirements

| Component  | Recommended Specs                            |
| ---------- | -------------------------------------------- |
| CPU        | Intel i5-4590 / AMD Ryzen 5 1500X or better  |
| GPU        | See table below                              |
| RAM        | 8 GB or more                                 |
| OS         | Windows 10                                   |
| USB Port   | At least one USB port                        |

- Supported GPUs for Oculus Link

|        NVIDIA GPUs      | Supported | Not Supported |
| ----------------------- | --------- | ------------- |
| NVIDIA Titan Z          |           | X             |
| NVIDIA Titan X          | X         |               |
| NVIDIA GTX 970          | X         |               |
| GTX 1060 (Desktop, 3GB) |           | X             |
| GTX 1060 (Desktop, 6GB) | X         |               |
| GTX 1060M               |           | X             |
| GTX 1070 (all)          | X         |               |
| GTX 1080 (all)          | X         |               |
| GTX 1650                |           | X             |
| GTX 1650 Super          | X         |               |
| GTX 1660                | X         |               |
| GTX 1660 Ti             | X         |               |
| RTX 20-series (all)     | X         |               |
| RTX 30-series (all)     | X         |               |

|     AMD GPUs    | Supported | Not Supported |
| --------------- | --------- | ------------- |
| AMD 200 Series   |           | X             |
| AMD 300 Series   |           | X             |
| AMD 400 Series   | X         |               |
| AMD 500 Series   | X         |               |
| AMD 5000 Series  | X         |               |
| AMD 6000 Series  | X         |               |
| AMD Vega Series  | X         |               |

## 1. Launching the Game

To launch the VR version, simply open `KoikatuVR.exe`. Since this uses Steam streaming, you should start SteamVR beforehand.

Before playing, make sure to wear your headphones and lock your door to avoid... unexpected situations. If you can’t, then just play responsibly (doge).

### Problem 1: Can’t Enter SteamVR

#### Step 1: Ensure All Required Software Is Installed

##### 1) Install SteamVR

Open Steam, press `Win+R`, enter `steam://run/250820`, and hit enter. This will trigger the installation of SteamVR.

##### 2) Install Oculus Software

Go to the [Oculus setup page](https://www.oculus.com/setup/). After installation, additional files will be downloaded, and you’ll be prompted to log in. Make sure your network is working properly.

If asked for a payment method, look for a “Skip” button.

###### Stuck on Loading at Login?

You can fix this by modifying your hosts file. I recommend using Huorong (a Chinese antivirus tool) to edit it safely.

If you don’t use Huorong, go to `C:\Windows\System32\drivers\etc`, find the file named `hosts`, and open it with Notepad.

Add the following lines at the end:

```text

157.240.11.49 graph.oculus.com
157.240.11.49 www2.oculus.com
157.240.8.49 scontent.oculuscdn.com
157.240.8.49 securecdn.oculus.com

```

Save the file. If you're not using Huorong, save it elsewhere first and move it back, removing any `.txt` extension.

#### Step 2: Check the Link Cable

The Oculus app will prompt you to test the Link cable during setup. If you skipped it, go to `Devices > Quest2 and Touch - USB Test` to test again.

#### Step 3: Check Settings

##### 1) Quest2 Device Settings

When you connect your Quest2 via USB, it will ask if you want to allow data access. Select “Deny.” If you allowed it by mistake, unplug and reconnect, then choose “Deny.”

##### 2) Oculus Software Settings

SteamVR will prompt you to allow “unknown sources.” Click “Allow.”  
Alternatively, go to `Settings > General > Unknown Sources` in the Oculus software.

#### Step 4: Still Not Working? Try This Sequence

##### 1) Quest2 Device

After connecting to your PC, you should see a popup asking to “Enable Oculus Link.” Click “Enable.”

If no popup appears, go to the Quick Settings panel on the bottom left and click “Oculus Link.”

##### 2) Start SteamVR

Surely you know how to launch SteamVR... right? (doge)

If your VR device is connected before starting Steam, the top-right corner of Steam should show a “VR” button. Click it to start.

If not, right-click the Steam icon in your system tray and select the second-last option — that’s SteamVR.  
Or enable the "Tools" view in your Steam library to find SteamVR listed there.

## 2. Starting the Game

I don’t really know what to write here — this section exists just to make Problem 2 game-related (doge).

Launching `KoikatuVR.exe` will auto-start SteamVR. So you can open KoikatuVR after launching Oculus Link on your Quest2.  
**Note: The game also opens a window on your desktop. You can press `Win+D` to minimize all windows. But when you take off and put your headset back on, the window may reappear. Just a heads-up.**

### Problem 2: Can’t Start the Game / Don’t Know How

You might’ve read elsewhere or seen videos saying only certain devices are supported (I forgot which).  
If you also tested “VR Kanojo” and assumed it uses eye tracking to select — that’s incorrect (I thought so too lol).

**Just press the joystick to bring up a selection line, then use the front trigger to confirm.**  
(See *3. Controls* for more input info.)

### Problem 3: White Screen After Starting / Stuck on Loading

Go to the [Koikatu DL page](https://dlsoft.dmm.co.jp/detail/illusion_0023/) and scroll down to download the `コイカツ VR パッチ`.

Direct link: [VR Patch Download](https://sample9.dmm.co.jp/digital/pcgame/illusion_0023/vr_patch.zip)

Unzip the file and run the executable. It’ll create a `コイカツ！VR_0531` folder. Copy the contents of the `setup` folder into your game directory and overwrite when prompted.

Note: According to the original author, this patch may limit positions to only three. I didn’t verify it myself since I didn’t play far. I initially wanted to play the story in VR, but that’s not supported. Here’s their (edited) fix:

> You need to use the positions in Story Mode first, then they become available in VR. So just go through all positions during battles, then save at night, exit, switch to VR, and they’ll be available.

Source (Chinese): [Anyone Tried the VR Version?](https://tieba.baidu.com/p/7620121778?prev=frs&source=frs#/)

## 3. Controls

**These are based on personal gameplay and only cover the basics.** For full controls, consult other guides.

### 1) Starting the Game

You’ll see two options after launch:

- スタート = Start  
- エンド = End

Press the joystick to show a selection line, and confirm with the front trigger.

### 2) In-Game Interface

Text will appear near your wrist. Use the `Y` and `B` buttons to switch tabs.

There are two tabs normally and a third (Move) during combat:

| Japanese   | English | Description      | Function                                                      |
| ---------- | ------- | ---------------- | ------------------------------------------------------------- |
| アクション | Action  | Actions           | Front trigger to act, side trigger for menu, joystick to select |
| システム   | System  | System Settings   | Front trigger to reset position                               |
| 移動       | Move    | Movement          | Hold front trigger to rotate view                             |

### 3) Notes

You can only use the joystick to select options while on the “アクション” (Action) tab.

## References

- [Oculus Link Official](https://support.oculus.com/articles/headsets-and-accessories/oculus-link/index-oculus-link)
- [Anyone Tried the VR Version? (Chinese)](https://tieba.baidu.com/p/7620121778?prev=frs&source=frs#/)
- [Fix Oculus Client Login/Install Issues on Win10 (CSDN, Chinese)](https://blog.csdn.net/mo_qi_qi/article/details/83795668)
- [“China Mobile” in Japanese](http://www.ichacha.net/jp/中国移动.html) ~~(Don’t ask why this is here. I don’t speak Japanese lol)~~

![yexca-30](https://count.getloli.com/@yexca-30)
