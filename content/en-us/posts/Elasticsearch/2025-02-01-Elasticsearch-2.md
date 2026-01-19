---
slug: 227
title: 'Elasticsearch Queries'
# draft: true
author: yexca
date: '2025-02-01T15:16:28+09:00'
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
> | Content                   | Link                                  |
> | :--------------------- | :------------------------------------ |
> | Elasticsearch Basic Operations | <https://blog.yexca.net/archives/226> |
> | Elasticsearch Query Operations | This article |
> | RestClient Basic Operations | <https://blog.yexca.net/archives/228> |
> | RestClient Query Operations | <https://blog.yexca.net/archives/229> |
> | Elasticsearch Data Aggregation | <https://blog.yexca.net/archives/231> |
> | Elasticsearch Autocomplete | <https://blog.yexca.net/archives/232> |
> | Elasticsearch Data Synchronization | <https://blog.yexca.net/archives/234> |
> | Elasticsearch Cluster | <https://blog.yexca.net/archives/235> |

The previous article mainly covered ES's data storage features. However, ES truly excels at search and data analysis.

ES queries are still implemented using JSON-style DSL.

## Query Categories

Common query types include:

* **Match All:** Retrieves all data, typically for testing. E.g., `match_all`.
* **Full-Text Search Queries:** Uses an analyzer to tokenize user input, then matches against the inverted index. E.g.:
  * `match_query`
  * `multi_match_query`
* **Exact Queries:** Finds data based on precise term values, typically for `keyword`, numeric, date, or boolean fields. E.g.:
  * `ids`
  * `range`
  * `term`
* **Geographic (Geo) Queries:** Queries based on latitude and longitude. E.g.:
  * `geo_distance`
  * `geo_bounding_box`
* **Compound Queries:** Combines the above simple query conditions to form complex queries. E.g.:
  * `bool`
  * `function_score`

The query syntax is generally consistent:

```json
GET /indexName/_search
{
    "query": {
        "QueryType": {
            "QueryCondition": "ConditionValue"
        }
    }
}
```

## Match All

The query type is `match_all`, with no query conditions.

```json
// Query all
GET /indexName/_search
{
    "query": {
        "match_all": {}
    }
}
```

## Full-Text Search Queries

These queries tokenize user input and are commonly used for search box functionality. Since they match against terms, the fields involved in the search must also be tokenizable `text` type fields.

Common types:

* `match`: Single-field query.
* `multi_match`: Multi-field query; any field meeting the condition satisfies the query.

`match` query syntax:

```json
# match
GET /indexName/_search
{
  "query": {
    "match": {
      "FIELD": "TEXT"
    }
  }
}

# Example
GET /hotel/_search
{
  "query": {
    "match": {
      "all": "外滩如家"
    }
  }
}
```

`multi_match` syntax:

```json
# multi_match
GET /indexName/_search
{
  "query": {
    "multi_match": {
      "query": "TEXT",
      "fields": ["FIELD1", "FIELD2"]
    }
  }
}

# Example
GET /hotel/_search
{
  "query": {
    "multi_match": {
      "query": "外滩如家",
      "fields": ["brand", "name", "business"]
    }
  }
}
```

> Since `brand`, `name`, `business` values were copied to the `all` field when creating the index, the results of the two query types above are the same.
>
> However, searching more fields impacts performance more. Using `copy_to` and then a single-field query is recommended.

## Exact Queries

Exact queries do not tokenize the search condition. Common types include:

* `term`: Searches based on an exact term value.
* `range`: Searches based on a range of values.

### Term Query

The query condition must be a non-tokenized term. Only an exact match between the input and the value will satisfy the condition.

Syntax:

```json
# term
GET /indexName/_search
{
  "query": {
    "term": {
      "FIELD": {
        "value": "VALUE"
      }
    }
  }
}
```

Example:

```json
GET /hotel/_search
{
  "query": {
    "term": {
      "city": {
        "value": "上海"
      }
    }
  }
}
```

### Range Query

Range queries are typically used for filtering numeric types by a range. For example, filtering by price or date ranges.

Syntax:

```json
# range
GET /hotel/_search
{
  "query": {
    "range": {
      "FIELD": {
        "gte": 10, // gte means greater than or equal to, gt means greater than
        "lte": 20 // lte means less than or equal to, lt means less than
      }
    }
  }
}
```

Example:

```json
GET /hotel/_search
{
  "query": {
    "range": {
      "price": {
        "gte": 1000,
        "lte": 2000
      }
    }
  }
}
```

## Geographic Coordinate Queries

