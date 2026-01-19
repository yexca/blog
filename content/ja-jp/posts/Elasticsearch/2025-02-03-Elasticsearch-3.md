---
slug: 228
title: 'Elasticsearch RestClient 入門'
# draft: true
author: yexca
date: '2025-02-03T22:30:00+09:00'
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
> | 内容                   | リンク                                |
> | :--------------------- | :------------------------------------ |
> | Elasticsearch 基本操作 | <https://blog.yexca.net/archives/226> |
> | Elasticsearch クエリ操作 | <https://blog.yexca.net/archives/227> |
> | RestClient 基本操作 | 本文 |
> | RestClient クエリ操作 | <https://blog.yexca.net/archives/229> |
> | Elasticsearch データ集計 | <https://blog.yexca.net/archives/231> |
> | Elasticsearch オートコンプリート | <https://blog.yexca.net/archives/232> |
> | Elasticsearch データ同期 | <https://blog.yexca.net/archives/234> |
> | Elasticsearch クラスター | <https://blog.yexca.net/archives/235> |

ESの公式は、ESを操作するための様々な言語のクライアントを提供しているんだ。これらのクライアントの核は、DSLステートメントを組み立てて、HTTPリクエストを通じてESに送信することだよ。

公式ドキュメント：<https://www.elastic.co/guide/en/elasticsearch/client/index.html>

以下では、Java HighLevel Rest Client のクライアントAPIを使うよ。

## インデックスの作成

データベースのテーブル構造はこんな感じ。

```sql
`id` bigint(20) NOT NULL COMMENT 'ホテルID',
`name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT 'ホテル名',
`address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT 'ホテル住所',
`price` int(10) NOT NULL COMMENT 'ホテル価格',
`score` int(2) NOT NULL COMMENT 'ホテル評価',
`brand` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT 'ホテルブランド',
`city` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '所在都市',
`star_name` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT 'ホテル星評価、1つ星から5つ星、1つダイヤモンドから5つダイヤモンド',
`business` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT 'ビジネスエリア',
`latitude` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '緯度',
`longitude` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '経度',
`pic` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT 'ホテル画像',
PRIMARY KEY (`id`) USING BTREE
```

インデックス作成で一番大事なのはマッピングだよ。考慮すべき点は以下だね。

*   フィールド名、フィールドデータ型（データベーステーブル構造の名前と型を参考にしてね）
*   検索に参加させるか（ビジネス要件に基づいて判断する。例えば、画像URLは検索不要だよね）
*   分かち書きが必要か（内容による。例えば、都市は分かち書き不要だよ）
*   分かち書きアナライザーは何か（ik_max_wordで統一してもいいよ）

上記の表の例：

```json
# インデックスを作成
PUT /hotel
{
  "mappings": {
    "properties": {
      "id": {
        "type": "keyword"
      },
      "name": {
        "type": "text",
        "analyzer": "ik_max_word",
        "copy_to": "all"
        /* 現在のフィールドを指定されたフィールド "all" にコピーする */
      },
      "address": {
        "type": "keyword",
        "index": false
      },
      "price": {
        "type": "integer"
      },
      "score": {
        "type": "integer"
      },
      "brand": {
        "type": "keyword",
        "copy_to": "all"
      },
      "city": {
        "type": "keyword",
        "copy_to": "all"
      },
      "starName": {
        "type": "keyword"
      },
      "business": {
        "type": "keyword"
      },
      "location": {
        "type": "geo_point"
        /* ESは2種類の地理座標データ型をサポートしているよ */
      },
      "pic": {
        "type": "keyword",
        "index": false
      },
      "all": {
        /* 結合フィールド。クエリ結果には表示されないけど、クエリには使えるよ */
        "type": "text",
        "analyzer": "ik_max_word"
      }
    }
  }
}
```

地理座標データ型：

*   geo_point：緯度 (latitude) と経度 (longitude) で決定される点のこと。例えば `"32.84 120.25"` だね。
*   geo_shape：複数の geo_point で構成される複雑な幾何学図形のこと。例えば直線 `"LINESTRING(-77.03 38.29, +77.00 38.88)"` みたいにね。

## RestClient の初期化

