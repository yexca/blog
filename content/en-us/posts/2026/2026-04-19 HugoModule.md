---
slug: 277
title: 'Hugo Module Management'
# draft: true
author: yexca
date: '2026-04-19T22:20:06+09:00'
categories:
    - Tech
tags:
    - Hugo
    - Go
---

{{< notice >}} This article was translated by gemini-3-flash-preview {{< /notice >}}

First, you need to install the `go` environment.

```bash
sudo apt install golang
```

Then, initialize the module:

```bash
hugo mod init github.com/<your_user>/<your_project>
```

Import the modules you want to add in your `hugo.yml` configuration file:

```yaml
module:
  imports:
    - path: github.com/name/repo
```

Update the configuration:

```bash
hugo mod get -u
```

## Module Storage

Since Hugo uses Go dependencies, use this command to see where the modules are actually stored:

```bash
go env GOMODCACHE
```

To vendor the dependencies into your own repository:

```bash
hugo mod vendor
```

This will create a `vendor` folder containing the project's dependencies.

## Usage

If you are using modules for a theme, you just need to create a local file with the same name. Modifying local files will override the files from the imported theme.

## References

<https://gohugo.io/hugo-modules/use-modules/>