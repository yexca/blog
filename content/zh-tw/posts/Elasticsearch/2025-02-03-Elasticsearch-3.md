---
slug: 228
title: 'Elasticsearch RestClient 入門'
# draft: true
author: yexca
date: '2025-02-03T22:30:00+09:00'
lastmod: '2025-02-15T17:17:08+09:00'
categories:
    - 技術學習
tags:
    - 後端技術
    - Elasticsearch
    - SpringCloud
---

{{< notice >}} 本文由 gemini-2.5-flash 翻譯 {{< /notice >}}

> **Elasticsearch 系列**
>
> | 內容                   | 連結                                  |
> | :--------------------- | :------------------------------------ |
> | Elasticsearch 基礎操作 | <https://blog.yexca.net/archives/226> |
> | Elasticsearch 查詢操作 | <https://blog.yexca.net/archives/227> |
> | RestClient 基礎操作 | 本文 |
> | RestClient 查詢操作 | <https://blog.yexca.net/archives/229> |
> | Elasticsearch 資料聚合 | <https://blog.yexca.net/archives/231> |
> | Elasticsearch 自動補齊 | <https://blog.yexca.net/archives/232> |
> | Elasticsearch 資料同步 | <https://blog.yexca.net/archives/234> |
> | Elasticsearch 叢集 | <https://blog.yexca.net/archives/235> |

ES 官方提供了各種不同語言的客戶端，用來操作 ES。這些客戶端的本質就是組裝 DSL 語句，透過 HTTP 請求傳送給 ES。

官方文件：<https://www.elastic.co/guide/en/elasticsearch/client/index.html>

以下使用 Java HighLevel Rest Client 客戶端 API。

## 建立索引庫

資料庫表格結構如下：

```sql
`id` bigint(20) NOT NULL COMMENT '旅店 ID',
`name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '旅店名稱',
`address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '旅店地址',
`price` int(10) NOT NULL COMMENT '旅店價格',
`score` int(2) NOT NULL COMMENT '旅店評分',
`brand` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '旅店品牌',
`city` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '所在城市',
`star_name` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '旅店星級，1星到5星，1鑽到5鑽',
`business` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '商圈',
`latitude` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '緯度',
`longitude` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '經度',
`pic` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '旅店圖片',
PRIMARY KEY (`id`) USING BTREE
```

建立索引庫最關鍵的是 mapping 映射，需要考量：

*   欄位名稱、欄位資料型別 (參考資料庫表格的名稱與型別)
*   是否參與搜尋 (根據業務判斷，例如圖片位址不需要參與搜尋)
*   是否需要分詞 (看內容，例如城市無需分詞)
*   分詞器是什麼 (可以統一 ik_max_word)

上方表格範例：

```json
# 建立索引庫
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
        /* 將目前欄位複製到指定欄位 all */
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
        /* ES 支援兩種地理座標資料型別 */
      },
      "pic": {
        "type": "keyword",
        "index": false
      },
      "all": {
        /* 組合欄位，不會在查詢結果顯示，但可用於查詢 */
        "type": "text",
        "analyzer": "ik_max_word"
      }
    }
  }
}
```

地理座標資料型別：

*   geo_point：由緯度 (latitude) 和經度 (longitude) 確定的一個點。例如 `"32.84 120.25"`
*   geo_shape：由多個 geo_point 組成的複雜幾何圖形。例如一條直線 `"LINESTRING(-77.03 38.29, +77.00 38.88)"`

## 初始化 RestClient

與 Elasticsearch 的所有互動都封裝在一個名為 RestHighLevelClient 的類別中。

首先引入 ES 的 RestHighLevelClient 相依套件。

```xml
<dependency>
    <groupId>org.elasticsearch.client</groupId>
    <artifactId>elasticsearch-rest-high-level-client</artifactId>
</dependency>
```

因為 SpringBoot 預設的 ES 版本為 7.6.2，需要覆寫預設 ES 版本。