Elasticsearchとのすべてのインタラクションは、RestHighLevelClientというクラスにカプセル化されているよ。

まず、ESのRestHighLevelClientの依存関係を導入するよ。

```xml
<dependency>
    <groupId>org.elasticsearch.client</groupId>
    <artifactId>elasticsearch-rest-high-level-client</artifactId>
</dependency>
```

SpringBootのデフォルトESバージョンは7.6.2だから、デフォルトのESバージョンを上書きする必要があるんだ。

```xml
<properties>
    <java.version>1.8</java.version>
    <elasticsearch.version>7.12.1</elasticsearch.version>
</properties>
```

RestHighLevelClientの初期化コードはこんな感じ。

```java
RestHighLevelClient client = new RestHighLevelClient(RestClient.builder(
        HttpHost.create("http://IP:9200")
));
```

でも、テストの便宜のために、初期化コードは`@BeforeEach`に置くよ。

```java
public class HotelIndexTest {
    private RestHighLevelClient client;

    @BeforeEach
    void setUp() {
        client = new RestHighLevelClient(RestClient.builder(
                        HttpHost.create("http://127.0.0.1:9200")));
    }

    @AfterEach
    void tearDown() throws IOException {
        this.client.close();
    }
}
```

インデックスを定義するにはDSLステートメントのJSON部分が必要だから、これは別途抽出できるよ。

```java
public class HotelContants {
    public static final String MAPPING_TEMPLATE = "{\n" +
            "  \"mappings\": {\n" +
            "    \"properties\": {\n" +
            "      \"id\": {\n" +
            "        \"type\": \"keyword\"\n" +
            "      },\n" +
            "      \"name\": {\n" +
            "        \"type\": \"text\",\n" +
            "        \"analyzer\": \"ik_max_word\",\n" +
            "        \"copy_to\": \"all\"\n" +
            "      },\n" +
            "      \"address\": {\n" +
            "        \"type\": \"keyword\",\n" +
            "        \"index\": false\n" +
            "      },\n" +
            "      \"price\": {\n" +
            "        \"type\": \"integer\"\n" +
            "      },\n" +
            "      \"score\": {\n" +
            "        \"type\": \"integer\"\n" +
            "      },\n" +
            "      \"brand\": {\n" +
            "        \"type\": \"keyword\",\n" +
            "        \"copy_to\": \"all\"\n" +
            "      },\n" +
            "      \"city\": {\n" +
            "        \"type\": \"keyword\",\n" +
            "        \"copy_to\": \"all\"\n" +
            "      },\n" +
            "      \"starName\": {\n" +
            "        \"type\": \"keyword\"\n" +
            "      },\n" +
            "      \"business\": {\n" +
            "        \"type\": \"keyword\"\n" +
            "      },\n" +
            "      \"location\": {\n" +
            "        \"type\": \"geo_point\"\n" +
            "      },\n" +
            "      \"pic\": {\n" +
            "        \"type\": \"keyword\",\n" +
            "        \"index\": false\n" +
            "      },\n" +
            "      \"all\": {\n" +
            "        \"type\": \"text\",\n" +
            "        \"analyzer\": \"ik_max_word\"\n" +
            "      }\n" +
            "    }\n" +
            "  }\n" +
            "}";
}
```

インデックス作成コード

```java
// 注意CreateIndexRequestのパッケージ
import org.elasticsearch.client.indices.CreateIndexRequest;

@Test
void testCreateHotelIndex() throws IOException {
    // Requestオブジェクトを作成
    CreateIndexRequest request = new CreateIndexRequest("hotel");
    // リクエストパラメータ
    request.source(MAPPING_TEMPLATE, XContentType.JSON);
    // リクエストを送信
    client.indices().create(request, RequestOptions.DEFAULT);
}
```

## インデックスの削除

DSLステートメント

```json
DELETE /hotel
```

作成コードとの違いは、Requestオブジェクトだけ。パラメータもないんだ。

```java
@Test
void testDeleteHotelIndex() throws IOException {
    // リクエストを作成
    DeleteIndexRequest request = new DeleteIndexRequest("hotel");
    // リクエストを送信
    client.indices().delete(request, RequestOptions.DEFAULT);
}
```

