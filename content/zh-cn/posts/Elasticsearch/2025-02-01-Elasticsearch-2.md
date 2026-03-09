---
slug: 227
title: 'Elasticsearch 查询'
# draft: true
author: yexca
date: '2025-02-01T15:16:28+09:00'
lastmod: '2025-02-15T17:17:08+09:00'
categories:
    - 技术学习
tags:
    - 后端技术
    - Elasticsearch
    - SpringCloud
---

> **Elasticsearch 系列**
>
> | 内容                   | 链接                                  |
> | :--------------------- | :------------------------------------ |
> | Elasticsearch 基础操作 | <https://blog.yexca.net/archives/226> |
> | Elasticsearch 查询操作 | 本文 |
> | RestClient 基础操作 | <https://blog.yexca.net/archives/228> |
> | RestClient 查询操作 | <https://blog.yexca.net/archives/229> |
> | Elasticsearch 数据聚合 | <https://blog.yexca.net/archives/231> |
> | Elasticsearch 自动补全 | <https://blog.yexca.net/archives/232> |
> | Elasticsearch 数据同步 | <https://blog.yexca.net/archives/234> |
> | Elasticsearch 集群 | <https://blog.yexca.net/archives/235> |

上篇文章主要为 es 的数据存储功能，但 es 最擅长的还是搜索和数据分析

es 的查询依然是基于 JSON 风格的 DSL 来实现的

## 查询分类

常见的查询类型包括：

* 查询所有：查询出所有数据，一般测试用。例 match_all
* 全文检索 (full text) 查询：利用分词器对用户输入内容分词，然后去倒排索引库中匹配，例：
  * match_query
  * multi_match_query
* 精确查询：根据精确词条值查找数据，一般是查找 keyword、数值、日期、boolean 等类型字段。例：
  * ids
  * range
  * term
* 地理 (geo) 查询：根据经纬度查询。例：
  * geo_distance
  * geo_bounding_box
* 复合 (compound) 查询：将上述简单查询条件组合起来，合并查询条件。例：
  * bool
  * function_score

查询的语法基本一致：

```json
GET /indexName/_search
{
    "query": {
        "查询类型": {
            "查询条件": "条件值"
        }
    }
}
```

## 查询所有

查询类型为 `match_all` 没有查询条件

```json
// 查询所有
GET /indexName/_search
{
    "query": {
        "match_all": {}
    }
}
```

## 全文检索查询

会对用户输入内容分词，常用于搜索框搜索。因为是拿着词条去匹配，因此参与搜索的字段也必须是可分词的 text 类型的字段

常见的：

* match：单字段查询
* multi_match：多字段查询，任意一个字段符合条件就算符合查询条件

match 查询语法：

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

