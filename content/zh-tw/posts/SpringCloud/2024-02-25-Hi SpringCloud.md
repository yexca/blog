---
slug: 158
# layout: post
title: 'Hi SpringCloud'
author: yexca
date: 2024-02-25T17:56:54+08:00
lastmod: 2025-02-05T17:13:54+09:00
# permalink: /archives/158
categories:
    - 技術學習
tags:
    - 後端技術
    - SpringCloud
--- 

{{< notice >}} 本文由 gemini-3-flash-preview 翻譯 {{< /notice >}}

## 服務架構

### 單體架構

將業務的所有功能集中在一個專案中開發，並打包成一個檔案進行部署。

優點：架構簡單、部署成本低，適合小型專案。

缺點：耦合度高、擴充性差。

### 分散式架構

根據業務功能對系統進行拆分，每個業務模組作為獨立專案開發，稱為一個服務。

優點：降低服務耦合、有利於服務升級拓展。

缺點：架構複雜、難度大，適合大型網際網路專案。

### 微服務

微服務是一種經過良好架構設計的分散式架構方案，微服務架構特徵：

* [單一職責](https://blog.yexca.net/zh-tw/archives/93#%E7%89%A9%E4%BB%B6%E5%B0%8E%E5%90%91%E8%A8%AD%E8%A8%88%E5%8E%9F%E5%89%87)：微服務拆分粒度更小，每一個服務都對應唯一的業務能力，做到單一職責，避免重複業務開發。
* 面向服務：微服務對外暴露業務介面。
* 自治：團隊獨立、技術獨立、數據獨立、部署獨立。
* 隔離性強：服務呼叫做好隔離、容錯、降級，避免出現連鎖問題。

## 微服務技術

微服務方案需要技術框架實作，常見的如下：

|                | Dubbo               | SpringCloud               | SpringCloudAlibaba        |
| -------------- | ------------------- | ------------------------- | ------------------------- |
| 註冊中心       | zookeeper、 Redis   | Eureka、 Consul           | Nacos、 Eureka            |
| 服務遠端呼叫   | Dubbo 協定          | Feign (http 協定)         | Dubbo、Feign              |
| 配置中心       | 無                  | SpringCloudConfig         | SpringCloudConfig、 Nacos |
| 服務網關       | 無                  | SpringCloudGateway、 Zuul | SpringCloudGateway、 Zuul |
| 服務監控與保護 | dubbo-admin，功能弱 | Hystix                    | Sentinel                  |

微服務需要根據業務模組拆分：

* 單一職責：不同微服務，不要重複開發相同業務。
* 數據獨立：不要存取其他微服務的資料庫。
* 面向服務：將自己的業務暴露為介面，供其他微服務呼叫。

## SpringCloud

SpringCloud 是目前使用最廣泛的微服務框架。它整合了各種微服務功能組件，並基於 SpringBoot 實作了這些組件的自動裝配。

官網：<https://spring.io/projects/spring-cloud/>

* 服務註冊發現：Eureka、Nacos、Consul
* 統一配置管理：SpringCloudConfig、Nacos
* 服務遠端呼叫：OpenFeign、Dubbo
* 統一網關路由：SpringCloudGateway、Zuul
* 服務鏈路監控：Zipkin、Sleuth
* 流控、降級、保護：Hystix、Sentinel

## 微服務呼叫

需求：根據訂單 id 查詢訂單的同時，把訂單所屬的使用者資訊一起回傳。

### 註冊 RestTemplate

```java
@Bean
public RestTemplate restTemplate(){
    return new RestTemplate();
}
```

### 服務遠端呼叫 RestTemplate

```java
@Service
public class OrderService {

    @Autowired
    private OrderMapper orderMapper;
    @Autowired
    private RestTemplate restTemplate;

    public Order queryOrderById(Long orderId) {
        // 1. 查詢訂單
        Order order = orderMapper.findById(orderId);
        // 2. 查詢使用者
        String url = "http://localhost:8081/user/" + order.getUserId();
        // RestTemplate 的 GET 方法
        User user = restTemplate.getForObject(url, User.class);
        // 3. 封裝使用者資訊
        order.setUser(user);
        // 4. 回傳
        return order;
    }
}
```