```xml
<properties>
    <java.version>1.8</java.version>
    <elasticsearch.version>7.12.1</elasticsearch.version>
</properties>
```

初始化 RestHighLevelClient 的程式碼如下：

```java
RestHighLevelClient client = new RestHighLevelClient(RestClient.builder(
        HttpHost.create("http://IP:9200")
));
```

不過為了測試方便，初始化程式碼會放在 @BeforeEach 中。

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

定義索引庫需要 DSL 語句的 JSON 部分，可以單獨提取出來。

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

建立索引的程式碼：

```java
// 注意CreateIndexRequest的套件
import org.elasticsearch.client.indices.CreateIndexRequest;

@Test
void testCreateHotelIndex() throws IOException {
    // 建立Request物件
    CreateIndexRequest request = new CreateIndexRequest("hotel");
    // 請求參數
    request.source(MAPPING_TEMPLATE, XContentType.JSON);
    // 發送請求
    client.indices().create(request, RequestOptions.DEFAULT);
}
```

## 刪除索引庫

DSL 語句：

```json
DELETE /hotel
```

與建立的程式碼差異僅在 Request 物件上，且沒有參數。

```java
@Test
void testDeleteHotelIndex() throws IOException {
    // 建立請求
    DeleteIndexRequest request = new DeleteIndexRequest("hotel");
    // 發送請求
    client.indices().delete(request, RequestOptions.DEFAULT);
}
```

## 判斷索引庫是否存在

DSL 語句：

```json
GET /hotel
```

差異仍在於 Request 物件。

```java
@Test
void testExistsHotelIndex() throws IOException {
    // 建立請求
    GetIndexRequest request = new GetIndexRequest("hotel");
    // 發送請求
    boolean exists = client.indices().exists(request, RequestOptions.DEFAULT);
    // 輸出
    System.out.println(exists);
}
```

> **總結**
>
> Java RestClient 操作 ES 的流程大致相似，使用 `client.indices()` 方法來取得索引庫的操作物件。

## RestClient

一般資料在資料庫中會透過查詢資料庫來進行索引庫的 CRUD 操作。

初始化 RestHighLevelClient：

