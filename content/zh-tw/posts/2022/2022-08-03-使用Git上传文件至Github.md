---
slug: 53
title: 使用 Git 上傳檔案至 GitHub
date: '2022-08-03T12:49:27+08:00'
author: hiyoung
# layout: post
# permalink: /archives/53
views:
    - '231'
categories:
    - 技術學習
tags:
    - Git
    - GitHub
---

{{< notice >}} 本文由 Gemini-3-flash 翻譯 {{< /notice >}}

> 這篇文章由 [Hiyoung](https://blog.hiyoung.icu/) 撰寫
>
> 其文章: <https://blog.hiyoung.icu/2022/08/03/0b5e2db181ab/>

最近經常要使用 GitHub 儲存我學習過程中的程式碼，發現無法直接上傳資料夾，於是在網路上查了一下如何使用 Git 上傳，所以寫篇部落格文章記錄一下。

## GitHub 端操作

### 1. 複製儲存庫網址

![使用Git上傳檔案至GitHub_1](https://cdn.statically.io/gh/hiyoung3937/img_hiyoung@master/bolg/%E4%BD%BF%E7%94%A8Git%E4%B8%8A%E4%BC%A0%E6%96%87%E4%BB%B6%E8%87%B3Github_1.3syztscmys80.jpg)

## 本地端操作

### 1. 在本地端新建一個空資料夾

![使用Git上傳檔案至GitHub_2](https://cdn.statically.io/gh/hiyoung3937/img_hiyoung@master/bolg/%E4%BD%BF%E7%94%A8Git%E4%B8%8A%E4%BC%A0%E6%96%87%E4%BB%B6%E8%87%B3Github_2.5nufudqca7w0.jpg)

我這裡已經 clone 完成

### 2. 在資料夾內開啟 Git Bash 視窗

![使用Git上傳檔案至GitHub_3](https://cdn.statically.io/gh/hiyoung3937/img_hiyoung@master/bolg/%E4%BD%BF%E7%94%A8Git%E4%B8%8A%E4%BC%A0%E6%96%87%E4%BB%B6%E8%87%B3Github_3.5l2lii1fkd80.jpg)

### 3. Clone 遠端儲存庫

```html
<pre class="language-bash" data-info="bash" data-role="codeBlock"><span class="token function">git</span> clone + 你的儲存庫網址
<span class="token function">git</span> clone https://github.com/hiyoung3937/study_code.git  //範例
```

### 4. 直接將需要上傳的檔案拖入即可

### 5. 上傳

```html
<pre class="language-bash" data-info="bash" data-role="codeBlock"><span class="token builtin class-name">cd</span>  study_code.git   //根據自己的遠端儲存庫名稱輸入
<span class="token function">git</span> init
<span class="token function">git</span> <span class="token function">add</span> <span class="token builtin class-name">.</span>
<span class="token function">git</span> commit -m “你的提交訊息”
<span class="token function">git</span> push
```

- - - - - -

## 指令說明

| clone + 儲存庫網址 | 複製你的儲存庫至本地端 |
| --- | --- |
| cd + 你的遠端儲存庫名 | 進入到遠端儲存庫內 (根據自己的儲存庫名稱輸入) |
| git init | 初始化 Git |
| git add . | 將工作區的檔案新增至暫存區（「.」是目前目錄下的所有檔案，也可只輸入資料夾名稱） |
| git commit -m “你的提交訊息” | 將暫存區的檔案新增至本地端儲存庫 |
| git push | 推送至遠端儲存庫（可能需要輸入帳號與密碼） |