These are essentially searches based on latitude and longitude. Official documentation: <https://www.elastic.co/guide/en/elasticsearch/reference/current/geo-queries.html>

Common scenarios: searching for nearby hotels, taxis, people, or restaurants.

### Bounding Box Query

`geo_bounding_box` query: searches for all documents whose coordinates fall within a specified rectangular area.

Requires specifying the coordinates of the top-left and bottom-right points.

```json
# geo_bounding_box
GET /indexName/_search
{
  "query": {
    "geo_bounding_box": {
      "FIELD": {
        "top_left": { // Top-left point
          "lat": 30,
          "lon": 20
        },
        "bottom_right": { // Bottom-right point
          "lat": 31,
          "lon": 21
        }
      }
    }
  }
}
```

### Proximity Query

Also known as `geo_distance` query: searches for all documents within a specified distance from a given central point.

```json
# geo_distance
GET /indexName/_search
{
  "query": {
    "geo_distance": {
      "distance": "15km", // Radius
      "FIELD": "31, 21" // Center point
    }
  }
}
```

Example: Search for hotels within 15km of (31.21, 121.5).

```json
GET /hotel/_search
{
  "query": {
    "geo_distance": {
      "distance": "15km",
      "location": "31.21, 121.5"
    }
  }
}
```

## Compound Queries

Combine simple queries to achieve more complex search logic. There are two common types:

* `function score`: A scoring function query that controls document relevance scores to influence ranking.
* `bool query`: A boolean query that combines multiple other queries using logical relationships to achieve complex searches.

### Relevance Scoring

When using a `match` query, document results are scored based on their relevance to the search terms (`_score`), and returned in descending order of score, e.g.:

```json
[
  {
    "_score" : 17.850193,
    "_source" : {
      "name" : "虹桥如家酒店真不错",
    }
  },
  {
    "_score" : 12.259849,
    "_source" : {
      "name" : "外滩如家酒店真不错",
    }
  },
  {
    "_score" : 11.91091,
    "_source" : {
      "name" : "迪士尼如家酒店真不错",
    }
  }
]
```

In ES, the scoring algorithm used in earlier versions was TF-IDF.

