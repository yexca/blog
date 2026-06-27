---
slug: 58
title: 'GitHub 拒絕存取 Connection refused'
date: '2022-08-15T02:44:47+08:00'
author: yexca
# layout: post
# permalink: /archives/58
views:
    - '385'
categories:
    - 開發實踐
tags:
    - GitHub
---

{{< notice >}} 本文由 Gemini-3-flash 翻譯 {{< /notice >}}

## 引言

今天使用 Git 推送時出現提示 `fatal: unable to access 'https://github.com/yexca-VRChat/yexca-VRChat.github.io.git/': Failed to connect to 127.0.0.1 port 1081 after 2074 ms: Connection refused`，重新啟動電腦也沒用，於是尋找解決方法 ~~(為什麼不讓我存取自己的儲存庫)~~

## 解決過程

經查閱相關資料後得知與代理伺服器（Proxy）有關，但我代理伺服器是設在路由器上啊

於是我連線到另一個普通路由器再次推送，還是出現同樣的問題

接著嘗試設定 Git 的代理伺服器也無果

```bash
git config --global --unset http.proxy
git config --global --unset https.proxy
```

最後想到我 WinXray 貌似、好像、大概開過吧，然後打開一看，果然開啟了 PAC，關閉後再次推送成功

## 參考文章

[fatal: unable to access 'https://github.com/fmoraless/e-commerce.git/': Failed to connect to 127.0.0.1 port 56832: Connection refuse · Issue #11981 · desktop/desktop](https://github.com/desktop/desktop/issues/11981)

[解決 git 下載出現：Failed to connect to 127.0.0.1 port 1080: Connection refused 拒絕連線錯誤_點亮～黑夜的博客-CSDN博客](https://blog.csdn.net/weixin_41010198/article/details/87929622)

[git 報錯:解決拒絕存取問題_Huang_milk的博客-CSDN博客](https://blog.csdn.net/Huang_milk/article/details/121291273?utm_medium=distribute.pc_relevant.none-task-blog-2~default~baidujs_baidulandingword~default-0-121291273-blog-87929622.pc_relevant_multi_platform_whitelistv4&spm=1001.2101.3001.4242.1&utm_relevant_index=3)
