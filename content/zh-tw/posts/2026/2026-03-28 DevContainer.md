---
slug: 274
title: '擁抱 Dev Container：徹底擺脫環境依賴'
# draft: true
author: yexca
date: '2026-03-28T16:12:02+09:00'
categories:
    - 開發實踐
tags:
    - Dev Container
    - Docker
    - Git
---

{{< notice >}} 本文由 gemini-3-flash-preview 翻譯 {{< /notice >}}

在開發的時候，尤其是前端開發，環境配置可謂是相當重要，每次執行 `npm install` 的時候都非常緊張，依賴項抓取失敗的次數太多啦。同時為了重現一個專案，而去適配和原專案開發時相同的環境也是較為麻煩的。

之前了解前端情況的時候，接觸了像是 Astro 或 Qwik 這樣較為新的島塢架構 (Islands Architecture)，同時又對自己使用 Hugo Book 的網站不是很滿意，於是便試著遷移。

不過這次遷移為了可重現性，我開始接觸可以在容器內開發的 Dev Container 技術，同時因為我換新電腦的原因，事實上我的部落格也進行了 Dev Container 化。

## 配置

說到配置還是很方便的，在專案根目錄建立 `.devcontainer` 資料夾，然後在裡面撰寫 `Dockerfile` 建構映像檔，接著在 `devcontainer.json` 設定相關選項即可。

Dockerfile 就是很常規的 Dockerfile 語法，抓取和安裝自己需要的映像檔與依賴項即可。

關於 json 檔案的所有設定項可參考：<https://containers.dev/implementors/json_reference/>，對於我的部落格來說很簡單，可以參考看看：

```json
{
    "name": "yexca-blog",
    "build": {
        "dockerfile": "Dockerfile",
        "args": {
            "HUGO_VERSION": "0.140.1"
        }
    },
    "customizations": {
        "vscode": {
            "extensions": [
                "budparr.language-hugo-vscode", // Hugo 語法高亮
                "ritwickdey.LiveServer"         // 即時預覽輔助
            ]
        }
    },

    "remoteUser": "vscode"
}
```

## 設定時區

剛開始我直接推送，但是很快就發現了奇怪的事情，也就是 GitHub 上顯示提交的時間和我本地對不上，我經過多次檢查終於發現了容器預設是 UTC 時間，所以最好還是在建構完成後手動設定一下比較好。

因為可能執行的系統不一樣難以在建置時配置，所以這部分我選擇使用指令來定義時區。

一般設定時間的方法為：

```bash
sudo timedatectl set-timezone Asia/Tokyo
```

但容器使用的精簡版 Linux 一般沒有該指令，所以可用：

```bash
sudo ln -sf /usr/share/zoneinfo/Asia/Tokyo /etc/localtime
```

驗證設定：

```bash
date -R
```

## Git

因為容器也相當於是一台新的機器，所以使用 git 推送的時候還是有點問題，雖然 VS Code 是說使用和本地儲存庫會沒有問題，但是我使用 1password 代理的情況下是沒有自動識別的。

這裡有兩種方法解決，第一種非常簡單，就是直接把自己的 `~/.ssh` 複製到容器，雖然有很大風險，但是自己用不推送的話倒也沒什麼；第二種就是先本地建構好 Dev Container 後推送到 GitHub，然後在 VS Code 選擇從 GitHub 複製儲存庫，登入自己的 GitHub 帳戶後抓取建置，之後推送直接就可以推送。

## 體驗

因為之前我其實就已經在使用 Dev Container 了，所以已經感受到了便利性。這次嘗試不使用官方的範例，自己嘗試去建置自定義的映像檔，明顯感覺真的很流暢，完美解決了跨裝置環境的問題。換裝置的時候，什麼都不需要安裝，直接 Clone 然後就可以直接開發，用過就知道很爽，同時也算是達成開發部署全環境一致了 (因為都是透過容器)。

## 參考文章

<https://vscode.js.cn/docs/devcontainers/containers#_working-with-git>
