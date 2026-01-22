---
slug: 217
title: 'SpringAMQP'
# draft: true
author: yexca
date: '2025-01-15T17:03:32+09:00'
categories:
    - Tech Learning
tags:
    - Backend Tech
    - SpringCloud
---

{{< notice >}} This article was translated by gemini-2.5-flash {{< /notice >}}

## Intro to MQ

### Synchronous Calls

Microservices calling each other via Feign is a synchronous approach, which comes with some issues.

For example, if you're building a payment service, it might need to integrate code from the order service and warehouse service. Later, if you add an SMS service or a loyalty points service, you'd have to modify the payment code each time. This violates the [Open/Closed Principle](https://blog.yexca.net/en/archives/93/#object-oriented-design-principles). Plus, you can't do anything else until the request returns, which wastes performance.

Problems: High coupling, performance degradation, resource waste, cascading failures (if a provider service goes down, all calling services fail too, like dominoes, quickly bringing down the entire microservice cluster).

### Asynchronous Call Solutions

Asynchronous calls are often implemented using an event-driven pattern.

User payment request -> Payment Service -> Broker. The payment service then completes and responds, and the Broker notifies the order service, warehouse service, and SMS service.

Pros: Service decoupling, improved performance and throughput, loose coupling (fault isolation), traffic shaping/spike reduction.

Cons: Relies on the Broker's reliability, security, and throughput. The architecture becomes more complex, business flows aren't always clear, and tracing/management can be harder.

### MQ

Message Queue. Literally, a queue for messages. It's the Broker in an event-driven architecture.

|            | **RabbitMQ**            | **ActiveMQ**                   | **RocketMQ** | **Kafka**  |
| ---------- | ----------------------- | ------------------------------ | ------------ | ---------- |
| Company/Community | Rabbit                  | Apache                         | Alibaba      | Apache     |
| Dev Language | Erlang                  | Java                           | Java         | Scala&Java |
| Protocol Support | AMQP，XMPP，SMTP，STOMP | OpenWire,STOMP，REST,XMPP,AMQP | Custom       | Custom     |
| Availability | High                    | Moderate                       | High         | High       |
| Single-Node Throughput | Moderate                | Low                            | High         | Very High  |
| Message Latency | Microsecond-level       | Millisecond-level              | Millisecond-level | Sub-millisecond |
| Message Reliability | High                    | Moderate                       | High         | Moderate   |

For high availability: Kafka, RocketMQ, RabbitMQ
For high reliability: RabbitMQ, RocketMQ
For high throughput: RocketMQ, Kafka
For low message latency: RabbitMQ, Kafka

## Installing RabbitMQ

You can find various installation methods on the [official website](https://www.rabbitmq.com/download.html). I'm using Docker to pull the image.

```bash
docker pull rabbitmq:3-management
```

Run command:

```bash
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

Visit <localhost:15672> to open the management UI. Here are some RabbitMQ concepts:

- channel: The tool to interact with MQ.
- exchange: Routes messages to queues.
- queue: Stores messages.
- virtualHost: A logical grouping for resources like queues, exchanges.

## Messaging Models

The [official website provides various demos](https://www.rabbitmq.com/getstarted.html), corresponding to different messaging models.

- Basic Queue: ["Hello World!"](https://www.rabbitmq.com/tutorials/tutorial-one-python.html)
- Work Queues: [Work Queues](https://www.rabbitmq.com/tutorials/tutorial-two-python.html)
- Publish/Subscribe Model
  - Fanout Exchange: Broadcast [Publish/Subscribe](https://www.rabbitmq.com/tutorials/tutorial-three-python.html)
  - Direct Exchange: Routing [Routing](https://www.rabbitmq.com/tutorials/tutorial-four-python.html)
  - Topic Exchange: Topics [Topics](https://www.rabbitmq.com/tutorials/tutorial-five-python.html)

### Hello World

Publisher -> Queue -> Consumer

- publisher: Message sender, sends messages to the queue.
- queue: Message queue, responsible for receiving and caching messages.
- consumer: Subscribes to the queue, processes messages in the queue.

Publisher

```java
public class PublisherTest {
    @Test
    public void testSendMessage() throws IOException, TimeoutException {
        // 1. Establish connection
        ConnectionFactory factory = new ConnectionFactory();
        // 1.1. Set connection parameters: hostname, port, vhost, username, password
        factory.setHost("localhost");
        factory.setPort(5672);
        factory.setVirtualHost("/");
        factory.setUsername("admin");
        factory.setPassword("admin");
        // 1.2. Establish connection
        Connection connection = factory.newConnection();

        // 2. Create Channel
        Channel channel = connection.createChannel();

        // 3. Create queue
        String queueName = "hello.queue";
        channel.queueDeclare(queueName, false, false, false, null);

        // 4. Send message
        String message = "hello, rabbitmq!";
        channel.basicPublish("", queueName, null, message.getBytes());
        System.out.println("Message sent successfully: 【" + message + "】");

        // 5. Close channel and connection
        channel.close();
        connection.close();

    }
}
```

Consumer

```java
public class ConsumerTest {
    public static void main(String[] args) throws IOException, TimeoutException {
        // 1. Establish connection
        ConnectionFactory factory = new ConnectionFactory();
        // 1.1. Set connection parameters: hostname, port, vhost, username, password
        factory.setHost("localhost");
        factory.setPort(5672);
        factory.setVirtualHost("/");
        factory.setUsername("admin");
        factory.setPassword("admin");
        // 1.2. Establish connection
        Connection connection = factory.newConnection();

        // 2. Create Channel
        Channel channel = connection.createChannel();

        // 3. Create queue
        String queueName = "hello.queue";
        channel.queueDeclare(queueName, false, false, false, null);

        // 4. Subscribe to messages
        channel.basicConsume(queueName, true, new DefaultConsumer(channel){
            @Override
            public void handleDelivery(String consumerTag, Envelope envelope,
                                       AMQP.BasicProperties properties, byte[] body) throws IOException {
                // 5. Process message
                String message = new String(body);
                System.out.println("Message received: 【" + message + "】");
            }
        });
        System.out.println("Waiting for messages....");
    }
}
```

Console Output:

```markdown
Waiting for messages....
Message received: 【hello, rabbitmq!】
```

Clearly, this approach is a bit cumbersome.

## SpringAMQP

[SpringAMQP](https://spring.io/projects/spring-amqp) is a template wrapper around RabbitMQ. It also leverages Spring Boot for auto-configuration, making it super convenient to use.

- AMQP

Advanced Message Queuing Protocol, an open standard for passing business messages between applications. This protocol is language and platform-agnostic, which aligns well with microservices' independence requirements.

- Spring AMQP

Spring AMQP defines a set of APIs based on the AMQP protocol, providing templates for sending and receiving messages. It includes two parts: `spring-amqp` for basic abstractions, and `spring-rabbit` as the default underlying implementation.

It can automatically declare queues, exchanges, and their bindings, and supports annotation-based listener patterns for asynchronous message reception.

### Basic Queue Model

First, add the dependency in your parent project:

```xml
<!--AMQP dependency, includes RabbitMQ-->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-amqp</artifactId>
</dependency>
```

#### Publisher (Sending Messages)

Configure `application.yml`:

```yml
spring:
  rabbitmq:
    host: localhost # Hostname
    port: 5672 # Port
    virtual-host: / # Virtual host
    username: admin # Username
    password: admin # Password
```

Use `RabbitTemplate` to send messages:

```java
@RunWith(SpringRunner.class)
@SpringBootTest
public class SpringamqpTest {
    @Autowired
    private RabbitTemplate rabbitTemplate;
    @Test
    public void testSimpleQueue(){
        // Queue name
        String queueName = "hello.queue";
        // Message
        String msg = "Hello Spring ampq";
        // Send
        rabbitTemplate.convertAndSend(queueName,msg);
    }
}
```

#### Consumer (Receiving Messages)

Same `application.yml` config as above.

```yml
spring:
  rabbitmq:
    host: localhost # Hostname
    port: 5672 # Port
    virtual-host: / # Virtual host
    username: admin # Username
    password: admin # Password
```

Create a new `SpringRabbitListener` class:

```java
@Component
public class SpringRabbitListener {
    @RabbitListener(queues = "hello.queue")
    public void listenSimpleQueue(String msg){
        System.out.println("Received message: " + msg);
    }
}
```

### Work Queues (Task Queues)

Also known as Task Queues. This model can boost message processing speed and prevent queue buildup.

publisher -> queue -> consumer1 and consumer2 and ...

#### Publisher (Sending Messages)

Define a method to send 50 messages per second:

```java
public class SpringamqpTest {
    @Test
    public void testWorkQueue() throws InterruptedException {
        String queueName = "hello.queue";
        String msg = "Hello Spring ampq...";
        for (int i = 0; i < 50; i++) {
            rabbitTemplate.convertAndSend(queueName, msg + i);
            // Sleep 20ms, sending 50 messages per second
            Thread.sleep(20);
        }
    }
}
```

#### Consumer (Receiving Messages)

Create two consumers bound to the same queue:

```java
@Component
public class SpringRabbitListener {
    @RabbitListener(queues = "hello.queue")
    public void listenSimpleQueue1(String msg) throws InterruptedException {
        System.out.println("1 received message: " + msg);
        // Processes 40 messages per second
        Thread.sleep(25);
    }

    @RabbitListener(queues = "hello.queue")
    public void listenSimpleQueue2(String msg) throws InterruptedException {
        // Using System.err to output red messages
        System.err.println("2 received message: " + msg);
        // Processes 5 messages per second
        Thread.sleep(200);
    }
}
```

#### Testing

Run consumers first, then the publisher to send messages.

From the output, you'll see both consumers receive half the messages. This means messages are evenly distributed among consumers, without considering their processing capacity. Clearly, that's an issue.

#### Prefetch

Modify `application.yml` to set the `prefetch` value, which controls the prefetch message limit (default is unlimited).

```yml
spring:
  rabbitmq:
    host: localhost # Hostname
    port: 5672 # Port
    virtual-host: / # Virtual host
    username: admin # Username
    password: admin # Password
    listener:
      simple:
        # Only fetches one message at a time; must process it before fetching the next
        prefetch: 1
```

Retesting shows improved execution efficiency.

### Publish/Subscribe Model

The Publish/Subscribe model adds an exchange, allowing the same message to be sent to all subscribers.

publisher -> exchange -> queue1 and queue2
queue1 -> consumer1 and consumer2
queue2 -> consumer3

Common exchanges include:

- Fanout: Broadcast
- Direct: Routing
- Topic: Topic

> Exchanges route messages but don't store them. If routing fails, the message is lost.

#### Fanout (Broadcast)

A Fanout exchange broadcasts received messages to every bound queue.

In the consumer, create a config class to declare queues and exchanges:

```java
@Configuration
public class FanoutConfig {
    /**
     * Declare exchange
     * @return
     */
    @Bean
    public FanoutExchange fanoutExchange(){
        return new FanoutExchange("hello.fanout");
    }

    /**
     * First queue
     * @return
     */
    @Bean
    public Queue fanoutQueue1(){
        return new Queue("fanout.queue1");
    }

    /**
     * Bind first queue to exchange
     * @param fanoutQueue1
     * @param fanoutExchange
     * @return
     */
    @Bean
    public Binding bindingQueue1(Queue fanoutQueue1, FanoutExchange fanoutExchange){
        return BindingBuilder.bind(fanoutQueue1).to(fanoutExchange);
    }

    /**
     * Second queue
     * @return
     */
    @Bean
    public Queue fanoutQueue2(){
        return new Queue("fanout.queue2");
    }

    /**
     * Bind second queue to exchange
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

Message Sending

```java
public class SpringamqpTest {    
    @Test
    public void testFanoutExchange(){
        // Exchange
        String exchangeName = "hello.fanout";
        // Message
        String msg = "hello, everyone";
        rabbitTemplate.convertAndSend(exchangeName,"",msg);
    }
}
```

The empty `routingkey` in the middle will be used in the next two models.

Message Reception

```java
@Component
public class SpringRabbitListener {
    @RabbitListener(queues = "fanout.queue1")
    public void listenFanoutQueue1(String msg){
        System.out.println("Fanout1 received message: " + msg);
    }
    @RabbitListener(queues = "fanout.queue2")
    public void listenFanoutQueue2(String msg){
        System.out.println("Fanout2 received message: " + msg);
    }
}
```

#### Direct (Routing)

A Direct Exchange routes received messages to specific queues based on rules, hence 'routing mode'.

Queues bind to exchanges with a `Routingkey`. Senders must also specify the message's `Routingkey`. Messages are only received if the queue's `Routingkey` and the message's `Routingkey` match exactly.

Here, we'll use annotations to declare queues and exchanges, no config class needed.

```java
@Component
public class SpringRabbitListener {
    @RabbitListener(bindings = @QueueBinding(
            value = @Queue(name = "direct.queue1"),
//            exchange = @Exchange(name = "hello.direct", type = ExchangeTypes.DIRECT),
//            Since the default type is Direct, it can be omitted
            exchange = @Exchange(name = "hello.direct"),
            key = {"red","warma"}
    ))
    public void listenDirectQueue1(String msg){
        System.out.println("1 received message: " + msg);
    }

    @RabbitListener(bindings = @QueueBinding(
            value = @Queue(name = "direct.queue2"),
            exchange = @Exchange(name = "hello.direct"),
            key = {"red","aqua"}
    ))
    public void listenDirectQueue2(String msg){
        System.out.println("2 received message: " + msg);
    }
}
```

Sender

```java
public class SpringamqpTest {    
    @Test
    public void testDirectExchange(){
        // Exchange
        String exchangeName = "hello.direct";
        // Message
        String msg = "hello, aqua";
        rabbitTemplate.convertAndSend(exchangeName,"aqua",msg);
    }
}
```

In the example above, only Consumer 2 receives the message. If the routing key was "red", both would receive it.

#### Topic

TopicExchange is similar to DirectExchange, but its routingKey must be a list of multiple words, separated by `.`.

When queues and exchanges specify a BindingKey, wildcards can be used:

- `#`: Matches one or more words.
- `*`: Matches only one word.

Receiver

```java
@Component
public class SpringRabbitListener {
    @RabbitListener(bindings = @QueueBinding(
            value = @Queue("topic.queue1"),
            exchange = @Exchange(name = "hello.topic", type = ExchangeTypes.TOPIC),
            key = "#.news"
    ))
    public void listenTopicQueue1(String msg){
        System.out.println("1 received message: " + msg);
    }
    @RabbitListener(bindings = @QueueBinding(
            value = @Queue("topic.queue2"),
            exchange = @Exchange(name = "hello.topic", type = ExchangeTypes.TOPIC),
            key = "china.#"
    ))
    public void listenTopicQueue2(String msg){
        System.out.println("2 received message: " + msg);
    }
}
```

Message Sending

```java
public class SpringamqpTest {    
    @Test
    public void testTopicExchange(){
        // Exchange
        String exchangeName = "hello.topic";
        // Message
        String msg = "news for China";
        rabbitTemplate.convertAndSend(exchangeName,"china.news",msg);
    }
}
```

In the example above, both 1 and 2 can receive.

```java
public class SpringamqpTest {    
    @Test
    public void testTopicExchange(){
        // Exchange
        String exchangeName = "hello.topic";
        // Message
        String msg = "news for Japan";
        rabbitTemplate.convertAndSend(exchangeName,"japan.news",msg);
    }
}
```

Only 1 can receive.

## Message Converters

Spring serializes messages to bytes before sending them to MQ, and deserializes bytes back to Java objects when receiving. By default, Spring uses JDK serialization, which results in large data volume, security vulnerabilities, and poor readability.

We can use JSON for serialization and deserialization.

First, add the dependency in the parent project:

```xml
<!-- JSON converter -->
<dependency>
    <groupId>com.fasterxml.jackson.dataformat</groupId>
    <artifactId>jackson-dataformat-xml</artifactId>
    <version>2.9.10</version>
</dependency>
```

Just declare a bean in both the consumer and receiver:

```java
@Bean
public MessageConverter jsonMessageConverter(){
    return new Jackson2JsonMessageConverter();
}
```