# 例子
GET /hotel/_search
{
  "query": {
    "match": {
      "all": "外滩如家"
    }
  }
}
```

multi_match 语法

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

# 例子
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

> 由于之前创索引表时将 brand、name、business 值利用 copy_to 复制到了 all 字段，上述两种查询结果一样
>
> 但搜索字段越多对性能影响越大，建议使用 copy_to，然后单字段查询

## 精准查询

精准查询不会对搜索条件分词，常见的有：

* term：根据词条精确值查询
* range：根据值的范围查询

### term 查询

查询条件必须是不分词的词条，输入与值完全匹配才符合条件

语法：

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

示例

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

### range 查询

范围查询，一般应用在对数值类型做范围过滤的时候。比如做价格、日期范围过滤

语法：

```json
# range
GET /hotel/_search
{
  "query": {
    "range": {
      "FIELD": {
        "gte": 10, // 这里的gte代表大于等于，gt则代表大于
        "lte": 20 // lte代表小于等于，lt则代表小于
      }
    }
  }
}
```

示例

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

## 地理坐标查询

其实就是根据经纬度检索，官方文档：<https://www.elastic.co/guide/en/elasticsearch/reference/current/geo-queries.html>

常用场景：搜索附近酒店、出租车、人、美食

### 矩形范围查询

geo_bounding_box 查询，查询坐标落在某个矩形范围内的所有文档

需要指定左上、右下两个点的坐标

```json
# geo_bounding_box
GET /indexName/_search
{
  "query": {
    "geo_bounding_box": {
      "FIELD": {
        "top_left": { // 左上点
          "lat": 30,
          "lon": 20
        },
        "bottom_right": { // 右下点
          "lat": 31,
          "lon": 21
        }
      }
    }
  }
}
```

### 附近查询

也叫距离查询 (geo_distance)：查询到指定中心点小于某个距离值的所有文档

```json
# geo_distance
GET /indexName/_search
{
  "query": {
    "geo_distance": {
      "distance": "15km", // 半径
      "FIELD": "31, 21" // 圆心
    }
  }
}
```

示例：搜索附近 (31.21, 121.5) 15km 内的酒店

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

## 复合查询

将其他简单查询组合，实现更复杂的搜索逻辑，常见有两种：

* function score：算分函数查询，可以控制文档相关性算分，控制文档排名
* bool query：布尔查询，利用逻辑关系组合多个其他查询，实现复杂搜索

### 相关性算分

当使用 match 查询时，文档结果会根据与搜索词条的关联度打分 (_score)，返回结果时按照分值降序排列，如：

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

在 es 中，早期使用的打分算法是 TF-IDF 算法

![image](https://github.com/yexca/picx-images-hosting/raw/master/2024/01-SpringCloud/image-20210721190152134.z026lthgfsw.webp)

TF-IDF 算法有缺陷，就是词条频率越高，文档得分也会越高，单个词条对文档影响较大。在 5.1 版本之后，算法改为 BM25 算法，会让单个词条的算分有一个上限

![image](https://github.com/yexca/picx-images-hosting/raw/master/2024/01-SpringCloud/image-20210721190416214.erx3gt63494.webp)

### 算分函数查询

算分函数虽然比较合理，但不一定是产品所需要的。要想控制相关性算分，就需要利用 es 的 function score 查询，修改文档的相关性算分，根据新得到的算分排序

结构：

```json
# function score
GET /indexName/_search
{
  "query": {
    "function_score": {
      "query": {}, // 原始查询
      "functions": [
        {
          "filter": {}, // 过滤条件
          "weight": 1 // 算分函数
        }
      ],
      "boost_mode": "multiply" // 运算模式
    }
  }
}
```

原始查询：基于这个条件搜索文档，并基于 BM25 算法给文档打分，原始算分 (query score)

过滤条件：复合该条件的文档才会重新算分

算分函数：复合 filter 条件的文档要根据此函数做运算，得到函数算分，有四种函数：

* weight：函数结果是常量
* field_value_factor：以文档中的某个字段值作为函数结果
* random_score：以随机数作为函数结果
* script_score：自定义算分函数算法

运算模式：算分函数的结果、原始查询的相关性算分，两者之间的运算方式，包括：

* multiply：相乘
* replace：用 function score 替换 query score
* 其他，如：sum、avg、max、min

示例：给 "如家" 这个品牌的酒店排名靠前一些

```json
GET /hotel/_search
{
  "query": { // 原始查询条件为任意，此处为能运行添加条件
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

### 布尔查询

布尔查询是一个或多个查询子句的组合，每一个子句就是一个子查询，组合方式有：

* must：必须匹配每个子查询，类似 "与"
* should：选择性匹配子查询，类似 "或"
* must_not：必须不匹配，不参与算分，类似 "非"
* filter：必须匹配，不参与算分

比如在搜索酒店时，可以选择地区、品牌、价格等字段做过滤，每一个不同的字段，其查询条件、方式不一样，必须是多个不同的查询，组合这些查询就要用 bool 查询了

> 参与打分的字段，查询性能越差。多条件查询时，建议：
>
> 搜索框的关键字搜索是全文检索，使用 must 查询，参与算分
>
> 其他过滤条件，采用 filter 查询，不参与算分

语法：

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

示例：搜索名字包含 "如家"，价格不高于 400，在坐标 31.21，121.5 周围 10km 范围内的酒店

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

## 搜索结果处理

搜索得到的结果可以排序、分页与高亮

### 排序

es 默认是按照相关度算分来排序，但是也支持自定义方式对搜索结果排序，可以排序字段类型有：keyword 类型、数值类型、地理坐标类型、日期类型等

#### 普通字段排序

keyword、数值、日期类型排序的语法基本一致

语法：

```json
# sort_normal
GET /indexName/_search
{
  "query": {
    
  },
  "sort": [
    {
      "FIELD": {
        "order": "desc" // 排序字段，ASC、DESC
      }
    }
  ]
}
```

排序条件是一个数组，可以写多个排序条件，按照声明的顺序，当第一个条件相等时，再按第二个条件，以此类推

示例：酒店数据按照用户评价降序，评价相同按价格升序

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

#### 地理坐标排序

语法：

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
        "unit": "km" // 排序单位
      }
    }
  ]
}
```

示例：按酒店距离排序 (假设位置为 31.034661，121.612282)

> 高德获取经纬度：<https://lbs.amap.com/demo/jsapi-v2/example/map/click-to-get-lnglat/>

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

### 分页

es 默认只返回 top10 数据，如果要查询更多数据就需要修改分页参数，es 通过修改 from、size 参数来控制要返回的分页结果：

* from：从第几个文档开始
* size：总共查询几个文档

> 类似于 MySQL 中的 `limit ?,?`

#### 基本分页

基本语法如下

```json
# 基本分页
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

