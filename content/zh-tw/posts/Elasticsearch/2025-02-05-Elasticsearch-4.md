---
slug: 229
title: 'Elasticsearch RestClient 查詢'
# draft: true
author: yexca
date: '2025-02-05T15:50:26+09:00'
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
> | RestClient 基礎操作 | <https://blog.yexca.net/archives/228> |
> | RestClient 查詢操作 | 本文 |
> | Elasticsearch 資料彙總 | <https://blog.yexca.net/archives/231> |
> | Elasticsearch 自動補齊 | <https://blog.yexca.net/archives/232> |
> | Elasticsearch 資料同步 | <https://blog.yexca.net/archives/234> |
> | Elasticsearch 叢集 | <https://blog.yexca.net/archives/235> |

文件的查詢相同地使用 RestHighLevelClient 物件

## match_all

發出請求如下：

```java
@Test
public void testMatchAll() throws IOException {
    // 準備request
    SearchRequest request = new SearchRequest("hotel");
    // 組織DSL參數
    request.source().query(QueryBuilders.matchAllQuery());
    // 傳送請求
    SearchResponse response = client.search(request, RequestOptions.DEFAULT);

    System.out.println(response);
}
```

解析回應

```java
@Test
public void testMatchAll() throws IOException {
    // 準備request
    SearchRequest request = new SearchRequest("hotel");
    // 組織DSL參數
    request.source().query(QueryBuilders.matchAllQuery());
    // 傳送請求
    SearchResponse response = client.search(request, RequestOptions.DEFAULT);

    // 解析結果
    SearchHits searchHits = response.getHits();
    // 查詢的總筆數
    long total = searchHits.getTotalHits().value;
    // 查詢結果陣列
    SearchHit[] hits = searchHits.getHits();
    for (SearchHit hit : hits) {
        String json = hit.getSourceAsString();
        System.out.println(json);
    }
}
```

es 回傳的結果是一個 JSON 字串，包含：

*   hits：命中結果
    *   total：總筆數，其中 value 是具體的總筆數值
    *   max_score：所有結果中得分最高的文件的相關性分數
    *   hits：搜尋結果的文件陣列，其中的每個文件都是一個 JSON 物件
        *   source：文件中的原始資料，也是 JSON 物件

因此，解析回應結果，就是逐層解析 JSON 字串，流程如下：

*   `SearchHits`：透過 response.getHits() 取得，就是 JSON 中的最外層 hits，代表命中的結果
    *   `SearchHits.getTotalHits().value`：取得總筆數資訊
    *   `SearchHits.getHits()`：取得 SearchHit 陣列，也就是文件陣列
        *   `SearchHit.getSourceAsString()`：取得文件結果中的 _source，也就是原始的 JSON 文件資料

## match 與 multi_match

與 match_all 類似，差別在於查詢條件

match 程式碼

```java
@Test
public void testMatch() throws IOException {
    SearchRequest request = new SearchRequest("hotel");
    request.source().query(QueryBuilders.matchQuery("all", "如家"));
    SearchResponse response = client.search(request, RequestOptions.DEFAULT);

    SearchHits searchHits = response.getHits();
    long total = searchHits.getTotalHits().value;
    System.out.println(total);
    SearchHit[] hits = searchHits.getHits();
    for (SearchHit hit : hits) {
        String json = hit.getSourceAsString();
        System.out.println(json);
    }
}
```

multi_match 程式碼

```java
@Test
public void testMultiMatch() throws IOException {
    SearchRequest request = new SearchRequest("hotel");
    request.source().query(QueryBuilders.multiMatchQuery("如家", "brand", "name"));
    SearchResponse response = client.search(request, RequestOptions.DEFAULT);

    SearchHits searchHits = response.getHits();
    long total = searchHits.getTotalHits().value;
    System.out.println(total);
    SearchHit[] hits = searchHits.getHits();
    for (SearchHit hit : hits) {
        String json = hit.getSourceAsString();
        System.out.println(json);
    }
}
```

可以看到程式碼重複部分較多，使用 `Ctrl+Alt+M` 進行程式碼提取，term 程式碼展現了提取

## 精準查詢

term 詞條精確比對查詢

