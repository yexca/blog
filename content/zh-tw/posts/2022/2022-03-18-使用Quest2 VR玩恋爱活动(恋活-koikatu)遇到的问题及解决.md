---
slug: 30
title: '使用 Quest2 VR 玩戀愛活動 (戀活 / koikatu) 遇到的問題及解決'
date: '2022-03-18T16:54:23+08:00'
lastmod: '2025-01-03T21:01:01+09:00'
author: yexca
# layout: post
# permalink: /archives/30
views:
    - '7351'
categories:
    - 折騰經驗
tags:
    - Game
    - VR
---

{{< notice >}} 此頁面有使用機器翻譯喲 {{< /notice >}}

## 引言

在玩了 Beat Saber 和 VRchat 等 VR 遊戲後突然想到 i 社有部分遊戲支援 VR，本人最喜歡玩戀活，於是試著進行遊玩，但卻遇到相關問題，本文僅作記錄。另 VR 版則無劇情，本人使用原版所以遇到問題較少。

## 前提/條件

以下圖片和部分文字來自 [Oculus 官網 Support](https://support.oculus.com/articles/headsets-and-accessories/oculus-link/index-oculus-link)，部分英文自己進行了翻譯，鑑於本人英文不是太好，請以官方原內容為準，以下列出主要內容，詳情請參考 [Oculus Link 的相容性要求](https://support.oculus.com/444256562873335)

### 資料線要求

Oculus Link 需使用能夠支援資料和電源連接的優質 USB 資料線。為獲得最佳舒適體驗，您還應確保資料線長度至少為 3 米 (10 英尺)

### 電腦要求

| 配件     | 推薦配置                                    |
| -------- | ------------------------------------------- |
| CPU      | Intel i5-4590 / AMD Ryzen 5 1500X 或更高版本 |
| 顯卡     | 請參閱下面的 GPU 表                         |
| 記憶體     | 8 GB+ 記憶體                                |
| 作業系統 | Win10                                       |
| USB 介面 | 1 個 USB 介面                               |

- Oculus Link 支援的 GPU

|            NVIDIA GPU                    |  支援    |    暫時不支援   |
| ---------------------------------------- | -------- | -------------- |
| NVIDIA Titan Z                           |          | X              |
| NVIDIA Titan X                           | X        |                |
| NVIDIA GeForce GTX 970                   | X        |                |
| NVIDIA GeForce GTX 1060 **Desktop, 3GB** |          | X              |
| NVIDIA GeForce GTX 1060 **Desktop, 6GB** | X        |                |
| NVIDIA GeForce GTX 1060M                 |          | X              |
| NVIDIA GeForce GTX 1070(all)             | X        |                |
| NVIDIA GeForce GTX 1080(all)             | X        |                |
| NVIDIA GeForce GTX 1650                  |          | X              |
| NVIDIA GeForce GTX 1650 Super            | X        |                |
| NVIDIA GeForce GTX 1660                  | X        |                |
| NVIDIA GeForce GTX 1660 TI               | X        |                |
| NVIDIA GeForce RTX 20-series (all)       | X        |                |
| NVIDIA GeForce RTX 30-series (all)       | X        |                |

|    AMD GPU      |   支援   |   暫時不支援    |
| --------------- | -------- | -------------- |
| AMD 200 Series  |          | X              |
| AMD 300 Series  |          | X              |
| AMD 400 Series  | X        |                |
| AMD 500 Series  | X        |                |
| AMD 5000 Series | X        |                |
| AMD 6000 Series | X        |                |
| AMD Vega Series | X        |                |

## 一、進入遊戲

進入遊戲 VR 版本直接打開 KoikatuVR.exe 即可，由於使用 steam 串流，故可提前進入 steamVR

進入遊戲前請確保戴上耳機，房門鎖緊等以預防突發情況，如不能做到請注意行為 XD

### 問題一：無法進入 steamVR

#### 一、確保安裝相關軟體

##### 1）steamVR 安裝

首先打開 steam，然後按 `Win+R`，輸入 `steam://run/250820`，按下回車便會自動安裝 steamVR

##### 2）Oculus 安裝

訪問[官網下載](https://www.oculus.com/setup/)，注意：安裝完成後會下載相關檔案，完成後會要求登錄帳號，請確保網絡環境正常 ~~(台灣應該沒事 XD)~~

如要求提供支付方式，可尋找 `跳過` 按鈕

###### 如果登入一直在加載，無法成功登入

可通過修改 Hosts 解決，推薦使用火絨打開 hosts 檔案進行修改

如果不使用火絨，打開 `C:\Windows\System32\drivers\etc`，找到 hosts 這個檔案，用記事本打開

在檔案末尾添加如下內容

```markdown
157.240.11.49 graph.oculus.com
157.240.11.49 www2.oculus.com
157.240.8.49 scontent.oculuscdn.com
157.240.8.49 securecdn.oculus.com
```

然後保存即可，如果不是使用火絨，請保存到一個地方然後移回原目錄並將副檔名 `.txt` 去除

#### 二、確保 Link 線正常

事實上，連接 Quest2 的時候 Oculus 軟體會有一步選擇是否檢測 Link 線，可通過此進行檢測，如果當時未進行檢測，可選擇 `設備 - Quest2 和 Touch-USB 檢測` 進行檢測

#### 三、確保設置正常

##### 1）Quest2 設備設置

使用 USB 連接 PC 和 Quest2 時 Quest 會彈出 `允許訪問資料`，請選擇拒絕，如果選擇了 `允許`，請拔下再重新連接選擇 `拒絕`

##### 2）Oculus 軟體設置

其實直接打開 steamVR 會有彈窗 `是否允許未知來源` 此時選擇允許即可

當然，可以在軟體的 `設置 - 通用 - 未知來源` 進行打開

#### 四、還是無法打開？換個姿勢試試

如果以上都沒問題但還是無法打開 steamVR，則可使用下述方式

##### 1）Quest2 設備

當連接 PC 後一般會有彈窗 `啟用 Oculus Link`，此時選擇 `啟用` 即可

如果上述未選擇 `啟用` 或沒有彈窗，可在下方任務欄的最左方即 `快速設置` 中找到 `Oculus Link`，點擊即可打開

##### 2）啟動 steamVR

不會有人不知道 steamVR 怎麼啟動吧 (doge)

如果先連接 VR 設備再打開 steam，那麼 steam 的介面右上方應該有 “VR” 標識，點擊即可打開

如果無此標識，可在任務欄 (或者說右下托盤) 裡找到 steam 圖標，鼠標右擊，倒數第二個即為 steamVR  
當然，可以在 steam 庫中將 `工具` 也顯示，這樣可以在 steam 庫中看見 steamVR

## 二、開始遊戲

我不知道這裡應該寫什麼，分這個標題是因為問題二與遊戲有關，那就寫其他的吧 (doge)

點擊 KoikatuVR.exe 會自動打開 steamVR，所以可以在 Quest2 設備打開 Oculus Link 後直接打開 KoikatuVR 即可  
**注意：遊戲會在桌面有一個視窗，可透過 `Win+D` 最小化所有視窗，但當摘下頭顯再次戴上時好像會再次出現，請注意**

### 問題二：無法開始遊戲/不知如何開始

如果您閱讀其他文章或觀看相關影片可能會得到僅支援部分設備 (支持啥我忘了)，如果和我一樣去測試了 VR kanojo 能否正常運行，也可能會以為是靠注視，其實不然 ~~(我就是想多寫點)~~

**只需要按下 “搖桿” 即可出現選擇線，按下前 “扳機鍵” 即可選擇** (更多操作請看 *三、操作說明*)

### 問題三：開始遊戲後一直白屏，電腦上 "LOADING" 一直在一半

可進[コイカツ！ DL 版](https://dlsoft.dmm.co.jp/detail/illusion_0023/)，點擊下方 `體験版・無料ダウンロード` 中的 `コイカツ VR パッチ` 進行下載

檔案直鏈：[コイカツ VR パッチ](https://sample9.dmm.co.jp/digital/pcgame/illusion_0023/vr_patch.zip)

下載解壓後會有一個可執行檔，運行後會出現 `コイカツ！VR_0531 更新版` 資料夾，將裡面 `setup` 資料夾內容移到遊戲根目錄並覆蓋即可

注意：此方法來源作者指出姿勢會變成只有三個，由於我並未遊玩，所以我沒有姿勢 (本來想著 VR 玩劇情的，但 VR 不能玩劇情)，以下為作者給出解決 (部分內容有修改)

> 姿勢是在故事模式裡用過什麼姿勢，在 vr 裡才能用，所以在故事模式裡戰鬥的時候把所有姿勢都點一遍，點完就換就行，然後到晚上存檔，在退出換 vr，然後姿勢就齊了

原文地址：[兄弟們有沒有玩了 vr 的](https://tieba.baidu.com/p/7620121778?prev=frs&source=frs#/)

## 三、操作說明

**此部分為自行遊玩得出，僅作部分說明**，其他操作請自行參考其他文章

### 1）開始遊戲

進入遊戲後會有俩選項，分別為

スタート，即 start，即開始

エンド，即 End，即結束

按下 "搖桿"，會出現一條線，可進行選擇 (前 "扳機鍵")

### 2）進入本番

左右手手腕部分會出現文字，可通過左右控制器上方按鍵即 `Y` 和 `B` 進行切換

一共有倆個，進入戰鬥後有三個 (多了一個 `移動`)，分別為

| 日文       | 英文   | 中文 | 作用                                                         |
| ---------- | ------ | ---- | ------------------------------------------------------------ |
| アクション | Action | 行動 | 前 "扳機鍵" 可進行各種操作 側 "扳機鍵" 可打開菜單 按下 "搖桿" 可進行選擇 |
| システム   | system | 系統 | 前 "扳機鍵" 可重置位置                                       |
| 移動       | Move   | 移動 | 前 "扳機鍵" 按住可改變視角                                   |

### 3）注意

僅可在 "アクション" 時按下 "搖桿" 可以進行選擇

## 參考文章

[Oculus Link](https://support.oculus.com/articles/headsets-and-accessories/oculus-link/index-oculus-link)

[兄弟們有沒有玩了 vr 的](https://tieba.baidu.com/p/7620121778?prev=frs&source=frs#/)

[Oculus 用戶端在 Win10 上面無法安裝或登陸的解決方法_國韻的部落格 - CSDN 部落格_oculus 無法連接伺服器](https://blog.csdn.net/mo_qi_qi/article/details/83795668)

[中國移動的日文](http://www.ichacha.net/jp/中国移动.html) ~~(別問我為什麼會參考這個，問就是不會日文)~~

![yexca-30](https://count.getloli.com/@yexca-30)
