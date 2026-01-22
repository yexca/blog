---
slug: 257
title: '2025 New Server Deployment Log'
# draft: true
author: yexca
date: '2025-10-03T10:22:25+09:00'
lastmod: '2025-10-05T02:18:25+09:00'
categories:
    - Tinkering Experience
tags:
    - Configuration Log
    - Docker
---

{{< notice >}} This article was translated by gemini-2.5-flash {{< /notice >}}

## Intro

My server's almost up. Renewed it last year, but this year, with all the deals popping up, renewing felt a bit pricey. After checking out some smaller server providers, I saw Alibaba Cloud offers discounts if you've been bill-free for 12 months. Since I was already looking at big names, Oracle popped into my head.

Figured I'd give it a shot. Used all my real info, and it actually got approved directly. Sweet!

But then it hit me: the [last time I tinkered with a server](/en/archives/131/) was back in 2023. Two years zipped by just like that. Time flies, huh?

## Oracle Linux

When creating the image, I found my preferred Debian wasn't an option, so I decided to try Oracle Linux. Turns out, this thing comes with MySQL pre-installed (I'm a bit of a host minimalist with Docker, lol). Not only that, it takes up a ton of resources. For a free 1C1G instance, it just lagged out. Had to switch images.

{{< details "Oracle Linux Usage Log" >}}

First, an upgrade. Seeing the `dnf` command actually reminded me of my Fedora days.

```bash
sudo dnf update -y
```

Then I spotted MySQL in the upgrade list. Server was bogged down, so I planned to uninstall it. First, check MySQL service status.

```bash
sudo systemctl status mysqld
```

Service is running, so stop it first.

```bash
sudo systemctl stop mysqld
```

Disable autostart on boot.

```bash
sudo systemctl disable mysqld
```

Uninstall.

```bash
sudo dnf remove mysql`server
```

Even after that, software upgrades were still slow. For Docker installation, refer to: <https://oracle-base.com/articles/linux/docker-install-docker-on-oracle-linux-ol8>

{{< /details >}}

## CentOS7 Software Update

First, change the repos. Oracle's CentOS7 actually had a broken software list. Running `sudo yum update` threw an error:

```markdown
Could not retrieve mirrorlist http://mirrorlist.centos.org/?release=7&arch=x86_64&repo=os&infra=stock error was
14: curl#6 - "Could not resolve host: mirrorlist.centos.org; Unknown error"
```

Update the software list.

```bash
sed -i 's/mirror\.centos\.org/vault.centos.org/g' /etc/yum.repos.d/CentOS-*.repo
sed -i 's/^#.*baseurl=http/baseurl=http/g' /etc/yum.repos.d/CentOS-*.repo
sed -i 's/^mirrorlist=http/#mirrorlist=http/g' /etc/yum.repos.d/CentOS-*.repo
```

Then, update the software.

```bash
sudo yum update
```

---

Reference: [mirrorlist.centos.org no longer resolve?](https://serverfault.com/questions/1161816/mirrorlist-centos-org-no-longer-resolve)

---

## Install Docker

Install tools.

```bash
sudo yum install -y yum-utils
```

Configure official repo.

```bash
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
```

Install.

```bash
sudo yum install docker-ce docker-ce-cli docker-compose containerd.io
```

Start.

```bash
sudo systemctl start docker
```

Set to autostart on boot.

```bash
sudo systemctl enable docker
```

---

Reference: [Install Docker on CentOS7 (refer to official docs)](https://www.cnblogs.com/lambdadog/p/18323721)

---

## Server Port Management

Open common ports 80 and 443. First, check firewall status.

```bash
sudo systemctl status firewalld
```

Output `Active: active (running)` means it's running. Check currently open ports (permanently open).

```bash
sudo firewalld-cmd --list-all --permanent
```

Add open port.

```bash
sudo firewall-cmd --zone=public --add-port=8080/tcp --permanent
```

Reload to take effect.

```bash
sudo firewall-cmd --reload
```

To remove a rule:

```bash
sudo firewall-cmd --zone=public --remove-port=8080/tcp --permanent
```

## Security Group Port Whitelisting

Server-side port configuration handles system access, but you also need to whitelist inbound ports in the security group.

Navigate to Instances - Networking - Subnet to manage the instance's Subnet.

Manage specific security group lists under its Security tab.

Add Ingress Rules under its Security rules.

For Source Type, use `CIDR`. Enter `0.0.0.0/0` for Source CIDR. Use `TCP` for IP Protocol. Enter `80, 443` for Destination Port Range. Description is optional, enter `HTTP/S`.

Then just 'Add Ingress Rules'.

## Install Nginx-UI

While my previous article, [Server Deployment Log with Docker](/en/archives/102/), covered its specific use, new features have emerged with updates.

To allow other containers to control Nginx and for easier updates, new directories need to be mapped. So the `docker-compose.yml` now looks like this:

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

The reason for mapping `/var/run/docker.sock`, as explained by Nginx-UI:

> Nginx UI's official image uses `/var/run/docker.sock` to communicate with the host Docker Engine via the Docker Client API. This feature is used to control Nginx in another container and to perform container replacement rather than binary replacement during Nginx UI's OTA upgrade, ensuring container dependencies are also upgraded. If you don't need this feature, add the environment variable `NGINX_UI_IGNORE_DOCKER_SOCKET=true` to the container.

## Other Services

Looks like everything else I use can just continue as is. This migration felt super fast; most of the time was spent on server configuration itself.