```java
@Test
public void testTerm() throws IOException {
    SearchRequest request = new SearchRequest("hotel");
    request.source().query(QueryBuilders.termQuery("city", "上海"));
    SearchResponse response = client.search(request, RequestOptions.DEFAULT);

    responseHandle(response);
}

// 回應處理程式碼提取
private static void responseHandle(SearchResponse response) {
    SearchHits searchHits = response.getHits();
    long total = searchHits.getTotalHits().value;
    System.out.println(total);
    SearchHit[] hits = searchHits.getHits();
    for (SearchHit hit : hits) {
        String json = hit.getSourceAsString();
        System.out.println(json);
    }
}
```

range 範圍查詢

```java
@Test
public void testRange() throws IOException {
    SearchRequest request = new SearchRequest("hotel");
    request.source().query(QueryBuilders
                           .rangeQuery("price")
                           .gte(100)
                           .lte(400));
    SearchResponse response = client.search(request, RequestOptions.DEFAULT);

    responseHandle(response);
}
```

## 布林查詢

```java
@Test
public void testBool() throws IOException {
    SearchRequest request = new SearchRequest("hotel");

    // 建構布林查詢
    BoolQueryBuilder booledQuery = QueryBuilders.boolQuery();
    // 加入must條件
    booledQuery.must(QueryBuilders.termQuery("city", "上海"));
    // 加入filter元件
    booledQuery.filter(QueryBuilders.rangeQuery("price").lte(300));

    request.source().query(booledQuery);
    SearchResponse response = client.search(request, RequestOptions.DEFAULT);

    responseHandle(response);
}
```

## 排序與分頁

```java
@Test
public void testSort() throws IOException {
    SearchRequest request = new SearchRequest("hotel");
    request.source().query(QueryBuilders.matchAllQuery());
    request.source().from(10).size(10);
    request.source().sort("price", SortOrder.ASC);
    SearchResponse response = client.search(request, RequestOptions.DEFAULT);

    responseHandle(response);
}
```

## 高亮

高亮與上述程式碼差異較大，請求建構

```java
@Test
public void testHigh() throws IOException {
    SearchRequest request = new SearchRequest("hotel");
    // DSL
    request.source().query(QueryBuilders.matchQuery("all", "漢庭"));
    // 高亮
    request.source().highlighter(
            new HighlightBuilder()
            .field("name")
            .requireFieldMatch(false)
    );
    // 傳送請求
    SearchResponse response = client.search(request, RequestOptions.DEFAULT);
        
    // 解析
    responseHandle(response);
}
```

因為查詢文件結果與高亮分離，結果解析需要額外處理

```java
@Test
public void testHigh() throws IOException {
    SearchRequest request = new SearchRequest("hotel");
    // DSL
    request.source().query(QueryBuilders.matchQuery("all", "漢庭"));
    // 高亮
    request.source().highlighter(
            new HighlightBuilder()
            .field("name")
            .requireFieldMatch(false)
    );
    // 傳送請求
    SearchResponse response = client.search(request, RequestOptions.DEFAULT);

    // 解析
    SearchHits searchHits = response.getHits();
    // 總筆數
    long total = searchHits.getTotalHits().value;
    System.out.println(total);
    // 文件陣列
    SearchHit[] hits = searchHits.getHits();
    for (SearchHit hit : hits) {
        String json = hit.getSourceAsString();
        // 反序列化
        HotelDoc hotelDoc = JSON.parseObject(json, HotelDoc.class);
        // 取得高亮結果
        Map<String, HighlightField> highlightFields = hit.getHighlightFields();
        if(!CollectionUtils.isEmpty(highlightFields)){
            // 取得高亮結果
            HighlightField highlightField = highlightFields.get("name");
            if (highlightField != null){
                String name = highlightField.getFragments()[0].toString();
                // 覆寫非高亮
                hotelDoc.setName(name);
            }
        }
        System.out.println(hotelDoc);
    }
}
```

## 飯店查詢案例

實現四部分功能：

*   飯店搜尋與分頁
*   飯店結果篩選
*   我周邊的飯店
*   飯店競價排名

### 搜尋與分頁

搜尋請求：

*   請求方式：POST
*   請求路徑：/hotel/list
*   請求參數：JSON 物件，包含 4 個欄位：
    *   key：搜尋關鍵字
    *   page：頁碼
    *   size：每頁大小
    *   sortBy：排序，目前暫不實作
*   回傳值：分頁查詢，需要回傳分頁結果 PageResult，包含兩個屬性：
    *   `total`：總筆數
    *   `List<HotelDoc>`：當前頁的資料

