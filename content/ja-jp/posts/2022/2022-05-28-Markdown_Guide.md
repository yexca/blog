---
slug: 43
title: Markdown 概要（学習ノート）
date: '2022-05-28T00:59:23+08:00'
lastmod: '2025-01-23T15:56:23+09:00'
author: yexca
categories:
  - 技術学習
tags:
  - Markdown
---

{{< notice >}} この記事は ChatGPT によって翻訳されました {{< /notice >}}

## はじめに

最近、[クラウドサイト](https://pan.vrchat.yexca.xyz/) を作る過程で Markdown に触れましたが、非常に使いやすいことに気付き、学習ノートとしてまとめることにしました。

[オンラインエディタ](https://markdown.com.cn/editor/) を使いながら学んでもよいし、[ローカルエディタ](https://markdown.com.cn/tools.html) を導入してもよいでしょう。

私自身は [Typora](https://www.typora.io/) を使用しています。

復習には [Markdown チートシート](https://markdown.com.cn/cheat-sheet.html) をどうぞ。

## 見出し

`#` + 半角スペース + 見出し名で作成し、1～6段階（HTML の h1～h6）に対応します。

```markdown
# 見出し1
## 見出し2
### 見出し3
#### 見出し4
##### 見出し5
###### 見出し6
````

> 一般的なウェブページでは、h1 はページタイトル、h2 以下が本文になります。h4 まであれば十分です。

## 改行

前の行の末尾に「半角スペースを2つ以上 + 改行」で改行できます。一部エディタでは自動的に処理されます。

```markdown
これは1行目（スペースあり）  
これは2行目
```

結果：

これは1行目（スペースあり）
これは2行目

## 斜体・太字

斜体は `*テキスト*`、太字は `**テキスト**`、両方なら `***テキスト***`。

```markdown
*斜体*  
**太字**  
***斜体かつ太字***
```

結果：

*斜体*
**太字**
***斜体かつ太字***

## 引用

行頭に `>` を付けます。

```markdown
> 引用レベル1
>> 引用レベル2
>>> 引用レベル3
```

結果：

> 引用レベル1
>
> > 引用レベル2
> >
> > > 引用レベル3

## リスト

### 番号付きリスト

`数字. 半角スペース 内容`

```markdown
1. 項目1
2. 項目2
3. 項目3
```

### 箇条書きリスト

`-`、`+`、`*` のいずれかを使用（統一推奨）、インデントで階層化。

```markdown
- 第一項目
  - 子項目1
  - 子項目2
    - 孫項目
- 第二項目
```

## コード

### インラインコード

`` `コード` `` で囲みます。

```markdown
`コード`  
``これは \` を含むコードです``
```

### ブロックコード

````markdown
```c
#include<stdio.h>
int main() {
  printf("Hello World");
}
```

```

結果：

```c
#include<stdio.h>
int main() {
  printf("Hello World");
}
````

## 水平線

3つ以上の `*`、`-`、`_` のみを使って改行。

```markdown
***
```

結果：

---

## リンク

### 簡易リンク

```markdown
<https://yexca.net>  
<yexca@duck.com>
```

結果：

[https://yexca.net](https://yexca.net)
[yexca@duck.com](mailto:yexca@duck.com)

### テキスト付きリンク

```markdown
[ブログ](https://blog.yexca.net)  
[ブログ](https://blog.yexca.net "実は Hiyoung と共同")
```

### 参照型リンク

```markdown
[blog]: https://blog.yexca.net  
[contact]: <mailto:yexca@duck.com>

これは [ブログ][blog] です。連絡は [こちら][contact]
```

## 画像

```markdown
![alt](画像URL "タイトル")
```

例：

```markdown
![背景](https://cdn.statically.io/gh/yexca/picx-images-hosting@master/2023/04-网站背景/blog-background.2p10z489pjc0.webp "背景画像")
```

画像 + リンク：

```markdown
[![画像](URL)](リンク先)
```

## エスケープ

Markdown の記号をそのまま表示したい時は `\` をつけます。

```markdown
これは * 斜体になります  
これは \* そのまま表示
```

## HTML挿入

```markdown
<details>
  <summary>クリックで展開</summary>
本文です
</details>
```

> Hugoテーマによっては HTML を正しく表示できないことがあります。

## 表

```markdown
| ヘッダ | 内容 | 備考 |
|:------|:----:|----:|
| 左寄せ | 中央 | 右寄せ |
```

結果：

| ヘッダ |  内容 |  備考 |
| :-- | :-: | --: |
| 左寄せ |  中央 | 右寄せ |

## 打ち消し線

```markdown
私は ~~戦争文学博士~~ Warma が好き
```

結果：

私は ~~戦争文学博士~~ Warma が好き

## チェックリスト

```markdown
- [ ] 未完了
- [x] 完了
```

結果：

* [ ] 未完了
* [x] 完了

## 絵文字

### コピー貼り付け

[Emojipedia](https://emojipedia.org/) から絵文字をコピーして貼るだけ。

### ショートコード

`:` で囲みます（要対応環境）

```markdown
:blush: :smiley:
```

結果：

😊 😃

## 脚注

```markdown
参考[^1]、GitHub[^2]、ユーザー[^yexca]

[^1]: 注釈テキスト
[^2]: [GitHub](https://github.com/yexca)
[^yexca]: [プロフィール](https://lit.link/yexca)
```

## 参考リンク

* [Markdown公式ガイド](https://markdown.com.cn/)
* [Markdown学習資料](https://liangjunrong.github.io/other-library/Markdown-Websites/Markdown/Markdown-study.html)
