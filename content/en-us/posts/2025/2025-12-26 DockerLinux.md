---
slug: 262
title: 'Building Temporary Interactive Linux Environments with Docker'
# draft: true
author: yexca
date: '2025-12-26T18:43:04+09:00'
categories:
    - Development Practice
tags:
    - Docker
    - Linux
---

{{< notice >}} This article was translated by gemini-3-flash-preview {{< /notice >}}

Running a bash script on Windows is a pain. Even on Linux, running a script tailored for a different distribution can be a hassle. Docker solves this while keeping your host system clean.

This post uses Alpine as an example to show how to set up an interactive environment to process files in your current directory.

## How it works

The core idea is mounting your current directory into a container. Here is the command template:

```bash
docker run --rm -it -v "$(pwd)":/data -w /data alpine sh
```

The parameters are as follows:

| Parameter | Meaning |
| ---- | -------------------------------------------------- |
| --rm | Remove the container after exiting |
| -it  | Combination of interactive and tty; allows interaction and output |
| -v   | Path mapping; maps the current directory to /data in the container |
| -w   | Sets the working directory, so you start inside /data |
| sh   | The command to run (in this case, the shell) |

If you only want to run a single command without staying in an interactive shell, just append the command at the end:

```bash
docker run --rm -v "$(pwd)":/data -w /data alpine ls -la
```

## Windows

The commands differ between PowerShell and CMD due to how they handle environment variables. Here is how to open an interactive Alpine shell:

- **PowerShell**

```bash
docker run --rm -it -v ${PWD}:/data -w /data alpine sh
```

- **CMD**

```bash
docker run --rm -it -v %cd%:/data -w /data alpine sh
```

## Linux

On Linux, containers run as root by default. To prevent files generated inside the container from being owned by root on your host, it's best to map your current user's UID and GID:

```bash
docker run --rm -it -u $(id -u):$(id -g) -v "$(pwd)":/data -w /data alpine sh
```

## MacOS

No special permission handling is usually required. Use the same variables as Linux:

```bash
docker run --rm -it -v "$(pwd)":/data -w /data alpine sh
```

## Notes - Alpine

Since Alpine is extremely minimal, you might need to install common utilities yourself. Use the `apk add` command to install what you need.