## インデックスの存在確認

DSLステートメント

```json
GET /hotel
```

違いはやっぱりRequestオブジェクトだよ。

```java
@Test
void testExistsHotelIndex() throws IOException {
    // リクエストを作成
    GetIndexRequest request = new GetIndexRequest("hotel");
    // リクエストを送信
    boolean exists = client.indices().exists(request, RequestOptions.DEFAULT);
    // 出力
    System.out.println(exists);
}
```

> **まとめ**
>
> JavaRestClientでESを操作する流れは基本的に似てるよ。`client.indices()` メソッドを使ってインデックス操作オブジェクトを取得するんだ。

## RestClient

通常、データはデータベースで、データベースクエリを通じてインデックスのCRUD操作を行うよ。

RestHighLevelClient の初期化

```java
@SpringBootTest
public class HotelDocumentTest {
    // サービスを注入
    @Autowired
    private IHotelService hotelService;

    private RestHighLevelClient client;

    @BeforeEach
    void setUp() {
        // RestClient を構築
        this.client = new RestHighLevelClient(
                RestClient.builder(
                        HttpHost.create("http://127.0.0.1:9200")));
    }

    @AfterEach
    void tearDown() throws IOException {
        this.client.close();
    }
}
```

## ドキュメントの追加

データベースからデータをクエリして、ESに書き込むよ。

### 構造の調整

データベースクエリの結果はHotel型のオブジェクトだよ。

```java
@Data
@TableName("tb_hotel")
public class Hotel {
    @TableId(type = IdType.INPUT)
    private Long id;
    private String name;
    private String address;
    private Integer price;
    private Integer score;
    private String brand;
    private String city;
    private String starName;
    private String business;
    private String longitude;
    private String latitude;
    private String pic;
}
```

インデックスの構造とは違うから、インデックスと同じ構造の新しい型を定義する必要があるんだ。

```java
@Data
@NoArgsConstructor
public class HotelDoc {
    private Long id;
    private String name;
    private String address;
    private Integer price;
    private Integer score;
    private String brand;
    private String city;
    private String starName;
    private String business;
    private String location;
    private String pic;

    public HotelDoc(Hotel hotel) {
        this.id = hotel.getId();
        this.name = hotel.getName();
        this.address = hotel.getAddress();
        this.price = hotel.getPrice();
        this.score = hotel.getScore();
        this.brand = hotel.getBrand();
        this.city = hotel.getCity();
        this.starName = hotel.getStarName();
        this.business = hotel.getBusiness();
        this.location = hotel.getLatitude() + ", " + hotel.getLongitude();
        this.pic = hotel.getPic();
    }
}
```

### 追加構文

DSLの構文はこれ。

```json
POST /{indexName}/_doc/{id}
{
    "name": "Jack",
    "age": 21
}
```

対応するJavaコード

```java
@Test
public void HotelCreateTest() throws IOException {
    // requestオブジェクトを準備
    IndexRequest request = new IndexRequest("indexName").id("1");
    // JSONオブジェクトを準備
    request.source("{\n" +
            "    \"name\": \"Jack\",\n" +
            "    \"age\": 21\n" +
            "}", XContentType.JSON);
    // リクエストを送信
    client.index(request, RequestOptions.DEFAULT);
}
```

### ドキュメント追加のサンプルコード

```java
@Test
public void HotelCreateTest() throws IOException {
    // ホテルデータをクエリ
    Hotel hotel = hotelService.getById(61083L);
    // ドキュメント型に変換
    HotelDoc hotelDoc = new HotelDoc(hotel);
    // JSONに変換
    String json = JSON.toJSONString(hotelDoc);

    // requestオブジェクトを準備
    IndexRequest request = new IndexRequest("hotel").id(hotelDoc.getId().toString());
    // JSONオブジェクトを準備
    request.source(json, XContentType.JSON);
    // リクエストを送信
    client.index(request, RequestOptions.DEFAULT);
}
```

## ドキュメントの検索

### 検索構文

DSLステートメント

```json
GET /{indexName}/_doc/{id}
```

Javaステートメント

