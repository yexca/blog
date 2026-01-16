---
slug: 43
title: Markdown Basics (Learning Notes)
date: '2022-05-28T00:59:23+08:00'
lastmod: '2025-01-23T15:56:23+09:00'
author: yexca
# layout: post
# permalink: /archives/43
views:
    - '436'
categories:
    - Tech Learning
tags:
    - Markdown
---

{{< notice >}} This article was translated by gemini-2.5-flash {{< /notice >}}

## Introduction

Recently, while building a [cloud storage website](https://pan.vrchat.yexca.xyz/), I learned about Markdown. This thing is super useful, so I'm writing up some learning notes.

You can learn on the go with an [online editor](https://markdown.com.cn/editor/), or download a [desktop editor](https://markdown.com.cn/tools.html).

My preferred Markdown editor is [Typora](https://www.typora.io/).

For a quick refresh, check out the official [Markdown Syntax Cheat Sheet](https://markdown.com.cn/cheat-sheet.html).

## Headings

To create a heading, just use `#` + `space` + `heading text`. There are six levels, mapping to HTML's h1-h6.

```markdown
# This is a H1
## This is a H2
### This is a H3
#### This is a H4
##### This is a H5
###### This is a H6
```

> For general web writing, the H1 is usually the page title, H2s start the main content, and you'll probably use up to H4.

## Line Breaks

Just add two or more spaces at the end of a line, then hit Enter. Some editors might add a line break directly.

For example, this code:

```bash
这是第一行  //这里有俩空格，后面也有→  
这是第二行
```

Result:

This is the first line  // two spaces here, and more after →  
This is the second line

## Italics & Bold

For italics, wrap text with a single `*`. For bold, use two `**`.

For example, this code:

```markdown
*This is italics*  
**This is bold**  
***This is italic and bold***
```

Result:

*This is italics*  
**This is bold**  
***This is italic and bold***

## Blockquotes

To create a blockquote, just add `>` + `space` + `content` at the start of a paragraph.

For example, this code:

```markdown
> This is a level 1 blockquote
>> This is a level 2 blockquote
>>> This is a level 3 blockquote
```

Result:

> This is a level 1 blockquote
>
> > This is a level 2 blockquote
> >
> > > This is a level 3 blockquote

## Lists

You can create ordered and unordered lists.

### Ordered Lists

Just add `number` + `.` + `space` + `content` before each list item.

For example, this code:

```markdown
1. First item
2. Second item
3. Third item
```

Result:

1. First item
2. Second item
3. Third item

### Unordered Lists

Use `+`, `-`, or `*` + `space` + `content`. But don't mix them ~~(for compatibility)~~.

Sub-items can be indented with `four spaces` or a `TAB`, then formatted like the parent item.

However, to comply with `markdownlint` standards, try to use the same symbol for all unordered lists in an article, like always using `-`.

For example, this code:

```markdown
- First item
  - First item sub-item one
  - First item sub-item two
    - First item sub-item two sub-item one
- Second item
- Third item
```

Result:

- First item
  - First item sub-item one
  - First item sub-item two
    - First item sub-item two sub-item one
- Second item
- Third item

## Code

### Inline Code

Wrap content you want to turn into inline code with backticks (` `). If your code contains a backtick, use double backticks (`` ``).

For example, this code:

```markdown
`Turn this content into a code block`  
``This content contains a '`' oh~``
```

Result:

`Turn this content into a code block`  
``This content contains a '`' oh~``

### Code Blocks

You can indent each line with four spaces or a `TAB`.

Alternatively, wrap the code with triple backticks (```) on the lines above and below. For syntax highlighting, specify the language after the opening triple backticks.

To follow best practices, use the triple backtick method.

For example, this code:

```markdown
``` C
include<stdio.h>
int main(void)
{
    printf("Hello World");
}
```
```

Result:

``` C
include<stdio.h>
int main(void)
{
    printf("Hello World");
}
```

## Horizontal Rules

On a separate line, use three or more `*`, `-`, or `_`.

For consistency, it's best to use three asterisks.

For example, this code:

```markdown
***
```

Result:

***

## Links

### Simple Links

Just wrap the URL or email address with `<>`.

For example, this code:

```markdown
<https://yexca.net>  
<yexca@duck.com>
```

Result:

<https://yexca.net>  
<yexca@duck.com>

### Links with Custom Text

`[Link text](URL "Optional Title")`. The `"Optional Title"` part can be omitted.

For example, this code:

```markdown
[yexca's Blog](https://blog.yexca.net)  
[yexca's Blog](https://blog.yexca.net "Actually, it's yexca and Hiyoung's blog")
```

Result:

[yexca's Blog](https://blog.yexca.net)  
[yexca's Blog](https://blog.yexca.net "Actually, it's yexca and Hiyoung's blog")

### Reference-Style Links

For example, this code:

```markdown
[blog]: https://blog.yexca.net  
[contact]: <mailto:yexca@duck.com>

This is my [personal blog][blog]. If you have questions, you can [contact me][contact].
```

Result:

[blog]: https://blog.yexca.net  
[contact]: <mailto:yexca@duck.com>

This is my [personal blog][blog]. If you have questions, you can [contact me][contact].

## Images

### Embedding Images

`![Alt text](Image URL "Optional Title")`. `Alt text` shows if the image fails to load, and `Optional Title` appears on hover.

Note: Some Markdown editors don't support `Optional Title` ~~(like this site's theme)~~. For best practice, at least ensure `Alt text` is provided.

For example, this code:

```markdown
![Image](https://cdn.statically.io/gh/yexca/picx-images-hosting@master/2023/04-网站背景/blog-background.2p10z489pjc0.webp "This is the background of this site")
```

Result:

![Image](https://cdn.statically.io/gh/yexca/picx-images-hosting@master/2023/04-网站背景/blog-background.2p10z489pjc0.webp "This is the background of this site")

### Image with a Link

Use the link syntax, but put the image syntax inside the `[]`.

For example, this code:

```markdown
[![Image](https://cdn.statically.io/gh/yexca/picx-images-hosting@master/2023/04-网站背景/blog-background.2p10z489pjc0.webp)](https://www.pixiv.net/artworks/82542737)
```

Result:

[![Image](https://cdn.statically.io/gh/yexca/picx-images-hosting@master/2023/04-网站背景/blog-background.2p10z489pjc0.webp)](https://www.pixiv.net/artworks/82542737)

## Escaping Characters

If you have characters you don't want Markdown to format, just add a `\` before them.

For example, this code:

```markdown
I want to type *but this will be italic*  
Adding an escape character \* will prevent italics and display the character
```

Result:

I want to type *but this will be italic*

Adding an escape character \* will prevent italics and display the character

## Embedded HTML

You can use HTML directly. Here's an example with the `<details>` tag.

For example, this code:

```markdown
<details>
    <summary>
        Click me
    </summary>
Found you!
</details>
I can use Markdown **for bold**, and also HTML <i>for italics</i> at the same time.
```

Since this site's theme doesn't directly parse HTML5, I won't demonstrate it live.

## Tables

Use three or more `-` for column headers, `|` to separate columns, and `:` for left, right, or center alignment (optional).

For example, this code:

```markdown
|Title|Content|Notes|
|:---|:---:|---:|
|Left-aligned|Centered|Right-aligned|
```

Result:

| Title      | Content |    Notes |
| :--------- | :-----: | -------: |
| Left-aligned | Centered | Right-aligned |

**Note**: You cannot add headings, blockquotes, lists, images, or HTML tags inside tables.

## Strikethrough

Add `~~` before and after the text you want to strike through.

For example, this code:

```markdown
I will always love ~~Dr. War Literature~~ Warma
```

Result:

I will always love ~~Dr. War Literature~~ Warma

## Task Lists

Use `-` + `space` + `[ ]` or `[x]` + `space` + `content`.

For example, this code:

```markdown
- [ ] This isn't done yet
- [x] This one is finished
```

Result:

- [ ] This isn't done yet
- [x] This one is finished

## Using Emojis

### Copy and Paste

In most cases, you can directly copy emojis from [Emojipedia](https://emojipedia.org/) and paste them. Just ensure your web encoding is `UTF-8`.

### Using Emoji Shortcodes

This requires Markdown application support, using colons `:` at the beginning and end.

You can look up shortcodes via the [Emoji Shortcode List](https://gist.github.com/rxaviers/7360908).

For example, this code:

```markdown
:blush:,:smiley:
```

Result:

😊,😃

## Footnotes

Similar to citations or superscripts in academic papers.

For example, this code:

```markdown
This references Wikipedia[^1], and this references Github[^2].
You can also use English, but no spaces or TABs[^yexca].

[^1]: You can use text here, which will appear at the corresponding position above.
[^2]: Or use a link [Github](https://github.com/yexca)
[^yexca]: [Personal Homepage](https://lit.link/yexca)
```

Result: The references appear at the very end of the article. Click the superscript to view them.

This references Wikipedia[^1], and this references Github[^2].
You can also use English, but no spaces or TABs[^yexca].

[^1]: You can use text here, which will appear at the corresponding position above.
[^2]: Or use a link [Github](https://github.com/yexca)
[^yexca]: [Personal Homepage](https://lit.link/yexca)

**Note**: Some editors don't support this.

## References

[Official Markdown Tutorial](https://markdown.com.cn/)

[Learning Markdown](https://liangjunrong.github.io/other-library/Markdown-Websites/Markdown/Markdown-study.html)
