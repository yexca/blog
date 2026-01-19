---
slug: 227
title: 'Elasticsearch 查詢'
# draft: true
author: yexca
date: '2025-02-01T15:16:28+09:00'
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
> | Elasticsearch 查詢操作 | 本文 |
> | RestClient 基礎操作 | <https://blog.yexca.net/archives/228> |
> | RestClient 查詢操作 | <https://blog.yexca.net/archives/229> |
> | Elasticsearch 資料彙總 | <https://blog.yexca.net/archives/231> |
> | Elasticsearch 自動補齊 | <https://blog.yexca.net/archives/232> |
> | Elasticsearch 資料同步 | <https://blog.yexca.net/archives/234> |
> | Elasticsearch 叢集 | <https://blog.yexca.net/archives/235> |

上一篇文章主要介紹了 Elasticsearch 的資料儲存功能，但 Elasticsearch 最擅長的還是搜尋和資料分析。

Elasticsearch 的查詢依然是基於 JSON 風格的 DSL 來實作的。

## 查詢分類

常見的查詢類型包括：

*   查詢所有：查詢出所有資料，一般用於測試。例如 match_all
*   全文檢索 (full text) 查詢：利用分詞器對使用者輸入的內容進行分詞，然後到反向索引資料庫中匹配，例如：
    *   match_query
    *   multi_match_query
*   精確查詢：根據精確詞條值尋找資料，一般用於尋找 keyword、數值、日期、boolean 等類型的欄位。例如：
    *   ids
    *   range
    *   term
*   地理 (geo) 查詢：根據經緯度查詢。例如：
    *   geo_distance
    *   geo_bounding_box
*   複合 (compound) 查詢：將上述簡單的查詢條件組合起來，合併查詢條件。例如：
    *   bool
    *   function_score

查詢的語法基本上一致：

```json
GET /indexName/_search
{
    "query": {
        "查詢類型": {
            "查詢條件": "條件值"
        }
    }
}
```

## 查詢所有

查詢類型為 `match_all` 沒有查詢條件

```json
// 查詢所有
GET /indexName/_search
{
    "query": {
        "match_all": {}
    }
}
```

## 全文檢索查詢

會對使用者輸入的內容進行分詞，常用於搜尋框的搜尋。因為是拿著詞條去匹配，因此參與搜尋的欄位也必須是可分詞的 text 類型欄位。

常見的：

*   match：單欄位查詢
*   multi_match：多欄位查詢，任意一個欄位符合條件就算符合查詢條件

match 查詢語法：

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

# 範例
GET /hotel/_search
{
  "query": {
    "match": {
      "all": "外灘如家"
    }
  }
}
```

multi_match 語法

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

# 範例
GET /hotel/_search
{
  "query": {
    "multi_match": {
      "query": "外灘如家",
      "fields": ["brand", "name", "business"]
    }
  }
}
```

> 由於之前建立索引表時將 brand、name、business 的值利用 copy_to 複製到 all 欄位，上述兩種查詢結果相同。
>
> 但搜尋欄位越多對效能影響越大，建議使用 copy_to，然後進行單欄位查詢。

## 精準查詢

精確查詢不會對搜尋條件進行分詞，常見的有：

*   term：根據詞條精確值查詢
*   range：根據值的範圍查詢

### term 查詢

查詢條件必須是不分詞的詞條，輸入與值完全匹配才符合條件。

語法：

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

範例

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

### range 查詢

範圍查詢，一般應用在對數值類型進行範圍過濾時。例如進行價格、日期範圍過濾。

語法：

```json
# range
GET /hotel/_search
{
  "query": {
    "range": {
      "FIELD": {
        "gte": 10, // 這裡的gte代表大於等於，gt則代表大於
        "lte": 20 // lte代表小於等於，lt則代表小於
      }
    }
  }
}
```

範例

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

## 地理座標查詢

其實就是根據經緯度檢索，官方文件：<https://www.elastic.co/guide/en/elasticsearch/reference/current/geo-queries.html>

常用情境：搜尋附近飯店、計程車、人、美食

### 矩形範圍查詢

geo_bounding_box 查詢，查詢座標落在某個矩形範圍內的所有文件。

需要指定左上、右下兩個點的座標。

```json
# geo_bounding_box
GET /indexName/_search
{
  "query": {
    "geo_bounding_box": {
      "FIELD": {
        "top_left": { // 左上點
          "lat": 30,
          "lon": 20
        },
        "bottom_right": { // 右下點
          "lat": 31,
          "lon": 21
        }
      }
    }
  }
}
```

### 附近查詢

也稱為距離查詢 (geo_distance)：查詢到指定中心點小於某個距離值的所有文件。

```json
# geo_distance
GET /indexName/_search
{
  "query": {
    "geo_distance": {
      "distance": "15km", // 半徑
      "FIELD": "31, 21" // 圓心
    }
  }
}
```

範例：搜尋附近 (31.21, 121.5) 15 公里內的飯店

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

## 複合查詢

