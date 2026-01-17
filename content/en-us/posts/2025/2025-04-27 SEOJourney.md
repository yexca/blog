---
slug: 246
title: 'So My Name Can Be Found: A Small Site SEO Debugging Practice'
# draft: true
author: yexca
date: '2025-04-27T17:38:16+09:00'
categories:
    - Development Practice
tags:
    - SEO
---

{{< notice >}} This article was translated by gemini-2.5-flash {{< /notice >}}

## Introduction

Another self-introduction, and my blog popped into my mind again.

I used to just Google `yexca`, click the first result, and land on my blog. But ever since changing domains, I've searched for `yexca` countless times, and my blog just vanishes from the results.

Initially, I didn't worry much, thinking maybe there was some penalty. Google recommends a year of 301 redirects after a domain change, but I only did six months before the old domain expired.

But it's been two years now, right? It should have recovered by now.

What's crazier is that some old, unmaintained sites rank higher. Meanwhile, my blog, which I update, optimize, and tinker with daily, seems completely forgotten by the world.

## So, I Started Looking for Answers

Opened my blog, checked the `<head>` section.
Huh? Why is `<meta name='description'>` just that tagline on the left side of the page?

Ah, when I configured it, it just said it would appear there. I thought it was similar to Argon's setup. So, this site's description is essentially meaningless.

But that phrase has been with me through my entire blogging journey; I don't want to give it up easily. Alright, then let's use JSON-LD for structured data!

So, I added this to the theme's custom `<head>` section:

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

Yeah, also considering it's a multilingual site, using variables for some content is definitely better.

## Navigating the Language Maze

Speaking of multilingual sites, what if I search in a different language environment?
So I searched `yexca` on `google.com.hk`, `google.com.tw`, and `google.com.jp`.

Turns out, my blog shows up in Japanese search results, but not in Chinese. As for English, I don't have many articles, so it's whatever.

That's really weird. Google should be able to identify <https://blog.yexca.net> as `yexca`, but why are the other language versions doing so poorly?

Digging deeper, I realized `hreflang` configuration might be missing, so I added:

```html
<link rel="alternate" hreflang="x-default" href="https://blog.yexca.net/" />
<link rel="alternate" hreflang="zh-CN" href="https://blog.yexca.net/" />
<link rel="alternate" hreflang="zh-TW" href="https://blog.yexca.net/zh-tw/" />
<link rel="alternate" hreflang="ja" href="https://blog.yexca.net/ja/" />
<link rel="alternate" hreflang="en" href="https://blog.yexca.net/en/" />
```

This explicitly tells search engines that users of different languages can access different language versions, and it's all the same website.

> BTW, this `<link>` block also appears on article pages because there's no conditional logic. But not all articles on my blog have all language versions, so this doesn't need to change; Google will understand it automatically.

## Patching Up the Gaps

But I randomly opened an article, and oops, it still had the JSON-LD site description. That felt a bit odd.
So, I added some conditional logic:

```html
{{ if .IsHome }}
  <!-- Homepage JSON-LD -->
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
  <!-- Article Page JSON-LD -->
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

Now, both the homepage and articles will have different JSON-LD. This makes the semantics more accurate and better aligns with Google's recommended structured data guidelines.

## A Little Hope

Now, everything's finally complete.  
Results won't show immediately, but I know the signal has been sent.

All that's left now is to wait for Google to understand my existence once again.

I hope next time, when I introduce my blog,  
I can just open Google and search `yexca`.
