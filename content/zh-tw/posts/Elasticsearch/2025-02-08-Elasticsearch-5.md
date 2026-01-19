---
slug: 231
title: 'Elasticsearch 資料聚合'
# draft: true
author: yexca
date: '2025-02-08T14:56:36+09:00'
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
> | RestClient 查詢操作 | <https://blog.yexca.net/archives/229> |
> | Elasticsearch 資料聚合 | 本文 |
> | Elasticsearch 自動補齊 | <https://blog.yexca.net/archives/232> |
> | Elasticsearch 資料同步 | <https://blog.yexca.net/archives/234> |
> | Elasticsearch 叢集 | <https://blog.yexca.net/archives/235> |

[聚合 (aggregations)](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations.html) 可以讓我們極其方便地實現對資料的統計、分析、運算。例如：

*   什麼品牌的行動電話最受歡迎？
*   這些行動電話的平均價格、最高價格、最低價格？
*   這些行動電話每月的銷售情況如何？

## 聚合的種類

常見的有三類：

*   桶 (bucket) 聚合：用來對文件做分組
    *   TermAggregation：依照文件欄位值分組，例如依照品牌、國家分組
    *   Date Histogram：依照日期階梯分組，例如一週或一月為一組
*   度量 (metric) 聚合：用以計算一些最大值、最小值、平均值等
    *   Avg：平均值
    *   Max：最大值
    *   Min：最小值
    *   Stats：同時求 max、min、avg、sum 等
*   管道 (pipeline) 聚合：其他聚合的結果為基礎做聚合

> 參與聚合的欄位必須是 keyword、日期、數值、布林類型

## DSL 聚合語句

### bucket

統計所有資料中飯店的品牌有幾種，即依品牌對資料分組

```json
# bucket term
GET /hotel/_search
{
  "size": 0, // 設定size為0，結果中不包含文件，只包含聚合結果
  "aggs": {
    "brandAgg": { // 聚合名稱
      "terms": { // 聚合類型
        "field": "brand", // 參與聚合欄位
        "size": 20 // 取得的聚合結果數量
      }
    }
  }
}
```

### 聚合結果排序

預設情況下，bucket 聚合會統計 bucket 內的文件數量，記為 count，並且依 count 降序排序。透過指定 order 屬性，自訂聚合的排序方式

```json
GET /hotel/_search
{
  "size": 0,
  "aggs": {
    "brandAgg": {
      "terms": {
        "field": "brand",
        "size": 20,
        "order": { // 排序
          "_count": "asc"
        }
      }
    }
  }
}
```

### 限定聚合範圍

預設情況下會對索引庫所有文件聚合，但實際使用時，使用者會輸入搜尋條件，因此聚合必須是對搜尋結果的聚合，聚合就必須要新增限定條件

```json
# bucket query
GET /hotel/_search
{
  "query": {
    "range": {
      "price": {
        "lte": 200 // 只對價格小於200的文件聚合
      }
    }
  },
  "size": 0,
  "aggs": {
    "brandAggQuery": {
      "terms": {
        "field": "brand",
        "size": 20
      }
    }
  }
}
```

### Metric

上述 bucket 聚合依品牌分組，現在要取得每個品牌使用者評分的 min、max、avg

```json
# metric
GET /hotel/_search
{
  "size": 0,
  "aggs": {
    "brandAgg": {
      "terms": {
        "field": "brand",
        "size": 20
      },
      "aggs": { // bucket的子聚合，對分組後每個組運算
        "scoreStats": { // 聚合名稱
          "stats": { // 聚合類型
            "field": "score" // 聚合欄位
          }
        }
      }
    }
  }
}
```

依照平均值排序

```json
GET /hotel/_search
{
  "size": 0,
  "aggs": {
    "brandAgg": {
      "terms": {
        "field": "brand",
        "size": 20,
        "order": {
          "scoreStats.avg": "desc" // 平均值降序
        }
      },
      "aggs": {
        "scoreStats": {
          "stats": {
            "field": "score"
          }
        }
      }
    }
  }
}
```