首先定義實體類別，接收參數

```java
@Data
public class RequestParams {
    private String key;
    private Integer page;
    private Integer size;
    private String sortBy;
}
```

定義回傳類別

```java
@Data
public class PageResult {
    private Long total;
    private List<HotelDoc> hotels;

    public PageResult(){

    }

    public PageResult(Long total, List<HotelDoc> hotels) {
        this.total = total;
        this.hotels = hotels;
    }
}
```

定義 Controller

```java
@RestController
@RequestMapping("/hotel")
public class HotelController {
    @Autowired
    private IHotelService hotelService;

    @PostMapping("/list")
    public PageResult search(@RequestBody RequestParams params){
        return hotelService.search(params);
    }
}
```

實作搜尋業務，首先註冊一個 Bean 物件

```java
@Bean
public RestHighLevelClient client(){
    return new RestHighLevelClient(RestClient
            .builder(HttpHost.create("http://ip:9200")
            ));
}
```

撰寫邏輯

```java
public PageResult search(RequestParams params) {
    // request
    SearchRequest request = new SearchRequest("hotel");
    BoolQueryBuilder boolQuery = QueryBuilders.boolQuery();
    // DSL
    String key = params.getKey();
    if (key == null || "".equals(key)){
        boolQuery.must(QueryBuilders.matchAllQuery());
    }else {
        boolQuery.must(QueryBuilders.matchQuery("all", key));
    }
    // 分頁
    int page = params.getPage();
    int size = params.getSize();
    request.source().from((page - 1) * size).size(size);
    // 查詢
    request.source().query(boolQuery);
    // 傳送請求
    try {
        SearchResponse response = client.search(request, RequestOptions.DEFAULT);

        // 回應解析
        SearchHits searchHits = response.getHits();
        // 總數
        long total = searchHits.getTotalHits().value;
        // 文件
        SearchHit[] hits = searchHits.getHits();
        // 遍歷
        List<HotelDoc> hotels = new ArrayList<>();
        for (SearchHit hit : hits) {
            String json = hit.getSourceAsString();
            HotelDoc hotelDoc = JSON.parseObject(json, HotelDoc.class);
            hotels.add(hotelDoc);
        }
        return new PageResult(total, hotels);
    } catch (IOException e) {
        throw new RuntimeException(e);
    }
}
```

### 結果篩選

包含的篩選條件：

*   brand：品牌值
*   city：城市
*   minPrice~maxPrice：價格範圍
*   starName：星級

修改實體類別

```java
@Data
public class RequestParams {
    private String key;
    private Integer page;
    private Integer size;
    private String sortBy;
    // 下面是新增的篩選條件參數
    private String city;
    private String brand;
    private String starName;
    private Integer minPrice;
    private Integer maxPrice;
}
```

修改查詢條件

```java
@Override
public PageResult search(RequestParams params) {
    // request
    SearchRequest request = new SearchRequest("hotel");
    basicQuery(params, request);
    // 分頁
    int page = params.getPage();
    int size = params.getSize();
    request.source().from((page - 1) * size).size(size);

    // 傳送請求
    try {
        SearchResponse response = client.search(request, RequestOptions.DEFAULT);

        // 回應解析
        SearchHits searchHits = response.getHits();
        // 總數
        long total = searchHits.getTotalHits().value;
        // 文件
        SearchHit[] hits = searchHits.getHits();
        // 遍歷
        List<HotelDoc> hotels = new ArrayList<>();
        for (SearchHit hit : hits) {
            String json = hit.getSourceAsString();
            HotelDoc hotelDoc = JSON.parseObject(json, HotelDoc.class);
            hotels.add(hotelDoc);
        }
        return new PageResult(total, hotels);
    } catch (IOException e) {
        throw new RuntimeException(e);
    }
}

private static void basicQuery(RequestParams params, SearchRequest request) {
    BoolQueryBuilder boolQuery = QueryBuilders.boolQuery();
    // 輸入內容
    String key = params.getKey();
    if (key == null || "".equals(key)){
        boolQuery.must(QueryBuilders.matchAllQuery());
    }else {
        boolQuery.must(QueryBuilders.matchQuery("all", key));
    }
    // brand
    if (params.getBrand() != null && !params.getBrand().equals("")){
        boolQuery.filter(QueryBuilders.termQuery("brand", params.getBrand()));
    }
    // starName
    if (params.getStarName() != null && !params.getStarName().equals("")){
        boolQuery.filter(QueryBuilders.termQuery("starName", params.getStarName()));
    }
    // city
    if (params.getCity() != null && !params.getStarName().equals("")){
        boolQuery.filter(QueryBuilders.termQuery("city", params.getCity()));
    }
    // price
    if (params.getMinPrice() != null && params.getMaxPrice() != null){
        boolQuery.filter(QueryBuilders.rangeQuery("price").gte(params.getMinPrice()).lte(params.getMaxPrice()));
    }
    // 查詢
    request.source().query(boolQuery);
}
```

