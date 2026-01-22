---
slug: 217
title: 'SpringAMQP'
# draft: true
author: yexca
date: '2025-01-15T17:03:32+09:00'
categories:
    - 技術学習
tags:
    - バックエンド技術
    - SpringCloud
---

{{< notice >}} この記事は gemini-2.5-flash によって翻訳されました {{< /notice >}}

## MQについて知るきっかけ

### 同期呼び出し

マイクロサービス間のFeignを使った呼び出しは同期方式で、いくつか問題があるんだ。

例えば、支払いサービスを開発するとして、注文サービスや倉庫サービスのコードを追加する必要があるよね。後でSMSサービスやポイントサービスを追加しようとしたら、その都度支払いコードを修正しなきゃいけない。これは[オープン・クローズドの原則](https://blog.yexca.net/ja/archives/93#%E3%82%AA%E3%83%96%E3%82%B8%E3%82%A7%E3%82%AF%E3%83%88%E6%8C%87%E5%90%91%E8%A8%AD%E8%A8%88%E3%81%AE%E5%8E%9F%E5%89%87)に反するし、リクエストが返ってくるまで他のことができないからパフォーマンスの無駄にもなるよ。

問題点は、結合度が高いこと、パフォーマンスが落ちること、リソースの無駄遣い、そしてカスケード障害（もしプロバイダに問題が起きると、それを呼び出す全てのサービスも巻き込まれて、ドミノ倒しのようにあっという間にマイクロサービス全体がダウンしちゃう）だね。

### 非同期呼び出しの解決策

非同期呼び出しの一般的な実装は、イベント駆動型パターンだよ。

ユーザーの支払いリクエスト -> 支払いサービス -> Broker。その後、支払いサービスが完了して応答し、Brokerが注文サービス、倉庫サービス、SMSサービスに通知する仕組みだ。

利点：サービスの疎結合化、パフォーマンス向上、スループットの向上、サービス間の強い依存関係がなくなり、障害分離が可能になる。あと、トラフィックのピークを緩和できるのもいいね。

欠点：Brokerの信頼性、安全性、スループット能力に依存すること。アーキテクチャが複雑になるし、ビジネスフローが明確じゃないから追跡や管理が難しくなるよ。

### MQ (メッセージキュー)

MessageQueue、メッセージキュー。文字通りメッセージを格納するキューのことで、イベント駆動型アーキテクチャにおけるBrokerの役割を果たすんだ。

| | **RabbitMQ** | **ActiveMQ** | **RocketMQ** | **Kafka** |
|---|---|---|---|---|
| 企業/コミュニティ | Rabbit | Apache | アリババ | Apache |
| 開発言語 | Erlang | Java | Java | Scala&Java |
| プロトコルサポート | AMQP，XMPP，SMTP，STOMP | OpenWire,STOMP，REST,XMPP,AMQP | 独自プロトコル | 独自プロトコル |
| 可用性 | 高い | 普通 | 高い | 高い |
| 単一サーバーのスループット | 普通 | 悪い | 高い | 非常に高い |
| メッセージ遅延 | マイクロ秒レベル | ミリ秒レベル | ミリ秒レベル | ミリ秒以内 |
| メッセージ信頼性 | 高い | 普通 | 高い | 普通 |

可用性を重視するなら：Kafka、RocketMQ、RabbitMQ

信頼性を重視するなら：RabbitMQ、RocketMQ

スループット能力を重視するなら：RocketMQ、Kafka

メッセージの低遅延を重視するなら：RabbitMQ、Kafka

## RabbitMQのインストール

[公式サイト](https://www.rabbitmq.com/download.html)を見ると色々なインストール方法があるけど、僕はDockerを使ってオンラインでプルするよ。

```bash
docker pull rabbitmq:3-management
```

実行コマンド

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

<localhost:15672>にアクセスすれば管理画面が開くよ。RabbitMQのいくつかの概念を説明するね：

- channel：MQを操作するためのツール
- exchange：交換機。メッセージをキューにルーティングするよ。
- queue：キュー。メッセージを保存するところ。
- virtualHost：仮想ホスト。キューや交換機などのリソースを論理的にグループ化したもの。

## メッセージモデル

[公式サイト](https://www.rabbitmq.com/getstarted.html)には色々なデモが提供されていて、それぞれ異なるメッセージモデルに対応しているよ。

- 基本メッセージキュー (BasicQueue)：["Hello World!"](https://www.rabbitmq.com/tutorials/tutorial-one-python.html)
- ワークメッセージキュー (WorkQueue)：[Work Queues](https://www.rabbitmq.com/tutorials/tutorial-two-python.html)
- パブリッシュ/サブスクライブモデル
  - Fanout Exchange：ブロードキャスト [Publish/Subscribe](https://www.rabbitmq.com/tutorials/tutorial-three-python.html)
  - Direct Exchange：ルーティング [Routing](https://www.rabbitmq.com/tutorials/tutorial-four-python.html)
  - Topic Exchange：トピック [Topics](https://www.rabbitmq.com/tutorials/tutorial-five-python.html)

### ハローワールド

Publisher -> Queue -> Consumer

- publisher：メッセージ発行者。メッセージをキューに送るよ。
- queue：メッセージキュー。メッセージを受け取ってキャッシュする役割。
- consumer：キューを購読して、キュー内のメッセージを処理するよ。

発行者

```java
public class PublisherTest {
    @Test
    public void testSendMessage() throws IOException, TimeoutException {
        // 1.接続を確立
        ConnectionFactory factory = new ConnectionFactory();
        // 1.1.接続パラメータを設定 (ホスト名、ポート番号、vhost、ユーザー名、パスワード)
        factory.setHost("localhost");
        factory.setPort(5672);
        factory.setVirtualHost("/");
        factory.setUsername("admin");
        factory.setPassword("admin");
        // 1.2.接続を確立
        Connection connection = factory.newConnection();

        // 2.チャネルChannelを作成
        Channel channel = connection.createChannel();

        // 3.キューを作成
        String queueName = "hello.queue";
        channel.queueDeclare(queueName, false, false, false, null);

        // 4.メッセージを送信
        String message = "hello, rabbitmq!";
        channel.basicPublish("", queueName, null, message.getBytes());
        System.out.println("メッセージ送信成功：【" + message + "】");

        // 5.チャネルと接続をクローズ
        channel.close();
        connection.close();

    }
}
```

受信者

```java
public class ConsumerTest {
    public static void main(String[] args) throws IOException, TimeoutException {
        // 1.接続を確立
        ConnectionFactory factory = new ConnectionFactory();
        // 1.1.接続パラメータを設定 (ホスト名、ポート番号、vhost、ユーザー名、パスワード)
        factory.setHost("localhost");
        factory.setPort(5672);
        factory.setVirtualHost("/");
        factory.setUsername("admin");
        factory.setPassword("admin");
        // 1.2.接続を確立
        Connection connection = factory.newConnection();

        // 2.チャネルChannelを作成
        Channel channel = connection.createChannel();

        // 3.キューを作成
        String queueName = "hello.queue";
        channel.queueDeclare(queueName, false, false, false, null);

        // 4.メッセージを購読
        channel.basicConsume(queueName, true, new DefaultConsumer(channel){
            @Override
            public void handleDelivery(String consumerTag, Envelope envelope,
                                       AMQP.BasicProperties properties, byte[] body) throws IOException {
                // 5.メッセージを処理
                String message = new String(body);
                System.out.println("メッセージを受信しました：【" + message + "】");
            }
        });
        System.out.println("メッセージの受信を待機中。。。。");
    }
}
```

コンソール出力：

```markdown
メッセージの受信を待機中。。。。
メッセージを受信しました：【hello, rabbitmq!】
```

明らかにこの方法は少し手間がかかるよね。

## SpringAMQP

[SpringAMQP](https://spring.io/projects/spring-amqp)はRabbitMQを基盤にラップされたテンプレート集で、SpringBootを利用して自動構成も実現されているから、すごく便利に使えるんだ。

- AMQP

Advanced Message Queuing Protocolのことで、アプリケーション間でビジネスメッセージをやり取りするためのオープンスタンダードだよ。このプロトコルは言語やプラットフォームに依存しないから、マイクロサービスにおける独立性の要求にもっと合致しているんだ。

- Spring AMQP

Spring AMQPはAMQPプロトコルに基づいて定義されたAPI仕様で、メッセージを送受信するためのテンプレートを提供しているよ。spring-amqpが基本的な抽象化、spring-rabbitがその基盤となるデフォルト実装だね。

これはキューや交換機、そのバインディング関係を自動で宣言してくれるし、アノテーションベースのリスナーパターンで非同期にメッセージを受け取れるんだ。

### Basic Queue (シンプルなキューモデル)

まずは親プロジェクトで依存関係を導入しよう。

```xml
<!--AMQP依存関係、RabbitMQを含む-->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-amqp</artifactId>
</dependency>
```

#### publisher (メッセージ送信)

application.ymlを設定しよう。

```yml
spring:
  rabbitmq:
    host: localhost # ホスト名
    port: 5672 # ポート
    virtual-host: / # 仮想ホスト
    username: admin # ユーザー名
    password: admin # パスワード
```

RabbitTemplateを使ってメッセージ送信を実装するよ。

```java
@RunWith(SpringRunner.class)
@SpringBootTest
public class SpringamqpTest {
    @Autowired
    private RabbitTemplate rabbitTemplate;
    @Test
    public void testSimpleQueue(){
        // キュー名
        String queueName = "hello.queue";
        // メッセージ
        String msg = "Hello Spring ampq";
        // 送信
        rabbitTemplate.convertAndSend(queueName,msg);
    }
}
```

#### consumer (メッセージ受信)

application.ymlの設定は上記と同じだよ。

```yml
spring:
  rabbitmq:
    host: localhost # ホスト名
    port: 5672 # ポート
    virtual-host: / # 仮想ホスト
    username: admin # ユーザー名
    password: admin # パスワード
```

新しいクラス SpringRabbitListener を作成するよ。

```java
@Component
public class SpringRabbitListener {
    @RabbitListener(queues = "hello.queue")
    public void listenSimpleQueue(String msg){
        System.out.println("受信したメッセージは：" + msg);
    }
}
```

### WorkQueue (ワークメッセージキュー)

TaskQueueとも呼ばれていて、タスクモデルだよ。メッセージ処理速度を上げて、キューにメッセージが溜まるのを防ぐことができるんだ。

publisher -> queue -> consumer1 and consumer2 and ...

#### publisher (メッセージ送信)

1秒間に50件のメッセージを送るメソッドを定義するね。

```java
public class SpringamqpTest {
    @Test
    public void testWorkQueue() throws InterruptedException {
        String queueName = "hello.queue";
        String msg = "Hello Spring ampq...";
        for (int i = 0; i < 50; i++) {
            rabbitTemplate.convertAndSend(queueName, msg + i);
            // 20ミリ秒スリープ、1秒間に50件のメッセージを送信
            Thread.sleep(20);
        }
    }
}
```

#### consumer (メッセージ受信)

同じキューに2つのコンシューマーをバインドするよ。

```java
@Component
public class SpringRabbitListener {
    @RabbitListener(queues = "hello.queue")
    public void listenSimpleQueue1(String msg) throws InterruptedException {
        System.out.println("1が受信したメッセージは：" + msg);
        // 1秒間に40件のメッセージを処理
        Thread.sleep(25);
    }

    @RabbitListener(queues = "hello.queue")
    public void listenSimpleQueue2(String msg) throws InterruptedException {
        // errで赤色メッセージを出力
        System.err.println("2が受信したメッセージは：" + msg);
        // 1秒間に5件のメッセージを処理
        Thread.sleep(200);
    }
}
```

#### テスト

まず受信者を起動して、それから送信者を起動してメッセージを送ってみよう。

出力結果を見ると、2つの受信者がそれぞれ半分のメッセージを受け取っているね。つまり、メッセージは各コンシューマーに均等に分配されていて、コンシューマーの処理能力は考慮されていないんだ。これだと明らかに問題があるよね。

#### prefetch

application.ymlファイルを修正して、`prefetch`の値を設定するよ。これでプリフェッチするメッセージの上限（デフォルトは無限）を制御できるんだ。

```yml
spring:
  rabbitmq:
    host: localhost # ホスト名
    port: 5672 # ポート
    virtual-host: / # 仮想ホスト
    username: admin # ユーザー名
    password: admin # パスワード
    listener:
      simple:
        # 毎回1つのメッセージしか取得できず、処理が完了してから次のメッセージを取得する
        prefetch: 1
```

もう一度テストしてみると、実行効率が上がっているのがわかるよ。

### パブリッシュ/サブスクライブモデル

パブリッシュ/サブスクライブモデルは交換機（Exchange）が加わって、同じメッセージを全ての受信者に送ることができるんだ。

publisher -> exchange -> queue1 and queue2
queue1 -> consumer1 and consumer2
queue2 -> consumer3

よく使われるExchangeはこれらだよ。

- Fanout：ブロードキャスト
- Direct：ルーティング
- Topic：トピック

> Exchangeはルーティングを担当するだけで、メッセージは保存しないよ。だから、ルーティングに失敗するとメッセージは失われちゃうんだ。

#### Fanout (扇出) ブロードキャスト

Fanout Exchangeは受け取ったメッセージを、それにバインドされている全てのキューにブロードキャストするよ。

受信者側で設定クラスを作って、キューとExchangeを宣言しよう。

```java
@Configuration
public class FanoutConfig {
    /**
     * 交換機を宣言
     * @return
     */
    @Bean
    public FanoutExchange fanoutExchange(){
        return new FanoutExchange("hello.fanout");
    }

    /**
     * 最初のキュー
     * @return
     */
    @Bean
    public Queue fanoutQueue1(){
        return new Queue("fanout.queue1");
    }

    /**
     * 最初のキューと交換機をバインド
     * @param fanoutQueue1
     * @param fanoutExchange
     * @return
     */
    @Bean
    public Binding bindingQueue1(Queue fanoutQueue1, FanoutExchange fanoutExchange){
        return BindingBuilder.bind(fanoutQueue1).to(fanoutExchange);
    }

    /**
     * 2番目のキュー
     * @return
     */
    @Bean
    public Queue fanoutQueue2(){
        return new Queue("fanout.queue2");
    }

    /**
     * 2番目のキューと交換機をバインド
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

メッセージ送信

```java
public class SpringamqpTest {    
    @Test
    public void testFanoutExchange(){
        // 交換機
        String exchangeName = "hello.fanout";
        // メッセージ
        String msg = "hello, everyone";
        rabbitTemplate.convertAndSend(exchangeName,"",msg);
    }
}
```

真ん中が空になっている `routingkey` は、次の2つのモデルで使うよ。

メッセージの受信

```java
@Component
public class SpringRabbitListener {
    @RabbitListener(queues = "fanout.queue1")
    public void listenFanoutQueue1(String msg){
        System.out.println("Fanout1がメッセージを受信：" + msg);
    }
    @RabbitListener(queues = "fanout.queue2")
    public void listenFanoutQueue2(String msg){
        System.out.println("Fanout2がメッセージを受信：" + msg);
    }
}
```

#### Direct (ルーティング)

Direct Exchangeは、受け取ったメッセージをルールに基づいて指定されたキューにルーティングするから、ルーティングモードって呼ばれるんだ。

キューとExchangeのバインドには `Routingkey` を指定する必要があるよ。送信側もメッセージを送るときに `Routingkey` を指定しなきゃいけないんだ。キューの `Routingkey` とメッセージの `Routingkey` が完全に一致した場合だけ、メッセージが受信されるよ。

ここではアノテーションベースでキューとExchangeを宣言するから、設定クラスは不要だよ。

```java
@Component
public class SpringRabbitListener {
    @RabbitListener(bindings = @QueueBinding(
            value = @Queue(name = "direct.queue1"),
//            exchange = @Exchange(name = "hello.direct", type = ExchangeTypes.DIRECT),
//            デフォルトでDirectタイプなので指定は不要
            exchange = @Exchange(name = "hello.direct"),
            key = {"red","warma"}
    ))
    public void listenDirectQueue1(String msg){
        System.out.println("1がメッセージを受信：" + msg);
    }

    @RabbitListener(bindings = @QueueBinding(
            value = @Queue(name = "direct.queue2"),
            exchange = @Exchange(name = "hello.direct"),
            key = {"red","aqua"}
    ))
    public void listenDirectQueue2(String msg){
        System.out.println("2がメッセージを受信：" + msg);
    }
}
```

送信者

```java
public class SpringamqpTest {    
    @Test
    public void testDirectExchange(){
        // 交換機
        String exchangeName = "hello.direct";
        // メッセージ
        String msg = "hello, aqua";
        rabbitTemplate.convertAndSend(exchangeName,"aqua",msg);
    }
}
```

上の例だと受信者2しかメッセージを受け取れないけど、もし`routingkey`が`red`なら両方ともメッセージを受け取れるよ。

#### Topic (トピック)

Topic ExchangeはDirect Exchangeと似ているけど、違いは`routingKey`が複数の単語のリストで、`．`で区切られていることだね。

キューとExchangeでBindingKeyを指定する時に、ワイルドカードが使えるよ。

- `#`：1つ以上の単語にマッチ
- `*`：1つの単語にのみマッチ

受信者

```java
@Component
public class SpringRabbitListener {
    @RabbitListener(bindings = @QueueBinding(
            value = @Queue("topic.queue1"),
            exchange = @Exchange(name = "hello.topic", type = ExchangeTypes.TOPIC),
            key = "#.news"
    ))
    public void listenTopicQueue1(String msg){
        System.out.println("1がメッセージを受信：" + msg);
    }
    @RabbitListener(bindings = @QueueBinding(
            value = @Queue("topic.queue2"),
            exchange = @Exchange(name = "hello.topic", type = ExchangeTypes.TOPIC),
            key = "china.#"
    ))
    public void listenTopicQueue2(String msg){
        System.out.println("2がメッセージを受信：" + msg);
    }
}
```

メッセージ送信

```java
public class SpringamqpTest {    
    @Test
    public void testTopicExchange(){
        // 交換機
        String exchangeName = "hello.topic";
        // メッセージ
        String msg = "news for China";
        rabbitTemplate.convertAndSend(exchangeName,"china.news",msg);
    }
}
```

上の例だと1と2の両方が受け取れるよ。

```java
public class SpringamqpTest {    
    @Test
    public void testTopicExchange(){
        // 交換機
        String exchangeName = "hello.topic";
        // メッセージ
        String msg = "news for Japan";
        rabbitTemplate.convertAndSend(exchangeName,"japan.news",msg);
    }
}
```

1だけが受け取れるよ。

## メッセージ変換器

Springは送信するメッセージをバイト列にシリアライズしてMQに送り、メッセージを受け取る時はバイト列をJavaオブジェクトにデシリアライズするんだ。ただ、デフォルトだとSpringが使うシリアライズ方法はJDKシリアライズで、データサイズが大きすぎたり、セキュリティ上の脆弱性があったり、可読性が低かったりするんだよね。

JSON方式を使ってシリアライズとデシリアライズをすることもできるよ。

まずは親プロジェクトで依存関係を導入しよう。

```xml
<!-- JSON変換器 -->
<dependency>
    <groupId>com.fasterxml.jackson.dataformat</groupId>
    <artifactId>jackson-dataformat-xml</artifactId>
    <version>2.9.10</version>
</dependency>
```

コンシューマーとレシーバーでBeanを宣言するだけでいいんだ。

```java
@Bean
public MessageConverter jsonMessageConverter(){
    return new Jackson2JsonMessageConverter();
}
```
