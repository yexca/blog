---
slug: 246
title: '為了能搜到自己的名字：一次小站 SEO 排查實踐'
# draft: true
author: yexca
date: '2025-04-27T17:38:16+09:00'
categories:
  - 開發實踐
tags:
  - SEO
---

{{< notice >}} 本文由 ChatGPT 翻譯 {{< /notice >}}

## 引言

又一次的自我介紹時，我不由得又想到了我的部落格。

過去我總是直接打開 Google 搜尋 `yexca`，點開第一個結果進入我的部落格。  
但自從更換網域後，無數次搜尋 `yexca`，我的網站卻始終消失在搜尋結果之外。

起初我並沒有太在意，以為可能有某種懲罰機制吧。畢竟 Google 建議更換網域後最好做一年的 301 重導向，而我當時只做了半年，舊網域就到期了。

但，已經兩年了吧，再怎麼說，也該恢復了吧？

而且更離譜的是，搜尋前幾的反而是一些早已不再維護的網站，  
而我，每天更新、調整、折騰的這個部落格，卻彷彿被世界遺忘了一般。

## 於是，我開始尋找原因

打開我的部落格，查看 `<head>` 區塊。  
嗯？`<meta name='description'>` 怎麼是網頁左邊那句標語？

啊這，當時配置的時候只是說那句話會出現在那邊，我以為跟 Argon 主題設定一樣呢。那麼也就是說，這網站的描述根本毫無意義啊。

不過，這句話幾乎陪伴了我整個部落格歷程，我不想輕易放棄它。  
既然如此，那就讓 JSON-LD 來承擔結構化描述的任務吧！

於是我在主題自定義 `<head>` 區段加入了：

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Blog",
  "name": "yexca'Blog",
  "url": "{{ .Site.BaseURL }}",
  "inLanguage": "{{ .Site.Language.Lang }}",
  "description": "{{ .Site.Params.description }}",
  "author": {
    "@type": "Person",
    "name": "yexca"
  }
}
</script>
```

嗯，同時考慮到是多語言網站，部分內容當然還是使用變數適配會比較好。

## 在語言的迷宮中探索

說到多語言網站，那我換個語系搜尋會如何呢？  
於是我在 `google.com.hk`、`google.com.tw`、`google.com.jp` 搜尋 `yexca`。

結果日文版可以搜尋到部落格，但中文版卻搜尋不到；英文內容不多，就算了。

這就很奇怪了，說明 Google 是有把 <https://blog.yexca.net> 辨識為 `yexca`，  
那為什麼其他語言版本這麼慘捏？

繼續排查下去，我發現可能是少了 hreflang 設定，於是我補上了：

```html
<link rel="alternate" hreflang="x-default" href="https://blog.yexca.net/" />
<link rel="alternate" hreflang="zh-CN" href="https://blog.yexca.net/" />
<link rel="alternate" hreflang="zh-TW" href="https://blog.yexca.net/zh-tw/" />
<link rel="alternate" hreflang="ja" href="https://blog.yexca.net/ja/" />
<link rel="alternate" hreflang="en" href="https://blog.yexca.net/en/" />
```

明確告訴搜尋引擎：不同語言的用戶可以拜訪不同語系版本，但這些都是同一網站。

> 順帶一提，這段 `<link>` 同樣會出現在文章頁面，因為我沒有加條件判斷。雖然不是每篇文章都有多語版本，不過 Google 是可以自己理解的。

## 一點點地補上遺漏

但我隨意點開一篇文章，哎呀，裡面還是 JSON-LD 的網站描述，多少有點奇怪。

於是我加上了條件邏輯：

```html
{{ if .IsHome }}
  <!-- 首頁 JSON-LD -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "yexca'Blog",
    "url": "{{ .Site.BaseURL }}",
    "inLanguage": "{{ .Site.Language.Lang }}",
    "description": "{{ .Site.Params.description }}",
    "author": {
      "@type": "Person",
      "name": "yexca"
    }
  }
  </script>

{{ else if .IsPage }}
  <!-- 文章頁 JSON-LD -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": "{{ .Permalink }}"
    },
    "headline": "{{ .Title }}",
    "name": "yexca'Blog",
    "author": {
      "@type": "Person",
      "name": "yexca"
    },
    "publisher": {
      "@type": "Person",
      "name": "yexca'Blog"
    },
    "datePublished": "{{ .Date.Format "2006-01-02" }}",
    "dateModified": "{{ .Lastmod.Format "2006-01-02" }}",
    "inLanguage": "{{ .Site.Language.Lang }}",
    "description": "{{ .Params.description | default .Site.Params.description }}"
  }
  </script>
{{ end }}
```

如此一來，首頁與文章就會產生不同的 JSON-LD，不僅語義更正確，也更符合 Google 結構化資料的建議。

## 小小的期盼

現在，一切終於補齊了。  
雖然成效不會立刻出現，但我知道，那個訊號，已經送出去了。

我希望，下次在介紹我的部落格時，  
可以直接打開 Google，搜尋 `yexca`。
