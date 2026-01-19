---
slug: 229
title: 'Elasticsearch RestClient クエリ'
# draft: true
author: yexca
date: '2025-02-05T15:50:26+09:00'
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
> | Elasticsearch の基本操作 | <https://blog.yexca.net/archives/226> |
> | Elasticsearch のクエリ操作 | <https://blog.yexca.net/archives/227> |
> | RestClient の基本操作 | <https://blog.yexca.net/archives/228> |
> | RestClient のクエリ操作 | 本文 |
> | Elasticsearch のデータ集約 | <https://blog.yexca.net/archives/231> |
> | Elasticsearch のオートコンプリート | <https://blog.yexca.net/archives/232> |
> | Elasticsearch のデータ同期 | <https://blog.yexca.net/archives/234> |
> | Elasticsearch クラスター | <https://blog.yexca.net/archives/235> |

ドキュメントのクエリも同じく RestHighLevelClient オブジェクトを使うよ。

## match_all

リクエストを発行するのはこんな感じ。

```java
@Test
public void testMatchAll() throws IOException {
    // request を準備
    SearchRequest request = new SearchRequest("hotel");
    // DSL パラメータを組み立て
    request.source().query(QueryBuilders.matchAllQuery());
    // リクエストを送信
    SearchResponse response = client.search(request, RequestOptions.DEFAULT);

    System.out.println(response);
}
```

レスポンスのパース

```java
@Test
public void testMatchAll() throws IOException {
    // request を準備
    SearchRequest request = new SearchRequest("hotel");
    // DSL パラメータを組み立て
    request.source().query(QueryBuilders.matchAllQuery());
    // リクエストを送信
    SearchResponse response = client.search(request, RequestOptions.DEFAULT);

    // 結果をパース
    SearchHits searchHits = response.getHits();
    // クエリの合計件数
    long total = searchHits.getTotalHits().value;
    // クエリの結果配列
    SearchHit[] hits = searchHits.getHits();
    for (SearchHit hit : hits) {
        String json = hit.getSourceAsString();
        System.out.println(json);
    }
}
```

Elasticsearch が返す結果は JSON 文字列で、こんな内容が含まれてるんだ：

*   hits：ヒットした結果
    *   total：合計件数。value が具体的な合計件数だよ。
    *   max_score：全結果の中で最もスコアの高いドキュメントの関連性スコア
    *   hits：検索結果のドキュメント配列。それぞれのドキュメントは JSON オブジェクトだよ。
        *   source：ドキュメント内の元データ。これも JSON オブジェクトだね。

だから、レスポンス結果をパースするっていうのは、JSON 文字列を階層的に解析していくってこと。流れはこんな感じだよ：

*   `SearchHits`：response.getHits() で取得できるよ。これは JSON の一番外側の hits で、ヒットした結果を表してる。
    *   `SearchHits.getTotalHits().value`：合計件数情報を取得するんだ。
    *   `SearchHits.getHits()`：SearchHit 配列、つまりドキュメント配列を取得するよ。
    *   `SearchHit.getSourceAsString()`：ドキュメント結果の _source、つまり元の JSON ドキュメントデータを取得するんだ。

## match と multi_match

match_all と似てるけど、違いはクエリ条件だよ。

match のコード

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

multi_match のコード

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

コードの重複が多いのがわかるよね。`Ctrl+Alt+M` でコードを抽出できるよ。term のコードで抽出の例を見せるね。

## 精密クエリ

term 用語の精密一致クエリ

