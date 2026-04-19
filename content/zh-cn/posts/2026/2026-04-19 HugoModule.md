---
slug: 277
title: 'Hugo Module 管理'
# draft: true
author: yexca
date: '2026-04-19T22:20:06+09:00'
categories:
    - 技术学习
tags:
    - Hugo
    - Go
---

首先需要安装 `go` 环境

```bash
sudo apt install golang
```

然后初始化

```bash
hugo mod init github.com/<your_user>/<your_project>
```

在配置文件 `hugo.yml` 导入需要添加的模块

```yaml
module:
  imports:
    - path: github.com/name/repo
```

更新配置

```bash
hugo mod get -u
```

## module 显示

因为使用 go 的依赖，所以要看模块具体在哪使用命令

```bash
go env GOMODCACHE
```

把依赖 vendor 进自己的仓库

```bash
hugo mod vendor
```

这样就会有一个 vendor 文件夹，显示该项目的依赖

## 使用

如果是作为主题的话，只需要本地同名文件即可，也就是修改本地的文件，将覆盖导入的主题的文件

## 参考文章

<https://gohugo.io/hugo-modules/use-modules/>
