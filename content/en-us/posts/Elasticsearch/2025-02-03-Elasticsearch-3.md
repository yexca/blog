---
slug: 228
title: 'Getting Started with Elasticsearch RestClient'
# draft: true
author: yexca
date: '2025-02-03T22:30:00+09:00'
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
> | Content | Link |
> | :--------------------- | :------------------------------------ |
> | Elasticsearch Basic Operations | <https://blog.yexca.net/archives/226> |
> | Elasticsearch Query Operations | <https://blog.yexca.net/archives/227> |
> | RestClient Basic Operations | This Article |
> | RestClient Query Operations | <https://blog.yexca.net/archives/229> |
> | Elasticsearch Data Aggregation | <https://blog.yexca.net/archives/231> |
> | Elasticsearch Autocomplete | <https://blog.yexca.net/archives/232> |
> | Elasticsearch Data Sync | <https://blog.yexca.net/archives/234> |
> | Elasticsearch Cluster | <https://blog.yexca.net/archives/235> |

Elasticsearch provides official clients for various languages to interact with ES. These clients essentially build DSL queries and send them to ES via HTTP requests.

Official Docs: <https://www.elastic.co/guide/en/elasticsearch/client/index.html>

This article uses the Java High-Level Rest Client API.

## Creating an Index

Here's the database table structure:

```sql
`id` bigint(20) NOT NULL COMMENT '酒店id',
`name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '酒店名称',
`address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '酒店地址',
`price` int(10) NOT NULL COMMENT '酒店价格',
`score` int(2) NOT NULL COMMENT '酒店评分',
`brand` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '酒店品牌',
`city` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '所在城市',
`star_name` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '酒店星级，1星到5星，1钻到5钻',
`business` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '商圈',
`latitude` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '纬度',
`longitude` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '经度',
`pic` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '酒店图片',
PRIMARY KEY (`id`) USING BTREE
```

Creating an index hinges on the mapping. You need to consider:

