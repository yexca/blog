---
slug: 229
title: 'Elasticsearch RestClient Queries'
# draft: true
author: yexca
date: '2025-02-05T15:50:26+09:00'
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
> | Content                       | Link                                  |
> | :---------------------------- | :------------------------------------ |
> | Elasticsearch Basic Operations | <https://blog.yexca.net/archives/226> |
> | Elasticsearch Query Operations | <https://blog.yexca.net/archives/227> |
> | RestClient Basic Operations   | <https://blog.yexca.net/archives/228> |
> | RestClient Query Operations   | This Article                          |
> | Elasticsearch Data Aggregation | <https://blog.yexca.net/archives/231> |
> | Elasticsearch Autocomplete    | <https://blog.yexca.net/archives/232> |
> | Elasticsearch Data Sync       | <https://blog.yexca.net/archives/234> |
> | Elasticsearch Cluster         | <https://blog.yexca.net/archives/235> |

Querying documents also uses the `RestHighLevelClient` object.

## match_all

Here's how to initiate the request:

```java
@Test
public void testMatchAll() throws IOException {
    // Prep the request
    SearchRequest request = new SearchRequest("hotel");
    // Build DSL parameters
    request.source().query(QueryBuilders.matchAllQuery());
    // Send the request
    SearchResponse response = client.search(request, RequestOptions.DEFAULT);

    System.out.println(response);
}
```

Parsing the Response

```java
@Test
public void testMatchAll() throws IOException {
    // Prep the request
    SearchRequest request = new SearchRequest("hotel");
    // Build DSL parameters
    request.source().query(QueryBuilders.matchAllQuery());
    // Send the request
    SearchResponse response = client.search(request, RequestOptions.DEFAULT);

    // Parse the results
    SearchHits searchHits = response.getHits();
    // Total hits
    long total = searchHits.getTotalHits().value;
    // Array of search results
    SearchHit[] hits = searchHits.getHits();
    for (SearchHit hit : hits) {
        String json = hit.getSourceAsString();
        System.out.println(json);
    }
}
```

ES returns a JSON string, which includes:

* `hits`: Matching results
  * `total`: Total hits, where `value` is the exact count.
  * `max_score`: Relevance score for the highest-scoring document among all results.
  * `hits`: Array of search result documents, each a JSON object.
    * `_source`: Original data in the document, also a JSON object.

So, parsing the response means parsing the JSON string layer by layer, as follows:

* `SearchHits`: Obtained via `response.getHits()`, this is the outermost `hits` in the JSON, representing the matched results.
  * `SearchHits.getTotalHits().value`: Gets the total hit count.
  * `SearchHits.getHits()`: Gets the `SearchHit` array, which is the document array.
    * `SearchHit.getSourceAsString()`: Gets `_source` from the document results, which is the raw JSON document data.

## match and multi_match

Similar to `match_all`, the difference is the query condition.

`match` Code

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

`multi_match` Code

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

You can see a lot of code repetition here. Use `Ctrl+Alt+M` to refactor and extract a method. The `term` code demonstrates this extraction.

## Precise Queries

`term` exact match query

