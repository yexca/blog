---
slug: 257
title: '2025 新伺服器部署紀錄'
# draft: true
author: yexca
date: '2025-10-03T10:22:25+09:00'
lastmod: '2025-10-05T02:18:25+09:00'
categories:
    - 折騰經驗
tags:
    - 配置紀錄
    - Docker
---

{{< notice >}} 本文由 gemini-2.5-flash 翻譯 {{< /notice >}}

## 引言

正好伺服器快到期，去年雖然續約了一年，但今年看到各種優惠突然覺得續約有點小貴，在看了許多小型伺服器廠商後，看到阿里巴巴雲有 12 個月內無帳單則可享有優惠，那既然都看到大廠了，順勢就想到了 Oracle

那就試試看吧，全套真實資料，居然直接就申請成功了，可喜可賀

不過突然又想到[上次折騰伺服器](/zh-tw/archives/131/)還是 2023 年啊，一晃兩年過去了，時間過得真快啊

## Oracle Linux

建立映像檔的時候發現沒有我喜歡用的 Debian，那就試著看看這個 Oracle Linux，結果這玩意兒啊，首先預裝 MySQL 就算了 (習慣用 Docker 多少有點主機潔癖 XD)，佔用還好大，對免費的 1C1G 來說直接卡住了，只好換其他映像檔了

{{< details "Oracle Linux 使用紀錄" >}}

首先升級，看到 `dnf` 指令還讓我想起之前使用 Fedora 的日子啊

```bash
sudo dnf update -y
```

然後發現升級列表有 MySQL，伺服器卡死了，準備解除安裝，先查看 MySQL 服務是否正在執行

```bash
sudo systemctl status mysqld
```

服務正在執行，先停止服務

```bash
sudo systemctl stop mysqld
```

禁止開機自啟

```bash
sudo systemctl disable mysqld
```

解除安裝

```bash
sudo dnf remove mysql`server
```

然後我升級軟體還是卡住，安裝 Docker 可參考: <https://oracle-base.com/articles/linux/docker-install-docker-on-oracle-linux-ol8>

{{< /details >}}

## CentOS7 更新軟體

首先更換軟體源，Oracle 的 CentOS7 居然軟體列表是錯誤的，執行 `sudo yum update` 會報錯

```markdown
Could not retrieve mirrorlist http://mirrorlist.centos.org/?release=7&arch=x86_64&repo=os&infra=stock error was
14: curl#6 - "Could not resolve host: mirrorlist.centos.org; Unknown error"
```

更新軟體列表

```bash
sed -i 's/mirror\.centos\.org/vault.centos.org/g' /etc/yum.repos.d/CentOS-*.repo
sed -i 's/^#.*baseurl=http/baseurl=http/g' /etc/yum.repos.d/CentOS-*.repo
sed -i 's/^mirrorlist=http/#mirrorlist=http/g' /etc/yum.repos.d/CentOS-*.repo
```

然後更新軟體

```bash
sudo yum update
```

---

參考文章: [mirrorlist.centos.org no longer resolve?](https://serverfault.com/questions/1161816/mirrorlist-centos-org-no-longer-resolve)

---

## 安裝 Docker

安裝工具

```bash
sudo yum install -y yum-utils
```

設定官方軟體源

```bash
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
```

安裝

```bash
sudo yum install docker-ce docker-ce-cli docker-compose containerd.io
```

啟動

```bash
sudo systemctl start docker
```

設定開機自啟

```bash
sudo systemctl enable docker
```

---

參考文章:[CentOS7 安裝 docker (參考官方文件)](https://www.cnblogs.com/lambdadog/p/18323721)

---

## 伺服器連接埠管理

開放常用連接埠 80 與 443，首先查看防火牆狀態

```bash
sudo systemctl status firewalld
```

輸出是 `Active: active (running)` 代表正在執行，查看目前開放的連接埠 (永久開放)

```bash
sudo firewalld-cmd --list-all --permanent
```

新增開放連接埠

```bash
sudo firewall-cmd --zone=public --add-port=8080/tcp --permanent
```

重新載入以生效

```bash
sudo firewall-cmd --reload
```

如果需要移除規則

```bash
sudo firewall-cmd --zone=public --remove-port=8080/tcp --permanent
```

## 安全群組放行連接埠

伺服器放行是伺服器系統方面允許存取，但是還需要安全群組放行入站連接埠

在 Instances - Networking - Subnet，管理這個實例的子網路

在其 Security 裡管理具體的安全群組列表

在其 Security rules 新增 Ingress Rules

其中 Source Type 使用 `CIDR`，Source CIDR 填入 `0.0.0.0/0`，IP Protocol 使用 `TCP`， Destination Port Range 填入 `80, 443`，Description 可選填入 `HTTP/S`

然後 Add Ingress Rules 即可

## 安裝 Nginx-UI

雖然之前的文章 [伺服器用 Docker 部署紀錄](/zh-tw/archives/102/) 提到了具體使用方式，但是隨著更新有了新功能

為了支援其他容器控制 Nginx 和方便更新，需要映射新目錄，所以 `docker-compose.yml` 變成了

```yaml
version: '3.1' 
services: 
  nginx-ui:
    restart: always
    image: uozi/nginx-ui:latest
    container_name: nginx_UI
    volumes:
      - /root/nginx/nginx:/etc/nginx
      - /root/nginx/nginx-ui:/etc/nginx-ui
      - /root/nginx/www:/www
      - /var/run/docker.sock:/var/run/docker.sock
    ports:
      - 80:80
      - 443:443
```

這裡映射 `/var/run/docker.sock` 的原因，Nginx-UI 解釋為：

> Nginx UI 官方映像檔使用 /var/run/docker.sock 透過 Docker Client API 與主機 Docker Engine 通訊。此功能用於在另一個容器中控制 Nginx，並在 Nginx UI 的 OTA 升級期間執行容器替換而非二進位替換，以確保容器相依性也得到升級。如果您不需要此功能，請向容器新增環境變數 (environment) NGINX_UI_IGNORE_DOCKER_SOCKET=true

## 其他服務

其他使用的東西似乎都可以直接繼續使用即可，這次移轉感覺速度好快，幾乎是在伺服器配置上花費了較多時間