```java
@SpringBootTest
public class HotelDocumentTest {
    // 注入服務
    @Autowired
    private IHotelService hotelService;

    private RestHighLevelClient client;

    @BeforeEach
    void setUp() {
        // 建構 RestClient
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

## 新增文件

將資料庫中的資料查詢出來，寫入 ES 中。

### 結構調整

資料庫查詢後的結果是一個 Hotel 型別的物件。

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

與索引庫結構存在差異，需要定義一個新的型別，使其與索引庫結構相同。

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

### 新增語法

DSL 的語法為：

```json
POST /{indexName}/_doc/{id}
{
    "name": "Jack",
    "age": 21
}
```

對應的 Java：

```java
@Test
public void HotelCreateTest() throws IOException {
    // 準備 Request 物件
    IndexRequest request = new IndexRequest("indexName").id("1");
    // 準備 JSON 物件
    request.source("{\n" +
            "    \"name\": \"Jack\",\n" +
            "    \"age\": 21\n" +
            "}", XContentType.JSON);
    // 發送請求
    client.index(request, RequestOptions.DEFAULT);
}
```

### 新增文件實例程式碼

```java
@Test
public void HotelCreateTest() throws IOException {
    // 查詢旅店資料
    Hotel hotel = hotelService.getById(61083L);
    // 轉換文件型別
    HotelDoc hotelDoc = new HotelDoc(hotel);
    // 轉為 JSON
    String json = JSON.toJSONString(hotelDoc);

    // 準備 Request 物件
    IndexRequest request = new IndexRequest("hotel").id(hotelDoc.getId().toString());
    // 準備 JSON 物件
    request.source(json, XContentType.JSON);
    // 發送請求
    client.index(request, RequestOptions.DEFAULT);
}
```

## 查詢文件

### 查詢語法

DSL 語句：

```json
GET /{indexName}/_doc/{id}
```

Java 語句：

```java
@Test
public void HotelGetTest() throws IOException {
    // 準備 Request
    GetRequest request = new GetRequest("indexName", "id");
    // 發送請求
    GetResponse response = client.get(request, RequestOptions.DEFAULT);
    // 解析結果
    String json = response.getSourceAsString();
    
    System.out.println(json);
}
```

### 查詢文件實例程式碼

```java
@Test
public void HotelGetTest() throws IOException {
    // 準備 Request
    GetRequest request = new GetRequest("hotel", "61083");
    // 發送請求
    GetResponse response = client.get(request, RequestOptions.DEFAULT);
    // 解析結果
    String json = response.getSourceAsString();
    // 反序列化為 Java 物件
    HotelDoc hotelDoc = JSON.parseObject(json, HotelDoc.class);
    System.out.println(hotelDoc);
}
```

## 刪除文件

### 刪除語法

DSL 語句：

```json
DELETE /{indexName}/_doc/{id}
```

Java 語句：

```java
@Test
public void HotelDeleteTest() throws IOException {
    // 準備 Request
    DeleteRequest request = new DeleteRequest("indexName", "id");
    // 發送請求
    client.delete(request, RequestOptions.DEFAULT);
}
```

### 刪除文件實例程式碼

```java
@Test
public void HotelDeleteTest() throws IOException {
    // 準備 Request
    DeleteRequest request = new DeleteRequest("hotel", "61083");
    // 發送請求
    client.delete(request, RequestOptions.DEFAULT);
}
```

## 修改文件

### 修改語法

修改有全量修改與增量修改兩種方式。在 RestClient 的 API 中，這兩種方式的 API 完全一致，判斷依據是 ID，新增時：

*   ID 存在，進行修改
*   ID 不存在，進行新增

這裡主要關注增量修改，DSL 語句如下：

```json
POST /{indexName}/_update/{id}
{
    "doc": "Rose",
    "age": 18
}
```

Java 語句：

```java
@Test
public void HotelUpdateTest() throws IOException {
    // 建立 Request 物件
    UpdateRequest request = new UpdateRequest("indexName", "id");
    // 準備參數
    request.doc(
            "name", "Rose",
            "age", 18
    );
    // 更新文件
    client.update(request, RequestOptions.DEFAULT);
}
```

### 修改文件實例程式碼

```java
@Test
public void HotelUpdateTest() throws IOException {
    // 建立 Request 物件
    UpdateRequest request = new UpdateRequest("hotel", "61083");
    // 準備參數
    request.doc(
            "price", 950,
            "starName", "四鑽"
    );
    // 更新文件
    client.update(request, RequestOptions.DEFAULT);
}
```

## 批次匯入文件

利用 BulkRequest 將資料庫資料批次匯入到索引庫中。其本質是將多個普通的 CRUD 請求組合在一起發送，範例如下：

```java
@Test
public void testBulk() throws IOException {
    // 建立 bulk 請求
    BulkRequest request = new BulkRequest();
    // 新增批次請求
    request.add(new IndexRequest("indexName").id("id1").source("json1", XContentType.JSON));
    request.add(new IndexRequest("indexName").id("id2").source("json2", XContentType.JSON));
    // 發送 bulk 請求
    client.bulk(request, RequestOptions.DEFAULT);
    }
```

### 批次匯入文件實例程式碼

```java
@Test
public void testBulk() throws IOException {
    // 批次查詢資料
    List<Hotel> hotelList = hotelService.list();

    // 建立 bulk 請求
    BulkRequest request = new BulkRequest();
    // 新增批次請求
    for (Hotel hotel : hotelList) {
        // 轉換文件型別
        HotelDoc hotelDoc = new HotelDoc(hotel);
        // 建立新增文件 Request 物件
        request.add(new IndexRequest("hotel")
                .id(hotelDoc.getId().toString())
                .source(JSON.toJSONString(hotelDoc), XContentType.JSON)
        );
    }

    // 發送 bulk 請求
    client.bulk(request, RequestOptions.DEFAULT);
}
```
