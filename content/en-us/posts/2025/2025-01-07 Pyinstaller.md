---
slug: 213
title: 'Python PyInstaller Packaging'
# draft: true
author: yexca
date: '2025-01-07T17:26:09+09:00'
categories:
    - Tech Learning
tags:
    - Python
    - Programming Basics
    - Programming Language
---

{{< notice >}} This article was translated by gemini-2.5-flash {{< /notice >}}

PyInstaller packaging is system-dependent. On Windows, it creates an `.exe` executable; on Linux, it outputs an ELF binary. Cross-platform packaging isn't supported.

## Installation

Install via pip:

```bat
pip install pyinstaller
```

## Package as a Single File

Use the `--onefile` argument:

```bat
pyinstaller --onefile main.py
```

## Common Arguments

For packaging Windows applications, common arguments include:

* `--windowed`: Hides the console window (if you're implementing a GUI).
* `--icon=icon.ico`: Adds an icon to the application.
* `--hidden-import`: Explicitly specifies required dependencies (prevents automatic analysis from missing them).
* `--add-data`: Adds extra resource files to the package.
* `--debug`: Enables debug information.

## Package as Multiple Files

When packaging as multiple files, use the `--onedir` argument:

```bash
pyinstaller --onedir main.dy
```

Dependency files end up in the `_internal` folder, which isn't ideal.

Only PyInstaller versions 6.1.0 and above can use this argument:

```bat
pyinstaller --contents-directory . .\main.py
```

This way, dependencies and the entry point are in the same directory.

## Packaging Configuration Items

Suppose your project's configuration is at `project/conf/settings.json`.

If you want to include this file when packaging, first package it as multiple files:

```bash
pyinstaller --name my_program --contents-directory . .\main.py
```

This generates a `my_program.spec` file in your current directory. Modify the `data` in `a` to input the files you want to package as a tuple, like this:

```groovy
datas=[('conf/settings.json', 'conf/')],
```

Then, delete all files in the `dist/` folder and run the command (or don't delete, just confirm when prompted):

```bash
pyinstaller my_program.spec
```

## Project

Using this method, the software from <https://blog.yexca.net/archives/211> is now packaged into an executable! (Though error handling is still missing.)

## References

<https://www.cnblogs.com/yqbaowo/p/17863429.html>
