---
slug: 43
title: Markdown 簡述 (學習筆記)
date: '2022-05-28T00:59:23+08:00'
lastmod: '2025-01-23T15:56:23+09:00'
author: yexca
# layout: post
# permalink: /archives/43
views:
    - '436'
categories:
    - 技術學習
tags:
    - Markdown
---

{{< notice >}} 本文由 gemini-2.5-flash 翻譯 {{< /notice >}}

## 前言

最近因建立[雲端硬碟網站](https://pan.vrchat.yexca.xyz/)而了解了一下 Markdown，發現這東西非常好用，於是寫了一份學習筆記。

可以透過[線上編輯器](https://markdown.com.cn/editor/)邊看邊學，也可以下載一些[編輯器](https://markdown.com.cn/tools.html)。

個人編寫 Markdown 的工具為 [Typora](https://www.typora.io/)。

複習可以去看官方的速查表 [Markdown 語法速查表](https://markdown.com.cn/cheat-sheet.html)。

## 標題

建立標題，只需`#`+`空白`+`標題文字`，總共有六個層級，對應 HTML 的 h1~h6。

```markdown
# 這是一級標題
## 這是二級標題
### 這是三級標題
#### 這是四級標題
##### 這是五級標題
###### 這是六級標題
```

> 一般的網頁編寫，第一層標題是網頁標題，第二層開始為內文，用到第四層就差不多了。

## 換行

只需在上一行末尾加上兩個以上的空白後 Enter (或換行) 即可，有些編輯器可以直接換行。

例如以下程式碼：

```bash
這是第一行  //這裡有兩個空白，後面也有→  
這是第二行
```

效果如下：

這是第一行  //這裡有兩個空白，後面也有→  
這是第二行

## 斜體 & 粗體

斜體是在文字前後加上一個 `*`，粗體是在文字前後加上兩個 `**`。

例如以下程式碼：

```markdown
*這是斜體*  
**這是粗體**  
***這是斜體加粗體***
```

效果如下：

*這是斜體*  
**這是粗體**  
***這是斜體加粗體***

## 引用區塊

建立引言區塊只需在段落開頭添加 `>`+`空白`+`內容`。

例如以下程式碼：

```markdown
> 這是一級引言
>> 這是二級引言
>>> 這是三級引言 
```

效果如下：

> 這是一級引言
>
> > 這是二級引言
> >
> > > 這是三級引言

## 清單

可以建立有序清單和無序清單。

### 有序清單

在清單項目前添加 `數字`+`.`+`空白`+`內容` 即可。

例如以下程式碼：

```markdown
1. 第一項
2. 第二項
3. 第三項
```

效果如下：

1. 第一項
2. 第二項
3. 第三項

### 無序清單

使用 `+`，`-` 或 `*`+`空白`+ `內容` 即可，但請不要混用 ~~(為了相容性)~~。

子項目可以使用 `四個空白` 或一個 `TAB` 然後用父項目格式即可。

不過為了符合 (markdownlint) 規範，一篇文章中的所有無序清單應盡量使用相同的符號，例如都使用 `-`。

例如以下程式碼：

```markdown
- 第一項
  - 第一項子項目一
  - 第一項子項目二
    - 第一項子項目二的子項目一
- 第二項
- 第三項
```

效果如下：

- 第一項
  - 第一項子項目一
  - 第一項子項目二
    - 第一項子項目二的子項目一
- 第二項
- 第三項

## 程式碼

### 單行

將要變成程式碼的內容放在 "\`" 中即可，如果程式碼中有 "\`" ，請使用 "``"。

例如以下程式碼：

```markdown
`將此內容變成程式碼區塊`  
``此內容中含有'`'喔~``
```

效果如下：

`將此內容變成程式碼區塊`  
``此內容中含有'`'喔~``

### 程式碼區塊

可以透過將每一行縮排四個空白或一個 `TAB`。

或者上下行 "\`\`\`" 包住，若要使用語法高亮，請在上方 "\`\`\`" 後寫上語言類型。

為了符合規範，請盡量使用第二種方式。

例如以下程式碼：

```markdown
\`\`\` C
include<stdio.h>
int main(void)
{
    printf("Hello World");
}
\`\`\`
```

效果如下：

``` C
include<stdio.h>
int main(void)
{
    printf("Hello World");
}
```

## 分隔線

在單獨一行使用三個及以上的 `*`，`-` 或 `_` 即可。

為了規範，請盡量使用三個星號。

例如以下程式碼：

```markdown
***
```

效果如下：

***

## 連結

### 簡易連結

直接將連結或電子郵件地址使用 `<>` 括起來即可。

例如以下程式碼：

```markdown
<https://yexca.net>  
<yexca@duck.com>
```

效果如下：

<https://yexca.net>  
<yexca@duck.com>

### 自訂文字的連結

`[超連結顯示名](超連結地址 "超連結 title")`，其中 `"超連結 title"` 可以不用填寫。

例如以下程式碼：

```markdown
[yexca 的部落格](https://blog.yexca.net)  
[yexca 的部落格](https://blog.yexca.net "其實是yexca和Hiyoung的部落格")
```

效果如下：

[yexca 的部落格](https://blog.yexca.net)  
[yexca 的部落格](https://blog.yexca.net "其實是yexca和Hiyoung的部落格")

### 參考型連結

例如以下程式碼：

```markdown
[blog]: https://blog.yexca.net  
[contact]: <mailto:yexca@duck.com>

這是我的[個人部落格][blog]，有問題可以[聯絡我][contact]。
```

效果如下：

[blog]: https://blog.yexca.net  
[contact]: <mailto:yexca@duck.com>

這是我的[個人部落格][blog]，有問題可以[聯絡我][contact]。

## 圖片

### 插入圖片

`![圖片 alt](圖片連結 "圖片 title")`，其中 `圖片 alt` 為當圖片載入失敗時顯示的內容，`圖片 title` 為滑鼠移到圖片上顯示的內容。

請注意：部分 Markdown 編輯器不支援 `圖片 title` ~~(例如本站這個主題)~~，為了規範，請至少確保填寫 `圖片 alt`。

例如以下程式碼：

```markdown
![圖片](https://cdn.statically.io/gh/yexca/picx-images-hosting@master/2023/04-網站背景/blog-background.2p10z489pjc0.webp "這是本站的背景圖片")
```

效果如下：

![圖片](https://cdn.statically.io/gh/yexca/picx-images-hosting@master/2023/04-網站背景/blog-background.2p10z489pjc0.webp "這是本站的背景圖片")

### 圖片包含連結

使用連結的語法，將圖片放在 `[]` 裡面即可。

例如以下程式碼：

```markdown
[![圖片](https://cdn.statically.io/gh/yexca/picx-images-hosting@master/2023/04-網站背景/blog-background.2p10z489pjc0.webp)](https://www.pixiv.net/artworks/82542737)
```

效果如下：

[![圖片](https://cdn.statically.io/gh/yexca/picx-images-hosting@master/2023/04-網站背景/blog-background.2p10z489pjc0.webp)](https://www.pixiv.net/artworks/82542737)

## 跳脫字元

如果有不想被 Markdown 格式化的字元，只需要在前方加上 `\` 即可。

例如以下程式碼：

```markdown
我想打出*但這會變成斜體*  
加上跳脫字元\*後面就不會變成斜體，而且可以顯示
```

效果如下：

我想打出*但這會變成斜體*

加上跳脫字元\*後面就不會變成斜體，而且可以顯示

## 內嵌 HTML

直接使用即可，以摺疊標籤為例：

例如以下程式碼：

```markdown
<details>
    <summary>
        點我試試看
    </summary>
被發現啦
</details>
我可以用Markdown**變粗**，也可以同時用HTML<i>變斜</i>
```

因為本站主題無法直接解析 H5，所以不提供範例。

## 表格

使用三個或多個 `-` 建立每欄的標題，使用 `|` 分隔每欄，使用 `:` 向左、向右或置中對齊 (非必要)。

例如以下程式碼：

```markdown
|標題|內容|備註|
|:---|:---:|---:|
|靠左對齊|置中|靠右對齊|
```

效果如下：

| 標題     | 內容 | 備註     |
| :------- | :--: | -------: |
| 靠左對齊 | 置中 | 靠右對齊 |

**請注意**：不可以在表格中加入標題、引言、清單、圖片或 HTML 標籤等等。

## 刪除線

在要刪除的內容前後加上 `~~`。

例如以下程式碼：

```markdown
我永遠喜歡 ~~戰爭文學博士~~ Warma
```

效果如下：

我永遠喜歡 ~~戰爭文學博士~~ Warma

## 待辦事項清單

使用 `-`+`空白`+`[ ]` 或 `[x]`+`空白`+`內容`。

例如以下程式碼：

```markdown
- [ ] 這個還沒完成呢
- [x] 這個完成啦 
```

效果如下：

- [ ] 這個還沒完成呢
- [x] 這個完成啦

## 使用 Emoji 表情符號

### 複製貼上

大部分情況可以直接複製 [Emojipedia](https://emojipedia.org/) 上的表情符號直接貼上，請確保網頁編碼為 `UTF-8`。

### 使用表情符號簡碼

這需要 Markdown 應用程式支援，以冒號 `:` 開頭和結尾。

可以透過[表情符號簡碼列表](https://gist.github.com/rxaviers/7360908)查詢。

例如以下程式碼：

```markdown
:blush:,:smiley:
```

效果如下：

😊,😃

## 註腳

類似於論文參考文獻的註標。

例如以下程式碼：

```markdown
這裡引用了維基百科[^1]，這裡引用了 Github[^2]。
也可以使用英文，但不能使用空白或 TAB[^yexca]。

[^1]: 這裡可以使用文字，然後會顯示在上方相應的位置
[^2]: 或者使用連結 [Github](https://github.com/yexca)
[^yexca]: [個人首頁](https://lit.link/yexca)
```

效果如下，參考的內容在文章最尾端，點擊註標即可查看。

這裡引用了維基百科[^1]，這裡引用了 Github[^2]。
也可以使用英文，但不能使用空白或 TAB[^yexca]。

[^1]: 這裡可以使用文字，然後會顯示在上方相應的位置
[^2]: 或者使用連結 [Github](https://github.com/yexca)
[^yexca]: [個人首頁](https://lit.link/yexca)

**請注意**：部分編輯器不支援。

## 參考文章

[Markdown 官方教學](https://markdown.com.cn/)

[Markdown 學習](https://liangjunrong.github.io/other-library/Markdown-Websites/Markdown/Markdown-study.html)
