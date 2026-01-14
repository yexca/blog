---
slug: 44
title: 'Building a Site with GitHub Pages and Custom Domains'
date: '2022-05-28T15:30:43+08:00'
lastmod: '2025-01-23T16:15:43+09:00'
author: yexca
# layout: post
# permalink: /archives/44
views:
    - '355'
categories:
    - Development Practice
tags:
    - GitHub Pages
    - Site Building
---

{{< notice >}} This article was translated by Gemini-3-flash {{< /notice >}}

## Introduction

I recently set up a personal page using GitHub Pages (it's gone now), so here's a quick guide on how to build a site and use a custom domain.

This post doesn't cover complex site generators, since I basically just wrote a single Markdown file.

## Create a GitHub Repository

First, sign up for a [GitHub](https://github.com) account. Once logged in, [create a new repository](https://github.com/new).

The **Repository name** should be `username.github.io`. For example, if my GitHub username is `yexca`, I would enter `yexca.github.io`.

## Git Environment Setup

On Windows, just [download and run the installer](https://git-scm.com/downloads) from the official Git website.

After installation, open Git Bash and run the following commands:

```bash
git config --global user.name "Your Name"
git config --global user.email "email@example.com"
```

Replace `Your Name` with your name and `email@example.com` with your email.

For example:

```bash
git config --global user.name "yexca"
git config --global user.email "yexca@duck.com"
```

## GitHub Desktop

### Installation

If you're already familiar with Git (though if you were, why are you reading this?), you can skip this step.

Go to the [GitHub Desktop website](https://desktop.github.com) to download and install it.

### Clone the Repository

Open GitHub Desktop, log in, and clone the repository you just created to a local folder.

The app will show the repository interface with some quick actions on the right.

![App Interface](https://cdn.jsdelivr.net/gh/yexca/picx-images-hosting@master/2022/05-GithubPages建站/image.43qnbq0gw800.webp)

I use VS Code, so I'll click "Open in Visual Studio Code".

### Build the Site

Create a `README.md` file and edit it using [Markdown](https://blog.yexca.net/archives/43) (shameless plug for my own Markdown notes).

Once edited and saved, go back to GitHub Desktop, click "Commit to main", then click "Push origin".

Now, visit `username.github.io` to see your site. (If it doesn't show up immediately, give it a few minutes).

## Custom Domain

### GitHub Pages

Go to your repository settings, find "Pages" on the left, enter your custom domain under "Custom domain", and click "Save".

Note: You can also choose a Jekyll theme here.

### DNS

In your domain's DNS settings, add a `CNAME` record pointing your domain to `username.github.io`, where `username` is your GitHub username.

### HTTPS

For some reason, I couldn't get HTTPS working directly through GitHub, so I used [Cloudflare](https://cloudflare.com/en-us/).

Enable the proxy in DNS settings, then under "SSL/TLS" > "Edge Certificates", toggle on "Always Use HTTPS".

## Other Site Builders

Since I didn't need a full blog, I just used a simple file. If you want a real blog, check out these tools:

* [Jekyll](http://jekyllrb.com/): Officially supported by GitHub.
* [VuePress](http://caibaojian.com/vuepress/): Great for Markdown-centric sites.
* Gitbook: Good for documentation sites.
* [LOFFER](https://fromendworld.github.io/LOFFER/)
* [Gridea](https://gridea.dev/): A static blog writing client.
* [Hexo](https://hexo.io/): Fast, simple, and powerful blog framework.
* [Hugo](https://gohugo.io/)

## References

[GitHub Pages Quickstart - GitHub Docs](https://docs.github.com/en/pages/quickstart)

[GitHub Pages Blog: Custom Domain, HTTPS, CAA — Fuyun's Blog](https://last2win.com/2020/02/21/github-pages-https/)

[GitHub Pages Setup Tutorial](https://sspai.com/post/54608)

[Installing Git - Liao Xuefeng's Website](https://www.liaoxuefeng.com/wiki/896043488029600/896067074338496)