```java
@Test
public void testTerm() throws IOException {
    SearchRequest request = new SearchRequest("hotel");
    request.source().query(QueryBuilders.termQuery("city", "上海"));
    SearchResponse response = client.search(request, RequestOptions.DEFAULT);

    responseHandle(response);
}

// Extracted response handling code
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

`range` query

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

## Boolean Queries

```java
@Test
public void testBool() throws IOException {
    SearchRequest request = new SearchRequest("hotel");

    // Build the boolean query
    BoolQueryBuilder booledQuery = QueryBuilders.boolQuery();
    // Add a 'must' condition
    booledQuery.must(QueryBuilders.termQuery("city", "上海"));
    // Add a 'filter' component
    booledQuery.filter(QueryBuilders.rangeQuery("price").lte(300));

    request.source().query(booledQuery);
    SearchResponse response = client.search(request, RequestOptions.DEFAULT);

    responseHandle(response);
}
```

## Sorting and Pagination

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

## Highlighting

Highlighting differs significantly from the previous code. Here's how to build the request:

```java
@Test
public void testHigh() throws IOException {
    SearchRequest request = new SearchRequest("hotel");
    // DSL
    request.source().query(QueryBuilders.matchQuery("all", "汉庭"));
    // Highlighting
    request.source().highlighter(
            new HighlightBuilder()
            .field("name")
            .requireFieldMatch(false)
    );
    // Send the request
    SearchResponse response = client.search(request, RequestOptions.DEFAULT);
        
    // Parse
    responseHandle(response);
}
```

Since search results and highlighting are separate, response parsing needs additional handling.

```java
@Test
public void testHigh() throws IOException {
    SearchRequest request = new SearchRequest("hotel");
    // DSL
    request.source().query(QueryBuilders.matchQuery("all", "汉庭"));
    // Highlighting
    request.source().highlighter(
            new HighlightBuilder()
            .field("name")
            .requireFieldMatch(false)
    );
    // Send the request
    SearchResponse response = client.search(request, RequestOptions.DEFAULT);

    // Parse
    SearchHits searchHits = response.getHits();
    // Total hits
    long total = searchHits.getTotalHits().value;
    System.out.println(total);
    // Document array
    SearchHit[] hits = searchHits.getHits();
    for (SearchHit hit : hits) {
        String json = hit.getSourceAsString();
        // Deserialize
        HotelDoc hotelDoc = JSON.parseObject(json, HotelDoc.class);
        // Get highlight results
        Map<String, HighlightField> highlightFields = hit.getHighlightFields();
        if(!CollectionUtils.isEmpty(highlightFields)){
            // Get highlight results
            HighlightField highlightField = highlightFields.get("name");
            if (highlightField != null){
                String name = highlightField.getFragments()[0].toString();
                // Overwrite non-highlighted content
                hotelDoc.setName(name);
            }
        }
        System.out.println(hotelDoc);
    }
}
```

## Hotel Search Case Study

Implements four features:

* Hotel search and pagination
* Hotel result filtering
* Hotels near me
* Hotel sponsored ranking

### Search and Pagination

Search Request:

* Method: POST
* Path: /hotel/list
* Parameters: JSON object, containing 4 fields:
  * `key`: Search keyword
  * `page`: Page number
  * `size`: Page size
  * `sortBy`: Sort order, not implemented yet
* Return Value: Paginated query, needs to return a `PageResult` containing two properties:
  * `total`: Total hits
  * `List<HotelDoc>`: Data for the current page

First, define the entity class to receive parameters.

```java
@Data
public class RequestParams {
    private String key;
    private Integer page;
    private Integer size;
    private String sortBy;
}
```

Define the return class.

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

Define the Controller.

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

Implement the search business. First, register a `Bean` object.

```java
@Bean
public RestHighLevelClient client(){
    return new RestHighLevelClient(RestClient
            .builder(HttpHost.create("http://ip:9200")
            ));
}
```

Write the logic.

```java
public PageResult search(RequestParams params) {
    // Request
    SearchRequest request = new SearchRequest("hotel");
    BoolQueryBuilder boolQuery = QueryBuilders.boolQuery();
    // DSL
    String key = params.getKey();
    if (key == null || "".equals(key)){
        boolQuery.must(QueryBuilders.matchAllQuery());
    }else {
        boolQuery.must(QueryBuilders.matchQuery("all", key));
    }
    // Pagination
    int page = params.getPage();
    int size = params.getSize();
    request.source().from((page - 1) * size).size(size);
    // Query
    request.source().query(boolQuery);
    // Send request
    try {
        SearchResponse response = client.search(request, RequestOptions.DEFAULT);

        // Parse response
        SearchHits searchHits = response.getHits();
        // Total
        long total = searchHits.getTotalHits().value;
        // Documents
        SearchHit[] hits = searchHits.getHits();
        // Iterate
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

### Result Filtering

Filtering conditions include:

* `brand`: Brand value
* `city`: City
* `minPrice~maxPrice`: Price range
* `starName`: Star rating

Modify the entity class.

```java
@Data
public class RequestParams {
    private String key;
    private Integer page;
    private Integer size;
    private String sortBy;
    // Below are the newly added filter parameters
    private String city;
    private String brand;
    private String starName;
    private Integer minPrice;
    private Integer maxPrice;
}
```

Modify the query conditions.

```java
@Override
public PageResult search(RequestParams params) {
    // Request
    SearchRequest request = new SearchRequest("hotel");
    basicQuery(params, request);
    // Pagination
    int page = params.getPage();
    int size = params.getSize();
    request.source().from((page - 1) * size).size(size);

    // Send request
    try {
        SearchResponse response = client.search(request, RequestOptions.DEFAULT);

        // Parse response
        SearchHits searchHits = response.getHits();
        // Total
        long total = searchHits.getTotalHits().value;
        // Documents
        SearchHit[] hits = searchHits.getHits();
        // Iterate
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
    // Input content
    String key = params.getKey();
    if (key == null || "".equals(key)){
        boolQuery.must(QueryBuilders.matchAllQuery());
    }else {
        boolQuery.must(QueryBuilders.matchQuery("all", key));
    }
    // Brand
    if (params.getBrand() != null && !params.getBrand().equals("")){
        boolQuery.filter(QueryBuilders.termQuery("brand", params.getBrand()));
    }
    // Star rating
    if (params.getStarName() != null && !params.getStarName().equals("")){
        boolQuery.filter(QueryBuilders.termQuery("starName", params.getStarName()));
    }
    // City
    if (params.getCity() != null && !params.getStarName().equals("")){
        boolQuery.filter(QueryBuilders.termQuery("city", params.getCity()));
    }
    // Price
    if (params.getMinPrice() != null && params.getMaxPrice() != null){
        boolQuery.filter(QueryBuilders.rangeQuery("price").gte(params.getMinPrice()).lte(params.getMaxPrice()));
    }
    // Query
    request.source().query(boolQuery);
}
```

### Hotels Near Me

Sort nearby hotels by distance, based on `location` coordinates.

Modify the entity class.

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
    // My current geographic coordinates
    private String location;
}
```

Add distance sorting.

```java
if (params.getLocation() != null) {
    // Distance sort
    request.source().sort(SortBuilders
            .geoDistanceSort("location", new GeoPoint(params.getLocation()))
            .order(SortOrder.ASC)
            .unit(DistanceUnit.KILOMETERS)
    );
}
```

### Distance Display

Modify `HotelDoc`, add distance.

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
    // Distance
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

Modify response handling.

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

### Adding Sponsored Hotels

Requirement: Pin specified hotels to the top of search results.

Add a flag to specific hotels, and use this flag in filter conditions to determine if `function_score` should be boosted.

Add an ad flag field to `HotelDoc`.

```java
private Boolean isAD;
```

Use DSL to add flags to some hotels.

```json
# Add ad
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

Add a score function query, modify the `basicQuery()` method.

```java
private static void basicQuery(RequestParams params, SearchRequest request) {
    BoolQueryBuilder boolQuery = QueryBuilders.boolQuery();
    // Input content
    String key = params.getKey();
    if (key == null || "".equals(key)){
        boolQuery.must(QueryBuilders.matchAllQuery());
    }else {
        boolQuery.must(QueryBuilders.matchQuery("all", key));
    }
    // Brand
    if (params.getBrand() != null && !params.getBrand().equals("")){
        boolQuery.filter(QueryBuilders.termQuery("brand", params.getBrand()));
    }
    // Star rating
    if (params.getStarName() != null && !params.getStarName().equals("")){
        boolQuery.filter(QueryBuilders.termQuery("starName", params.getStarName()));
    }
    // City
    if (params.getCity() != null && !params.getStarName().equals("")){
        boolQuery.filter(QueryBuilders.termQuery("city", params.getCity()));
    }
    // Price
    if (params.getMinPrice() != null && params.getMaxPrice() != null){
        boolQuery.filter(QueryBuilders
                .rangeQuery("price")
                .gte(params.getMinPrice())
                .lte(params.getMaxPrice())
        );
    }

    // Score function_score
    FunctionScoreQueryBuilder functionScoreQuery = QueryBuilders.functionScoreQuery(
            // Original query
            boolQuery,
            // Array
            new FunctionScoreQueryBuilder.FilterFunctionBuilder[]{
                    // One of the function score elements
                    new FunctionScoreQueryBuilder.FilterFunctionBuilder(
                            // Filter condition
                            QueryBuilders.termQuery("isAD", true),
                            // Score function
                            ScoreFunctionBuilders.weightFactorFunction(10)
                    )
            }
    );
    // Query
    request.source().query(functionScoreQuery);
}
```
