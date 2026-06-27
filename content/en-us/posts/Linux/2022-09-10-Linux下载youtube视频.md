---
slug: 68
title: Downloading YouTube Videos on Linux
date: '2022-09-10T19:29:58+08:00'
author: yexca
# layout: post
# permalink: /archives/68
views:
    - '330'
categories:
    - Tinkering Notes
tags:
    - YouTube
---

{{< notice >}} This article was translated by gemini-3-flash-preview {{< /notice >}}

## Introduction

Since we've already covered the Windows command line, we can't skip Linux.

Windows article: [Downloading YouTube videos via Command Line](http://blog.yexca.net/en/archives/52)

## Download yt-dlp

I recommend setting up a Python environment first, then heading to [Releases · yt-dlp/yt-dlp · GitHub](https://github.com/yt-dlp/yt-dlp/releases) to download *yt-dlp*. If you don't want to deal with Python, just download the *yt-dlp_linux* binary.

After downloading, grant it execution permissions and move it to `/usr/local/bin/`.

## Download ffmpeg

Refer to the official site: [Download FFmpeg](https://ffmpeg.org/download.html#build-linux)

On Fedora, use the following command:

```bash
sudo dnf install ffmpeg
```

## Configuration File

Switch to the configuration directory:

```bash
cd ~/.config
```

Create the folder and enter it:

```bash
mkdir yt-dlp
cd yt-dlp
```

Create the configuration file:

```bash
vi config
```

Here is my configuration:

```bash
-f bv+ba/b -o ~/Videos/%(uploader)s/%(upload_date)s%(title)s%(id)s.%(ext)s --continue --merge-output-format mp4
```

Breakdown:

```bash
-f bv+ba/b # Best video + best audio / best quality

-o # Output folder configuration
/%(uploader)s/ # Create folder based on channel name
%(upload_date)s # Upload date
%(title)s # Video title
%(id)s # Video ID
.%(ext)s # File extension

--continue # Resume partial downloads

--merge-output-format mp4 # Merge into mp4 format
```

## References

[Batch converting video formats with ffmpeg](http://blog.yexca.net/en/archives/65) (Wait, do I really need to link my own article?)
