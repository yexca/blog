---
slug: 247
title: '拥抱 DevOps：把我的博客构造部署工作甩给 GitHub'
# draft: true
author: yexca
date: '2025-05-16T18:14:06+09:00'
categories:
    - 开发实践
tags:
    - DevOps
    - GitHub Actions
    - CI/CD
---

## 引言

最近在想着自己要继续做什么或者学什么的时候，老是看到 “DevOps” 这个词。起初我随手一搜，发现上面列的技术栈自己差不多都有所了解，还以为是类似“全栈”那样多掌握点工具 (虽然事实上好像也是)
不过因为没什么兴趣道也就耽搁了 (其实是没开发热情了)

直到最近躺了快四个月感觉自己应该挣扎一下，于是又想到了这个词。再次了解了一下，怎么说呢......这是卷到极致了是吧，前后端分离人不分离就罢了，这整得开发运维分离人不分离了属于是

不过话又说回来，看到自动流有 Github Action 的时候不由得让我想起了之前用 Jekyll 博客时候是可以直接自动部署的，但因为我是从其他博客系统迁移的子文件夹分类的习惯还是继续保留着，那个部署不支持子文件夹所以我也就没深入了解了。那么，这次既然都想着整点东西，就看看现在的 Hugo 博客能不能自动部署吧 ~~毕竟每次从容器里下回来再上传还挺麻烦的~~

## 工作流

创建一个工作流是在 Git 仓库根目录的 `.github/workflows/` 目录下的 yaml 文件定义的，文件名可以随意，我这次是部署，所以用 `deploy.yml`

文件结构大体分为名称、触发器以及工作

### 名称

这个就无所谓，起个名字呗

```yaml
name: Build and Deploy Hugo Blog
```

### 触发器

Action Workflow 有多种触发方式，我这里是每次推送触发就行，毕竟基本也就是更新文章，然后就构建

另外再加一个手动触发，以防有时候是 Github 配置错误还得再下次推送才能启动 Action Workflow

```yaml
on:
  push: # Git Push 时候触发
    branches:
      - main  # 监听源仓库主分支的更新
  workflow_dispatch: # 手动触发
```

### 工作

我这里只有一个工作，jobs 是可以有多个的，它们并行执行

首先命名工作的名称

```yaml
jobs:
  build-deploy:
```

然后定义运行的内核，在工作名称的下一级，我选择了 ubuntu

```yaml
jobs:
  build-deploy:
    runs-on: ubuntu-latest
```

然后定义执行的步骤，第一步克隆仓库

```yaml
jobs:
  build-deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout source
        uses: actions/checkout@v4
```

然后是安装 Hugo

```yaml
steps:
  - name: Setup Hugo
    uses: peaceiris/actions-hugo@v2
    with:
      hugo-version: '0.140.1' # 这里是我本地的版本，兼容性应该高点
      extended: true # 因为我的主题使用了 SCSS 所以必须使用 extended 版本
```

接着是构建指令

```yaml
steps:
  - name: Build Hugo Site
    run: hugo --minify
```

推送到我部署 Github Page 的仓库

```yaml
steps:
  - name: Deploy to BlogWeb repo
    uses: peaceiris/actions-gh-pages@v3
    with:
      external_repository: yexca/Blog-Web-Hugo
      publish_branch: main # 推送到目标仓库 yexca/Blog-Web-Hugo 的 main 分支
      publish_dir: ./public # 推送的当前仓库的文件夹，Hugo 默认是生成到这个文件夹
      personal_token: ${{ secrets.PERSONAL_TOKEN }}
```

所以合起来就是这样

```yaml
name: Build and Deploy Hugo Blog

on:
  push:
    branches:
      - main
  workflow_dispatch:

jobs:
  build-deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout source
        uses: actions/checkout@v4

      - name: Setup Hugo
        uses: peaceiris/actions-hugo@v2
        with:
          hugo-version: '0.140.1'
          extended: true

      - name: Build Hugo site
        run: hugo --minify

      - name: Deploy to blogWeb repo
        uses: peaceiris/actions-gh-pages@v3
        with:
          external_repository: yexca/Blog-Web-Hugo
          publish_branch: main 
          publish_dir: ./public
          personal_token: ${{ secrets.PERSONAL_TOKEN }}

```

