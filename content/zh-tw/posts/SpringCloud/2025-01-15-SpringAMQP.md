---
slug: 217
title: 'SpringAMQP'
# draft: true
author: yexca
date: '2025-01-15T17:03:32+09:00'
categories:
    - 技術學習
tags:
    - 後端技術
    - SpringCloud
---

{{< notice >}} 本文由 gemini-3-pro 翻譯 {{< /notice >}}

## 初識 MQ

### 同步調用

微服務間基於 Feign 的呼叫屬於同步方式，存在一些問題。

例如要開發一個支付服務，需要加入訂單服務和倉儲服務的程式碼，後期若要加入簡訊服務、積分服務等都需要修改支付程式碼，違反了[開放-封閉原則](https://blog.yexca.net/zh-tw/archives/93/#%E7%89%A9%E4%BB%B6%E5%B0%8E%E5%90%91%E8%A8%AD%E8%A8%88%E5%8E%9F%E5%89%87)，並且在請求返回前無法做其他事情也會造成效能的浪費。

**問題：** 耦合度高、效能下降、資源浪費、級聯失敗 (若提供者出現問題，所有呼叫方也會跟著出問題，如同骨牌效應，迅速導致整個微服務群故障)。

### 非同步調用方案

非同步 (Asynchronous) 調用常見實現就是事件驅動模式。

使用者支付請求 -> 支付服務 -> Broker，之後支付服務完成並回應，然後由 Broker 通知訂單服務、倉儲服務和簡訊服務。

- **優點：** 服務解耦、效能提升、吞吐量提高、服務沒有強依賴、故障隔離、流量削峰。
- **缺點：** 依賴於 Broker 的可靠性、安全性、吞吐能力，架構變複雜了，業務沒有明顯的流程線，不好追蹤管理。

### MQ

MessageQueue，訊息佇列，字面意思為存放訊息的佇列，也就是事件驅動架構中的 Broker。

|                | **RabbitMQ**            | **ActiveMQ**                      | **RocketMQ**   | **Kafka**    |
| -------------- | ----------------------- | --------------------------------- | -------------- | ------------ |
| **公司/社群**  | Rabbit                  | Apache                            | 阿里 (Alibaba) | Apache       |
| **開發語言**   | Erlang                  | Java                              | Java           | Scala & Java |
| **協定支援**   | AMQP，XMPP，SMTP，STOMP | OpenWire, STOMP，REST, XMPP, AMQP | 自定義協定     | 自定義協定   |
| **可用性**     | 高                      | 一般                              | 高             | 高           |
| **單機吞吐量** | 一般                    | 差                                | 高             | 非常高       |
| **訊息延遲**   | 微秒級                  | 毫秒級                            | 毫秒級         | 毫秒以內     |
| **訊息可靠性** | 高                      | 一般                              | 高             | 一般         |

- **追求可用性：** Kafka、RocketMQ、RabbitMQ
- **追求可靠性：** RabbitMQ、RocketMQ
- **追求吞吐能力：** RocketMQ、Kafka
- **追求訊息低延遲：** RabbitMQ、Kafka

## 安裝 RabbitMQ

可以從[官網](https://www.google.com/search?q=https://www.rabbitmq.com/download.html)看到多種安裝方式，我使用 Docker 線上拉取。

```Bash
docker pull rabbitmq:3-management
```

執行指令：

```Bash
docker run \
 -e RABBITMQ_DEFAULT_USER=admin \
 -e RABBITMQ_DEFAULT_PASS=admin \
 --name mq \
 --hostname mq1 \
 -p 15672:15672 \
 -p 5672:5672 \
 -d \
 rabbitmq:3-management
```

訪問 `<localhost:15672>` 即可打開管理介面。RabbitMQ 中的一些概念：

- **channel：** 操作 MQ 的工具
- **exchange：** 交換機，路由訊息到佇列中
- **queue：** 佇列，儲存訊息
- **virtualHost：** 虛擬主機，是對 queue、exchange 等資源的邏輯分組

## 訊息模型

在[官網提供了多種 Demo](https://www.rabbitmq.com/getstarted.html)，對應了不同的訊息模型：

- **基本訊息佇列 (BasicQueue)：** ["Hello World!"](https://www.rabbitmq.com/tutorials/tutorial-one-python.html)
- **工作訊息佇列 (WorkQueue)：** [Work Queues](https://www.rabbitmq.com/tutorials/tutorial-two-python.html)
- **發佈訂閱模型：**
  - Fanout Exchange：廣播 [Publish/Subscribe](https://www.rabbitmq.com/tutorials/tutorial-three-python.html)
  - Direct Exchange：路由 [Routing](https://www.rabbitmq.com/tutorials/tutorial-four-python.html)
  - Topic Exchange：主題 [Topics](https://www.rabbitmq.com/tutorials/tutorial-five-python.html)

### Hello World

Publisher -> Queue -> Consumer

- **publisher：** 訊息發佈者，將訊息發送到佇列 queue
- **queue：** 訊息佇列，負責接受並快取訊息
- **consumer：** 訂閱佇列，處理佇列中的訊息

發佈者

```Java
public class PublisherTest {
    @Test
    public void testSendMessage() throws IOException, TimeoutException {
        // 1.建立連線
        ConnectionFactory factory = new ConnectionFactory();
        // 1.1.設定連線參數，分別是：主機名、連接埠號、vhost、使用者名稱、密碼
        factory.setHost("localhost");
        factory.setPort(5672);
        factory.setVirtualHost("/");
        factory.setUsername("admin");
        factory.setPassword("admin");
        // 1.2.建立連線
        Connection connection = factory.newConnection();

        // 2.建立通道 Channel
        Channel channel = connection.createChannel();

        // 3.建立佇列
        String queueName = "hello.queue";
        channel.queueDeclare(queueName, false, false, false, null);

        // 4.發送訊息
        String message = "hello, rabbitmq!";
        channel.basicPublish("", queueName, null, message.getBytes());
        System.out.println("發送訊息成功：【" + message + "】");

        // 5.關閉通道和連線
        channel.close();
        connection.close();

    }
}
```

接收者

```Java
public class ConsumerTest {
    public static void main(String[] args) throws IOException, TimeoutException {
        // 1.建立連線
        ConnectionFactory factory = new ConnectionFactory();
        // 1.1.設定連線參數，分別是：主機名、連接埠號、vhost、使用者名稱、密碼
        factory.setHost("localhost");
        factory.setPort(5672);
        factory.setVirtualHost("/");
        factory.setUsername("admin");
        factory.setPassword("admin");
        // 1.2.建立連線
        Connection connection = factory.newConnection();

        // 2.建立通道 Channel
        Channel channel = connection.createChannel();

        // 3.建立佇列
        String queueName = "hello.queue";
        channel.queueDeclare(queueName, false, false, false, null);

        // 4.訂閱訊息
        channel.basicConsume(queueName, true, new DefaultConsumer(channel){
            @Override
            public void handleDelivery(String consumerTag, Envelope envelope,
                                       AMQP.BasicProperties properties, byte[] body) throws IOException {
                // 5.處理訊息
                String message = new String(body);
                System.out.println("接收到訊息：【" + message + "】");
            }
        });
        System.out.println("等待接收訊息。。。。");
    }
}
```

控制台輸出：

```Markdown
等待接收訊息。。。。
接收到訊息：【hello, rabbitmq!】
```

顯然這種方式略顯繁瑣。

## SpringAMQP

[SpringAMQP](https://spring.io/projects/spring-amqp) 是基於 RabbitMQ 封裝的一套模板，並且還利用 SpringBoot 對其實現了自動配置 (Auto-configuration)，使用起來非常方便。

- AMQP

  Advanced Message Queuing Protocol，是用於在應用程式之間傳遞業務訊息的開放標準。該協定與語言和平台無關，更符合微服務中獨立性的要求。

- Spring AMQP

  Spring AMQP 是基於 AMQP 協定定義的一套 API 規範，提供了模板來發送和接收訊息。包含兩部分，其中 spring-amqp 是基礎抽象，spring-rabbit 是底層的預設實現。

它可以自動宣告佇列、交換機及其綁定關係，基於註解 (Annotation) 的監聽器模式，非同步接收訊息。

### Basic Queue 簡單佇列模型

首先在父專案 (Parent Project) 中引入依賴：

```XML
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-amqp</artifactId>
</dependency>
```

#### publisher 訊息發送

設定 `application.yml`：

```YAML
spring:
  rabbitmq:
    host: localhost # 主機名
    port: 5672 # 連接埠
    virtual-host: / # 虛擬主機
    username: admin # 使用者名稱
    password: admin # 密碼
```

利用 `RabbitTemplate` 實現訊息發送：

```Java
@RunWith(SpringRunner.class)
@SpringBootTest
public class SpringamqpTest {
    @Autowired
    private RabbitTemplate rabbitTemplate;
    @Test
    public void testSimpleQueue(){
        // 佇列名
        String queueName = "hello.queue";
        // 訊息
        String msg = "Hello Spring ampq";
        // 發送
        rabbitTemplate.convertAndSend(queueName,msg);
    }
}
```

#### consumer 訊息接收

設定 `application.yml` 同上：

```YAML
spring:
  rabbitmq:
    host: localhost # 主機名
    port: 5672 # 連接埠
    virtual-host: / # 虛擬主機
    username: admin # 使用者名稱
    password: admin # 密碼
```

建立一個新類別 `SpringRabbitListener`：

```Java
@Component
public class SpringRabbitListener {
    @RabbitListener(queues = "hello.queue")
    public void listenSimpleQueue(String msg){
        System.out.println("接收的訊息為：" + msg);
    }
}
```

### WorkQueue 工作訊息佇列

也稱 TaskQueue，任務模型，可以提高訊息處理速度，避免佇列訊息堆積。

Publisher -> Queue -> Consumer1 and Consumer2 and ...

#### publisher 訊息發送

定義一個方法，每秒發送 50 條訊息：

```Java
public class SpringamqpTest {
    @Test
    public void testWorkQueue() throws InterruptedException {
        String queueName = "hello.queue";
        String msg = "Hello Spring ampq...";
        for (int i = 0; i < 50; i++) {
            rabbitTemplate.convertAndSend(queueName, msg + i);
            // 睡眠20毫秒，1秒發50條訊息
            Thread.sleep(20);
        }
    }
}
```

#### consumer 訊息接收

建立兩個消費者綁定同一佇列：

```Java
@Component
public class SpringRabbitListener {
    @RabbitListener(queues = "hello.queue")
    public void listenSimpleQueue1(String msg) throws InterruptedException {
        System.out.println("1接收的訊息為：" + msg);
        // 每秒處理40條訊息
        Thread.sleep(25);
    }

    @RabbitListener(queues = "hello.queue")
    public void listenSimpleQueue2(String msg) throws InterruptedException {
        // 使用err輸出紅色訊息
        System.err.println("2接收的訊息為：" + msg);
        // 每秒處理5條訊息
        Thread.sleep(200);
    }
}
```

#### 測試

先運行接收者，而後運行發送者發送訊息。

從輸出結果可以看到，兩個接收者各接收一半的訊息，也就是說訊息是平均分配給每個消費者，並沒有考慮到消費者的處理能力。這樣顯然是有問題的。

#### prefetch

修改 `application.yml` 檔案，設定 `prefetch` 這個值，可以控制預取訊息的上限 (預設無限)。

```YAML
spring:
  rabbitmq:
    host: localhost # 主機名
    port: 5672 # 連接埠
    virtual-host: / # 虛擬主機
    username: admin # 使用者名稱
    password: admin # 密碼
    listener:
      simple:
        # 每次只能獲取一條訊息，處理完成才能獲取下一個訊息
        prefetch: 1
```

再次測試可以發現執行效率提高。

### 發佈訂閱模型

發佈訂閱模式加入了交換機 (Exchange)，允許將同一個訊息發送給全部接收者。

Publisher -> Exchange -> Queue1 and Queue2

Queue1 -> Consumer1 and Consumer2

Queue2 -> Consumer3

常見的 exchange 有：

- **Fanout：** 廣播
- **Direct：** 路由
- **Topic：** 主題

> exchange 負責路由，並不儲存，一旦路由失敗則訊息遺失。

#### Fanout (扇出) 廣播

Fanout exchange 會將接收到的訊息廣播到每一個和其綁定的 queue。

在接收者建立一個配置類別，宣告佇列與交換機：

```Java
@Configuration
public class FanoutConfig {
    /**
     * 宣告交換機
     * @return
     */
    @Bean
    public FanoutExchange fanoutExchange(){
        return new FanoutExchange("hello.fanout");
    }

    /**
     * 第一個佇列
     * @return
     */
    @Bean
    public Queue fanoutQueue1(){
        return new Queue("fanout.queue1");
    }

    /**
     * 綁定第一個佇列與交換機
     * @param fanoutQueue1
     * @param fanoutExchange
     * @return
     */
    @Bean
    public Binding bindingQueue1(Queue fanoutQueue1, FanoutExchange fanoutExchange){
        return BindingBuilder.bind(fanoutQueue1).to(fanoutExchange);
    }

    /**
     * 第二個佇列
     * @return
     */
    @Bean
    public Queue fanoutQueue2(){
        return new Queue("fanout.queue2");
    }

    /**
     * 綁定第二個佇列與交換機
     * @param fanoutQueue2
     * @param fanoutExchange
     * @return
     */
    @Bean
    public Binding bindingQueue2(Queue fanoutQueue2, FanoutExchange fanoutExchange){
        return BindingBuilder.bind(fanoutQueue2).to(fanoutExchange);
    }
}
```

訊息發送：

```Java
public class SpringamqpTest {    
    @Test
    public void testFanoutExchange(){
        // 交換機
        String exchangeName = "hello.fanout";
        // 訊息
        String msg = "hello, everyone";
        rabbitTemplate.convertAndSend(exchangeName,"",msg);
    }
}
```

其中中間空著的 `routingkey` 在下兩個模型使用。

訊息的接收：

```Java
@Component
public class SpringRabbitListener {
    @RabbitListener(queues = "fanout.queue1")
    public void listenFanoutQueue1(String msg){
        System.out.println("Fanout1 接收訊息：" + msg);
    }
    @RabbitListener(queues = "fanout.queue2")
    public void listenFanoutQueue2(String msg){
        System.out.println("Fanout2 接收訊息：" + msg);
    }
}
```

#### Direct 路由

Direct Exchange 會將接收到的訊息根據規則路由到指定的 Queue，因此稱為路由模式。

佇列與交換機的綁定要指定一個 `Routingkey`，發送方發訊息時也必須指定訊息的 `Routingkey`，只有佇列的 `Routingkey` 和訊息的 `Routingkey` 完全一致，才會接收到訊息。

在此使用基於註解宣告佇列和交換機，不需要配置類別：

```Java
@Component
public class SpringRabbitListener {
    @RabbitListener(bindings = @QueueBinding(
            value = @Queue(name = "direct.queue1"),
//            exchange = @Exchange(name = "hello.direct", type = ExchangeTypes.DIRECT),
//            因為預設為 Direct 類型，可以不用指定
            exchange = @Exchange(name = "hello.direct"),
            key = {"red","warma"}
    ))
    public void listenDirectQueue1(String msg){
        System.out.println("1 接收訊息：" + msg);
    }

    @RabbitListener(bindings = @QueueBinding(
            value = @Queue(name = "direct.queue2"),
            exchange = @Exchange(name = "hello.direct"),
            key = {"red","aqua"}
    ))
    public void listenDirectQueue2(String msg){
        System.out.println("2 接收訊息：" + msg);
    }
}
```

發送者：

```Java
public class SpringamqpTest {    
    @Test
    public void testDirectExchange(){
        // 交換機
        String exchangeName = "hello.direct";
        // 訊息
        String msg = "hello, aqua";
        rabbitTemplate.convertAndSend(exchangeName,"aqua",msg);
    }
}
```

上例只有接收者 2 可以接收到訊息，若 routingkey 為 red 則兩個都能接收到訊息。

#### Topic 主題

TopicExchange 與 DirectExchange 類似，區別在於 routingKey 必須是多個單字的列表，並且以 `.` 分割。

Queue 與 Exchange 指定 BindingKey 時可以使用萬用字元：

- `#`：匹配一個或多個單字
- `*`：只匹配一個單字

接收者：

```Java
@Component
public class SpringRabbitListener {
    @RabbitListener(bindings = @QueueBinding(
            value = @Queue("topic.queue1"),
            exchange = @Exchange(name = "hello.topic", type = ExchangeTypes.TOPIC),
            key = "#.news"
    ))
    public void listenTopicQueue1(String msg){
        System.out.println("1 接受訊息：" + msg);
    }
    @RabbitListener(bindings = @QueueBinding(
            value = @Queue("topic.queue2"),
            exchange = @Exchange(name = "hello.topic", type = ExchangeTypes.TOPIC),
            key = "china.#"
    ))
    public void listenTopicQueue2(String msg){
        System.out.println("2 接受訊息：" + msg);
    }
}
```

訊息發送：

```Java
public class SpringamqpTest {    
    @Test
    public void testTopicExchange(){
        // 交換機
        String exchangeName = "hello.topic";
        // 訊息
        String msg = "news for China";
        rabbitTemplate.convertAndSend(exchangeName,"china.news",msg);
    }
}
```

上例 1 和 2 都可以接收。

```Java
public class SpringamqpTest {    
    @Test
    public void testTopicExchange(){
        // 交換機
        String exchangeName = "hello.topic";
        // 訊息
        String msg = "news for Japan";
        rabbitTemplate.convertAndSend(exchangeName,"japan.news",msg);
    }
}
```

只有 1 可以接收。

## 訊息轉換器

Spring 會把發送的訊息序列化為位元組 (Bytes) 發送給 MQ，接收訊息時，把位元組反序列化為 Java 物件，只不過預設情況下 Spring 採用的序列化方式是 JDK 序列化，其數據體積過大、有安全漏洞、可讀性差。

可以使用 JSON 方式來做序列化和反序列化。

首先在父專案引入依賴：

```XML
<dependency>
    <groupId>com.fasterxml.jackson.dataformat</groupId>
    <artifactId>jackson-dataformat-xml</artifactId>
    <version>2.9.10</version>
</dependency>
```

在消費者與接收者宣告一個 bean 即可：

```java
@Bean
public MessageConverter jsonMessageConverter(){
    return new Jackson2JsonMessageConverter();
}
```
