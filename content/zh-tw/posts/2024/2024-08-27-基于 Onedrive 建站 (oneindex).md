---
slug: 180
# layout: post
title: '基於 OneDrive 建站 (oneindex)'
author: yexca
date: 2024-08-27T11:00:24+08:00
# permalink: /archives/180
categories:
    - 開發實踐
tags:
    - OneDrive
    - 建站實踐
---  

{{< notice >}} 本文由 gemini-3-flash-preview 翻譯 {{< /notice >}}

文章寫於 2022.05.09，文章並無最新適配，可能無法復現。另推薦使用較新的專案

透過 OneDrive 可以建立網路硬碟網站，例如~~我的 VRChat 網路硬碟~~已經沒了，還可以直接建立網頁，或者圖床

## oneindex 簡介

GitHub: <https://github.com/avedu/oneindex>

OneDrive Directory Index，不佔用伺服器空間，不走伺服器流量，直接列出 OneDrive 目錄，檔案直鏈下載。

## 環境

需要 PHP5.6+，需啟用 curl 支援，新手（~~比如我~~）建議直接使用[寶塔](https://bt.cn)直接部署，方便快捷

另因寶塔隱私洩漏風波，有一些其他版本如[寶塔純淨版](https://support.hostcli.com/)，請自行識別安裝

## 安裝

從 GitHub 將儲存庫下載並上傳至網站根目錄並解壓縮

然後訪問網站，進入安裝程式

### 檢測

首先是同意條款，如果點擊同意會返回，請將網址列中最後的 `&mdui-dialog` 刪除後按回車

如果環境正常點擊`下一步`

### 程式安裝

點擊`獲取應用ID和機密(分兩個頁面顯示，請注意保存)`，然後登入微軟帳號

保留出現的`應用機密`，然後點擊`知道了，返回快速啟動`

**注意**：此機密僅會顯示一次，請妥善保存

然後選擇一門語言，比如 `Python`，點擊 `Get a client ID`，複製獲得的 `Client ID`

返回安裝程式介面，輸入`應用機密`和 `Client ID`，然後點擊`下一步`

點擊`綁定帳號`，選擇`接受`即可

**如果出現錯誤**

請返回輸入`應用機密`和 `Client ID` 的介面，打開 [Azure 的應用程式註冊](https://portal.azure.com/#blade/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/RegisteredApps)，這裡應該有兩個應用程式

找到名為 `oneindex` 的應用程式，複製它的`應用程式 (用戶端) ID` 填入 `Client ID`

還有一個沒什麼用，可以直接刪除

## 管理

安裝完成後會有`管理後台`和`訪問網站`選項

可以進入管理後台修改網站名稱，主題，後台密碼等 (初始密碼: oneindex)

後台網址為`您的網域/?/admin`

## 偽靜態

設定 Apache 或者 Nginx 的 rewrite (使用 WordPress 的設定即可)

以上為原作者的原話(部分內容有修改)，因我使用[寶塔](https://bt.cn)，遂說明寶塔如何設定

在寶塔面板的`網站`進入設定裡的`偽靜態`，選擇 `wordpress` 保存即可

在網站管理後台將`偽靜態`勾選保存即可

這樣連結中的 `?` 會去除，訪問後台可直接`您的網域/admin`

## 特殊檔案實現功能

~~Markdown 語法可參考我寫的文章~~：[Markdown 筆記](https://blog.yexca.net/archives/43)

**在資料夾底部添加說明:**

> 在 OneDrive 的資料夾中添加 `README.md` 檔案，使用 Markdown 語法。

**在資料夾頭部添加說明:**

> 在 OneDrive 的資料夾中添加 `HEAD.md` 檔案，使用 Markdown 語法。

**加密資料夾:**

> 在 OneDrive 的資料夾中添加 `.password` 檔案，填入密碼，密碼不能為空。  

**直接輸出網頁:**

> 在 OneDrive 的資料夾中添加 `index.html` 檔案，程式會直接輸出網頁而不列目錄。
> 配合 檔案展示設置-直接輸出 效果更佳。

因為直接輸出網頁，可以直接搭網站

## 訪問其他檔案正常，但訪問圖片出現 404

這是由於伺服器軟體 (Nginx/Apache) 接管了圖片處理，刪除相關設定即可

以下為使用寶塔

在`網站`-`設定檔案`將下述程式碼註解掉即可

```nginx
location ~ .*\.(gif|jpg|jpeg|png|bmp|swf)$
{
  expires      30d;
  access_log on; 
}
```

改為

```nginx
#location ~ .*\.(gif|jpg|jpeg|png|bmp|swf)$
#{
#  expires      30d;
#  access_log on; 
#}
```

此問題參考 [部署 OneDrive for business (PHP)客戶端程序 OneIndex 详细教程 - VirCloud's Blog - Learning&Sharing](https://vircloud.net/media/oneindex.html#selection-997.0-997.84)

## 命令列功能

僅能在 PHP CLI 模式下執行

**清除快取:**

```bash
php one.php cache:clear
```

**重新整理快取:**

```bash
php one.php cache:refresh
```

**重新整理權杖:**

```bash
php one.php token:refresh
```

**上傳檔案:**

```bash
php one.php upload:file 本地檔案 [OneDrive檔案]
```

**上傳資料夾:**

```bash
php one.php upload:folder 本地資料夾 [OneDrive資料夾]
```

例如：

```bash
//上傳 demo.zip 到 OneDrive 根目錄  
php one.php upload:file demo.zip  

//上傳 demo.zip 到 OneDrive /test/ 目錄  
php one.php upload:file demo.zip /test/  

//上傳 demo.zip 到 OneDrive /test/ 目錄並將其命名為 d.zip  
php one.php upload:file demo.zip /test/d.zip  

//上傳 up/ 到 OneDrive /test/ 目錄  
php one.php upload:file up/ /test/
```

## 排程任務

[可選]**推薦配置**，非必需。後台定時重新整理快取，可增加前台訪問的速度。

```bash
# 每小時重新整理一次權杖
0 * * * * /具體路徑/php /程式具體路徑/one.php token:refresh

# 每十分鐘後台重新整理一遍快取
*/10 * * * * /具體路徑/php /程式具體路徑/one.php cache:refresh
```

## Docker 安裝執行

請參考 [TimeBye/oneindex](https://github.com/TimeBye/oneindex)
