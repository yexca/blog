---
slug: 211
title: 'Pixiv Downloader'
# draft: true
author: yexca
date: '2025-01-03T20:05:44+09:00'
lastmod: '2025-05-18T16:20:33+09:00'
categories:
    - Development Practice
tags:
    - Pixiv
    - Python
    - PyQt6
---

{{< notice >}} This article was translated by gemini-3-flash-preview {{< /notice >}}

> 2025-05-18 Update  
> I wrote a SQLite version so you don't have to configure a database. Details: <https://blog.yexca.net/en/archives/248>

It took three days to whip up a usable version, though there's no error handling—~~if it crashes, just restart it.~~

Project Link: <https://github.com/yexca/PixivDownloader-MySQL>

## Introduction

This started with [Recording Downloaded Artist Works in a Database](https://blog.yexca.net/en/archives/94/). I had a database for tracking my downloaded works, but eventually, I realized I was doing repetitive manual labor. Repetitive tasks are exactly what computers are for. I recently felt like building an app and wasn't satisfied with this one: <https://github.com/yexca/yasumiProject>. Since I had some free time during the holidays, I started writing.

## Description

I managed to get it working, but there's no error handling or anything like that. It's "barely functional." Also, the code is a mess (it's my first time developing a relatively large GUI app)—messy enough that I don't even want to refactor it or add internationalization support.

During development, I suddenly realized that since I was writing a program anyway, I should have just used SQLite. Setting up a MySQL instance is a hassle. But since I already built it this way, I'm sticking with it.

Lastly, I thought about packaging it into an EXE, but because it uses a config file, packaging became a pain ~~(and at the start, Windows kept flagging the output as a virus)~~. I'm too lazy to mess with it further, so it stays as-is.

## UI

Background image: <https://www.pixiv.net/artworks/83273073>

- Home

![home](https://github.com/yexca/picx-images-hosting/raw/master/2025/01-PixivDownloader/home.4ckyo63bny.webp)

- Settings

![settings](https://github.com/yexca/picx-images-hosting/raw/master/2025/01-PixivDownloader/settings.5fknz20gje.webp)

## Configuration

Since this was developed based on my existing database, there is almost no customization. The SQL table schema is:

```sql
CREATE TABLE pic (
    ID varchar(99),
    # Unique Identifier
    name varchar(255),
    # Artist Nickname
    downloadedDate datetime,
    # Download/Update Time
    lastDownloadID varchar(255),
    # Latest Work ID
    platform varchar(50),
    # Platform
    url varchar(255),
    # Link
    PRIMARY KEY(ID)
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

The API requires authentication and doesn't support logging in via username/password. Follow <https://gist.github.com/ZipFile/c9ebedb224406f4f11845ab700124362> to get an Auth Token.

I didn't upload the background image to the Git repo. The path is `app\resources\images\background.png`.

You need Python installed. Install dependencies with:

```bash
pip install -r requirements.txt
```

## Usage

Run the program:

```bash
python main.py
```

Complete the configuration in the Pixiv Auth and Settings tabs, then return to the Home page.

Enter an Artist ID **or** a specific Work ID, and it will automatically crawl all works by that artist.

## Conclusion

I honestly don't think I'll even use this myself, but it counts as a small step in my development journey.

![yexca-211](https://count.getloli.com/@yexca-211)
