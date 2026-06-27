---
slug: 248
title: 'Pixiv Downloader Refactor: From Haphazard Code to Understanding the Chaos'
# draft: true
author: yexca
date: '2025-05-18T16:20:33+09:00'
categories:
    - Development Practice
tags:
    - Pixiv
    - Python
    - PyQt6
---

{{< notice >}} This article was translated by gemini-2.5-flash {{< /notice >}}

Initially, I just planned to whip up a small utility, use it for a couple of days, then forget about it (like most of my past projects). But it ended up saving me a ton of time without a single bug, and the more I used it, the smoother it felt.

Slowly, it sparked that old thought: "Why not just use SQLite?" Seriously, spinning up a MySQL instance every time is a real pain. So, this version came to be, finally freeing me from firing up a database service every time. (And it's finally actually usable by humans, too.)

## Usage

Project Link: <https://github.com/yexca/PixivDownloader-SQLite>

The GUI is similar to the previous generation; check out <https://blog.yexca.net/en/archives/211/> for details.

### Configuration

Before use, you need to configure:

* `refresh token` (for Pixiv login authentication, refer to: [Pixiv OAuth Flow](https://gist.github.com/ZipFile/c9ebedb224406f4f11845ab700124362))
* Download path (default `D:\Downloads`)

### Download Instructions

After setup, simply input:

* Artist ID, or
* Artwork ID (if both are provided, only the Artist ID will be used)

Click 'Download' to fetch all works and log them to the database. For artists without existing records, all works will be downloaded. For artists with records, only un-downloaded works will be fetched.

### Error Handling

Regarding program errors, only basic crawling error handling is implemented. If an error dialog pops up, it might be due to:

* `refresh token` not configured or expired
* Artist account does not exist
* Artwork does not exist

I haven't provided specific error messages; if an error occurs, please check these three points.

For other errors (like the application crashing), please send me the latest file from `program_root/logs/app_*-*-*.log` and describe the issue.

Contact: `PixivDownloader#yexca.net` (replace @)

## New Feature: From MySQL to SQLite

The biggest change is no longer needing your own MySQL setup; it now uses lightweight SQLite.

I then removed unnecessary database configs and consolidated settings with the Pixiv auth token.

Added an icon (just had ChatGPT draw one for fun), tweaked some UI styles – nothing major.

The code got some initial architectural structuring, though it ended up messy again by the end. (But who knows, maybe I'll revisit it someday?)

## Migrating from Old MySQL Database

While I doubt anyone used the previous version, I still need to explain this. Due to database structure differences, the best way to migrate is to query, export, and directly import. Here's the query:

```sql
SELECT ID, name, downloadedDate, lastDownloadID, url
FROM pic
WHERE platform = 'pixiv';
```

Export the results in SQL INSERT format (I used Dataflare, which supports this).

Then, create a Python file and put in the following content:

```python
import sqlite3

conn = sqlite3.connect("pixiv.db")
cursor = conn.cursor()

cursor.execute('''
        Create Table If Not Exists pic (
               ID TEXT PRIMARY KEY,
               name TEXT,
               downloadedDate TEXT,
               lastDownloadID TEXT,
               url TEXT
               )
               ''')

conn.commit()

cursor.execute("""
INSERT INTO `pic` (`ID`, `name`, `downloadedDate`, `lastDownloadID`, `url`) VALUES
('123', 'name1', '2024-06-08 00:00:00', '1234', 'https://www.pixiv.net/users/123'),
('234', 'name2', '2025-02-12 00:05:36', '2345', 'https://www.pixiv.net/users/234'),
('345', 'name3', '2025-01-11 17:26:17', '3456', 'https://www.pixiv.net/users/345');
"""
)

conn.commit()

cursor.execute("""
Select * from pic
"""
)

rows = cursor.fetchall()
for row in rows:
    print(row)

conn.close()
```

Replace the content within `cursor.execute` with your database backup. I've left three example records here.

Then, place the generated `pixiv.db` file into `program_root/resources`.

## Some Dev Thoughts: From 'Messy Code' to 'Understanding the Chaos'

Honestly, when I started this dev cycle, I really wanted to refactor the previous messy code. But as I worked on it, I realized exactly why it got so messy in the first place 😂

If anything, this refactor ended up even messier. Halfway through, I just thought, "Forget refactoring, I'll just copy-paste it." That led to the current mix of camelCase and snake_case, and honestly, I'm too tired to touch it anymore, sigh.

It's pretty much a runnable, half-finished product, but hey, if it works, it works, right?~

![yexca-248](https://count.getloli.com/@yexca-248)
