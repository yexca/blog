---
slug: 258
title: 'Tinkering with Manga and Audio Websites'
# draft: true
author: yexca
date: '2025-10-05T01:58:35+09:00'
categories:
    - Tinkering Notes
tags:
    - Config Log
    - Docker
---

{{< notice >}} This article was translated by gemini-2.5-flash {{< /notice >}}

## Introduction

Google's Gemini Pro subscription comes with 2TiB of space, which naturally got me thinking about tinkering again. So, let's get to it.

But looking back, it's already been three years since [my last tinkering](/en/archives/73). Time really flies, huh?

## Manga: Komga

First up is Komga for reading manga. While scanning can be a bit sluggish, the overall user experience is decent.

After all these years, Komga has seen many updates. [My previous article](/en/archives/71) is no longer reusable. Using docker-compose makes things more portable. Here's the `docker-compose.yml`:

```yaml
version: '3.0'
services:
  komga:
    image: gotson/komga:1.23.4
    container_name: komga
    volumes:
      - type: bind
        source: /home/komga/config
        target: /config
      - type: bind
        source: /home/rclone/data
        target: /data
    ports:
      - 25600:25600
    restart: unless-stopped
```

Also, having a [dedicated iOS app Komic](https://pruizlezcano.github.io/komic/) is super convenient.

## rclone Mounts Google Drive

Similar to [Microsoft OneDrive](/en/archives/105), you first need to authenticate in a browser on a Windows machine to get a token.

The process is to download rclone, then run the command:

```bash
rclone config
```

After naming, select `Google Drive` (22), grant `Full access all files, excluding Application Data Folder` permission, then hit enter for the browser login to pop up. Once done, exit.

Initially, I wasn't entirely sure, so I applied for a software ID and Secret. It doesn't seem to be used here, but I'll keep a record in case it's useful later.

{{< details "Applying for Google API ID and Secret" >}}

Open the Google API Services website: <https://console.developers.google.com/>

Select `Enable APIs and services`, search for and enable `Google Drive API`.

In the `Manage` section of Google Drive API, `Create credentials`.

For API type, choose `User data`, which includes `OAuth` as described.

In OAuth Client ID, select `Web application` as the type. You can enter `rclone` for the name. After completion, a `Client ID` will appear.

Then complete the creation. In Credentials, select the `rclone` app you just created and copy the `Client secrets`.

{{< /details >}}

Next, copy the config file to the server. The local directory is:

```markdown
C:\Users\%USERNAME%\AppData\Roaming\rclone
```

On the server, download fuse. My server is CentOS7, so I downloaded these:

```bash
sudo yum install -y fuse fuse3 fuse-libs
```

Newer systems can just download fuse3. Then mount it with Docker:

```bash
sudo docker run --rm \
    --volume /home/opc/rclone/config:/config/rclone \
    --volume /home/opc/rclone/data:/data:shared \
    --volume /etc/passwd:/etc/passwd:ro --volume /etc/group:/etc/group:ro \
    --device /dev/fuse --cap-add SYS_ADMIN --security-opt apparmor:unconfined \
    rclone/rclone \
    mount GoogleDrive:/ /data \
    --no-checksum \
    --use-server-modtime \
    --no-gzip-encoding \
    --no-update-modtime \
    --no-seek \
    --modify-window 2m \
    --allow-other \
    --allow-non-empty \
    --dir-cache-time 30m \
    --cache-read-retries 15 \
    --cache-db-purge \
    --timeout 30m \
    --vfs-cache-mode full \
    --vfs-read-chunk-size 2M \
    --vfs-read-chunk-size-limit 5M \
    --vfs-cache-max-age 30m \
    --attr-timeout 20s \
    --poll-interval 9m \
    --vfs-cache-poll-interval 10m&
```

The long list of configurations afterwards refers to [Komga's official documentation](https://komga.org/docs/installation/gdrive). Their specific meanings are:

| Parameter                      | Purpose                              | Explanation                                                                                                 |
| :----------------------------- | :----------------------------------- | :---------------------------------------------------------------------------------------------------------- |
| `--no-checksum`                | Skip checksums                       | Reduces API calls and speeds up directory loading. Suitable for large files like videos.                    |
| `--use-server-modtime`         | Use server's file modification time  | Prevents duplicate uploads/syncs due to local vs. remote time differences.                                  |
| `--no-gzip-encoding`           | Disable GZIP encoding                | Some cloud services (like Drive) perform poorly with compressed responses; this reduces CPU usage.          |
| `--no-update-modtime`          | Do not update file modification time | Prevents Drive from triggering version updates due to time changes for read-only purposes.                  |
| `--no-seek`                    | Disable random seeking               | Reduces support for video seeking, but improves stability for sequential reads. Suitable for continuous playback. |
| `--modify-window 2m`           | File modification time error tolerance window | Prevents misidentification due to local/remote time differences.                                            |
| `--allow-other`                | Allow other system users to access mounted content | Requires explicit permission in `/etc/fuse.conf`.                                                           |
| `--allow-non-empty`            | Mount non-empty directories          | Allows mounting even if the mount point is not empty.                                                       |
| `--dir-cache-time 30m`         | Directory cache time                 | Reduces frequent requests to cloud API, default is moderate.                                                |
| `--cache-read-retries 15`      | Number of retries on cache read failure | Improves stability.                                                                                         |
| `--cache-db-purge`             | Purge cache database on each startup | Prevents errors from corrupted old caches. Suitable for environments where mounts are frequently stopped/started. |
| `--timeout 30m`                | Single transfer timeout limit        | Prevents disconnections when reading long videos or large files.                                             |
| `--vfs-cache-mode full`        | Full VFS cache mode                  | Both reads and writes go through local cache. Most balanced and secure performance.                         |
| `--vfs-read-chunk-size 2M`     | Chunk size for each download         | Smaller saves bandwidth but is more frequent. This config is suitable for low-bandwidth environments.       |
| `--vfs-read-chunk-size-limit 5M` | Maximum chunk size limit           | Limits growth to prevent timeouts from excessively large requests.                                          |
| `--vfs-cache-max-age 30m`      | Maximum cache file age               | Relatively short duration, good for saving space.                                                           |
| `--attr-timeout 20s`           | File attribute cache time            | Prevents frequent `stat()` calls; 20s is a compromise.                                                      |
| `--poll-interval 9m`           | Cloud change polling interval        | Checks for changes every 9 minutes, reducing Google API load.                                               |
| `--vfs-cache-poll-interval 10m` | Local cache cleanup interval       | Cleans up expired cache every 10 minutes.                                                                   |

## Using Alpine Linux

Due to high resource usage, I thought of using the extremely lightweight Alpine Linux.

### Docker Installation

First, update packages:

```bash
doas apk update
```

Install Docker:

```bash
doas apk add docker docker-cli-compose
```

Configure startup on boot:

```bash
rc-update add docker default
```

Start Docker. This might take a moment:

```bash
doas service docker start
```

Add yourself to the Docker user group:

```bash
doas addgroup ${USER} docker
```

---

Reference articles:

<https://wiki.alpinelinux.org/wiki/Docker>

---

### Swap Creation

First, add swap space:

```bash
doas fallocate -l 8G /swapfile
```

Set permissions for root access only:

```bash
doas chmod 600 /swapfile
```

Format swap:

```bash
doas mkswap /swapfile
```

Enable swap:

```bash
doas swapon /swapfile
```

Then you can check if it's active:

```bash
free -h
```

### rclone Configuration

Being extremely lightweight, it requires some additional configuration.

First, install fuse:

```bash
doas apk add fuse
```

Load fuse module:

```bash
doas modprobe fuse
```

Then you need to change the root directory to a shared type:

```bash
doas mount --make-rshared /
```

After that, it's similar to CentOS7.

---

Reference articles:

- [How to Install Rclone on Alpine Linux Latest](https://ipv6.rs/tutorial/Alpine_Linux_Latest/rclone/)

- [Alpine Linux Wiki Rclone](https://wiki.alpinelinux.org/wiki/Rclone)

---

## Kikoeru

I hit a few dead ends at first and ultimately failed, so I'll just log it here.

{{< details "An Afternoon of Failure TT" >}}

I followed forks of the classic kikoeru project to find the latest commit. While I did find [XunJiJiang/kikoeru-express](https://github.com/XunJiJiang/kikoeru-express), I spent an entire afternoon trying to build the image, from Node.js 12 all the way to 16. I encountered various errors, tried different mirror sources, etc. Then I tried deploying it standalone, which also failed. Even attempting to build it without Docker failed. In the end, I really gave up and decided to stick with the classic 0.6.2.

Ugh, seriously. It recommended Node.js versions 12-14, but during actual build, at some step, it hinted at features from Node.js 16+. If I directly used 14+, `npm i` would error out. So I had to use version 13 to install dependencies first, then copy them over and build with version 16. Who knew this would take an entire afternoon? Honestly though, it did teach me to skillfully switch Node.js versions, haha.

I opened an iOS app I had downloaded previously, tried connecting, and it showed an error. Checking the update log, it said to use version 0.6.14 or higher. I was shocked! Then I quickly searched and found [Number178/kikoeru-express](https://github.com/Number178/kikoeru-express), which I had already starred 😂.

{{< /details >}}

Now using the updated [Number178/kikoeru-express](https://github.com/Number178/kikoeru-express). The author also developed an iOS app, which is super convenient.

Configuration:

```yaml
version: '3.0'
services:
    kikoeru:
        ports:
            - '8011:8888'
        container_name: kikoeru
        volumes:
            - type: bind
              source: /home/rclone/data/asmr
              target: /usr/src/kikoeru/VoiceWork
            - /home/kikoeru/sqlite:/usr/src/kikoeru/sqlite
            - /home/kikoeru/covers:/usr/src/kikoeru/covers
            - /home/kikoeru/config:/usr/src/kikoeru/config
        image: 'number17/kikoeru:v0.6.14-20250914'
        restart: always
```

Also, the tag language cannot be switched; it defaults to Simplified Chinese. If you need Japanese, you'll have to switch it *before* scanning.
