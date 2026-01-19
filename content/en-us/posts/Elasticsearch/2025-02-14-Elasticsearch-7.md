---
slug: 234
title: 'Elasticsearch Data Synchronization'
# draft: true
author: yexca
date: '2025-02-14T20:36:55+09:00'
lastmod: '2025-02-15T17:17:08+09:00'
categories:
    - Tech Learning
tags:
    - Backend Tech
    - Elasticsearch
    - SpringCloud
---

{{< notice >}} This article was translated by gemini-2.5-flash {{< /notice >}}

> **Elasticsearch Series**
>
> | Content                        | Link                                  |
> | :----------------------------- | :------------------------------------ |
> | Elasticsearch Basic Operations | <https://blog.yexca.net/archives/226> |
> | Elasticsearch Query Operations | <https://blog.yexca.net/archives/227> |
> | RestClient Basic Operations    | <https://blog.yexca.net/archives/228> |
> | RestClient Query Operations    | <https://blog.yexca.net/archives/229> |
> | Elasticsearch Data Aggregation | <https://blog.yexca.net/archives/231> |
> | Elasticsearch Autocomplete     | <https://blog.yexca.net/archives/232> |
> | Elasticsearch Data Synchronization | This Article |
> | Elasticsearch Cluster          | <https://blog.yexca.net/archives/235> |

ES data typically comes from a MySQL database. So, when MySQL data changes, ES also needs to update. This is what we call data synchronization between ES and MySQL.

Common data synchronization solutions include three main types:

*   Synchronous Call
*   Asynchronous Notification
*   Binlog Listening

## Synchronous Call

![image](https://raw.githubusercontent.com/yexca/picx-images-hosting/master/2024/01-SpringCloud/image.1lj3wtigvg1s.webp)

Steps:

*   hotel-demo exposes an API for modifying data in ES.
*   The backend management system (hotel-admin) directly calls the API provided by hotel-demo after completing its database operations.

## Asynchronous Notification

![image](https://raw.githubusercontent.com/yexca/picx-images-hosting/master/2024/01-SpringCloud/image.7639v9kp7l0.webp)

Steps:

*   hotel-admin sends an MQ message after performing CRUD operations on MySQL data.
*   hotel-demo listens to the MQ, and updates ES data upon receiving the message.

## Binlog Listening

![image](https://raw.githubusercontent.com/yexca/picx-images-hosting/master/2024/01-SpringCloud/image.6t9hbchmlm00.webp)

Process:

*   Enable MySQL's binlog feature.
*   All MySQL CRUD operations are recorded in the binlog.
*   hotel-demo monitors binlog changes using Canal, updating ES content in real-time.

## Solution Comparison

Method One: Synchronous Call

*   Pros: Simple and direct implementation.
*   Cons: High business coupling.

Method Two: Asynchronous Notification

*   Pros: Low coupling, moderate implementation complexity.
*   Cons: Relies on MQ reliability.

Method Three: Binlog Listening

*   Pros: Completely decouples services.
*   Cons: Enabling binlog increases database load, high implementation complexity.

## Data Sync Implementation

Note: We'll use MQ for asynchronous notification, implementing MySQL CRUD operations in hotel-admin.

In hotel-admin and hotel-demo, add the RabbitMQ dependency:

```xml
<!--amqp-->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-amqp</artifactId>
</dependency>
```

Declare queue and exchange names:

```java
public class MqConstants {
    // Exchange
    public final static String HOTEL_EXCHANGE = "hotel.topic";
    // Queue for new and update operations
    public final static String HOTEL_INSERT_QUEUE = "hotel.insert.queue";
    // Queue for delete operations
    public final static String HOTEL_DELETE_QUEUE = "hotel.delete.queue";
    // RoutingKey for insert or update
    public final static String HOTEL_INSERT_KEY = "hotel.insert";
    // RoutingKey for delete
    public final static String HOTEL_DELETE_KEY = "hotel.delete";
}
```

Declare exchange configuration in hotel-demo:

```java
@Configuration
public class MqConfig {
    @Bean
    public TopicExchange topicExchange(){
        return new TopicExchange(MqConstants.HOTEL_EXCHANGE,true,false);
    }
    @Bean
    public Queue insertQueue(){
        return new Queue(MqConstants.HOTEL_INSERT_QUEUE,true);
    }
    @Bean
    public Queue deleteQueue(){
        return new Queue(MqConstants.HOTEL_DELETE_QUEUE, true);
    }
    @Bean
    public Binding insertQueueBinding(){
        return BindingBuilder.bind(insertQueue()).to(topicExchange()).with(MqConstants.HOTEL_INSERT_KEY);
    }
    @Bean
    public Binding deleteQueueBinding(){
        return BindingBuilder.bind(deleteQueue()).to(topicExchange()).with(MqConstants.HOTEL_DELETE_KEY);
    }
}
```

Send MQ messages from hotel-admin:

```java
public class HotelController {
    @Autowired
    private RabbitTemplate rabbitTemplate;
    
    @PostMapping
    public void saveHotel(@RequestBody Hotel hotel){
        hotelService.save(hotel);
        rabbitTemplate.convertAndSend(MqConstants.HOTEL_EXCHANGE, MqConstants.HOTEL_INSERT_KEY, hotel.getId());
    }

    @PutMapping()
    public void updateById(@RequestBody Hotel hotel){
        if (hotel.getId() == null) {
            throw new InvalidParameterException("id cannot be null");
        }
        hotelService.updateById(hotel);
        rabbitTemplate.convertAndSend(MqConstants.HOTEL_EXCHANGE, MqConstants.HOTEL_INSERT_KEY,hotel.getId());
    }

    @DeleteMapping("/{id}")
    public void deleteById(@PathVariable("id") Long id) {
        hotelService.removeById(id);
        rabbitTemplate.convertAndSend(MqConstants.HOTEL_EXCHANGE, MqConstants.HOTEL_DELETE_KEY, id);
    }
}
```

In hotel-demo, receive MQ messages. Business logic:

*   Insert message: Query hotel info by `hotel.id`, then add a new document to the index.
*   Delete message: Delete a document from the index by `hotel.id`.

```java
@Override
public void deleteById(Long id) {
    try {
        // Prepare the request
        DeleteRequest request = new DeleteRequest("hotel", id.toString());
        // Send the request
        client.delete(request, RequestOptions.DEFAULT);
    } catch (IOException e) {
        throw new RuntimeException(e);
    }
}

@Override
public void insertById(Long id) {
    try {
        // Query data by id
        Hotel hotel = getById(id);
        // Convert to document type
        HotelDoc hotelDoc = new HotelDoc(hotel);

        // Prepare the request
        IndexRequest request = new IndexRequest("hotel").id(id.toString());
        // Prepare JSON
        request.source(JSON.toJSONString(hotelDoc), XContentType.JSON);
        // Send the request
        client.index(request, RequestOptions.DEFAULT);
    } catch (IOException e) {
        throw new RuntimeException(e);
    }
}
```

Write the listener in hotel-demo:

```java
@Component
public class HotelLinster {
    @Autowired
    private IHotelService hotelService;

    /**
     * Listen for updates or inserts
     * @param id
     */
    @RabbitListener(queues = MqConstants.HOTEL_INSERT_QUEUE)
    public void listenHotelInsertOrUpdate(Long id){
        hotelService.insertById(id);
    }

    /**
     * Listen for deletes
     * @param id
     */
    @RabbitListener(queues = MqConstants.HOTEL_DELETE_QUEUE)
    public void listenHotelDelete(Long id){
        hotelService.deleteById(id);
    }
}
```