### 附近的飯店

基於 location 座標，依距離對周圍的飯店排序

修改實體類別

```java
@Data
public class RequestParams {
    private String key;
    private Integer page;
    private Integer size;
    private String sortBy;
    private String city;
    private String brand;
    private String starName;
    private Integer minPrice;
    private Integer maxPrice;
    // 我目前的地理座標
    private String location;
}
```

加入距離排序

```java
if (params.getLocation() != null) {
    // 距離排序
    request.source().sort(SortBuilders
            .geoDistanceSort("location", new GeoPoint(params.getLocation()))
            .order(SortOrder.ASC)
            .unit(DistanceUnit.KILOMETERS)
    );
}
```

### 距離顯示

修改 HotelDoc，加入距離

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
    // 距離
    private Object distance;

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

修改回應處理

```java
for (SearchHit hit : hits) {
    String json = hit.getSourceAsString();
    HotelDoc hotelDoc = JSON.parseObject(json, HotelDoc.class);
    Object[] sortValues = hit.getSortValues();
    if (sortValues.length > 0){
        Object sortValue = sortValues[0];
        hotelDoc.setDistance(sortValue);
    }
    hotels.add(hotelDoc);
}
```

### 加入廣告飯店

需求：讓指定的飯店在搜尋結果中排名置頂

給指定飯店加入標記，在篩選條件中根據此標記判斷是否提高 function_score

在 HotelDoc 加入廣告標記欄位

```java
private Boolean isAD;
```

用 DSL 給一些飯店加入標記

```json
# 加入廣告
POST /hotel/_update/607915
{
    "doc": {
        "isAD": true
    }
}
POST /hotel/_update/728461
{
    "doc": {
        "isAD": true
    }
}
POST /hotel/_update/7094829
{
    "doc": {
        "isAD": true
    }
}
POST /hotel/_update/198323591
{
    "doc": {
        "isAD": true
    }
}
```

加入算分函式查詢，修改 basicQuery() 方法

```java
private static void basicQuery(RequestParams params, SearchRequest request) {
    BoolQueryBuilder boolQuery = QueryBuilders.boolQuery();
    // 輸入內容
    String key = params.getKey();
    if (key == null || "".equals(key)){
        boolQuery.must(QueryBuilders.matchAllQuery());
    }else {
        boolQuery.must(QueryBuilders.matchQuery("all", key));
    }
    // brand
    if (params.getBrand() != null && !params.getBrand().equals("")){
        boolQuery.filter(QueryBuilders.termQuery("brand", params.getBrand()));
    }
    // starName
    if (params.getStarName() != null && !params.getStarName().equals("")){
        boolQuery.filter(QueryBuilders.termQuery("starName", params.getStarName()));
    }
    // city
    if (params.getCity() != null && !params.getStarName().equals("")){
        boolQuery.filter(QueryBuilders.termQuery("city", params.getCity()));
    }
    // price
    if (params.getMinPrice() != null && params.getMaxPrice() != null){
        boolQuery.filter(QueryBuilders
                .rangeQuery("price")
                .gte(params.getMinPrice())
                .lte(params.getMaxPrice())
        );
    }

    // 算分 function_score
    FunctionScoreQueryBuilder functionScoreQuery = QueryBuilders.functionScoreQuery(
            // 原始查詢
            boolQuery,
            // 陣列
            new FunctionScoreQueryBuilder.FilterFunctionBuilder[]{
                    // 其中一個 function score 元素
                    new FunctionScoreQueryBuilder.FilterFunctionBuilder(
                            // 篩選條件
                            QueryBuilders.termQuery("isAD", true),
                            // 算分函式
                            ScoreFunctionBuilders.weightFactorFunction(10)
                    )
            }
    );
    // 查詢
    request.source().query(functionScoreQuery);
}
```
