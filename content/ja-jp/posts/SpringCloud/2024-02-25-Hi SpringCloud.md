---
slug: 158
# layout: post
title: 'Hi SpringCloud'
author: yexca
date: 2024-02-25T17:56:54+08:00
lastmod: 2025-02-05T17:13:54+09:00
# permalink: /archives/158
categories:
    - 技術研修
tags:
    - バックエンド
    - SpringBoot
--- 

## サービスアーキテクチャ

### モノリシックアーキテクチャ

すべてのビジネス機能を1つのプロジェクトで開発し、展開用に1つのパッケージにパッケージ化します。

利点: シンプルなアーキテクチャ、スケーラビリティが低い、導入コストが低い、小規模プロジェクトに適している

デメリット: 結合度が高い

### 分散アーキテクチャ

システムは業務機能ごとに分割されており、各業務モジュールはサービスと呼ばれる独立したプロジェクトとして開発されている。

利点: サービスの結合を減らし、サービスのアップグレードと拡張を容易にする

デメリット: 複雑なアーキテクチャ、使いにくい、大規模なインターネットプロジェクトに適している

### マイクロサービス

マイクロサービスは、適切に設計された分散アーキテクチャ ソリューションです。マイクロサービス アーキテクチャの特徴:

* [単一責任](https://blog.yexca.net/ja/archives/93#%E3%82%AA%E3%83%96%E3%82%B8%E3%82%A7%E3%82%AF%E3%83%88%E6%8C%87%E5%90%91%E8%A8%AD%E8%A8%88%E3%81%AE%E5%8E%9F%E5%89%87): マイクロサービスはより細かい粒度に分割されます。各サービスは固有のビジネス機能に対応しており、単一責任を実現し、重複したビジネス開発を回避します。
* サービス指向: マイクロサービスはビジネスインターフェースを外部に公開します
* 自律性: チームの独立性、テクノロジーの独立性、データの独立性、展開の独立性
* 強力な分離: サービス呼び出しは分離され、フォールトトレラントであり、連鎖的な問題を回避するためにダウングレードされます。

## マイクロサービス技術

マイクロサービス ソリューションには技術フレームワークの実装が必要です。最も一般的なものは次のとおりです。

|                        | Dubbo                 | SpringCloud               | SpringCloudAlibaba        |
| ---------------------- | --------------------- | ------------------------- | ------------------------- |
| 登録センター           | zookeeper、 Redis     | Eureka、 Consul           | Nacos、 Eureka            |
| リモートサービスコール | Dubbo プロトコル      | Feign (http プロトコル)   | Dubbo、Feign              |
| 構成センター           | 无                    | SpringCloudConfig         | SpringCloudConfig、 Nacos |
| サービスゲートウェイ   | 无                    | SpringCloudGateway、 Zuul | SpringCloudGateway、 Zuul |
| サービスの監視と保護   | dubbo-admin，弱い機能 | Hystix                    | Sentinel                  |

マイクロサービスはビジネスモジュールに応じて分割する必要がある

* 単一責任: 異なるマイクロサービスに対して同じビジネスを繰り返し開発しない
* データの独立性: 他のマイクロサービスのデータベースにアクセスしない
* サービス指向: 独自のビジネスを他のマイクロサービスが呼び出すためのインターフェースとして公開する

## SpringCloud

SpringCloud は現在最も広く使用されているマイクロサービス フレームワークです。さまざまなマイクロサービス機能コンポーネントを統合し、SpringBoot に基づいてこれらのコンポーネントの自動アセンブリを実装します。

公式サイト: <https://spring.io/projects/spring-cloud/>

* サービス登録と検出: Eureka、Nacos、Consul
* 統合構成管理: SpringCloudConfig、Nacos
* リモートサービスコール: OpenFeign、Dubbo
* 統合ゲートウェイルーティング: SpringCloudGateway、Zuul
* サービスリンク監視: Zipkin、Sleuth
* フロー制御、劣化、保護: Hystix、Sentinel

## マイクロサービス呼び出し

要件: 注文 ID に基づいて注文を照会する場合、注文が属するユーザー情報を返します。

### RestTemplate を登録する

```java
@Bean
public RestTemplate restTemplate(){
    return new RestTemplate();
}
```

### サービスリモート呼び出し RestTemplate

```java
@Service
public class OrderService {

    @Autowired
    private OrderMapper orderMapper;
    @Autowired
    private RestTemplate restTemplate;

    public Order queryOrderById(Long orderId) {
        // 1.注文をクエリ
        Order order = orderMapper.findById(orderId);
        // 2.ユーザーをクエリ
        String url = "http://localhost:8081/user/" + order.getUserId();
        // RestTemplateのGETメソッド
        User user = restTemplate.getForObject(url, User.class);
        // 3.ユーザー情報をカプセル化する
        order.setUser(user);
        // 4.戻る
        return order;
    }
}
```