#### 深度分页问题

如果要查询第 990-1000 数据，语句如下

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

但由于 es 的机制，分页时必须先查询 0-1000 条，然后截取 990-1000 展示

如果 es 是单点模式，并无太大影响，但集群部署时查询 1000 条并不是每个节点查 200 条，因为 A 节点的 200 条可能在 B 节点排到 1000 名外

为了获取前 1000，需要每个节点都查询 Top1000，然后汇总重新排名截取

若要查询 Top10000 甚至更多会对内存和 CPU 产生非常大的压力，因此 es 禁止 from+size 超过 10000 的请求

而针对深度分页，es 提供了两种解决方案：<https://www.elastic.co/guide/en/elasticsearch/reference/current/paginate-search-results.html>

* search after：分页时需要排序，原理是从上一次的排序值开始，查询下一页数据。官方推荐使用的方式
* scroll：原理将排序后的文档 id 形成快照，保存在内存。官方已经不推荐使用

#### 分页总结

* `from + size`：
  * 优点：支持随机翻页
  * 缺点：深度分页问题，默认查询上限（from + size）是 10000
  * 场景：百度、京东、谷歌、淘宝这样的随机翻页搜索
* `after search`：
  * 优点：没有查询上限（单次查询的 size 不超过10000）
  * 缺点：只能向后逐页查询，不支持随机翻页
  * 场景：没有随机翻页需求的搜索，例如手机向下滚动翻页

* `scroll`：
  * 优点：没有查询上限（单次查询的size不超过 10000）
  * 缺点：会有额外内存消耗，并且搜索结果是非实时的
  * 场景：海量数据的获取和迁移。从 ES7.1 开始不推荐，建议用 after search方案

### 高亮

使用搜索引擎搜索内容时，关键字会变为红色，较为醒目，为高亮显示，一般是给文档所有关键字添加一个标签 (`<em>`)，给该标签编写 CSS 样式

语法：

```json
# 高亮
GET /indexName/_search
{
  "query": {
    
  },
  "highlight": {
    "fields": { // 指定要高亮的字段
      "FIELD": {
        "pre_tags": "<em>", // 用来标记高亮字段的前置标签
        "post_tags": "</em>" // 用来标记高亮字段的后置标签
      }
    }
  }
}
```

注意：

* 高亮是对关键字高亮，所以搜索条件必须有关键字，不能是范围查询
* 默认情况下，高亮的字段，必须与搜素指定的字段一致，否则无法高亮
* 对非搜索字段高亮，需要添加属性：`required_field_match=false`

示例：搜索，名字部分高亮

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

// 截取结果
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

结果的 highlight 部分展示了添加标签后的结果

### 搜索结果处理总结

DSL 查询是一个大 JSON 对象，包含

* query：查询
* from、size：分页条件
* sort：排序条件
* highlight：高亮条件

综合示例

```json
# 查询综合
GET /hotel/_search
{
  "query": { // 查询
    "match": {
      "city": "上海"
    }
  },
  "from": 10, // 分页起始
  "size": 10, // 分页尺寸
  "sort": [
    { // 普通排序
      "price": {
        "order": "asc"
      }
    },
    { // 距离排序
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
  "highlight": { // 高亮字段
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
