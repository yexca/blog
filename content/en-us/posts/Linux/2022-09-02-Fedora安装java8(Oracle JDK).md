---
slug: 63
title: 'Installing Java 8 (Oracle JDK) on Fedora'
date: '2022-09-02T17:37:51+08:00'
author: yexca
# layout: post
# permalink: /archives/63
views:
    - '752'
categories:
    - Tech Learning
tags:
    - Fedora
    - Java
---

{{< notice >}} This article was translated by gemini-2.5-flash {{< /notice >}}

## Intro

Fedora comes with Java, but it's OpenJDK. Sometimes, you just need Oracle's version.

## Download

Head to the official site to download: [Java Downloads | Oracle](https://www.oracle.com/java/technologies/downloads/) (Requires login to download)

Find *java8-Linux*, then grab the *x64 Compressed Archive* (that's the 64-bit compressed package).

As of writing, the file was named *jdk-8u341-linux-x64.tar.gz*.

## Move to Directory

1. First, create a Java directory under */usr/local*.

```bash
sudo mkdir -p /usr/local/java
```

2. Copy the file there.

Assuming your download is in *~/Downloads*, navigate to it.

```bash
cd Downloads
```

Then copy it to the directory we just made.

```bash
sudo cp -r jdk-8u341-linux-x64.tar.gz /usr/local/java
```

## Extract the Archive

3. Switch to the Java directory.

```bash
cd /usr/local/java
```

4. Extract the installation file.

```bash
sudo tar xvzf jdk-8u341-linux-x64.tar.gz
```

## Configure $PATH

5. Add these lines to the end of */etc/profile*.

```bash
JAVA_HOME=/usr/local/java/jdk1.8.0_341
PATH=$PATH:$HOME/bin:$JAVA_HOME/bin
export JAVA_HOME
export PATH
```

## Update Available Java Versions

6. Run these commands directly.

```bash
sudo update-alternatives --install "/usr/bin/java" "java" "/usr/local/java/jdk1.8.0_341/bin/java" 1
```

```bash
sudo update-alternatives --install "/usr/bin/javac" "javac" "/usr/local/java/jdk1.8.0_341/bin/javac" 1
```

```bash
sudo update-alternatives --install "/usr/bin/javaws.itweb" "javaws.itweb" "/usr/local/java/jdk1.8.0_341/bin/javaws.itweb" 1
```

## Apply Configuration

7. First, reload the system-wide PATH file.

```bash
source /etc/profile
```

8. Reboot your system.

```bash
reboot
```

## Switch Java Version

You can check the current Java version by running:

```bash
java -version
```

9. Use the following command to switch:

```bash
sudo alternatives --config java
```

The currently active Java version will have a `+` next to it. Find your desired version and type its number to select.

## References

[How to Install Java on Fedora {OpenJDK and Oracle JDK}](https://www.lsbin.com/9422.html)
