---
slug: 31
title: 'Beat Saber 新增自訂歌曲清單'
date: '2022-03-18T17:46:00+08:00'
author: yexca
# layout: post
# permalink: /archives/31
views:
    - '1049'
categories:
    - 疑難排解經驗
tags:
    - Game
    - Beat Saber
---

{{< notice >}} 本文由 gemini-2.5-flash-lite 翻譯 {{< /notice >}}

## 引言

近期購入了 Beat Saber (雖然是透過阿根廷區)，於是便想著新增自訂歌曲。透過 Steam 的評論區得知 [WGzeyu](https://bs.wgzeyu.com/) 大佬做了相關教學，但由於我的目的比較單純，而教學內容又相當完整，因此特地撰寫這篇文章來總結。

## 一、準備工作

註：**2022.03.25：今日修改相關內容時發現 1.20.0 版本已有 Mod，請直接參閱第二部分。同時，恢復資料的部分已更新。**

### 1）降級

由於目前最新版本 1.20.0 並沒有相關 Mod，因此需要先進行降級。待 Mod 更新後，可以再升級回最新版本。

#### &lt;1&gt; 下載 1.19.0 或更早的版本

可至 [WGzeyu 大佬提供的網盤](https://zfile.imoto.love/#/1/main/%E6%B8%B8%E6%88%8F%E5%A4%87%E4%BB%BD%E4%B8%8E%E6%87%92%E4%BA%BA%E5%8C%85) 下載。選擇想下載的版本後進行下載。

檔案直連：[1.19.0](https://zfile.backend.imoto.love/BeatSaber%E8%B5%84%E6%BA%90/%E6%B8%B8%E6%88%8F%E5%A4%87%E4%BB%BD%E4%B8%8E%E6%87%92%E4%BA%BA%E5%8C%85/%E6%9B%B4%E6%96%B0%E4%BA%8E%5B2021-12-10%5D_BS1.19.0-Steam%E5%8E%9F%E7%89%88%E5%A4%87%E4%BB%BD.7z?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20220318T091129Z&X-Amz-SignedHeaders=host&X-Amz-Expires=1800&X-Amz-Credential=0021598ce5a9e88000000000a/20220318/us-west-002/s3/aws4_request&X-Amz-Signature=cc2be80e633bee85d365eeae7eecc84246daeea5cc1b54d8cdb1e090aaf3cd16)[ ](https://zfile.backend.imoto.love/BeatSaber%E8%B5%84%E6%BA%90/%E6%B8%B8%E6%88%8F%E5%A4%87%E4%BB%BD%E4%B8%8E%E6%87%92%E4%BA%BA%E5%8C%85/%E6%9B%B4%E6%96%B0%E4%BA%8E%5B2021-12-10%5D_BS1.19.0-Steam%E5%8E%9F%E7%89%88%E5%A4%87%E4%BB%BD.7z?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20220318T091129Z&X-Amz-SignedHeaders=host&X-Amz-Expires=1800&X-Amz-Credential=0021598ce5a9e88000000000a/20220318/us-west-002/s3/aws4_request&X-Amz-Signature=cc2be80e633bee85d365eeae7eecc84246daeea5cc1b54d8cdb1e090aaf3cd16)[Steam 版](https://zfile.backend.imoto.love/BeatSaber%E8%B5%84%E6%BA%90/%E6%B8%B8%E6%88%8F%E5%A4%87%E4%BB%BD%E4%B8%8E%E6%87%92%E4%BA%BA%E5%8C%85/%E6%9B%B4%E6%96%B0%E4%BA%8E%5B2021-12-10%5D_BS1.19.0-Steam%E5%8E%9F%E7%89%88%E5%A4%87%E4%BB%BD.7z?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20220318T091129Z&X-Amz-SignedHeaders=host&X-Amz-Expires=1800&X-Amz-Credential=0021598ce5a9e88000000000a/20220318/us-west-002/s3/aws4_request&X-Amz-Signature=cc2be80e633bee85d365eeae7eecc84246daeea5cc1b54d8cdb1e090aaf3cd16)

#### &lt;2&gt; 替換 1.20.0 版本

解壓縮下載的檔案，然後透過 Steam 開啟遊戲目錄。返回上一層後，將「Beat Saber」資料夾重新命名為「Beat Saber 1.20.0」，接著將剛剛下載的檔案重新命名為「Beat Saber」並移動到此資料夾。

#### &lt;3&gt; 如何恢復資料

&lt;1&gt; 使用 Steam 開啟遊戲目錄，刪除 UserData 資料夾內的 Beat Saber IPA。
&lt;2&gt; 複製以下資料夾 (依需求複製)：
    * UserData (Mod 設定)
    * CustomSabers (光劍模型)
    * CustomPlatforms (場景模型)
    * CustomAvatars (人物模型)
    * CustomNotes (方塊模型)
&lt;3&gt; 然後進入「Beat Saber 1.20.0」資料夾，貼上複製的這些資料夾。在彈出的提示中，選擇【替換】。
&lt;4&gt; 開啟「Beat Saber」資料夾，進入 Beat Saber\_Data 資料夾，剪下 CustomLevels 資料夾。
&lt;5&gt; 進入「Beat Saber 1.20.0」資料夾，進入 Beat Saber\_Data 資料夾，貼上剪下的那個資料夾。在彈出的提示中，選擇【替換】。

最後將「Beat Saber」資料夾刪除，將「Beat Saber 1.20.0」資料夾重新命名為「Beat Saber」。

### 2）相關軟體

#### &lt;1&gt; Mod 管理器 "ModAssistant"

此軟體有英文版和中文版，請依需求下載。網盤下載：[網盤連結](https://zfile.imoto.love/#/1/main/%E5%B7%A5%E5%85%B7%EF%BC%88%E5%A6%82Mod%E5%AE%89%E8%A3%85%E5%99%A8%E3%80%81%E8%B0%B1%E9%9D%A2%E7%BC%96%E8%BE%91%E5%99%A8%E7%AD%89BS%E7%9B%B8%E5%85%B3%E8%BD%AF%E4%BB%B6%EF%BC%89)

檔案直連：[ModAssistant 中文增強版 Mod 安裝器，支援 PC 不支援 Quest](https://zfile.backend.imoto.love/BeatSaber%E8%B5%84%E6%BA%90/%E5%B7%A5%E5%85%B7%EF%BC%88%E5%A6%82Mod%E5%AE%89%E8%A3%85%E5%99%A8%E3%80%81%E8%B0%B1%E9%9D%A2%E7%BC%96%E8%BE%91%E5%99%A8%E7%AD%89BS%E7%9B%B8%E5%85%B3%E8%BD%AF%E4%BB%B6%EF%BC%89/ModAssistant%E4%B8%AD%E6%96%87%E5%A2%9E%E5%BC%B7%E7%89%88Mod%E5%AE%89%E8%A3%85%E5%99%A8%EF%BC%8C%E6%94%AF%E6%8C%81PC%E4%B8%8D%E6%94%AF%E6%8C%81Quest.exe?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20220318T092216Z&X-Amz-SignedHeaders=host&X-Amz-Expires=1800&X-Amz-Credential=0021598ce5a9e88000000000a/20220318/us-west-002/s3/aws4_request&X-Amz-Signature=e26018f6434606a63ca2bc428fa1c87d1d60cfbbdbf8afb6375aa282308f0405)

#### &lt;2&gt; BeatSaber 歌曲路徑管理器

可透過上述網盤連結下載，檔案直連：[BeatSaber 歌曲路徑管理器](https://zfile.backend.imoto.love/BeatSaber%E8%B5%84%E6%BA%90/%E5%B7%A5%E5%85%B7%EF%BC%88%E5%A6%82Mod%E5%AE%89%E8%A3%85%E5%99%A8%E3%80%81%E8%B0%B1%E9%9D%A2%E7%BC%96%E8%BE%91%E5%99%A8%E7%AD%89BS%E7%9B%B8%E5%85%B3%E8%BD%AF%E4%BB%B6%EF%BC%89/BeatSaber%E6%AD%8C%E6%9B%B2%E8%B7%AF%E5%BE%84%E7%AE%A1%E7%90%86%E5%99%A8-5.3.exe?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20220318T092357Z&X-Amz-SignedHeaders=host&X-Amz-Expires=1800&X-Amz-Credential=0021598ce5a9e88000000000a/20220318/us-west-002/s3/aws4_request&X-Amz-Signature=bef28996aa91b4c2caebc67e9fc85bc6c5287060682159bb1e421a0be2df1dd6) (5.3 版本，可能因更新而失效)

#### &lt;3&gt; Resilio Sync

可透過上述網盤連結下載，官網連結：[Resilio Sync](https://www.resilio.com/individuals/)

檔案直連：[Resilio Sync 64 位元](https://zfile.backend.imoto.love/BeatSaber%E8%B5%84%E6%BA%90/%E5%B7%A5%E5%85%B7%EF%BC%88%E5%A6%82Mod%E5%AE%89%E8%A3%85%E5%99%A8%E3%80%81%E8%B0%B1%E9%9D%A2%E7%BC%96%E8%BE%91%E5%99%A8%E7%AD%89BS%E7%9B%B8%E5%85%B3%E8%BD%AF%E4%BB%B6%EF%BC%89/Resilio-Sync_64bit.exe?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20220318T093036Z&X-Amz-SignedHeaders=host&X-Amz-Expires=1800&X-Amz-Credential=0021598ce5a9e88000000000a/20220318/us-west-002/s3/aws4_request&X-Amz-Signature=35909c49580c01baa00f853fb4d7a77a1344cd2cc618d8584997dc3be85df0a0)

### 3）資料夾

上述軟體中，除了 Resilio Sync 外，皆為單一檔案應用程式，可放置於常用軟體資料夾。

另外，需在您想存放歌曲的位置建立一個資料夾，例如「E:\games\Beat Saber Song\」，位置可自行決定。

## 二、步驟

### 1）開啟 Beat Saber 一次

### 2）開啟 "ModAssistant"

點擊同意後即可進入左方的 "Mod" 介面。左下方可選擇遊戲版本。選擇好後即可安裝 Mod，或直接開始安裝。

若速度過慢，可在「選項」中將軟體來源改為國內。

### 3）開啟 Beat Saber 一次

### 4）開啟 Resilio Sync

此部分步驟請參考：[Beat Saber 曲包資源同步 – Resilio Sync (wgzeyu.com)](https://bs.wgzeyu.com/songs/)

反正最後都是需要開啟這個網頁的，既然已有步驟，我就不在此處撰寫了（懶惰）。

下載資料夾目錄即選擇上一步建立的資料夾。

### 5）開啟 BeatSaber 歌曲路徑管理器

初次開啟時，請依照提示進行選擇。然後點擊「新增目錄」，選擇放置歌曲的目錄 (即上一步下載的資料夾目錄)。

接著點擊「儲存列表」即可。

## 三、後續

當然，如果您有其他需求，請參考 [WGzeyu](https://bs.wgzeyu.com/) 的 [教學](https://bs.wgzeyu.com/pc-guide/)。
