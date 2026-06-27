---
slug: 31
title: 'Adding Custom Song Packs to Beat Saber'
date: '2022-03-18T17:46:00+08:00'
author: yexca
# layout: post
# permalink: /archives/31
views:
    - '1049'
categories:
    - Tinkering Notes
tags:
    - Game
    - Beat Saber
---

{{< notice >}} This article was translated by gemini-2.5-flash-lite {{< /notice >}}

## Introduction

I recently bought Beat Saber (on the Argentinian store), and wanted to add custom songs. I found a tutorial by [WGzeyu](https://bs.wgzeyu.com/) in the Steam reviews. Since my goal is simple, and their tutorial is quite comprehensive, I'm writing this article to summarize it.

## 1. Preparation

Note: **Update 2022.03.25: I checked today and mods for 1.20.0 are available. See step two directly. The data restoration section has also been updated.**

### 1) Downgrading

The current latest version, 1.20.0, doesn't have mods yet. So, you need to downgrade. You can upgrade again after mods are updated.

#### <1> Download version 1.19.0 or earlier

You can download from [this cloud drive provided by WGzeyu](https://zfile.imoto.love/#/1/main/%E6%B8%B8%E6%88%8F%E5%A4%87%E4%BB%BD%E4%B8%8E%E6%87%92%E4%BA%BA%E5%8C%85). Choose the version you want and download it.

Direct link: [1.19.0](https://zfile.backend.imoto.love/BeatSaber%E8%B5%84%E6%BA%90/%E6%B8%B8%E6%88%8F%E5%A4%87%E4%BB%BD%E4%B8%8E%E6%87%92%E4%BA%BA%E5%8C%85/%E6%9B%B4%E6%96%B0%E4%BA%8E%5B2021-12-10%5D_BS1.19.0-Steam%E5%8E%9F%E7%89%88%E5%A4%87%E4%BB%BD.7z?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20220318T091129Z&X-Amz-SignedHeaders=host&X-Amz-Expires=1800&X-Amz-Credential=0021598ce5a9e88000000000a/20220318/us-west-002/s3/aws4_request&X-Amz-Signature=cc2be80e633bee85d365eeae7eecc84246daeea5cc1b54d8cdb1e090aaf3cd16)[steam version](https://zfile.backend.imoto.love/BeatSaber%E8%B5%84%E6%BA%90/%E6%B8%B8%E6%88%8F%E5%A4%87%E4%BB%BD%E4%B8%8E%E6%87%92%E4%BA%BA%E5%8C%85/%E6%9B%B4%E6%96%B0%E4%BA%8E%5B2021-12-10%5D_BS1.19.0-Steam%E5%8E%9F%E7%89%88%E5%A4%87%E4%BB%BD.7z?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20220318T091129Z&X-Amz-SignedHeaders=host&X-Amz-Expires=1800&X-Amz-Credential=0021598ce5a9e88000000000a/20220318/us-west-002/s3/aws4_request&X-Amz-Signature=cc2be80e633bee85d365eeae7eecc84246daeea5cc1b54d8cdb1e090aaf3cd16)

#### <2> Replace the 1.20.0 version

Extract the downloaded file. Then, open the game's directory via Steam. Go up one level, rename the "Beat Saber" folder to "Beat Saber 1.20.0". Then, rename the downloaded file to "Beat Saber" and move it into this folder.

#### <3> How to restore data

<1> Use Steam to open the game directory. Delete "Beat Saber IPA" from the UserData folder.
<2> Copy the following folders (copy as needed):

* UserData (Mod settings)
* CustomSabers (Lightsaber models)
* CustomPlatforms (Stage models)
* CustomAvatars (Avatar models)
* CustomNotes (Block models)

<3> Navigate to the "Beat Saber 1.20.0" folder. Paste the copied folders. When prompted, select "Replace".
<4> Open the "Beat Saber" folder. Go into the Beat Saber\_Data folder and cut the CustomLevels folder.
<5> Navigate to the "Beat Saber 1.20.0" folder. Go into the Beat Saber\_Data folder. Paste the cut folder. When prompted, select "Replace".

Finally, delete the "Beat Saber" folder and rename "Beat Saber 1.20.0" to "Beat Saber".

### 2) Required Software

#### <1> Mod Manager "ModAssistant"

This software has English and Chinese versions. Download as needed. Cloud drive link: [Cloud Drive](https://zfile.imoto.love/#/1/main/%E5%B7%A5%E5%85%B7%EF%BC%88%E5%A6%82Mod%E5%AE%89%E8%A3%85%E5%99%A8%E3%80%81%E8%B0%B1%E9%9D%A2%E7%BC%96%E8%BE%91%E5%99%A8%E7%AD%89BS%E7%9B%B8%E5%85%B3%E8%BD%AF%E4%BB%B6%EF%BC%89)

Direct link: [ModAssistant Chinese Enhanced Version Mod Installer, Supports PC, Not Quest](https://zfile.backend.imoto.love/BeatSaber%E8%B5%84%E6%BA%90/%E5%B7%A5%E5%85%B7%EF%BC%88%E5%A6%82Mod%E5%AE%89%E8%A3%85%E5%99%A8%E3%80%81%E8%B0%B1%E9%9D%A2%E7%BC%96%E8%BE%91%E5%99%A8%E7%AD%89BS%E7%9B%B8%E5%85%B3%E8%BD%AF%E4%BB%B6%EF%BC%89/ModAssistant%E4%B8%AD%E6%96%87%E5%A2%9E%E5%BC%BA%E7%89%88Mod%E5%AE%89%E8%A3%85%E5%99%A8%EF%BC%8C%E6%94%AF%E6%8C%81PC%E4%B8%8D%E6%94%AF%E6%8C%81Quest.exe?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20220318T092216Z&X-Amz-SignedHeaders=host&X-Amz-Expires=1800&X-Amz-Credential=0021598ce5a9e88000000000a/20220318/us-west-002/s3/aws4_request&X-Amz-Signature=e26018f6434606a63ca2bc428fa1c87d1d60cfbbdbf8afb6375aa282308f0405)

#### <2> BeatSaber Song Path Manager

You can download this from the cloud drive link above. Direct link: [BeatSaber Song Path Manager](https://zfile.backend.imoto.love/BeatSaber%E8%B5%84%E6%BA%90/%E5%B7%A5%E5%85%B7%EF%BC%88%E5%A6%82Mod%E5%AE%89%E8%A3%85%E5%99%A8%E3%80%81%E8%B0%B1%E9%9D%A2%E7%BC%96%E8%BE%91%E5%99%A8%E7%AD%89BS%E7%9B%B8%E5%85%B3%E8%BD%AF%E4%BB%B6%EF%BC%89/BeatSaber%E6%AD%8C%E6%9B%B2%E8%B7%AF%E5%BE%84%E7%AE%A1%E7%90%86%E5%99%A8-5.3.exe?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20220318T092357Z&X-Amz-SignedHeaders=host&X-Amz-Expires=1800&X-Amz-Credential=0021598ce5a9e88000000000a/20220318/us-west-002/s3/aws4_request&X-Amz-Signature=bef28996aa91b4c2caebc67e9fc85bc6c5287060682159bb1e421a0be2df1dd6) (Version 5.3, might be outdated due to updates)

#### <3> ResilioSync

You can download this from the cloud drive link above. Official website: [ResilioSync](https://www.resilio.com/individuals/)

Direct link: [ResilioSync 64-bit](https://zfile.backend.imoto.love/BeatSaber%E8%B5%84%E6%BA%90/%E5%B7%A5%E5%85%B7%EF%BC%88%E5%A6%82Mod%E5%AE%89%E8%A3%85%E5%99%A8%E3%80%81%E8%B0%B1%E9%9D%A2%E7%BC%96%E8%BE%91%E5%99%A8%E7%AD%89BS%E7%9B%B8%E5%85%B3%E8%BD%AF%E4%BB%B6%EF%BC%89/Resilio-Sync_64bit.exe?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20220318T093036Z&X-Amz-SignedHeaders=host&X-Amz-Expires=1800&X-Amz-Credential=0021598ce5a9e88000000000a/20220318/us-west-002/s3/aws4_request&X-Amz-Signature=35909c49580c01baa00f853fb4d7a77a1344cd2cc618d8584997dc3be85df0a0)

### 3) Folders

The software mentioned above, except for ResilioSync, are single-file applications. You can place them in a folder for common software.

You also need to create a folder where you want to store your songs, e.g., "E:\\games\\Beat Saber Song\\". Any location is fine.

## 2. Steps

### 1) Launch Beat Saber once

### 2) Open "ModAssistant"

Click "Agree" to access the "Mod" interface on the left. You can select the game version at the bottom left. After selecting, you can install mods or start the installation directly.

If the download is too slow, you can change the software source to a domestic one in "Options".

### 3) Launch Beat Saber once

### 4) Open ResilioSync

Please refer to: [Beat Saber Song Pack Resource Synchronization – ResilioSync (wgzeyu.com)](https://bs.wgzeyu.com/songs/) for this part.

You'll end up opening this webpage anyway, so since there are already steps there, I won't write them out (too lazy).

Select the folder you created in the previous step as the download directory.

### 5) Open BeatSaber Song Path Manager

On first launch, follow the prompts. Then click "Add Directory" and select the folder where you store your songs (which is the download directory from the previous step).

Then click "Save List".

## 3. Further Steps

If you have other needs, please refer to [WGzeyu](https://bs.wgzeyu.com/)'s [tutorial](https://bs.wgzeyu.com/pc-guide/).
