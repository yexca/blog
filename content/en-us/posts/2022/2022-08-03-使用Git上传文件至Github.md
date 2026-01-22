---
slug: 53
title: Uploading Files to GitHub Using Git
date: '2022-08-03T12:49:27+08:00'
author: hiyoung
# layout: post
# permalink: /archives/53
views:
    - '231'
categories:
    - Tech Learning
    - 技术学习
tags:
    - Git
    - Github
---

{{< notice >}} This article was translated by Gemini-3-flash {{< /notice >}}

> Written by [Hiyoung](https://blog.hiyoung.icu/)
>
> Original Article: <https://blog.hiyoung.icu/2022/08/03/0b5e2db181ab/>

I've been using GitHub a lot lately to store code from my learning process. I realized you can't upload folders directly through the web UI, so I looked into using Git for uploads. Here's a quick post to document the process.

## GitHub Operations

### 1. Copy Repository URL

![Uploading files to GitHub via Git_1](https://cdn.statically.io/gh/hiyoung3937/img_hiyoung@master/bolg/%E4%BD%BF%E7%94%A8Git%E4%B8%8A%E4%BC%A0%E6%96%87%E4%BB%B6%E8%87%B3Github_1.3syztscmys80.jpg)

## Local Operations

### 1. Create a New Empty Folder Locally

![Uploading files to GitHub via Git_2](https://cdn.statically.io/gh/hiyoung3937/img_hiyoung@master/bolg/%E4%BD%BF%E7%94%A8Git%E4%B8%8A%E4%BC%A0%E6%96%87%E4%BB%B6%E8%87%B3Github_2.5nufudqca7w0.jpg)

I've already finished the clone here.

### 2. Open Git Bash in the Folder

![Uploading files to GitHub via Git_3](https://cdn.statically.io/gh/hiyoung3937/img_hiyoung@master/bolg/%E4%BD%BF%E7%94%A8Git%E4%B8%8A%E4%BC%A0%E6%96%87%E4%BB%B6%E8%87%B3Github_3.5l2lii1fkd80.jpg)

### 3. Clone Remote Repository

```html
<pre class="language-bash" data-info="bash" data-role="codeBlock"><span class="token function">git</span> clone + your_repo_address
<span class="token function">git</span> clone https://github.com/hiyoung3937/study_code.git  // Example
```

### 4. Drag and Drop Files to Upload

### 5. Upload

```html
<pre class="language-bash" data-info="bash" data-role="codeBlock"><span class="token builtin class-name">cd</span>  study_code.git   // Enter your repository name
<span class="token function">git</span> init
<span class="token function">git</span> <span class="token function">add</span> <span class="token builtin class-name">.</span>
<span class="token function">git</span> commit -m "your commit message"
<span class="token function">git</span> push
```

- - - - - -

## Command Descriptions

| clone + repository address | Clones your repository to the local machine |
|---|---|
| cd + your remote repository name | Enters the remote repository folder (input based on your repo name) |
| git init | Initializes Git |
| git add . | Adds workspace files to the staging area ("." adds all files in the current directory; can also specify a folder name) |
| git commit -m "your commit message" | Adds files from the staging area to the local repository |
| git push | Pushes to the remote repository (may require credentials) |
