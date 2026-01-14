---
slug: 47
title: 原神自動簽到 (Linux 伺服器 Docker)
date: '2022-06-09T13:33:42+08:00'
author: yexca
# layout: post
# permalink: /archives/47
views:
    - '700'
categories:
    - 實戰經驗
tags:
    - Docker
    - miHoYo
---

{{< notice >}} 本文由 Gemini-3-flash 翻譯 {{< /notice >}}

## 引言

由於騰訊雲函數從六月開始收費，於是便棄用改在自己的伺服器上架設

既然六月收費為什麼現在才寫文章呢？因為~~可能還有三個月的免費試用~~我米遊社的 Cookie 過期更換，故紀錄一下

## 工具 & 原教學

[原神簽到小助手 每日福利不用愁 - 銀彈博客](https://www.yindan.me/tutorial/genshin-impact-helper.html)

由於原文介紹了多種使用方法，自己的閱讀體驗不是太好，故寫此文

## 騰訊雲函數處理

請將騰訊雲函數凍結以確保不會產生費用

當然，如果沒什麼其他需求可直接註銷帳號，但註銷帳號需要手持身分證照片，請注意

## 前提

伺服器可以連接上米哈遊的伺服器 <https://mihoyo.com>

可在 SSH 命令列視窗輸入 `ping mihoyo.com` 測試是否可以連線

~~我的一個伺服器就連不上，只好換一個，唉~~

## Docker 安裝

可以直接使用一鍵腳本進行安裝，實測 Debian 10 和 CentOS 7 正常安裝 (請使用 root 帳戶)

安裝指令如下：

```bash
curl -fsSL https://get.docker.com | bash -s docker --mirror Aliyun
```

也可以使用中國大陸 daocloud 一鍵安裝指令：

```bash
curl -sSL https://get.daocloud.io/docker | sh
```

## 腳本安裝

使用以下指令即可

```bash
docker pull yindan/genshinhelper
```

### CentOS 錯誤

我使用 CentOS 安裝時出現錯誤 `Can't Connect to Docker Daemon`

請確保使用 root 帳戶，然後輸入以下指令

```bash
systemctl start docker
```

## 簡易使用

### Cookie 獲取

獲取米遊社 Cookie 請參考：[原神樹脂查看/推播 – yexca'Blog](https://yexca.xyz/archives/12)

**注意**：Cookie 應包含 `account_id` 和 `cookie_token` 兩個欄位

多帳號在不同 Cookie 中間加 `#` 即可，例如 `Cookie1#Cookie2#Cookie3`

### 簡易配置

```bash
docker run -d --name=genshinhelper \
-e COOKIE_MIHOYOBBS="<COOKIE_MIHOYOBBS>" \
--restart always \
yindan/genshinhelper:latest
```

將自己的 `Cookie` 替換上述指令的 `<COOKIE_MIHOYOBBS>` 即可

### 重新配置/更新 Cookie

重新配置好像需要解除安裝再重裝，然後再進行配置

或者使用設定檔只需替換 Cookie 就可以了吧 (沒用過，~~Cookie 有效期很長的~~)

### 常用指令

```bash
# 查看 Docker 所有的容器
docker ps -a

# 查看日誌
docker logs -f genshinhelper --tail 100

# 重啟
docker restart genshinhelper

# 更新
docker pull yindan/genshinhelper
docker rm -f genshinhelper
# 之後依據基本使用或進階使用重新部署

# 卸載
docker rm -f genshinhelper
docker image rm genshinhelper
```

## 進階使用

可下載範例檔案修改

> * Github: [config.json](https://gitlab.com/y1ndan/genshin-checkin-helper/-/raw/main/genshincheckinhelper/config/config.example.json)
> * Telegram: <https://t.me/genshinhelperupdates/5>

### 安裝

假設設定檔位於伺服器的 `/etc/genshin/config.json`，使用以下指令映射配置

```bash
docker run -d --name=genshinhelper \
-v /etc/genshin:/app/genshincheckinhelper/config \
--restart always \
yindan/genshinhelper:latest
```

### 配置

設定檔可以只留下需要的參數，把非必須的參數刪除，例如只需要 `Cookie`

則設定檔除了保持完整也可以寫成：

```json
{
  "COOKIE_MIHOYOBBS": "<COOKIE_MIHOYOBBS>",
}
```

### 設定檔新增

RANDOM_SLEEP_SECS_RANGE：隨機延遲休眠秒數範圍，單位：秒。設置成 "0-0" 為取消延遲。
CHECK_IN_TIME：每日簽到時間。該時間和執行環境的時間有關，和時區無關。如果是 docker，可以用 TZ=Asia/Shanghai 設置時區。
CHECK_RESIN_SECS：原神原粹樹脂檢測間隔時間，單位：秒。
COOKIE_RESIN_TIMER：需要開啟原粹樹脂檢測帳號的 cookie。
SHOPTOKEN：微信積分商城的 token，透過封包擷取獲取。
ONEPUSH：推播配置。notifier 為推播名稱，params 為所需參數。詳見後文。

### OnePush 推播參數一覽

推播名稱 / notifier: bark  
參數大全 / params:  
{'required': ['key'], 'optional': ['title', 'content', 'sound', 'isarchive', 'icon', 'group', 'url', 'copy', 'autocopy']}

推播名稱 / notifier: custom  
參數大全 / params:  
{'required': ['url'], 'optional': ['method', 'datatype', 'data']}

推播名稱 / notifier: dingtalk  
參數大全 / params:  
{'required': ['token'], 'optional': ['title', 'content', 'secret', 'markdown']}

推播名稱 / notifier: discord  
參數大全 / params:  
{'required': ['webhook'], 'optional': ['title', 'content', 'username', 'avatar_url', 'color']}

推播名稱 / notifier: pushplus  
參數大全 / params:  
{'required': ['token', 'content'], 'optional': ['title', 'topic', 'markdown']}

推播名稱 / notifier: qmsg  
參數大全 / params:  
{'required': ['key'], 'optional': ['title', 'content', 'mode', 'qq']}

推播名稱 / notifier: serverchan  
參數大全 / params:  
{'required': ['sckey', 'title'], 'optional': ['content']}

推播名稱 / notifier: serverchanturbo  
參數大全 / params:  
{'required': ['sctkey', 'title'], 'optional': ['content', 'channel', 'openid']}

推播名稱 / notifier: telegram  
參數大全 / params:  
{'required': ['token', 'userid'], 'optional': ['title', 'content', 'api_url']}

推播名稱 / notifier: wechatworkapp  
參數大全 / params:  
{'required': ['corpid', 'corpsecret', 'agentid'], 'optional': ['title', 'content', 'touser', 'markdown']}

推播名稱 / notifier: wechatworkbot  
參數大全 / params:  
{'required': ['key'], 'optional': ['title', 'content', 'markdown']}

### 推播例子

```conf
telegram  
ONEPUSH={"notifier":"telegram","params":{"markdown":false,"token":"xxxx","userid":"xxx"}}

discord  
ONEPUSH={"notifier":"discord","params":{"markdown":true,"webhook":"https://discord.com/api/webhooks/xxxxxx"}}
```

docker 設定檔對應目錄為：/etc/genshin:/app/genshincheckinhelper/config