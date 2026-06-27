---
slug: 247
title: '擁抱 DevOps：把我的部落格建構與部署丟給 GitHub 處理'
# draft: true
author: yexca
date: '2025-05-16T18:14:06+09:00'
categories:
  - 開發實踐
tags:
  - DevOps
  - GitHub Actions
  - CI/CD
---

{{< notice >}} 本文由 ChatGPT 翻譯 {{< /notice >}}

## 引言

最近在思考自己要繼續做什麼或學些什麼的時候，老是看到「DevOps」這個詞。一開始隨手查了一下，發現裡面提到的技術棧自己差不多都有碰過，還以為這只是像「全端」那樣多掌握幾個工具就好（雖然其實也差不多啦）

但因為當時沒什麼興趣就耽擱了（其實是沒開發熱情了）

直到最近躺了快四個月，覺得該掙扎一下，結果又想到這個詞。再深入了解後，只能說......這根本是「捲」到極致了吧，前後端分離就算了，現在是連開發和運維分離都不分人了。

不過話說回來，當我看到自動流程有 GitHub Action 的時候，就讓我想起以前用 Jekyll 建部落格時也能自動部署。但因為我那時候從其他部落格系統轉過來，習慣用子資料夾分類，而那套部署方式不支援子資料夾，所以我也沒深入研究。既然這次想好好整一整，就來看看現在的 Hugo 部落格能不能自動部署吧 ~~畢竟每次都從容器下回來再上傳真的蠻麻煩的~~

## 工作流程

建立一個 Workflow 的方式是，在 Git 倉庫根目錄的 `.github/workflows/` 中建立一個 yaml 檔案，檔名隨意。我這次是部署用途，就命名為 `deploy.yml`

整個檔案結構主要分為：名稱、觸發器與工作內容

### 名稱

這個就隨意取名即可

```yaml
name: Build and Deploy Hugo Blog
```

### 觸發器

GitHub Action Workflow 支援多種觸發方式，我這裡設成每次 push 都觸發，畢竟通常都是更新文章然後進行構建

另外加上手動觸發功能，以備有時候 GitHub 出錯需要手動啟動 Workflow

```yaml
on:
  push: # 當 Git Push 時觸發
    branches:
      - main  # 監聽主分支
  workflow_dispatch: # 手動觸發
```

### 工作內容

我這邊只有一個工作（job），但其實 jobs 可設定多個並行執行。

先命名這個工作

```yaml
jobs:
  build-deploy:
```

接著定義執行的作業環境，我這裡選用 ubuntu：

```yaml
jobs:
  build-deploy:
    runs-on: ubuntu-latest
```

接下來定義各步驟，第一步：檢出原始碼

```yaml
jobs:
  build-deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout source
        uses: actions/checkout@v4
```

安裝 Hugo：

```yaml
steps:
  - name: Setup Hugo
    uses: peaceiris/actions-hugo@v2
    with:
      hugo-version: '0.140.1' # 这里是我本地的版本，兼容性应该高点
      extended: true # 因为我的主题使用了 SCSS 所以必须使用 extended 版本
```

執行建構指令：

```yaml
steps:
  - name: Build Hugo Site
    run: hugo --minify
```

將建構後的內容部署到另一個 GitHub Pages 倉庫：

```yaml
steps:
  - name: Deploy to BlogWeb repo
    uses: peaceiris/actions-gh-pages@v3
    with:
      external_repository: yexca/Blog-Web-Hugo
      publish_branch: main # 推送到目标仓库 yexca/Blog-Web-Hugo 的 main 分支
      publish_dir: ./public # 推送的当前仓库的文件夹，Hugo 默认是生成到这个文件夹
      personal_token: ${{ secrets.PERSONAL_TOKEN }}
```

完整合併如下：

```yaml
name: Build and Deploy Hugo Blog

on:
  push:
    branches:
      - main
  workflow_dispatch:

jobs:
  build-deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout source
        uses: actions/checkout@v4

      - name: Setup Hugo
        uses: peaceiris/actions-hugo@v2
        with:
          hugo-version: '0.140.1'
          extended: true

      - name: Build Hugo site
        run: hugo --minify

      - name: Deploy to blogWeb repo
        uses: peaceiris/actions-gh-pages@v3
        with:
          external_repository: yexca/Blog-Web-Hugo
          publish_branch: main 
          publish_dir: ./public
          personal_token: ${{ secrets.PERSONAL_TOKEN }}

```

## 設定 Token

由於存取其他倉庫需要權限，因此需先產生 Token。

在 GitHub 的 `Settings -> Developer Settings -> Personal access tokens -> Fine-grained tokens` 中，產生一組擁有目標倉庫讀寫權限的 Token。

然後回到原始碼倉庫（例如 `yexca/Blog-Source-Hugo`），進入 `Settings -> Secrets and variables -> Actions -> Repository secrets`，新增剛才建立的 Token，名稱需對應 `PERSONAL_TOKEN`。

## 處理自訂網域

若你為 GitHub Pages 設定了自訂網域，需建立一個 `CNAME` 檔，內容為你的網域。

但 GitHub Action 的部署會清空再覆蓋內容，因此 `CNAME` 也會被刪除，所以要在部署前手動加上，可採以下兩種方式：

### 方法一：工作流中建立檔案

```yaml
steps:
  - name: Add CNAME
    run: echo 'blog.yexca.net' > public/CNAME
```

### 方法二：在 Hugo 的 static 資料夾放置 `CNAME`

因為 `static` 資料夾會被原樣複製到輸出目錄，也能達成目的。

## 主題子模組處理

我原本的主題是以 Git Submodule 引入的，但因為我做了不少修改，若不處理這部分，推送上去的將會是原始 repo 的內容，而非我修改過的版本。

### 備份主題

```bash
cp -r themes/Hugo-Theme-Stack tmp/Hugo-Theme-Stack-Backup
```

### 移除子模組

```bash
git submodule deinit -f themes/Hugo-Theme-Stack
git rm -f themes/Hugo-Theme-Stack
rm -rf .git/modules/themes/Hugo-Theme-Stack
rm .gitmodules
```

### 恢復主題

```bash
cp -r tmp/Hugo-Theme-Stack-Backup themes/Hugo-Theme-Stack
rm -rf tmp
```

## 修復 JS 語法錯誤

我以前為部落格添加了網站執行時間顯示，但當時用了舊的八進位語法：

```javascript
Date.UTC(2021, 10, 06, 14, 15, 19)
```

而 Hugo 的 `--minify` 壓縮指令會對其報錯，改成以下即可：

```javascript
Date.UTC(2021, 10, 6, 14, 15, 19)
```

## 結語

終於不再需要手動編譯了。自從我開始使用 Docker，就習慣將開發環境與本機系統隔離，這樣換電腦或搬服務器只需搬容器即可，也養成了環境潔癖。

現在好了，連建構與部署也搬到雲端去了，以前是隔離到容器，現在是隔離到 GitHub，算是徹底根治了這毛病。

不過再回頭看看 DevOps，我倒覺得這其實也是當代技術演進過快導致的產物。

從早年的機器碼、組合語言，到高階語言，再到容器化部署，一次次技術的「門檻下降」實際上也在偷偷「拉高起跑線」。

雖然讓程式開發越來越便利，但也使這行的入門門檻不知不覺變高，讓像我這樣的人加速被淘汰啦。

不過話說回來，工作是工作，生活是生活。技術變快歸變快，世界的節奏、行業的變遷應該還沒快到讓人沒喘息的空間。還是會有留一口氣的餘地吧。
