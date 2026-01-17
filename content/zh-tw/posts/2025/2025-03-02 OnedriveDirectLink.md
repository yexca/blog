---
slug: 237
title: '獲取 OneDrive 直接下載連結'
# draft: true
author: yexca
date: '2025-03-02T12:58:57+09:00'
categories:
    - 實作經驗
tags:
    - OneDrive
---

{{< notice >}} 本文由 gemini-3-flash-preview 翻譯 {{< /notice >}}

## 引言

最近下載 OneDrive 分享的檔案時，發現無法被 IDM 自動抓取，而瀏覽器下載又不穩定，經常下載失敗，於是我便在想是否有辦法獲取直接下載連結。

## 擴充功能問題

剛開始看到不支援了，還以為需要重新安裝，結果刪除後去 Chrome 線上應用程式商店顯示無法安裝，呃，刪太早了。

不過 IDM 作為付費軟體，居然沒有跟進更新。

從 [簡悅專案問題](https://github.com/Kenshin/simpread/discussions/6633) 得知，原來只是按鈕被加上了 `disabled` 屬性禁用，把屬性移除後就能正常安裝。

## 獲取直接連結

但 IDM 還是無法偵測，那就只能尋找直接下載連結了。

進入分享頁面，預覽某個檔案，點擊右上角 `Share` - `Copy link` 即可獲取檔案分享連結，類似於：

```markdown
https://xxx-my.sharepoint.com/:u:/r/personal/xxx/Documents/xxx/xxx.rar?csf=1&web=1&e=OTZZbx
```

將其中的 `web` 替換為 `download`，類似於：

```markdown
https://xxx-my.sharepoint.com/:u:/r/personal/xxx/Documents/xxx/xxx.rar?csf=1&download=1&e=OTZZbx
```

複製到 IDM 的 `Add URL` 下載即可。

---

參考文章：<https://techcommunity.microsoft.com/discussions/onedriveforbusiness/onedrive-direct-download-link/4226744>

---

![yexca-237](https://count.getloli.com/@yexca-237)
