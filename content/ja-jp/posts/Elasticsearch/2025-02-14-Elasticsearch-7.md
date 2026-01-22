---
slug: 234
title: 'Elasticsearch データ同期'
# draft: true
author: yexca
date: '2025-02-14T20:36:55+09:00'
lastmod: '2025-02-15T17:17:08+09:00'
categories:
    - 技術学習
tags:
    - バックエンド技術
    - Elasticsearch
    - SpringCloud
---

{{< notice >}} この記事は gemini-2.5-flash によって翻訳されました {{< /notice >}}

> **Elasticsearch シリーズ**
>
> | 内容                   | リンク                                  |
> | :--------------------- | :------------------------------------ |
> | Elasticsearch 基本操作 | <https://blog.yexca.net/ja/archives/226> |
> | Elasticsearch 検索操作 | <https://blog.yexca.net/ja/archives/227> |
> | RestClient 基本操作 | <https://blog.yexca.net/ja/archives/228> |
> | RestClient 検索操作 | <https://blog.yexca.net/ja/archives/229> |
> | Elasticsearch データ集計 | <https://blog.yexca.net/ja/archives/231> |
> | Elasticsearch オートコンプリート | <https://blog.yexca.net/ja/archives/232> |
> | Elasticsearch データ同期 | この記事 |
> | Elasticsearch クラスター | <https://blog.yexca.net/ja/archives/235> |

Elasticsearch のデータは MySQL データベースから来てるんだ。だから、MySQL のデータが変わったら、Elasticsearch もそれに合わせて変わる必要があるんだよね。これが Elasticsearch と MySQL の間のデータ同期だよ。

よくあるデータ同期の方法は3つあるよ。

*   同期呼び出し
*   非同期通知
*   binlog 監視

## 同期呼び出し

![image](https://raw.githubusercontent.com/yexca/picx-images-hosting/master/2024/01-SpringCloud/image.1lj3wtigvg1s.webp)

手順：

*   hotel-demo が外部にインターフェースを提供して、Elasticsearch のデータを変更するんだ。
*   バックエンド管理システム (hotel-admin) はデータベース操作が完了したら、hotel-demo が提供するインターフェースを直接呼び出すんだ。

## 非同期通知

![image](https://raw.githubusercontent.com/yexca/picx-images-hosting/master/2024/01-SpringCloud/image.7639v9kp7l0.webp)

手順：

*   hotel-admin は MySQL データに対して CRUD 操作が完了したら、MQ メッセージを送信するよ。
*   hotel-demo は MQ を監視して、メッセージを受け取ったら Elasticsearch のデータを変更するんだ。

## binlog 監視

![image](https://raw.githubusercontent.com/yexca/picx-images-hosting/master/2024/01-SpringCloud/image.6t9hbchmlm00.webp)

流れ：

*   MySQL の binlog 機能を有効にするんだ。
*   MySQL で CRUD 操作が完了すると、全部 binlog に記録されるよ。
*   hotel-demo は Canal を使って binlog の変化を監視し、Elasticsearch の内容をリアルタイムで更新するんだ。

## アプローチ比較

方法1：同期呼び出し

*   メリット：実装がシンプルで、手っ取り早い。
*   デメリット：業務の結合度が高い。

方法2：非同期通知

*   メリット：低結合で、実装の難易度は普通。
*   デメリット：MQ の信頼性に依存する。

方法3：binlog 監視

*   メリット：サービス間の結合を完全に解消できる。
*   デメリット：binlog を有効にするとデータベースの負荷が増えるし、実装の複雑度が高い。

## データ同期の実装

説明：MQ 非同期通知を使って、hotel-admin で MySQL の CRUD 操作を実装するよ。

hotel-admin と hotel-demo に RabbitMQ の依存関係を追加するんだ。

```xml
<!--amqp-->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-amqp</artifactId>
</dependency>
```

キューとエクスチェンジ名を宣言するよ。

```java
public class MqConstants {
    // 交换机
    public final static String HOTEL_EXCHANGE = "hotel.topic";
    // 监听新增和修改队列
    public final static String HOTEL_INSERT_QUEUE = "hotel.insert.queue";
    // 监听删除的队列
    public final static String HOTEL_DELETE_QUEUE = "hotel.delete.queue";
    // 新增或修改的RoutingKey
    public final static String HOTEL_INSERT_KEY = "hotel.insert";
    // 删除的RoutingKey
    public final static String HOTEL_DELETE_KEY = "hotel.delete";
}
```

hotel-demo でエクスチェンジ設定を宣言する。

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

hotel-admin で MQ メッセージを送信するよ。

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
            throw new InvalidParameterException("id不能为空");
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

hotel-demo で MQ メッセージを受け取るんだけど、ビジネスロジックはこんな感じだよ。

*   新規追加メッセージ：渡された hotel.id に基づいて情報を検索し、それからインデックスに新しいデータを1件追加する。
*   削除メッセージ：渡された hotel.id に基づいてインデックスからデータを1件削除する。

```java
@Override
public void deleteById(Long id) {
    try {
        // 准备request
        DeleteRequest request = new DeleteRequest("hotel", id.toString());
        // 发送请求
        client.delete(request, RequestOptions.DEFAULT);
    } catch (IOException e) {
        throw new RuntimeException(e);
    }
}

@Override
public void insertById(Long id) {
    try {
        // 根据id查询数据
        Hotel hotel = getById(id);
        // 转换文档类型
        HotelDoc hotelDoc = new HotelDoc(hotel);

        // 准备request
        IndexRequest request = new IndexRequest("hotel").id(id.toString());
        // 准备json
        request.source(JSON.toJSONString(hotelDoc), XContentType.JSON);
        // 发送请求
        client.index(request, RequestOptions.DEFAULT);
    } catch (IOException e) {
        throw new RuntimeException(e);
    }
}
```

hotel-demo でリスナーを書くよ。

```java
@Component
public class HotelLinster {
    @Autowired
    private IHotelService hotelService;

    /**
     * 监听修改或新增
     * @param id
     */
    @RabbitListener(queues = MqConstants.HOTEL_INSERT_QUEUE)
    public void listenHotelInsertOrUpdate(Long id){
        hotelService.insertById(id);
    }

    /**
     * 监听删除
     * @param id
     */
    @RabbitListener(queues = MqConstants.HOTEL_DELETE_QUEUE)
    public void listenHotelDelete(Long id){
        hotelService.deleteById(id);
    }
}
```