```java
@Test
public void testTerm() throws IOException {
    SearchRequest request = new SearchRequest("hotel");
    request.source().query(QueryBuilders.termQuery("city", "上海"));
    SearchResponse response = client.search(request, RequestOptions.DEFAULT);

    responseHandle(response);
}

// レスポンス処理のコード抽出
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

range 範囲クエリ

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

## ブールクエリ

```java
@Test
public void testBool() throws IOException {
    SearchRequest request = new SearchRequest("hotel");

    // bool クエリを構築
    BoolQueryBuilder booledQuery = QueryBuilders.boolQuery();
    // must 条件を追加
    booledQuery.must(QueryBuilders.termQuery("city", "上海"));
    // filter コンポーネントを追加
    booledQuery.filter(QueryBuilders.rangeQuery("price").lte(300));

    request.source().query(booledQuery);
    SearchResponse response = client.search(request, RequestOptions.DEFAULT);

    responseHandle(response);
}
```

## ソートとページネーション

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

## ハイライト

ハイライトは上記のコードと結構違うから、リクエストの構築から見ていこう。

```java
@Test
public void testHigh() throws IOException {
    SearchRequest request = new SearchRequest("hotel");
    // DSL
    request.source().query(QueryBuilders.matchQuery("all", "汉庭"));
    // ハイライト
    request.source().highlighter(
            new HighlightBuilder()
            .field("name")
            .requireFieldMatch(false)
    );
    // リクエストを送信
    SearchResponse response = client.search(request, RequestOptions.DEFAULT);
        
    // パース
    responseHandle(response);
}
```

ドキュメントのクエリ結果とハイライトは別々だから、結果のパースは追加で処理が必要だよ。

```java
@Test
public void testHigh() throws IOException {
    SearchRequest request = new SearchRequest("hotel");
    // DSL
    request.source().query(QueryBuilders.matchQuery("all", "汉庭"));
    // ハイライト
    request.source().highlighter(
            new HighlightBuilder()
            .field("name")
            .requireFieldMatch(false)
    );
    // リクエストを送信
    SearchResponse response = client.search(request, RequestOptions.DEFAULT);

    // パース
    SearchHits searchHits = response.getHits();
    // 合計件数
    long total = searchHits.getTotalHits().value;
    System.out.println(total);
    // ドキュメント配列
    SearchHit[] hits = searchHits.getHits();
    for (SearchHit hit : hits) {
        String json = hit.getSourceAsString();
        // 逆シリアル化
        HotelDoc hotelDoc = JSON.parseObject(json, HotelDoc.class);
        // ハイライト結果を取得
        Map<String, HighlightField> highlightFields = hit.getHighlightFields();
        if(!CollectionUtils.isEmpty(highlightFields)){
            // ハイライト結果を取得
            HighlightField highlightField = highlightFields.get("name");
            if (highlightField != null){
                String name = highlightField.getFragments()[0].toString();
                // ハイライトされていないものを上書き
                hotelDoc.setName(name);
            }
        }
        System.out.println(hotelDoc);
    }
}
```

## ホテル検索の事例

4つの機能を実装するよ：

*   ホテルの検索とページネーション
*   ホテル結果のフィルタリング
*   自分の周辺のホテル
*   ホテルの入札ランキング

### 検索とページネーション

検索リクエスト：

*   リクエスト方式：POST
*   リクエストパス：/hotel/list
*   リクエストパラメータ：JSON オブジェクトで、4つのフィールドが含まれるよ：
    *   key：検索キーワード
    *   page：ページ番号
    *   size：1ページあたりのサイズ
    *   sortBy：ソート。今はまだ実装しないよ。
*   戻り値：ページングクエリで、ページング結果の PageResult を返す必要があるよ。2つのプロパティが含まれる：
    *   `total`：合計件数
    *   `List<HotelDoc>`：現在のページデータ

まず、エンティティクラスを定義してパラメータを受け取るよ。

```java
@Data
public class RequestParams {
    private String key;
    private Integer page;
    private Integer size;
    private String sortBy;
}
```

戻り値のクラスを定義するよ。

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

Controller を定義するよ。

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

検索ビジネスを実装するんだけど、まず Bean オブジェクトを登録するんだ。

```java
@Bean
public RestHighLevelClient client(){
    return new RestHighLevelClient(RestClient
            .builder(HttpHost.create("http://ip:9200")
            ));
}
```

ロジックを書くよ。

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
    // ページネーション
    int page = params.getPage();
    int size = params.getSize();
    request.source().from((page - 1) * size).size(size);
    // クエリ
    request.source().query(boolQuery);
    // リクエストを送信
    try {
        SearchResponse response = client.search(request, RequestOptions.DEFAULT);

        // レスポンスパース
        SearchHits searchHits = response.getHits();
        // 合計数
        long total = searchHits.getTotalHits().value;
        // ドキュメント
        SearchHit[] hits = searchHits.getHits();
        // イテレート
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

### 結果のフィルタリング

含まれるフィルタリング条件は：

*   brand：ブランド値
*   city：都市
*   minPrice~maxPrice：価格範囲
*   starName：星評価

エンティティクラスを修正するよ。

```java
@Data
public class RequestParams {
    private String key;
    private Integer page;
    private Integer size;
    private String sortBy;
    // 下は追加したフィルタリング条件パラメータだよ
    private String city;
    private String brand;
    private String starName;
    private Integer minPrice;
    private Integer maxPrice;
}
```

クエリ条件を修正するよ。

```java
@Override
public PageResult search(RequestParams params) {
    // request
    SearchRequest request = new SearchRequest("hotel");
    basicQuery(params, request);
    // ページネーション
    int page = params.getPage();
    int size = params.getSize();
    request.source().from((page - 1) * size).size(size);

    // リクエストを送信
    try {
        SearchResponse response = client.search(request, RequestOptions.DEFAULT);

        // レスポンスパース
        SearchHits searchHits = response.getHits();
        // 合計数
        long total = searchHits.getTotalHits().value;
        // ドキュメント
        SearchHit[] hits = searchHits.getHits();
        // イテレート
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
    // 入力内容
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
    // クエリ
    request.source().query(boolQuery);
}
```

### 近くのホテル

location 座標に基づいて、周囲のホテルを距離でソートするよ。

エンティティクラスを修正するよ。

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
    // 自分の現在の地理座標
    private String location;
}
```

距離によるソートを追加するよ。

```java
if (params.getLocation() != null) {
    // 距離ソート
    request.source().sort(SortBuilders
            .geoDistanceSort("location", new GeoPoint(params.getLocation()))
            .order(SortOrder.ASC)
            .unit(DistanceUnit.KILOMETERS)
    );
}
```

### 距離表示

HotelDoc を修正して、距離を追加するよ。

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

レスポンス処理を修正するよ。

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

### 広告ホテルの追加

要件：指定したホテルを検索結果で上位に表示させたい。

指定ホテルにフラグを追加して、フィルタリング条件でこのフラグに基づいて function_score を上げるかどうかを判断するんだ。

HotelDoc に広告フラグフィールドを追加するよ。

```java
private Boolean isAD;
```

DSL を使って、いくつかのホテルにフラグを追加するよ。

```json
# 広告を追加
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

スコアリング関数クエリを追加して、basicQuery() メソッドを修正するよ。

```java
private static void basicQuery(RequestParams params, SearchRequest request) {
    BoolQueryBuilder boolQuery = QueryBuilders.boolQuery();
    // 入力内容
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

    // スコアリング function_score
    FunctionScoreQueryBuilder functionScoreQuery = QueryBuilders.functionScoreQuery(
            // 元のクエリ
            boolQuery,
            // 配列
            new FunctionScoreQueryBuilder.FilterFunctionBuilder[]{
                    // function score の要素の一つ
                    new FunctionScoreQueryBuilder.FilterFunctionBuilder(
                            // フィルタリング条件
                            QueryBuilders.termQuery("isAD", true),
                            // スコアリング関数
                            ScoreFunctionBuilders.weightFactorFunction(10)
                    )
            }
    );
    // クエリ
    request.source().query(functionScoreQuery);
}
```
