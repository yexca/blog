---
slug: 158
# layout: post
title: 'Hi SpringCloud'
author: yexca
date: 2024-02-25T17:56:54+08:00
lastmod: 2025-02-05T17:13:54+09:00
# permalink: /archives/158
categories:
    - Tech Learning
tags:
    - Backend
    - SpringCloud
--- 

{{< notice >}} This article was translated by gemini-3-flash-preview {{< /notice >}}

## Service Architecture

### Monolithic Architecture

All business functions are integrated into a single project, packaged as one unit for deployment.

**Pros:** Simple architecture, low deployment cost. Good for small projects.

**Cons:** High coupling. Poor scalability.

### Distributed Architecture

Split the system based on business functions. Each module is developed as an independent project, called a "service."

**Pros:** Reduced coupling, easier to upgrade and scale.

**Cons:** Complex architecture, high difficulty. Suitable for large-scale internet projects.

### Microservices

Microservices is a well-designed distributed architecture pattern. Key characteristics:

* [Single Responsibility](https://blog.yexca.net/archives/93#%E9%9D%A2%E5%90%91%E5%AF%B9%E8%B1%A1%E8%AE%BE%E8%AE%A1%E5%8E%9F%E5%88%99): Fine-grained service splitting. Each service corresponds to a unique business capability to avoid redundant development.
* Service-Oriented: Services expose business interfaces to the outside.
* Autonomous: Independent teams, tech stacks, data, and deployment.
* Strong Isolation: Implement isolation, fault tolerance, and fallbacks for service calls to prevent cascading failures.

## Microservice Technologies

Implementing a microservice solution requires a technical framework. Common ones include:

|                | Dubbo               | SpringCloud               | SpringCloudAlibaba        |
| -------------- | ------------------- | ------------------------- | ------------------------- |
| Service Registry | zookeeper, Redis   | Eureka, Consul           | Nacos, Eureka            |
| Remote Call    | Dubbo protocol       | Feign (HTTP protocol)      | Dubbo, Feign              |
| Config Center  | None                | SpringCloudConfig         | SpringCloudConfig, Nacos |
| API Gateway    | None                | SpringCloudGateway, Zuul | SpringCloudGateway, Zuul |
| Monitoring/Protection | dubbo-admin (limited) | Hystix                    | Sentinel                  |

Microservices should be split according to business modules:

* Single Responsibility: Don't duplicate the same business logic in different services.
* Data Independence: Do not directly access other services' databases.
* Service-Oriented: Expose your business logic as interfaces for other services to call.

## SpringCloud

SpringCloud is currently the most widely used microservice framework. It integrates various microservice components and implements auto-configuration based on SpringBoot.

Official Website: <https://spring.io/projects/spring-cloud/>

* Service Registration & Discovery: Eureka, Nacos, Consul
* Unified Configuration Management: SpringCloudConfig, Nacos
* Remote Service Calls: OpenFeign, Dubbo
* Unified Gateway Routing: SpringCloudGateway, Zuul
* Distributed Tracing: Zipkin, Sleuth
* Flow Control, Fallback, & Protection: Hystix, Sentinel

## Microservice Calls

Requirement: When querying an order by ID, return the associated user information as well.

### Register RestTemplate

```java
@Bean
public RestTemplate restTemplate(){
    return new RestTemplate();
}
```

### Remote Service Call with RestTemplate

```java
@Service
public class OrderService {

    @Autowired
    private OrderMapper orderMapper;
    @Autowired
    private RestTemplate restTemplate;

    public Order queryOrderById(Long orderId) {
        // 1. Query the order
        Order order = orderMapper.findById(orderId);
        // 2. Query the user
        String url = "http://localhost:8081/user/" + order.getUserId();
        // RestTemplate GET method
        User user = restTemplate.getForObject(url, User.class);
        // 3. Encapsulate user info
        order.setUser(user);
        // 4. Return
        return order;
    }
}
```