![image](https://jsd.cdn.zzko.cn/gh/yexca/image_hosting@master/2024/01-SpringCloud/image-20210721190152134.z026lthgfsw.webp)

The TF-IDF algorithm had a flaw: higher term frequency led to higher document scores, giving a single term too much influence. After version 5.1, the algorithm was changed to BM25, which gives a maximum limit to a single term's score.

![image](https://jsd.cdn.zzko.cn/gh/yexca/image_hosting@master/2024/01-SpringCloud/image-20210721190416214.erx3gt63494.webp)

### Function Score Query

While the BM25 scoring function is generally reasonable, it may not align with product requirements. To control relevance scoring, you can use ES's `function_score` query to modify a document's relevance score and reorder results based on the new scores.

Structure:

```json
# function score
GET /indexName/_search
{
  "query": {
    "function_score": {
      "query": {}, // Original query
      "functions": [
        {
          "filter": {}, // Filter condition
          "weight": 1 // Score function
        }
      ],
      "boost_mode": "multiply" // Operation mode
    }
  }
}
```

* **Original Query:** Searches documents based on this condition and scores them using the BM25 algorithm (original query score).
* **Filter Condition:** Only documents matching this condition will be re-scored.
* **Score Function:** Documents matching the filter condition will be processed by this function to get a function score. There are four types of functions:
  * `weight`: Function result is a constant.
  * `field_value_factor`: Uses a field's value in the document as the function result.
  * `random_score`: Uses a random number as the function result.
  * `script_score`: Custom scoring function algorithm.
* **Operation Mode:** The way the function score and the original query's relevance score are combined. Includes:
  * `multiply`: Multiplies the scores.
  * `replace`: Replaces the query score with the function score.
  * Others, such as: `sum`, `avg`, `max`, `min`.

Example: Give "如家" (Rujia) brand hotels a higher rank.

```json
GET /hotel/_search
{
  "query": { // Original query condition is any; added condition here for execution
    "function_score": {
      "query": {"term": {
        "city": "上海"
      }},
      "functions": [
        {
          "filter": {"term": {
            "brand": "如家"
          }},
          "weight": 10
        }
      ],
      "boost_mode": "multiply"
    }
  }
}
```

### Boolean Query

A boolean query combines one or more query clauses. Each clause is a sub-query, and they can be combined in the following ways:

* `must`: All sub-queries must match, similar to "AND".
* `should`: Sub-queries are optional matches, similar to "OR".
* `must_not`: Sub-queries must not match, does not contribute to the score, similar to "NOT".
* `filter`: Sub-queries must match, does not contribute to the score.

For example, when searching for hotels, you might filter by region, brand, price, etc. Each different field requires a different query condition and method. To combine these multiple distinct queries, a `bool` query is necessary.

> Fields contributing to scoring generally lead to slower query performance. For multi-condition queries, it's recommended:
>
> * Keyword searches in the search box are full-text searches, use `must` query, and contribute to scoring.
> * Other filter conditions, use `filter` query, and do not contribute to scoring.

Syntax:

```json
# bool
GET /hotel/_search
{
  "query": {
    "bool": {
      "must": [
        {}
      ],
      "should": [
        {}
      ],
      "must_not": [
        {}
      ],
      "filter": [
        {}
      ]
    }
  }
}
```

Example: Search for hotels whose name contains "如家", price is not higher than 400, and are within 10km of coordinates 31.21, 121.5.

```json
GET /hotel/_search
{
  "query": {
    "bool": {
      "must": [
        {"match": {
          "name": "如家"
        }}
      ],
      "must_not": [
        {"range": {
          "price": {
            "gt": 400
          }
        }}
      ],
      "filter": [
        {"geo_distance": {
          "distance": "10km",
          "location": {
            "lat": 31.21,
            "lon": 121.5
          }
        }}
      ]
    }
  }
}
```

## Search Result Processing

Search results can be sorted, paginated, and highlighted.

### Sorting

ES sorts by relevance score by default, but it also supports custom sorting of search results. Fields that can be sorted include `keyword` type, numeric type, geographic coordinate type, date type, etc.

#### Standard Field Sorting

Sorting for `keyword`, numeric, and date types has largely the same syntax.

Syntax:

```json
# sort_normal
GET /indexName/_search
{
  "query": {
    
  },
  "sort": [
    {
      "FIELD": {
        "order": "desc" // Sort field, ASC, DESC
      }
    }
  ]
}
```

The sort condition is an array, allowing multiple sort conditions. They are applied in the declared order: if the first condition is equal, the second condition is used, and so on.

Example: Hotel data sorted by user review in descending order, then by price in ascending order if reviews are the same.

```json
GET /hotel/_search
{
  "query": {
    "match": {
      "city": "上海"
    }
  },
  "sort": [
    {
      "score": {
        "order": "desc"
      }
    },
    {
      "price": {
        "order": "asc"
      }
    }
  ]
}
// Or
GET /hotel/_search
{
  "query": {
    "match": {
      "city": "上海"
    }
  },
  "sort": [
    {
      "score": "desc"
    },
    {
      "price": "asc"
    }
  ]
}
```

#### Geographic Coordinate Sorting

Syntax:

```json
# sort_geo
GET /indexName/_search
{
  "query": {
    
  },
  "sort": [
    {
      "_geo_distance": {
        "FIELD": {
          "lat": 40,
          "lon": -70
        },
        "order": "asc", // Sort order
        "unit": "km" // Sort unit
      }
    }
  ]
}
```

Example: Sort hotels by distance (assuming location is 31.034661, 121.612282).

> Gaode (Amap) to get lat/lon: <https://lbs.amap.com/demo/jsapi-v2/example/map/click-to-get-lnglat/>

```json
GET /hotel/_search
{
  "query": {
    "match_all": {}
  },
  "sort": [
    {
      "_geo_distance": {
        "location": {
          "lat": 31.034661,
          "lon": 121.612282
        },
        "order": "asc",
        "unit": "km"
      }
    }
  ]
}
```

### Pagination

ES by default only returns the top 10 documents. To query more data, you need to modify the pagination parameters. ES controls the paginated results returned by modifying the `from` and `size` parameters:

* `from`: The starting document index.
* `size`: The total number of documents to query.

> Similar to `limit ?,?` in MySQL.

#### Basic Pagination

The basic syntax is as follows:

```json
# Basic pagination
GET /indexName/_search
{
  "query": {
    
  },
  "from": 0,
  "size": 10,
  "sort": [
    {
      "FIELD": {
        "order": "desc"
      }
    }
  ]
}
```

#### Deep Pagination Problem

To query data from 990-1000, the statement would be:

```json
GET /hotel/_search
{
  "query": {
    "match_all": {}
  },
  "from": 990,
  "size": 10,
  "sort": [
    {
      "price": {
        "order": "asc"
      }
    }
  ]
}
```

However, due to ES's mechanism, pagination requires first querying documents from 0-1000, then taking documents from 990-1000 for display.

If ES is in a single-node setup, this has little impact. But in a clustered deployment, querying 1000 documents does not mean each node queries 200 documents, because node A's 200 documents might rank outside the Top 1000 on node B.

To get the Top 1000, each node needs to query its own Top 1000, then results are aggregated, re-ranked, and finally truncated.

Querying Top 10000 or more can put significant pressure on memory and CPU. Therefore, ES restricts `from + size` from exceeding 10000.

For deep pagination, ES provides two solutions: <https://www.elastic.co/guide/en/elasticsearch/reference/current/paginate-search-results.html>

* `search after`: Requires sorting during pagination. The principle is to query the next page's data starting from the sort values of the last document on the previous page. Officially recommended.
* `scroll`: The principle is to create a snapshot of sorted document IDs in memory. Officially no longer recommended.

#### Pagination Summary

* `from + size`:
  * **Pros:** Supports arbitrary page jumps.
  * **Cons:** Deep pagination issues, default query limit (`from + size`) is 10000.
  * **Scenarios:** Random pagination searches like Baidu, JD, Google, Taobao.
* `search after`:
  * **Pros:** No query limit (single query `size` does not exceed 10000).
  * **Cons:** Can only query pages sequentially forward, does not support arbitrary page jumps.
  * **Scenarios:** Searches without a random page jump requirement, e.g., scrolling down on a mobile phone.

* `scroll`:
  * **Pros:** No query limit (single query `size` does not exceed 10000).
  * **Cons:** Incurs extra memory overhead, and search results are not real-time.
  * **Scenarios:** Retrieving and migrating large amounts of data. Not recommended since ES 7.1; `search after` is suggested instead.

### Highlighting

When searching content with a search engine, keywords often appear in a prominent color (e.g., red) for better visibility. This is highlighting, typically achieved by adding a tag (`<em>`) around all keywords in a document and applying CSS styles to that tag.

Syntax:

```json
# Highlight
GET /indexName/_search
{
  "query": {
    
  },
  "highlight": {
    "fields": { // Specify fields to highlight
      "FIELD": {
        "pre_tags": "<em>", // Pre-tag for highlighting field
        "post_tags": "</em>" // Post-tag for highlighting field
      }
    }
  }
}
```

Notes:

* Highlighting applies to keywords, so the search condition must involve keywords, not range queries.
* By default, highlighted fields must be the same as the fields specified in the search; otherwise, highlighting won't work.
* To highlight fields not explicitly searched, add the attribute: `required_field_match=false`.

Example: Search with the name field highlighted.

```json
GET /hotel/_search
{
  "query": {
    "match": {
      "all": "如家"
    }
  },
  "highlight": {
    "fields": {
      "name": {
        "require_field_match": "false", 
        "pre_tags": "<em>",
        "post_tags": "</em>"
      }
    }
  }
}

// Truncated result
"hits" : [
    {
    "_index" : "hotel",
    "_type" : "_doc",
    "_id" : "339952837",
    "_score" : 2.7875905,
    "_source" : {
      "address" : "良乡西路7号",
      "brand" : "如家",
      "business" : "房山风景区",
      "city" : "北京",
      "id" : 339952837,
      "location" : "39.73167, 116.132482",
      "name" : "如家酒店(北京良乡西路店)",
      "pic" : "https://m.tuniucdn.com/fb3/s1/2n9c/3Dpgf5RTTzrxpeN5y3RLnRVtxMEA_w200_h200_c1_t0.jpg",
      "price" : 159,
      "score" : 46,
      "starName" : "二钻"
    },
    "highlight" : {
      "name" : [
        "<em>如家</em>酒店(北京良乡西路店)"
      ]
    }
  }
]
```

The `highlight` section of the result shows the text with the added tags.

### Search Result Processing Summary

A DSL query is a large JSON object containing:

* `query`: Search query.
* `from`, `size`: Pagination conditions.
* `sort`: Sort conditions.
* `highlight`: Highlighting conditions.

Comprehensive example:

```json
# Comprehensive Query
GET /hotel/_search
{
  "query": { // Query
    "match": {
      "city": "上海"
    }
  },
  "from": 10, // Pagination start
  "size": 10, // Pagination size
  "sort": [
    { // Normal sort
      "price": {
        "order": "asc"
      }
    },
    { // Distance sort
      "_geo_distance": {
        "location": {
          "lat": 31,
          "lon": 121
        },
        "order": "asc",
        "unit": "km"
      }
    }
  ],
  "highlight": { // Highlight fields
    "fields": {
      "name": {
        "require_field_match": "false", 
        "pre_tags": "<em>",
        "post_tags": "</em>"
      }
    }
  }
}
```