將其他簡單查詢組合，實現更複雜的搜尋邏輯，常見有兩種：

*   function score：算分函數查詢，可以控制文件關聯性算分，控制文件排名。
*   bool query：布林查詢，利用邏輯關係組合多個其他查詢，實現複雜搜尋。

### 關聯性算分

當使用 match 查詢時，文件結果會根據與搜尋詞條的關聯度給予評分 (_score)，返回結果時會依照分數降序排列，例如：

```json
[
  {
    "_score" : 17.850193,
    "_source" : {
      "name" : "虹橋如家酒店真不錯",
    }
  },
  {
    "_score" : 12.259849,
    "_source" : {
      "name" : "外灘如家酒店真不錯",
    }
  },
  {
    "_score" : 11.91091,
    "_source" : {
      "name" : "迪士尼如家酒店真不錯",
    }
  }
]
```

在 Elasticsearch 中，早期使用的評分演算法是 TF-IDF 演算法。

![image](https://jsd.cdn.zzko.cn/gh/yexca/image_hosting@master/2024/01-SpringCloud/image-20210721190152134.z026lthgfsw.webp)

TF-IDF 演算法有缺陷，就是詞條頻率越高，文件得分也會越高，單個詞條對文件影響較大。在 5.1 版本之後，演算法改為 BM25 演算法，會讓單個詞條的算分有一個上限。

![image](https://jsd.cdn.zzko.cn/gh/yexca/image_hosting@master/2024/01-SpringCloud/image-20210721190416214.erx3gt63494.webp)

### 算分函數查詢

算分函數雖然比較合理，但不一定是產品所需要的。若要控制關聯性算分，就需要利用 Elasticsearch 的 function score 查詢，修改文件的關聯性算分，根據新得到的算分排序。

結構：

```json
# function score
GET /indexName/_search
{
  "query": {
    "function_score": {
      "query": {}, // 原始查詢
      "functions": [
        {
          "filter": {}, // 過濾條件
          "weight": 1 // 算分函數
        }
      ],
      "boost_mode": "multiply" // 運算模式
    }
  }
}
```

原始查詢：基於這個條件搜尋文件，並基於 BM25 演算法給文件評分，即原始算分 (query score)。

過濾條件：符合該條件的文件才會重新算分。

算分函數：符合 filter 條件的文件要根據此函數進行運算，得到函數算分，有四種函數：

*   weight：函數結果是常數
*   field_value_factor：以文件中的某個欄位值作為函數結果
*   random_score：以亂數作為函數結果
*   script_score：自訂算分函數演算法

運算模式：算分函數的結果、原始查詢的關聯性算分，兩者之間的運算方式，包括：

*   multiply：相乘
*   replace：用 function score 取代 query score
*   其他，例如：sum、avg、max、min

範例：讓「如家」這個品牌的飯店排名靠前一些。

```json
GET /hotel/_search
{
  "query": { // 原始查詢條件為任意，此處為能運行添加條件
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

### 布林查詢

布林查詢是一個或多個查詢子句的組合，每一個子句就是一個子查詢，組合方式有：

*   must：必須匹配每個子查詢，類似「且」
*   should：選擇性匹配子查詢，類似「或」
*   must_not：必須不匹配，不參與算分，類似「非」
*   filter：必須匹配，不參與算分

例如在搜尋飯店時，可以選擇地區、品牌、價格等欄位進行過濾，每一個不同的欄位，其查詢條件、方式都不一樣，必須是多個不同的查詢，組合這些查詢就要用布林查詢了。

> 參與評分的欄位，查詢效能越差。多條件查詢時，建議：
>
> 搜尋框的關鍵字搜尋是全文檢索，使用 must 查詢，參與算分。
>
> 其他過濾條件，採用 filter 查詢，不參與算分。

語法：

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

範例：搜尋名字包含「如家」，價格不高於 400，在座標 31.21，121.5 周圍 10 公里範圍內的飯店。

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

## 搜尋結果處理

搜尋得到的結果可以排序、分頁與高亮。

### 排序

Elasticsearch 預設是按照關聯度算分來排序，但是也支援自訂方式對搜尋結果排序，可排序的欄位類型有：keyword 類型、數值類型、地理座標類型、日期類型等。

#### 普通欄位排序

keyword、數值、日期類型排序的語法基本上一致。

語法：

```json
# sort_normal
GET /indexName/_search
{
  "query": {
    
  },
  "sort": [
    {
      "FIELD": {
        "order": "desc" // 排序欄位，ASC、DESC
      }
    }
  ]
}
```

排序條件是一個陣列，可以撰寫多個排序條件，按照宣告的順序，當第一個條件相等時，再按第二個條件，以此類推。

範例：飯店資料按照使用者評價降序，評價相同則按價格升序。

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
// 或者
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

#### 地理座標排序

語法：

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
        "order": "asc", // 排序方式
        "unit": "km" // 排序單位
      }
    }
  ]
}
```

範例：按飯店距離排序 (假設位置為 31.034661，121.612282)。

> 高德取得經緯度：<https://lbs.amap.com/demo/jsapi-v2/example/map/click-to-get-lnglat/>

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

### 分頁

Elasticsearch 預設只返回前 10 筆資料，如果要查詢更多資料就需要修改分頁參數，Elasticsearch 透過修改 from、size 參數來控制要返回的分頁結果：

*   from：從第幾個文件開始
*   size：總共查詢幾個文件

> 類似於 MySQL 中的 `limit ?,?`

#### 基本分頁

基本語法如下

```json
# 基本分頁
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

#### 深度分頁問題

如果要查詢第 990-1000 筆資料，語法如下

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

但由於 Elasticsearch 的機制，分頁時必須先查詢 0-1000 條，然後截取 990-1000 筆資料來顯示。

如果 Elasticsearch 是單點模式，並無太大影響，但叢集部署時查詢 1000 條並不是每個節點查詢 200 條，因為 A 節點的 200 條可能在 B 節點排到 1000 名之外。

為了取得前 1000 筆，需要每個節點都查詢 Top 1000，然後彙總重新排名後截取。

若要查詢 Top 10000 甚至更多筆資料，會對記憶體和 CPU 產生非常大的壓力，因此 Elasticsearch 禁止 from+size 超過 10000 的請求。

而針對深度分頁，Elasticsearch 提供了兩種解決方案：<https://www.elastic.co/guide/en/elasticsearch/reference/current/paginate-search-results.html>

*   search after：分頁時需要排序，原理是從上一次的排序值開始，查詢下一頁資料。官方推薦使用的作法。
*   scroll：原理是將排序後的文件 ID 形成快照，保存在記憶體。官方已經不推薦使用。

#### 分頁總結

*   `from + size`：
    *   優點：支援隨機翻頁
    *   缺點：深度分頁問題，預設查詢上限（from + size）是 10000
    *   情境：百度、京東、Google、淘寶這類隨機翻頁搜尋。
*   `after search`：
    *   優點：沒有查詢上限（單次查詢的 size 不超過 10000）
    *   缺點：只能向後逐頁查詢，不支援隨機翻頁
    *   情境：沒有隨機翻頁需求的搜尋，例如手機向下捲動翻頁。

*   `scroll`：
    *   優點：沒有查詢上限（單次查詢的 size 不超過 10000）
    *   缺點：會產生額外記憶體消耗，並且搜尋結果是非即時的。
    *   情境：大量資料的取得和移轉。從 ES 7.1 開始不推薦，建議使用 after search 方案。

### 高亮

使用搜尋引擎搜尋內容時，關鍵字會變為紅色，較為醒目，即為高亮顯示。一般是給文件所有關鍵字添加一個標籤 (`<em>`)，並為該標籤編寫 CSS 樣式。

語法：

```json
# 高亮
GET /indexName/_search
{
  "query": {
    
  },
  "highlight": {
    "fields": { // 指定要高亮的欄位
      "FIELD": {
        "pre_tags": "<em>", // 用來標記高亮欄位的前置標籤
        "post_tags": "</em>" // 用來標記高亮欄位的後置標籤
      }
    }
  }
}
```

注意：

*   高亮是對關鍵字進行高亮，所以搜尋條件必須有關鍵字，不能是範圍查詢。
*   預設情況下，高亮的欄位必須與搜尋指定的欄位一致，否則無法高亮。
*   對非搜尋欄位高亮，需要添加屬性：`required_field_match=false`

範例：搜尋時，名字部分高亮。

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

// 截取結果
"hits" : [
    {
    "_index" : "hotel",
    "_type" : "_doc",
    "_id" : "339952837",
    "_score" : 2.7875905,
    "_source" : {
      "address" : "良鄉西路7號",
      "brand" : "如家",
      "business" : "房山風景區",
      "city" : "北京",
      "id" : 339952837,
      "location" : "39.73167, 116.132482",
      "name" : "如家酒店(北京良鄉西路店)",
      "pic" : "https://m.tuniucdn.com/fb3/s1/2n9c/3Dpgf5RTTzrxpeN5y3RLnRVtxMEA_w200_h200_c1_t0.jpg",
      "price" : 159,
      "score" : 46,
      "starName" : "二鑽"
    },
    "highlight" : {
      "name" : [
        "<em>如家</em>酒店(北京良鄉西路店)"
      ]
    }
  }
]
```

結果的 highlight 部分展示了添加標籤後的結果。

### 搜尋結果處理總結

DSL 查詢是一個大型 JSON 物件，包含：

*   query：查詢
*   from、size：分頁條件
*   sort：排序條件
*   highlight：高亮條件

綜合範例

```json
# 查詢綜合
GET /hotel/_search
{
  "query": { // 查詢
    "match": {
      "city": "上海"
    }
  },
  "from": 10, // 分頁起始
  "size": 10, // 分頁尺寸
  "sort": [
    { // 普通排序
      "price": {
        "order": "asc"
      }
    },
    { // 距離排序
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
  "highlight": { // 高亮欄位
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
