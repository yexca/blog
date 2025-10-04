---
slug: 257
title: '2025 新服务器部署记录'
# draft: true
author: yexca
date: '2025-10-03T10:22:25+09:00'
lastmod: '2025-10-05T02:18:25+09:00'
categories:
    - 折腾经验
tags:
    - 配置记录
    - Docker
---

## 引言

恰逢服务器快过期，去年虽然续费了一年，但今年看到各种优惠突然觉得续费有点小贵，在看了许多小服务器厂商后，看到阿里云有 12 个月内无账单则可享受优惠，那既然都看到大厂了，顺势就想到了 Oracle

那就试试吧，全套真实资料，居然直接就申请成功了，可喜可贺

不过突然又想到[上次折腾服务器](/archives/131/)还是 2023 年啊，一晃两年过去了，时间过得真快啊

## Oracle Linux

创建镜像的时候发现没我喜欢用的 Debian，那就试着看看这个 Oracle Linux，结果这玩意吧，首先预装 MySQL 就算了 (习惯用 Docker 多少有点主机洁癖 XD)，占用还好大，对免费的 1C1G 来说直接卡了，只好换其他镜像了

{{< details "Oracle Linux 使用记录" >}}

首先升级，看到 `dnf` 命令还让我想起来之前使用 Fedora 的日子啊

```bash
sudo dnf update -y
```

然后发现升级列表有 MySQL，服务器卡死了，准备卸载，先查看 MySQL 服务是否运行

```bash
sudo systemctl status mysqld
```

服务在运行，先停止服务

```bash
sudo systemctl stop mysqld
```

禁止开机自启

```bash
sudo systemctl disable mysqld
```

卸载

```bash
sudo dnf remove mysql`server
```

然后我升级软件还是卡，安装 Docker 可参考: <https://oracle-base.com/articles/linux/docker-install-docker-on-oracle-linux-ol8>

{{< /details >}}

## CentOS7 更新软件

首先更换源，Oracle 的 CentOS7 居然软件列表是错的，运行 `sudo yum update` 会报错

```markdown
Could not retrieve mirrorlist http://mirrorlist.centos.org/?release=7&arch=x86_64&repo=os&infra=stock error was
14: curl#6 - "Could not resolve host: mirrorlist.centos.org; Unknown error"
```

更新软件列表

```bash
sed -i 's/mirror\.centos\.org/vault.centos.org/g' /etc/yum.repos.d/CentOS-*.repo
sed -i 's/^#.*baseurl=http/baseurl=http/g' /etc/yum.repos.d/CentOS-*.repo
sed -i 's/^mirrorlist=http/#mirrorlist=http/g' /etc/yum.repos.d/CentOS-*.repo
```

然后更新软件

```bash
sudo yum update
```

---

参考文章: [mirrorlist.centos.org no longer resolve?](https://serverfault.com/questions/1161816/mirrorlist-centos-org-no-longer-resolve)

---

## 安装 Docker

安装工具

```bash
sudo yum install -y yum-utils
```

配置官方源

```bash
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
```

安装

```bash
sudo yum install docker-ce docker-ce-cli docker-compose containerd.io
```

启动

```bash
sudo systemctl start docker
```

设置开机自启

```bash
sudo systemctl enable docker
```

---

参考文章:[CentOS7 安装 docker (参考官方文档)](https://www.cnblogs.com/lambdadog/p/18323721)

---

## 服务器端口管理

开放常用端口 80 与 443，首先查看防火墙状态

```bash
sudo systemctl status firewalld
```

输出是 `Active: active (running)` 代表正在运行，查看当前开放的端口 (永久开放)

```bash
sudo firewalld-cmd --list-all --permanent
```

添加开放端口

```bash
sudo firewall-cmd --zone=public --add-port=8080/tcp --permanent
```

重载以生效

```bash
sudo firewall-cmd --reload
```

如果需要移除规则

```bash
sudo firewall-cmd --zone=public --remove-port=8080/tcp --permanent
```

## 安全组放行端口

服务器放行是服务器系统方面运行访问，但是还需要安全组放行入站端口

在 Instances - Networking - Subnet，管理这个实例的 Subnet

在其 Security 里管理具体的安全组列表

在其 Security rules 添加 Ingress Rules

其中 Source Type 使用 `CIDR`，Source CIDR 填入 `0.0.0.0/0`，IP Protocol 使用 `TCP`， Destination Port Range 填入 `80, 443`，Description 可选填入 `HTTP/S`

然后 Add Ingress Rules 即可

## 安装 Nginx-UI

虽然之前的文章 [服务器用 Docker 部署记录](/archives/102/) 提到了具体使用，但是随着更新有了新特性

为了支持其他容器控制 Nginx 和更新方便，需要映射新目录，所以 `docker-compose.yml` 变成了

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

这里映射 `/var/run/docker.sock` 的原因，Nginx-UI 解释为:

> Nginx UI 官方镜像使用 /var/run/docker.sock 通过 Docker Client API 与主机 Docker Engine 通信。此功能用于在另一个容器中控制 Nginx，并在 Nginx UI 的 OTA 升级期间执行容器替换而非二进制替换，以确保容器依赖项也得到升级。如果您不需要此功能，请向容器添加环境变量 (environment) NGINX_UI_IGNORE_DOCKER_SOCKET=true

## 其他服务

其他使用的东西貌似都可以直接继续使用即可，这次迁移感觉速度好快，几乎是在服务器配置上花费了较多时间
