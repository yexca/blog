---
slug: 231
title: 'Elasticsearch Data Aggregations'
# draft: true
author: yexca
date: '2025-02-08T14:56:36+09:00'
lastmod: '2025-02-15T17:17:08+09:00'
categories:
    - Learning Tech
tags:
    - Backend Tech
    - Elasticsearch
    - SpringCloud
---

{{< notice >}} This article was translated by gemini-2.5-flash {{< /notice >}}

> **Elasticsearch Series**
>
> | Content                        | Link                                  |
> | :----------------------------- | :------------------------------------ |
> | Elasticsearch Basic Operations | <https://blog.yexca.net/archives/226> |
> | Elasticsearch Query Operations | <https://blog.yexca.net/archives/227> |
> | RestClient Basic Operations    | <https://blog.yexca.net/archives/228> |
> | RestClient Query Operations    | <https://blog.yexca.net/archives/229> |
> | Elasticsearch Data Aggregations | This article                        |
> | Elasticsearch Autocomplete     | <https://blog.yexca.net/archives/232> |
> | Elasticsearch Data Sync        | <https://blog.yexca.net/archives/234> |
> | Elasticsearch Cluster          | <https://blog.yexca.net/archives/235> |

[Aggregations](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations.html) make it super easy to count, analyze, and compute data. For instance:

*   Which phone brands are most popular?
*   What's the average, max, and min price for these phones?
*   How do these phones sell each month?

## Types of Aggregations

Commonly, there are three types:

*   Bucket Aggregations: Used to group documents.
    *   TermAggregation: Groups by document field values, like by brand or country.
    *   Date Histogram: Groups by date intervals, e.g., weekly or monthly.
*   Metric Aggregations: Used to calculate things like max, min, or average values.
    *   Avg: Average value.
    *   Max: Maximum value.
    *   Min: Minimum value.
    *   Stats: Computes max, min, avg, sum, etc., all at once.
*   Pipeline Aggregations: Perform aggregations based on the results of other aggregations.

> Fields participating in aggregations must be of type keyword, date, numeric, or boolean.

## DSL Aggregation Statements

### bucket

Count how many hotel brands exist across all data, i.e., group data by brand.

```json
# bucket term
GET /hotel/_search
{
  "size": 0, // Set size to 0 to exclude documents, only return aggregation results.
  "aggs": {
    "brandAgg": { // Aggregation name
      "terms": { // Aggregation type
        "field": "brand", // Field for aggregation
        "size": 20 // Number of aggregation results to retrieve
      }
    }
  }
}
```

### Sorting Aggregation Results

By default, bucket aggregations count documents within each bucket (as `_count`) and sort by `_count` in descending order. You can customize the sort order using the `order` property.

```json
GET /hotel/_search
{
  "size": 0,
  "aggs": {
    "brandAgg": {
      "terms": {
        "field": "brand",
        "size": 20,
        "order": { // Sorting
          "_count": "asc"
        }
      }
    }
  }
}
```

### Limiting Aggregation Scope

By default, aggregations run on all documents in the index. However, in practice, users provide search criteria. Thus, aggregations must operate on the search results, requiring limiting conditions.

```json
# bucket query
GET /hotel/_search
{
  "query": {
    "range": {
      "price": {
        "lte": 200 // Only aggregate documents where price is less than or equal to 200
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

The bucket aggregation above grouped by brand. Now, we want to get the min, max, and avg user scores for each brand.

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
      "aggs": { // Sub-aggregation of the bucket, operates on each group after grouping
        "scoreStats": { // Aggregation name
          "stats": { // Aggregation type
            "field": "score" // Field for aggregation
          }
        }
      }
    }
  }
}
```

Sorting by Average

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
          "scoreStats.avg": "desc" // Average value descending
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

## RestAPI Aggregations

### Syntax

Aggregation conditions are at the same level as `query`, so use `request.source()` to specify aggregation conditions.

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

Response Handling

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

    // Parse aggregation results
    Aggregations aggregations = response.getAggregations();
    // Get aggregation results by name
    Terms term = aggregations.get("brandAgg");
    // Get buckets
    List<? extends Terms.Bucket> buckets = term.getBuckets();
    // Iterate
    for (Terms.Bucket bucket : buckets) {
        // Get key
        String name = bucket.getKeyAsString();
        System.out.println(name);
    }
}
```

### Use Case

On the frontend, city, star rating, and brand options are usually fixed and don't change with search input.

However, if you search for "Oriental Pearl Tower", the city should only be Shanghai; other cities shouldn't show up.

This means available cities and other options should change based on the search input. To achieve this, the frontend needs to request available cities based on the content. Assuming the API looks like this:

*   Request Method: `POST`
*   Request Path: `/hotel/filters`
*   Request Parameters: `RequestParams`, same parameters as for searching documents.
*   Return Type: `Map<String, List<String>>`

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
    // Create request
    SearchRequest request = new SearchRequest("hotel");
    // Build DSL query
    basicQuery(params, request);
    // Set size
    request.source().size(0);
    // Add aggregations
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
    // Execute request
    try {
        SearchResponse response = client.search(request, RequestOptions.DEFAULT);

        // Parse response
        Map<String, List<String>> result = new HashMap<>();
        Aggregations aggregations = response.getAggregations();
        // Brand
        List<String> brandList = getAggName(aggregations, "brandAgg");
        result.put("品牌", brandList); // Keep original key as per common practice for map keys in such scenarios
        // City
        List<String> cityList = getAggName(aggregations, "cityAgg");
        result.put("城市", cityList);
        // Star Rating
        List<String> starList = getAggName(aggregations, "starAgg");
        result.put("星级", starList);
        return result;
    } catch (IOException e) {
        throw new RuntimeException(e);
    }
}

private static List<String> getAggName(Aggregations aggregations, String name) {
    // Get brand aggregation
    Terms brand = aggregations.get(name);
    // Get buckets
    List<? extends Terms.Bucket> buckets = brand.getBuckets();
    // Iterate
    List<String> brandList = new ArrayList<>();
    for (Terms.Bucket bucket : buckets) {
        // Get key
        String key = bucket.getKeyAsString();
        brandList.add(key);
    }
    return brandList;
}
```