* Field names and data types (refer to your database table structure).
* Whether the field should be searchable (based on business needs, e.g., image URLs typically aren't).
* Whether the field needs tokenization (depends on content, e.g., cities usually don't).
* Which tokenizer to use (ik_max_word is a common choice).

Example mapping for the table above:

```json
# Create index
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
        /* Copies this field to the 'all' field */
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
        /* ES supports two geospatial data types */
      },
      "pic": {
        "type": "keyword",
        "index": false
      },
      "all": {
        /* Combined field, won't show in query results but is searchable */
        "type": "text",
        "analyzer": "ik_max_word"
      }
    }
  }
}
```

Geospatial data types:

* geo_point: A single point defined by latitude and longitude. E.g., `"32.84 120.25"`
* geo_shape: Complex geometric shapes composed of multiple geo_points. E.g., a line `"LINESTRING(-77.03 38.29, +77.00 38.88)"`

## Initializing RestClient

All interactions with Elasticsearch are encapsulated within the `RestHighLevelClient` class.

First, add the `RestHighLevelClient` dependency:

```xml
<dependency>
    <groupId>org.elasticsearch.client</groupId>
    <artifactId>elasticsearch-rest-high-level-client</artifactId>
</dependency>
```

Since SpringBoot's default ES version is 7.6.2, you'll need to override it.

```xml
<properties>
    <java.version>1.8</java.version>
    <elasticsearch.version>7.12.1</elasticsearch.version>
</properties>
```

Here's how to initialize the `RestHighLevelClient`:

```java
RestHighLevelClient client = new RestHighLevelClient(RestClient.builder(
        HttpHost.create("http://IP:9200")
));
```

For convenience during testing, the initialization code is placed in `@BeforeEach`.

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

The JSON part of the DSL statement needed for defining the index can be extracted into a separate constant.

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

Code to create the index:

```java
// Note the CreateIndexRequest package
import org.elasticsearch.client.indices.CreateIndexRequest;

@Test
void testCreateHotelIndex() throws IOException {
    // Create a Request object
    CreateIndexRequest request = new CreateIndexRequest("hotel");
    // Request parameters
    request.source(MAPPING_TEMPLATE, XContentType.JSON);
    // Send the request
    client.indices().create(request, RequestOptions.DEFAULT);
}
```

## Deleting an Index

DSL statement:

```json
DELETE /hotel
```

The only difference from the creation code is the Request object, and it takes no parameters.

```java
@Test
void testDeleteHotelIndex() throws IOException {
    // Create the request
    DeleteIndexRequest request = new DeleteIndexRequest("hotel");
    // Send the request
    client.indices().delete(request, RequestOptions.DEFAULT);
}
```

## Checking if an Index Exists

DSL statement:

```json
GET /hotel
```

Again, the difference is just the Request object.

```java
@Test
void testExistsHotelIndex() throws IOException {
    // Create the request
    GetIndexRequest request = new GetIndexRequest("hotel");
    // Send the request
    boolean exists = client.indices().exists(request, RequestOptions.DEFAULT);
    // Output
    System.out.println(exists);
}
```

> **Summary**
>
> The process for Java RestClient operations on ES is quite similar: use the `client.indices()` method to get the index management object.

## RestClient

Typically, data is managed (CRUD) in an index from a database query.
Initializing `RestHighLevelClient`:

```java
@SpringBootTest
public class HotelDocumentTest {
    // Inject service
    @Autowired
    private IHotelService hotelService;

    private RestHighLevelClient client;

    @BeforeEach
    void setUp() {
        // Build RestClient
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

## Adding Documents

Query data from the database and write it into ES.

### Structure Adjustment

The result of a database query is a `Hotel` object.

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

There's a structural difference compared to the index. We need to define a new type that matches the index structure.

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

### Add Syntax

The DSL syntax is:

```json
POST /{indexName}/_doc/{id}
{
    "name": "Jack",
    "age": 21
}
```

The corresponding Java code:

```java
@Test
public void HotelCreateTest() throws IOException {
    // Prepare the request object
    IndexRequest request = new IndexRequest("indexName").id("1");
    // Prepare the JSON object
    request.source("{\n" +
            "    \"name\": \"Jack\",\n" +
            "    \"age\": 21\n" +
            "}", XContentType.JSON);
    // Send the request
    client.index(request, RequestOptions.DEFAULT);
}
```

### Add Document Example Code

```java
@Test
public void HotelCreateTest() throws IOException {
    // Query hotel data
    Hotel hotel = hotelService.getById(61083L);
    // Convert to document type
    HotelDoc hotelDoc = new HotelDoc(hotel);
    // Convert to JSON
    String json = JSON.toJSONString(hotelDoc);

    // Prepare the request object
    IndexRequest request = new IndexRequest("hotel").id(hotelDoc.getId().toString());
    // Prepare the JSON object
    request.source(json, XContentType.JSON);
    // Send the request
    client.index(request, RequestOptions.DEFAULT);
}
```

## Querying Documents

### Query Syntax

DSL statement:

```json
GET /{indexName}/_doc/{id}
```

Java code:

```java
@Test
public void HotelGetTest() throws IOException {
    // Prepare the request
    GetRequest request = new GetRequest("indexName", "id");
    // Send the request
    GetResponse response = client.get(request, RequestOptions.DEFAULT);
    // Parse the result
    String json = response.getSourceAsString();
    
    System.out.println(json);
}
```

### Query Document Example Code

```java
@Test
public void HotelGetTest() throws IOException {
    // Prepare the request
    GetRequest request = new GetRequest("hotel", "61083");
    // Send the request
    GetResponse response = client.get(request, RequestOptions.DEFAULT);
    // Parse the result
    String json = response.getSourceAsString();
    // Deserialize into a Java object
    HotelDoc hotelDoc = JSON.parseObject(json, HotelDoc.class);
    System.out.println(hotelDoc);
}
```

## Deleting Documents

### Delete Syntax

DSL statement:

```json
DELETE /{indexName}/_doc/{id}
```

Java code:

```java
@Test
public void HotelDeleteTest() throws IOException {
    // Prepare the request
    DeleteRequest request = new DeleteRequest("indexName", "id");
    // Send the request
    client.delete(request, RequestOptions.DEFAULT);
}
```

### Delete Document Example Code

```java
@Test
public void HotelDeleteTest() throws IOException {
    // Prepare the request
    DeleteRequest request = new DeleteRequest("hotel", "61083");
    // Send the request
    client.delete(request, RequestOptions.DEFAULT);
}
```

## Updating Documents

### Update Syntax

Updates can be full or partial. In the RestClient API, both use the same API, determined by the ID. When adding:

* If ID exists, it's an update.
* If ID doesn't exist, it's an insert.

Here, we'll focus on partial updates. DSL statement:

```json
POST /{indexName}/_update/{id}
{
    "doc": "Rose",
    "age": 18
}
```

Java code:

```java
@Test
public void HotelUpdateTest() throws IOException {
    // Create request object
    UpdateRequest request = new UpdateRequest("indexName", "id");
    // Prepare parameters
    request.doc(
            "name", "Rose",
            "age", 18
    );
    // Update document
    client.update(request, RequestOptions.DEFAULT);
}
```

### Update Document Example Code

```java
@Test
public void HotelUpdateTest() throws IOException {
    // Create request object
    UpdateRequest request = new UpdateRequest("hotel", "61083");
    // Prepare parameters
    request.doc(
            "price", 950,
            "starName", "四钻"
    );
    // Update document
    client.update(request, RequestOptions.DEFAULT);
}
```

## Bulk Importing Documents

Use `BulkRequest` to import database data into the index in bulk. This essentially combines multiple regular CRUD requests and sends them together. Example:

```java
@Test
public void testBulk() throws IOException {
    // Create bulk request
    BulkRequest request = new BulkRequest();
    // Add bulk requests
    request.add(new IndexRequest("indexName").id("id1").source("json1", XContentType.JSON));
    request.add(new IndexRequest("indexName").id("id2").source("json2", XContentType.JSON));
    // Send bulk request
    client.bulk(request, RequestOptions.DEFAULT);
    }
```

### Bulk Import Document Example Code

```java
@Test
public void testBulk() throws IOException {
    // Batch query data
    List<Hotel> hotelList = hotelService.list();

    // Create bulk request
    BulkRequest request = new BulkRequest();
    // Add bulk requests
    for (Hotel hotel : hotelList) {
        // Convert to document type
        HotelDoc hotelDoc = new HotelDoc(hotel);
        // Create request object for new document
        request.add(new IndexRequest("hotel")
                .id(hotelDoc.getId().toString())
                .source(JSON.toJSONString(hotelDoc), XContentType.JSON)
        );
    }

    // Send bulk request
    client.bulk(request, RequestOptions.DEFAULT);
}
```