## RestAPI 聚合

### 語法

聚合條件與 query 同級，因此使用 `request.source()` 指定聚合條件

```java
@Test
public void testAggTerm() throws IOException {
    SearchRequest request = new SearchRequest("hotel");

    request.source().size(0);
    request.source().aggregation(
            AggregationBuilders
                    .terms("brandAgg")
                    .field("brand")
                    .size(20)
    );

    SearchResponse response = client.search(request, RequestOptions.DEFAULT);
}
```

回應處理

```java
@Test
public void testAggTerm() throws IOException {
    SearchRequest request = new SearchRequest("hotel");

    request.source().size(0);
    request.source().aggregation(
            AggregationBuilders
                    .terms("brandAgg")
                    .field("brand")
                    .size(20)
    );

    SearchResponse response = client.search(request, RequestOptions.DEFAULT);

    // 解析聚合結果
    Aggregations aggregations = response.getAggregations();
    // 依名稱取得聚合結果
    Terms term = aggregations.get("brandAgg");
    // 取得bucket
    List<? extends Terms.Bucket> buckets = term.getBuckets();
    // 遍歷
    for (Terms.Bucket bucket : buckets) {
        // 取得key
        String name = bucket.getKeyAsString();
        System.out.println(name);
    }
}
```

### 範例需求

前端頁面的城市、星級、品牌都是固定供選擇的，不會隨著搜尋輸入而改變

但是假如搜尋 "東方明珠"，那城市只能是上海，不應該顯示其他城市

也就是可供選擇的城市等應該隨著搜尋輸入的內容改變，為此，前端需要依照內容請求可選城市，假設介面如下：

*   請求方式：`POST`
*   請求路徑：`/hotel/filters`
*   請求參數：`RequestParams`，與搜尋文件的參數一致
*   回傳值類型：`Map<String, List<String>>`

Controller

```java
@PostMapping("/filters")
public Map<String, List<String>> getFilters(@RequestBody RequestParams params){
    return hotelService.getFilters(params);
}
```

Service

```java
public Map<String, List<String>> getFilters(RequestParams params) {
    // 請求
    SearchRequest request = new SearchRequest("hotel");
    // DSL
    basicQuery(params, request);
    // 設定size
    request.source().size(0);
    // 聚合
    request.source().aggregation(
            AggregationBuilders
                    .terms("brandAgg")
                    .field("brand")
                    .size(100)
    );
    request.source().aggregation(
            AggregationBuilders
                    .terms("cityAgg")
                    .field("city")
                    .size(100)
    );
    request.source().aggregation(
            AggregationBuilders
                    .terms("starAgg")
                    .field("starName")
                    .size(100)
    );
    // 請求
    try {
        SearchResponse response = client.search(request, RequestOptions.DEFAULT);

        // 解析回應
        Map<String, List<String>> result = new HashMap<>();
        Aggregations aggregations = response.getAggregations();
        // 品牌
        List<String> brandList = getAggName(aggregations, "brandAgg");
        result.put("品牌", brandList);
        // 城市
        List<String> cityList = getAggName(aggregations, "cityAgg");
        result.put("城市", cityList);
        // 星級
        List<String> starList = getAggName(aggregations, "starAgg");
        result.put("星級", starList);
        return result;
    } catch (IOException e) {
        throw new RuntimeException(e);
    }
}

private static List<String> getAggName(Aggregations aggregations, String name) {
    // 取得品牌
    Terms brand = aggregations.get(name);
    // 取得bucket
    List<? extends Terms.Bucket> buckets = brand.getBuckets();
    // 遍歷
    List<String> brandList = new ArrayList<>();
    for (Terms.Bucket bucket : buckets) {
        // 取得key
        String key = bucket.getKeyAsString();
        brandList.add(key);
    }
    return brandList;
}
```
