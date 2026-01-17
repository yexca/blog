---
slug: 63
title: 'Fedora 安裝 java8(Oracle JDK)'
date: '2022-09-02T17:37:51+08:00'
author: yexca
# layout: post
# permalink: /archives/63
views:
    - '752'
categories:
    - 技術學習
tags:
    - Fedora
    - Java
---

{{< notice >}} 本文由 gemini-2.5-flash 翻譯 {{< /notice >}}

## 前言

儘管 Fedora 系統本身就內建 Java 環境，不過是 OpenJDK。有時候還是會需要用到 Oracle 的 Java 環境。

## 下載

前往官網下載：[Java Downloads | Oracle](https://www.oracle.com/java/technologies/downloads/) (下載需要登入)

找到 *java8-Linux*，下載 *x64 Compressed Archive* (64位元的壓縮檔版本)

撰寫本文時，檔案名稱為 *jdk-8u341-linux-x64.tar.gz*

## 移至指定目錄

1. 首先建立一個 Java 的目錄，在 */usr/local* 中

```bash
sudo mkdir -p /usr/local/java
```

2. 將檔案複製到此目錄

假設下載的檔案在 *~/Downloads*，請進入下載目錄

```bash
cd Downloads
```

然後複製到上述目錄

```bash
sudo cp -r jdk-8u341-linux-x64.tar.gz /usr/local/java
```

## 解壓縮安裝檔

3. 切換到 Java 目錄

```bash
cd /usr/local/java
```

4. 解壓縮安裝檔

```bash
sudo tar xvzf jdk-8u341-linux-x64.tar.gz
```

## 設定 $PATH 環境變數

5. 在 */etc/profile* 檔案的結尾處加入以下內容

```bash
JAVA_HOME=/usr/local/java/jdk1.8.0_341
PATH=$PATH:$HOME/bin:$JAVA_HOME/bin
export JAVA_HOME
export PATH
```

## 更新可用的 Java 版本清單

6. 直接執行以下指令

```bash
sudo update-alternatives --install "/usr/bin/java" "java" "/usr/local/java/jdk1.8.0_341/bin/java" 1
```

```bash
sudo update-alternatives --install "/usr/bin/javac" "javac" "/usr/local/java/jdk1.8.0_341/bin/javac" 1
```

```bash
sudo update-alternatives --install "/usr/bin/javaws.itweb" "javaws.itweb" "/usr/local/java/jdk1.8.0_341/bin/javaws.itweb" 1
```

## 使設定檔生效

7. 首先重新載入系統全域的 PATH 檔案

```bash
source /etc/profile
```

8. 重新啟動系統

```bash
reboot
```

## 切換 Java 版本

您可以執行指令來查看 Java 版本

```bash
java -version
```

9. 使用以下指令切換

```bash
sudo alternatives --config java
```

目前使用的 Java 版本前方會有「+」符號，找到對應的版本，輸入數字選擇即可。

## 參考文章

[如何在 Fedora {OpenJDK 和 Oracle JDK} 上安裝 Java？](https://www.lsbin.com/9422.html)