```java
@Test
public void HotelGetTest() throws IOException {
    // requestを準備
    GetRequest request = new GetRequest("indexName", "id");
    // リクエストを送信
    GetResponse response = client.get(request, RequestOptions.DEFAULT);
    // 結果を解析
    String json = response.getSourceAsString();
    
    System.out.println(json);
}
```

### ドキュメント検索のサンプルコード

```java
@Test
public void HotelGetTest() throws IOException {
    // requestを準備
    GetRequest request = new GetRequest("hotel", "61083");
    // リクエストを送信
    GetResponse response = client.get(request, RequestOptions.DEFAULT);
    // 結果を解析
    String json = response.getSourceAsString();
    // Javaオブジェクトに逆シリアル化
    HotelDoc hotelDoc = JSON.parseObject(json, HotelDoc.class);
    System.out.println(hotelDoc);
}
```

## ドキュメントの削除

### 削除構文

DSLステートメント

```json
DELETE /{indexName}/_doc/{id}
```

Javaステートメント

```java
@Test
public void HotelDeleteTest() throws IOException {
    // requestを準備
    DeleteRequest request = new DeleteRequest("indexName", "id");
    // リクエストを送信
    client.delete(request, RequestOptions.DEFAULT);
}
```

### ドキュメント削除のサンプルコード

```java
@Test
public void HotelDeleteTest() throws IOException {
    // requestを準備
    DeleteRequest request = new DeleteRequest("hotel", "61083");
    // リクエストを送信
    client.delete(request, RequestOptions.DEFAULT);
}
```

## ドキュメントの変更

### 変更構文

変更には全量変更と増分変更があるんだけど、RestClientのAPIでは、この2つの方法は完全に同じAPIを使うんだ。判断基準はIDで、新規追加の場合は：

*   IDが存在する場合、変更
*   IDが存在しない場合、新規追加

ここでは主に増分変更に注目するね。DSLステートメントはこれ。

```json
POST /{indexName}/_update/{id}
{
    "doc": "Rose",
    "age": 18
}
```

Javaステートメント

```java
@Test
public void HotelUpdateTest() throws IOException {
    // requestオブジェクトを作成
    UpdateRequest request = new UpdateRequest("indexName", "id");
    // パラメータを準備
    request.doc(
            "name", "Rose",
            "age", 18
    );
    // ドキュメントを更新
    client.update(request, RequestOptions.DEFAULT);
}
```

### ドキュメント変更のサンプルコード

```java
@Test
public void HotelUpdateTest() throws IOException {
    // requestオブジェクトを作成
    UpdateRequest request = new UpdateRequest("hotel", "61083");
    // パラメータを準備
    request.doc(
            "price", 950,
            "starName", "四钻"
    );
    // ドキュメントを更新
    client.update(request, RequestOptions.DEFAULT);
}
```

## ドキュメントの一括インポート

BulkRequestを使って、データベースのデータをインデックスに一括インポートするよ。これは、複数の通常のCRUDリクエストをまとめて送信するっていうのが本質なんだ。例はこんな感じ。

```java
@Test
public void testBulk() throws IOException {
    // bulkリクエストを作成
    BulkRequest request = new BulkRequest();
    // bulkリクエストを追加
    request.add(new IndexRequest("indexName").id("id1").source("json1", XContentType.JSON));
    request.add(new IndexRequest("indexName").id("id2").source("json2", XContentType.JSON));
    // bulkリクエストを送信
    client.bulk(request, RequestOptions.DEFAULT);
    }
```

### ドキュメント一括インポートのサンプルコード

```java
@Test
public void testBulk() throws IOException {
    // データを一括クエリ
    List<Hotel> hotelList = hotelService.list();

    // bulkリクエストを作成
    BulkRequest request = new BulkRequest();
    // bulkリクエストを追加
    for (Hotel hotel : hotelList) {
        // ドキュメント型に変換
        HotelDoc hotelDoc = new HotelDoc(hotel);
        // ドキュメント新規追加requestオブジェクトを作成
        request.add(new IndexRequest("hotel")
                .id(hotelDoc.getId().toString())
                .source(JSON.toJSONString(hotelDoc), XContentType.JSON)
        );
    }

    // bulkリクエストを送信
    client.bulk(request, RequestOptions.DEFAULT);
}
```
