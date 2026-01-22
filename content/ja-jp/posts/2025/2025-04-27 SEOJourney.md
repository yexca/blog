---
slug: 246
title: '自分の名前で検索されるために：小さなブログの SEO 調査実践記'
# draft: true
author: yexca
date: '2025-04-27T17:38:16+09:00'
categories:
    - 開発実践
tags:
    - SEO
---

{{< notice >}} この記事は ChatGPT によって翻訳されました {{< /notice >}}

## はじまり

また自己紹介のタイミングで、ふと思い出したのが自分のブログだった。

昔は Google で `yexca` って検索すれば一発で一番上に出てきて、そこからすぐブログに飛べた。  
でもドメインを変更してからというもの、何度検索してもブログはどこにも見当たらなくなった。

最初はそこまで気にしてなくて、Google の制限とかペナルティみたいなもんかなって思ってた。  
公式には、ドメインを変えるときは 301 リダイレクトを1年間続けるのが推奨されてて、でも俺は半年で旧ドメインの期限切れちゃったんだよね。

でも、もう2年経ったよ？そろそろ戻ってきてもいいんじゃないの？

しかもおかしいのは、検索上位に出てくるのは昔のメンテ止まったようなサイトばかりで、  
俺が毎日更新して、調整して、あれこれいじりまくってるこのブログはまるでネットから消えたかのようになってた。

## というわけで原因調査開始

まずはブログを開いて `<head>` をチェック。  
ん？`<meta name='description'>` がサイドバーに出てくるキャッチコピーになってる？

あー…そういや、設定のとき「ここに表示されるよ」ってだけ書いてあって、Argon テーマの時と同じようなもんだと思ってたわ。  
つまり、今のサイト説明は意味不明ってことか。

とはいえ、この言葉は自分のブログ人生をずっと一緒に歩んできたし、簡単に手放したくない。  
だったら、構造化データ（JSON-LD）を使って、説明の役割をそっちに任せればいいじゃん！

ってことで、テーマの `<head>` カスタムに以下を追加：

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

しかもサイトは多言語対応だから、部分的に変数で言語ごとに適応できるようにした方が良いね。

## 言語という迷宮での探索

多言語サイトってことで、じゃあ言語変えて検索してみたらどうなる？って気になって、  
 `google.com.hk`、`google.com.tw`、`google.com.jp` で `yexca` を検索してみた。

結果は、なんと日本語環境ではちゃんと出てきた。  
 でも中国語では出てこない。英語はまぁ記事が少ないから仕方ないか。

つまり Google 的には `https://blog.yexca.net` が `yexca` に紐づいてるのは認識してるっぽいけど、  
 言語ごとの評価とかがうまく機能してないのかも？

さらに調べていくと `hreflang` の指定が足りないんじゃ？と気づいて、こんな感じで追加：

```html
<link rel="alternate" hreflang="x-default" href="https://blog.yexca.net/" />
<link rel="alternate" hreflang="zh-CN" href="https://blog.yexca.net/" />
<link rel="alternate" hreflang="zh-TW" href="https://blog.yexca.net/zh-tw/" />
<link rel="alternate" hreflang="ja" href="https://blog.yexca.net/ja/" />
<link rel="alternate" hreflang="en" href="https://blog.yexca.net/en/" />
```

これで検索エンジンには「これは多言語対応の同一サイトです」って明確に伝わる。

> ちなみに、この `<link>` はすべての記事ページにも入るようにした。  
> すべての言語に翻訳があるわけじゃないけど、Google 側がちゃんと処理してくれるからそのままでOK。

## 少しずつ埋める抜け穴

で、試しにどれかの記事を開いたら、「あれ？JSON-LD がまだサイト情報になってるやん？」ってなった。  
 これはちょっと違和感あるなと思って、条件分岐を入れることにした：

```html
{{ if .IsHome }}
  <!-- ホーム JSON-LD -->
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
  <!-- 記事 JSON-LD -->
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

これでホームと記事で異なる JSON-LD が表示されるようになって、  
 意味的にも正しいし、Google の構造化データガイドラインにもより適合する。

## 小さな願い

これでようやく一通り整った。  
 もちろん、すぐに結果が出るわけじゃないけど、  
 でも、確かに「信号」は送り出されたはず。

あとはただ、待つだけ。Google がもう一度、俺の存在を認識してくれるのを。

次に誰かにブログを紹介する時には、  
 Google を開いて、`yexca` って検索して、すっと出てくるように。
