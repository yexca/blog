---
slug: 44
title: 'GitHub Pages 建站及自訂網域'
date: '2022-05-28T15:30:43+08:00'
lastmod: '2025-01-23T16:15:43+09:00'
author: yexca
# layout: post
# permalink: /archives/44
views:
    - '355'
categories:
    - 開發實務
tags:
    - GitHub Pages
    - 建站實務
---

{{< notice >}} 本文由 Gemini-3-flash 翻譯 {{< /notice >}}

## 引言

最近基於 GitHub Pages 弄了一個個人頁面 (已經沒了)，記錄一下如何使用 GitHub Pages 建站以及自訂網域。

本文沒有建站系統等，~~因為我也就寫了一個 Markdown 檔案~~。

## 建立 GitHub 存放庫

首先需要註冊一個 [GitHub](https://github.com) 帳號，登入後[建立一個新存放庫](https://github.com/new)。

其中 **Repository name** 為 `username.github.io`，例如我的 GitHub 使用者名稱為 `yexca`，則輸入 `yexca.github.io`。

## Git 環境安裝

Windows 環境直接從 Git 官網直接[下載安裝程式](https://git-scm.com/downloads)即可。

安裝完成後，開啟 Git Bash，在命令列輸入以下程式碼：

```bash
git config --global user.name "Your Name"
git config --global user.email "email@example.com"
```

其中 `Your Name` 替換為您的姓名，`email@example.com` 替換為您的電子郵件。

例如我的：

```bash
git config --global user.name "yexca"
git config --global user.email "yexca@duck.com"
```

## GitHub Desktop

### 安裝

如果您熟悉 Git 的操作 ~~熟悉 Git 操作怎麼會來看我的文章~~，這一步可以跳過。

直接進入 [GitHub Desktop 官網](Https://desktop.github.com)下載安裝即可。

### 複製存放庫

開啟 GitHub Desktop 後登入 GitHub 帳號，選擇一個空資料夾將上一步建立的存放庫複製 (Clone) 到本機。

然後軟體會出現一個存放庫變動介面，右方會有一些快捷操作。

![軟體介面](https://cdn.jsdelivr.net/gh/yexca/picx-images-hosting@master/2022/05-GithubPages建站/image.43qnbq0gw800.webp)

這裡我使用 VS Code，點擊 `Open in Visual Studio Code` 在 VS Code 開啟。

### 建立網站

這裡直接建立一個 `README.md` 檔案使用 [Markdown 編輯](https://blog.yexca.net/archives/43) (~~這裡順便放一個我寫的 Markdown 筆記~~)。

編輯完成並儲存後，在 `GitHub Desktop` 點擊 `Commit to main`，然後點擊右方 `Push origin` 即可。

至此訪問 `username.github.io` 即可看到網站內容，~~如果沒看到請等一段時間~~。

## 自訂網域

### GitHub Pages

進入剛剛建立的存放庫頁面，點擊 `Settings`，左側找到 `Pages`，在 `Custom domain` 處輸入自訂網域然後點擊 `Save`。

註：在這裡可以進行 Jekyll 建站主題的選擇。

### DNS

在網域的 DNS 解析處新增一個 `CNAME` 類型解析，將網域指向 `username.github.io`，其中 `username` 為您的 GitHub 使用者名稱。

### HTTPS

這裡我用 GitHub 的不知為何沒成功，於是使用 [Cloudflare](https://cloudflare.com/zh-tw/)。

在 DNS 解析處啟用代理，然後在 `SSL/TLS` 的 `邊緣憑證` 處將 `一律使用 HTTPS` 打開即可。

## 其他建站

因無部落格需求，我只是寫一個簡單的檔案，如果是建立部落格之類的可以使用一些建站工具：

* [Jekyll](http://jekyllrb.com/) GitHub 官方支援的建站
* [VuePress 中文網](http://caibaojian.com/vuepress/) Markdown 推薦
* Gitbook 適合建立說明文件類網站
* [LOFFER](https://fromendworld.github.io/LOFFER/)
* [Gridea](https://gridea.dev/) 一個靜態部落格寫作客戶端
* [Hexo](https://hexo.io/zh-tw/) 快速、簡潔且高效的部落格框架
* [Hugo](https://gohugo.io/)

## 參考文章

[GitHub Pages 快速入門 - GitHub Docs](https://docs.github.com/cn/pages/quickstart)

[GitHub Pages 部落格：自訂網域，HTTPS，CAA — 浮雲的部落格](https://last2win.com/2020/02/21/github-pages-https/)

[GitHub Pages 搭建教程](https://sspai.com/post/54608)

[安裝 Git - 廖雪峰的官方網站](https://www.liaoxuefeng.com/wiki/896043488029600/896067074338496)