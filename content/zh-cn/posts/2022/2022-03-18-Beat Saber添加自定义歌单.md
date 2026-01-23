---
slug: 31
title: 'Beat Saber 添加自定义歌单'
date: '2022-03-18T17:46:00+08:00'
author: yexca
# layout: post
# permalink: /archives/31
views:
    - '1049'
categories:
    - 折腾经验
tags:
    - Game
    - Beat Saber
---

## 引言

近期入正了Beat Saber(虽然是阿区)，于是便想着去添加自定义歌曲，通过steam的评论区得知[WGzeyu](https://bs.wgzeyu.com/)大佬做了相关教程，但由于本人目的简单，而教程比较全，特写此文章进行总结

## 一、准备

注: **2022.03.25: 今日更改相关东西发现 1.20.0 已有 Mod，请直接看第二步，同时，恢复数据部分已更新**

### 1）降级

由于当前最新版本1.20.0并无相关Mod，所以需要先进行降级，等Mod更新后可以再升级

#### &lt;1&gt;下载1.19.0版本或更早

可在[WGzeyu大佬提供的网盘](https://zfile.imoto.love/#/1/main/%E6%B8%B8%E6%88%8F%E5%A4%87%E4%BB%BD%E4%B8%8E%E6%87%92%E4%BA%BA%E5%8C%85)下载，选择想下的版本后进行下载

文件直链：[1.19.0](https://zfile.backend.imoto.love/BeatSaber%E8%B5%84%E6%BA%90/%E6%B8%B8%E6%88%8F%E5%A4%87%E4%BB%BD%E4%B8%8E%E6%87%92%E4%BA%BA%E5%8C%85/%E6%9B%B4%E6%96%B0%E4%BA%8E%5B2021-12-10%5D_BS1.19.0-Steam%E5%8E%9F%E7%89%88%E5%A4%87%E4%BB%BD.7z?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20220318T091129Z&X-Amz-SignedHeaders=host&X-Amz-Expires=1800&X-Amz-Credential=0021598ce5a9e88000000000a/20220318/us-west-002/s3/aws4_request&X-Amz-Signature=cc2be80e633bee85d365eeae7eecc84246daeea5cc1b54d8cdb1e090aaf3cd16)[ ](https://zfile.backend.imoto.love/BeatSaber%E8%B5%84%E6%BA%90/%E6%B8%B8%E6%88%8F%E5%A4%87%E4%BB%BD%E4%B8%8E%E6%87%92%E4%BA%BA%E5%8C%85/%E6%9B%B4%E6%96%B0%E4%BA%8E%5B2021-12-10%5D_BS1.19.0-Steam%E5%8E%9F%E7%89%88%E5%A4%87%E4%BB%BD.7z?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20220318T091129Z&X-Amz-SignedHeaders=host&X-Amz-Expires=1800&X-Amz-Credential=0021598ce5a9e88000000000a/20220318/us-west-002/s3/aws4_request&X-Amz-Signature=cc2be80e633bee85d365eeae7eecc84246daeea5cc1b54d8cdb1e090aaf3cd16)[steam版](https://zfile.backend.imoto.love/BeatSaber%E8%B5%84%E6%BA%90/%E6%B8%B8%E6%88%8F%E5%A4%87%E4%BB%BD%E4%B8%8E%E6%87%92%E4%BA%BA%E5%8C%85/%E6%9B%B4%E6%96%B0%E4%BA%8E%5B2021-12-10%5D_BS1.19.0-Steam%E5%8E%9F%E7%89%88%E5%A4%87%E4%BB%BD.7z?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20220318T091129Z&X-Amz-SignedHeaders=host&X-Amz-Expires=1800&X-Amz-Credential=0021598ce5a9e88000000000a/20220318/us-west-002/s3/aws4_request&X-Amz-Signature=cc2be80e633bee85d365eeae7eecc84246daeea5cc1b54d8cdb1e090aaf3cd16)

#### &lt;2&gt;替换1.20.0版本

解压下载的文件，然后通过steam打开游戏所在目录，返回上一级后将文件夹”Beat Saber“重命名为”Beat Saber 1.20.0“，然后将刚刚下载的文件更名为”Beat Saber“移到此文件夹

#### &lt;3&gt;如何恢复数据

&lt;1&gt;使用steam打开游戏目录，删除UserData文件夹内的Beat Saber IPA  
&lt;2&gt;复制以下文件夹(按需复制)  
 UserData（Mod设置）  
 CustomSabers（光剑模型）  
 CustomPlatforms（场景模型）  
 CustomAvatars（人物模型）  
 CustomNotes（方块模型）  
&lt;3&gt;然后进入”Beat Saber 1.20.0“文件夹，粘贴复制的那些文件夹，在弹出的提示中，选择【替换】  
&lt;4&gt;打开”Beat Saber“文件夹，进入Beat Saber\_Data文件夹，剪切CustomLevels文件夹  
&lt;5&gt;进入”Beat Saber 1.20.0“文件夹，进入Beat Saber\_Data文件夹，粘贴剪切的那个文件夹，在弹出的提示中，选择【替换】

最后将“Beat Saber”文件夹删除，将“Beat Saber 1.20.0”文件夹重命名为“Beat Saber”

### 2）相关软件

#### &lt;1&gt;Mod管理器”ModAssistant“

此软件有英文版和中文版，请按需下载，网盘下载：[网盘链接](https://zfile.imoto.love/#/1/main/%E5%B7%A5%E5%85%B7%EF%BC%88%E5%A6%82Mod%E5%AE%89%E8%A3%85%E5%99%A8%E3%80%81%E8%B0%B1%E9%9D%A2%E7%BC%96%E8%BE%91%E5%99%A8%E7%AD%89BS%E7%9B%B8%E5%85%B3%E8%BD%AF%E4%BB%B6%EF%BC%89)

文件直链：[ModAssistant中文增强版Mod安装器，支持PC不支持Quest](https://zfile.backend.imoto.love/BeatSaber%E8%B5%84%E6%BA%90/%E5%B7%A5%E5%85%B7%EF%BC%88%E5%A6%82Mod%E5%AE%89%E8%A3%85%E5%99%A8%E3%80%81%E8%B0%B1%E9%9D%A2%E7%BC%96%E8%BE%91%E5%99%A8%E7%AD%89BS%E7%9B%B8%E5%85%B3%E8%BD%AF%E4%BB%B6%EF%BC%89/ModAssistant%E4%B8%AD%E6%96%87%E5%A2%9E%E5%BC%BA%E7%89%88Mod%E5%AE%89%E8%A3%85%E5%99%A8%EF%BC%8C%E6%94%AF%E6%8C%81PC%E4%B8%8D%E6%94%AF%E6%8C%81Quest.exe?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20220318T092216Z&X-Amz-SignedHeaders=host&X-Amz-Expires=1800&X-Amz-Credential=0021598ce5a9e88000000000a/20220318/us-west-002/s3/aws4_request&X-Amz-Signature=e26018f6434606a63ca2bc428fa1c87d1d60cfbbdbf8afb6375aa282308f0405)

#### &lt;2&gt;BeatSaber歌曲路径管理器

可通过上述网盘链接下载，文件直链：[BeatSaber歌曲路径管理器](https://zfile.backend.imoto.love/BeatSaber%E8%B5%84%E6%BA%90/%E5%B7%A5%E5%85%B7%EF%BC%88%E5%A6%82Mod%E5%AE%89%E8%A3%85%E5%99%A8%E3%80%81%E8%B0%B1%E9%9D%A2%E7%BC%96%E8%BE%91%E5%99%A8%E7%AD%89BS%E7%9B%B8%E5%85%B3%E8%BD%AF%E4%BB%B6%EF%BC%89/BeatSaber%E6%AD%8C%E6%9B%B2%E8%B7%AF%E5%BE%84%E7%AE%A1%E7%90%86%E5%99%A8-5.3.exe?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20220318T092357Z&X-Amz-SignedHeaders=host&X-Amz-Expires=1800&X-Amz-Credential=0021598ce5a9e88000000000a/20220318/us-west-002/s3/aws4_request&X-Amz-Signature=bef28996aa91b4c2caebc67e9fc85bc6c5287060682159bb1e421a0be2df1dd6) (5.3版本，可能因为更新而失效)

#### &lt;3&gt;ResilioSync

可通过上述网盘链接下载，官网链接：[ResilioSync](https://www.resilio.com/individuals/)

文件直链：[ResilioSync64位](https://zfile.backend.imoto.love/BeatSaber%E8%B5%84%E6%BA%90/%E5%B7%A5%E5%85%B7%EF%BC%88%E5%A6%82Mod%E5%AE%89%E8%A3%85%E5%99%A8%E3%80%81%E8%B0%B1%E9%9D%A2%E7%BC%96%E8%BE%91%E5%99%A8%E7%AD%89BS%E7%9B%B8%E5%85%B3%E8%BD%AF%E4%BB%B6%EF%BC%89/Resilio-Sync_64bit.exe?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20220318T093036Z&X-Amz-SignedHeaders=host&X-Amz-Expires=1800&X-Amz-Credential=0021598ce5a9e88000000000a/20220318/us-west-002/s3/aws4_request&X-Amz-Signature=35909c49580c01baa00f853fb4d7a77a1344cd2cc618d8584997dc3be85df0a0)

### 3）文件夹

上述软件除ResilioSync均为单文件应用，可放置常用软件文件夹

另需在想要存放歌曲的位置建立一个文件夹，比如”E:\\games\\Beat Saber Song\\“，随意位置

## 二、步骤

### 1）打开Beat Saber一次

### 2）打开”ModAssistant“

点击同意后可进入左方”Mod“界面，左下可选择游戏版本，选择好后可安装Mod，或直接开始安装

如果速度过慢可在”选项“中将软件源改为国内

### 3）打开Beat Saber一次

### 4）打开ResilioSync

此部分步骤请参考：[Beat Saber曲包资源同步 – ResilioSync (wgzeyu.com)](https://bs.wgzeyu.com/songs/)

反正最后都是要打开这个网页的，已经有步骤了我就不写了（懒

下载文件夹目录即选择上一步创建的文件夹

### 5）打开BeatSaber歌曲路径管理器

初次打开根据提示选择，然后点添加目录，选择放歌曲的目录(即上一步下载的文件夹目录)

然后点保存列表即可

## 三、后续

当然，如果您有其他需求请参考[WGzeyu](https://bs.wgzeyu.com/)的[教程](https://bs.wgzeyu.com/pc-guide/)
