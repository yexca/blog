---
slug: 47
title: 原神自动签到 (Linux 服务器 Docker)
date: '2022-06-09T13:33:42+08:00'
author: yexca
# layout: post
# permalink: /archives/47
views:
    - '700'
categories:
    - 折腾经验
tags:
    - Docker
    - miHoYo
---

## 引言

由于腾讯云函数从六月开始收费，于是便弃用改在自己的服务器上搭建

既然六月收费为什么现在才写文章呢？因为~~可能还有三个月的免费试用~~我米游社的 Cookie 过期更换，故记录

## 工具&原教程

[原神签到小助手 每日福利不用愁 - 银弹博客](https://www.yindan.me/tutorial/genshin-impact-helper.html)

由于原文介绍了多种使用方法，自己的阅读体验不是太好，故写此文

## 腾讯云函数处理

请将腾讯云函数冻结已确保不会收取费用

当然，如果没什么其他需求可直接注销账号，但注销账号需要手持身份证照片，请注意

## 前提

服务器可以连接上米忽悠的服务器 <https://mihoyo.com>

可在 SSH 命令行窗口输入 `ping mihoyo.com` 测试是否可以连接

~~我的一个服务器就连接不上，只好换一个，唉~~

## Docker安装

可以直接使用一键脚本进行安装，实测 Debian10 和 CentOS7 正常安装 (请使用 root 账户)

安装命令如下：

```bash
curl -fsSL https://get.docker.com | bash -s docker --mirror Aliyun
```

也可以使用国内 daocloud 一键安装命令：

```bash
curl -sSL https://get.daocloud.io/docker | sh
```

## 脚本安装

使用以下命令即可

```bash
docker pull yindan/genshinhelper
```

### CentOS 错误

我使用 CentOS 安装时出现错误 `Can't Connect to Docker Daemon`

请确保使用 root 账户，然后输入以下命令

```bash
systemctl start docker
```

## 简易使用

### Cookie 获取

获取米游社Cookie请参考：[原神树脂查看/推送 – yexca'Blog](https://blog.yexca.net/archives/12)

**注意**：Cookie 应包含`account_id`和`cookie_token`两个字段

多账号在不同Cookie中间加`#`即可，例如`Cookie1#Cookie2#Cookie3`

### 简易配置

```bash
docker run -d --name=genshinhelper \
-e COOKIE_MIHOYOBBS="<COOKIE_MIHOYOBBS>" \
--restart always \
yindan/genshinhelper:latest
```

将自己的`Cookie`替换上述命令的`<COOKIE_MIHOYOBBS>`即可

### 重新配置/更新Cookie

重新配置好像需要卸载再重装，然后再进行配置

或者使用配置文件只需替换Cookie就可以了吧(没用过，~~Cookie有效期很长的~~)

### 常用命令

```bash
# 查看Docker所有的容器
docker ps -a

# 查看日志
docker logs -f genshinhelper --tail 100

# 重启
docker restart genshinhelper

# 更新
docker pull yindan/genshinhelper
docker rm -f genshinhelper
# 之后依据基本使用或高级使用重新部署

# 卸载
docker rm -f genshinhelper
docker image rm genshinhelper
```

## 高阶使用

可下载示例文件修改

> * Github: [config.json](https://gitlab.com/y1ndan/genshin-checkin-helper/-/raw/main/genshincheckinhelper/config/config.example.json)
> * Telegram: <https://t.me/genshinhelperupdates/5>

### 安装

假设配置文件位于服务器的 `/etc/genshin/config.json`，使用以下命令已映射配置

```bash
docker run -d --name=genshinhelper \
-v /etc/genshin:/app/genshincheckinhelper/config \
--restart always \
yindan/genshinhelper:latest
```

### 配置

配置文件可以只留下需要的参数，把非必须的参数删除，例如只需要`Cookie`

则配置文件除了保持完整也可以写成：

```json
{
  "COOKIE_MIHOYOBBS": "<COOKIE_MIHOYOBBS>",
}
```

### 配置文件新增

RANDOM_SLEEP_SECS_RANGE：随机延迟休眠秒数范围，单位：秒。设置成"0-0"为取消延迟。
CHECK_IN_TIME：每日签到时间。该时间和运行环境的时间有关，和时区无关。如果是docker，可以用TZ=Asia/Shanghai设置时区。
CHECK_RESIN_SECS：原神原粹树脂检测间隔时间，单位：秒。
COOKIE_RESIN_TIMER：需要开启原粹树脂检测账号的cookie。
SHOPTOKEN：微信积分商城的token，通过抓包获取。
ONEPUSH：推送配置。notifier为推送名字，params为所需参数。详见后文。

### OnePush 推送参数一览

推送名称 / notifier: bark  
参数大全 / params:  
{'required': ['key'], 'optional': ['title', 'content', 'sound', 'isarchive', 'icon', 'group', 'url', 'copy', 'autocopy']}

推送名称 / notifier: custom  
参数大全 / params:  
{'required': ['url'], 'optional': ['method', 'datatype', 'data']}

推送名称 / notifier: dingtalk  
参数大全 / params:  
{'required': ['token'], 'optional': ['title', 'content', 'secret', 'markdown']}

推送名称 / notifier: discord  
参数大全 / params:  
{'required': ['webhook'], 'optional': ['title', 'content', 'username', 'avatar_url', 'color']}

推送名称 / notifier: pushplus  
参数大全 / params:  
{'required': ['token', 'content'], 'optional': ['title', 'topic', 'markdown']}

推送名称 / notifier: qmsg  
参数大全 / params:  
{'required': ['key'], 'optional': ['title', 'content', 'mode', 'qq']}

推送名称 / notifier: serverchan  
参数大全 / params:  
{'required': ['sckey', 'title'], 'optional': ['content']}

推送名称 / notifier: serverchanturbo  
参数大全 / params:  
{'required': ['sctkey', 'title'], 'optional': ['content', 'channel', 'openid']}

推送名称 / notifier: telegram  
参数大全 / params:  
{'required': ['token', 'userid'], 'optional': ['title', 'content', 'api_url']}

推送名称 / notifier: wechatworkapp  
参数大全 / params:  
{'required': ['corpid', 'corpsecret', 'agentid'], 'optional': ['title', 'content', 'touser', 'markdown']}

推送名称 / notifier: wechatworkbot  
参数大全 / params:  
{'required': ['key'], 'optional': ['title', 'content', 'markdown']}

### 推送例子

```conf
telegram  
ONEPUSH={"notifier":"telegram","params":{"markdown":false,"token":"xxxx","userid":"xxx"}}

discord  
ONEPUSH={"notifier":"discord","params":{"markdown":true,"webhook":"https://discord.com/api/webhooks/xxxxxx"}}
```

docker 配置文件映射目录为：/etc/genshin:/app/genshincheckinhelper/config