## 配置 Token

因为访问其他仓库是需要 Token 的，所以需要去生成一个

在自己的 `Settings -> Developer Settings -> Personal access tokens -> Fine-grained tokens` 生成一个对指定仓库有读写权限的 Token 就可以

然后到源仓库配置，我的是 `yexca/Blog-Source-Hugo` 仓库，进入仓库的 `Settings -> Secrets and variables -> Actions` 的 `Repository secrets` 添加刚生成的 Token，其中名字就是刚才配置写的 `PERSONAL_TOKEN`

## 处理域名问题

因为 Github Page 使用自己的域名的话是会有一个文件名为 `CNAME` 填入自定义的域名的，而 Github Action Workflow 推送实际上是直接把原来的全部内容删除再推送过去，所以 `CNAME` 文件也会被删除，就需要在推送前加上这个文件以自定义域名，有两种方法

一个是在工作流新建文件

```yaml
steps:
  - name: Add CNAME
    run: echo 'blog.yexca.net' > public/CNAME
```

或者直接在 Hugo 的 `static` 文件夹放一个 `CNAME` 文件，因为该文件夹内容会被直接放到生成的内容根目录

## 主题模块问题

因为我的原主题是使用 Git SubModule 加上的，所以推送上去后是直接链接到对应 Github repo 的，可是我已经进行较多修改，这些并不会上传到 Github，因此需要断开链接

### 备份主题文件

在此之前先备份，复制到其他文件夹

```bash
cp -r themes/Hugo-Theme-Stack tmp/Hugo-Theme-Stack-Backup
```

### 移除子模块配置

先初始化子模块

```bash
git submodule deinit -f themes/Hugo-Theme-Stack
```

从 Git 移除

```bash
git rm -f themes/Hugo-Theme-Stack
```

移除文件

```bash
rm -rf .git/modules/themes/Hugo-Theme-Stack
```

再把根目录的 `.gitmodules` 文件也删除

```bash
rm .gitmodules
```

### 恢复主题

再把备份的文件送回来

```bash
cp -r tmp/Hugo-Theme-Stack-Backup themes/Hugo-Theme-Stack
```

删除备份文件 (可以先测试后再删)

```bash
rm -rf tmp
```

## 修复 JS 规范错误

因为自己之前搞的博客运行时间使用了较为古老的八进制数写法，而我采用了命令 `hugo -minify` 压缩构建的方式，导致产生了错误

解决仿佛也很简单，原先代码是

```javascript
Date.UTC(2021, 10, 06, 14, 15, 19)
```

改成

```javascript
Date.UTC(2021, 10, 6, 14, 15, 19)
```

## 结语

这下总算是脱离编译了，从我开始使用 Docker 开始就慢慢习惯了让开发环境和本地系统隔离，这样更换系统更换服务器什么的只要转移容器就行，所以开发向来都是与实机隔离的，也渐渐培养出了环境洁癖了

现在好了，构建部署都不在本地了，以前是隔离到容器，现在是隔离到云端了，彻底治好环境洁癖了属于是

不过再次来看 DevOps，我感觉这何尝不是现在越来越卷，技术发展越来越便捷带来的产物呢
从早年机器适配、汇编到高级语言的出现，再到容器化部署打破环境障碍，技术每一次迭代带来效率提高门槛降低的同时都在悄悄拔高“起步线”

虽然为编程生活带来了更大的快捷性，可也顺手提升了行业入门门槛，从而使我更快被下岗了属于是

不过工作是工作生活是生活，技术迭代是快，可世界的系统迭代、行业迭代不至于这么快，多少还是会给人来点喘息的时间吧
