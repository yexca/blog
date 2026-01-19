---
slug: 226
title: 'Elasticsearch 入門'
# draft: true
author: yexca
date: '2025-01-29T23:38:51+09:00'
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
> | Elasticsearch 基礎操作 | 本文                                  |
> | Elasticsearch 查詢操作 | <https://blog.yexca.net/archives/227> |
> | RestClient 基礎操作 | <https://blog.yexca.net/archives/228> |
> | RestClient 查詢操作 | <https://blog.yexca.net/archives/229> |
> | Elasticsearch 資料聚合 | <https://blog.yexca.net/archives/231> |
> | Elasticsearch 自動補齊 | <https://blog.yexca.net/archives/232> |
> | Elasticsearch 資料同步 | <https://blog.yexca.net/archives/234> |
> | Elasticsearch 叢集 | <https://blog.yexca.net/archives/235> |

Elasticsearch 是一款非常強大的開源搜尋引擎軟體，可以幫助我們從海量資料中快速找到需要的內容。結合 Kibana、Logstash、Beats，也就是 Elastic Stack (ELK)。被廣泛應用在日誌資料分析、即時監控等領域。

而 Elasticsearch 是 Elastic Stack 的核心，負責儲存、搜尋、分析資料。

Elasticsearch 底層基於 Lucene 實作，Lucene 為 Java 的一個搜尋引擎函式庫。

## 正向索引

傳統資料庫 (例如 MySQL) 採用正向索引，舉例來說下表：

| id   | title          | price |
| ---- | -------------- | ----- |
| 1    | 小米手機       | 3499  |
| 2    | 華為手機       | 4999  |
| 3    | 華為小米充電器 | 49    |
| 4    | 小米手環       | 239   |

如果基於 id 精準查詢，直接走索引會很快。

但若基於 title 做模糊查詢，只能逐行掃描資料，流程：

1.  使用者搜尋 *手機*，資料庫條件 `%手機%`
2.  逐行取得資料，如 id 為 1 的資料
3.  判斷資料中的 title 是否符合條件
4.  符合則放入，不符合則捨棄，下一行

隨著資料量的增加，逐行掃描的效率越來越低。

## 倒排索引

倒排索引的概念是基於 MySQL 這樣的正向索引而言的。

Elasticsearch 採用倒排索引，概念：

*   文件 (document)：每筆資料就是一個文件。
*   詞條 (term)：文件按照語義分成的詞語。

建立倒排索引是對正向索引的一種特殊處理，流程：

1.  將每一個文件的資料利用演算法斷詞，得到一個個詞條。
2.  建立表，每行包括詞條、詞條所在文件 id、位置等資訊。
3.  因為詞條的唯一性，可以給詞條建立索引，例如雜湊表結構索引。

舉例來說上例的表可以建立如下倒排索引：

| 詞條   | 文件 id |
| ------ | ------- |
| 小米   | 1，3，4 |
| 手機   | 1，2    |
| 華為   | 2，3    |
| 充電器 | 3       |
| 手環   | 4       |

倒排索引搜尋流程：

1.  使用者搜尋 `小米手機`。
2.  對搜尋內容斷詞，得到 `小米`、`手機`。
3.  使用詞條在倒排索引查找，得到包含詞條的文件 id：1、2、3、4。
4.  使用文件 id 到正向索引中查找具體文件。

### 文件 (Document)

Elasticsearch 是面向文件儲存的，可以是資料庫中的一筆商品資料、一個訂單資訊。文件資料會被序列化為 JSON 格式後儲存在 Elasticsearch 中。

上述正向索引表的 JSON 如下：

```json
{
    "id": 1,
    "title": "小米手機",
    "price": 3499
}
{
    "id": 2,
    "title": "華為手機",
    "price": 4999
}
{
    "id": 3,
    "title": "華為小米充電器",
    "price": 49
}
{
    "id": 4,
    "title": "小米手環",
    "price": 299
}
```

在 Json 文件中包含許多欄位，類似於資料庫中的欄。

### 索引與映射 (Mapping)

索引 (index) 為相同型別的文件集合。

映射 (mapping) 為索引中文件的欄位限制資訊，類似於資料表的結構限制。

可以把索引當做是資料庫中的資料表，資料庫的資料表會有限制資訊，用來定義表的結構、欄位的名稱、型別等資訊。因此，索引庫中就有映射，是索引中文件的欄位限制資訊，類似於資料表的結構限制。

## MySQL 與 Elasticsearch

| MySQL  | Elasticsearch | 說明                                                         |
| ------ | ------------- | ------------------------------------------------------------ |
| Table  | Index         | 索引 (index)，就是文件的集合，類似資料庫的資料表 (table)         |
| Row    | Document      | 文件 (Document)，就是一筆筆的資料，類似資料庫中的資料列 (Row)，文件都是 JSON 格式 |
| Column | Field         | 欄位 (Field)，就是 JSON 文件中的欄位，類似資料庫中的欄 (Column) |
| Schema | Mapping       | Mapping (映射) 是索引中文件的限制，例如欄位型別限制。類似資料庫的綱要 (Schema) |
| SQL    | DSL           | DSL 是 Elasticsearch 提供的 JSON 風格的請求語句，用來操作 Elasticsearch，實作 CRUD |

在企業中，往往是兩者結合使用：

*   對安全性要求較高的寫入操作，使用 MySQL 實作。
*   對查詢效能要求較高的搜尋需求，使用 Elasticsearch 實作。
*   兩者再基於某種方式，實作資料的同步，確保一致性。

### 優缺點

**正向索引**：

*   優點：
    *   可以給多個欄位建立索引。
    *   根據索引欄位搜尋、排序速度非常快。
*   缺點：
    *   根據非索引欄位，或者索引欄位中的部分詞條查找時，只能全表掃描。

**倒排索引**：

*   優點：
    *   根據詞條搜尋、模糊搜尋時，速度非常快。
*   缺點：
    *   只能給詞條建立索引，而不是欄位。
    *   無法根據欄位做排序。

## 安裝

一般只用 Elasticsearch 即可，使用 Kibana 可以提供一個 Elasticsearch 的視覺化介面，方便學習撰寫 DSL 語句。

### Elasticsearch

為了使 Elasticsearch 與 Kibana 容器互連，可以先建立一個網路。

```bash
docker network create es-net
```

> 有多種方式可以實作互連，如 docker-compose、172.17.0.1

拉取 Elasticsearch 映像檔。

```bash
docker pull elasticsearch:7.12.1
```

單點部署

```bash
docker run -d \
    --name es \
    -e "ES_JAVA_OPTS=-Xms512m -Xmx512m" \
    -e "discovery.type=single-node" \
    -v es-data:/usr/share/elasticsearch/data \
    -v es-plugins:/usr/share/elasticsearch/plugins \
    --privileged \
    --network es-net \
    -p 9200:9200 \
    -p 9300:9300 \
elasticsearch:7.12.1
```

注意修改映射目錄，上述使用資料卷 (volume)，部分解釋：

*   `-e "cluster.name=es-docker-cluster"`：設定叢集名稱。
*   `-e "http.host=0.0.0.0"`：監聽的位址，可以從外部網路存取。
*   `-e "ES_JAVA_OPTS=-Xms512m -Xmx512m"`：記憶體大小。
*   `-e "discovery.type=single-node"`：非叢集模式。
*   `-v es-data:/usr/share/elasticsearch/data`：掛載資料卷，綁定 ES 的資料目錄。
*   `-v es-logs:/usr/share/elasticsearch/logs`：掛載資料卷，綁定 ES 的日誌目錄。
*   `-v es-plugins:/usr/share/elasticsearch/plugins`：掛載資料卷，綁定 ES 的插件目錄。
*   `--privileged`：授予資料卷存取權。
*   `--network es-net` ：加入一個名為 es-net 的網路中。

存取 `<localhost:9200>` 查看回傳類似下述內容即表示啟動成功。

```json
{
  "name" : "6747e3f712ba",
  "cluster_name" : "docker-cluster",
  "cluster_uuid" : "GSLtjxiMSlyRRRW-pSzvWQ",
  "version" : {
    "number" : "7.12.1",
    "build_flavor" : "default",
    "build_type" : "docker",
    "build_hash" : "3186837139b9c6b6d23c3200870651f10d3343b7",
    "build_date" : "2021-04-20T20:56:39.040728659Z",
    "build_snapshot" : false,
    "lucene_version" : "8.8.0",
    "minimum_wire_compatibility_version" : "6.8.0",
    "minimum_index_compatibility_version" : "6.0.0-beta1"
  },
  "tagline" : "You Know, for Search"
}
```

### Kibana

拉取相同版本的映像檔。

```bash
docker pull kibana:7.12.1
```

執行

```bash
docker run -d \
--name kibana \
-e ELASTICSEARCH_HOSTS=http://es:9200 \
--network=es-net \
-p 5601:5601  \
kibana:7.12.1
```

其中 `-e ELASTICSEARCH_HOSTS=http://es:9200"`：設定 Elasticsearch 的位址，因為 Kibana 已經與 Elasticsearch 在同一個網路，因此可以用容器名稱直接存取 Elasticsearch。

Kibana 啟動通常比較慢，需要多等一會兒，可以查看日誌，若出現連接埠號則表示啟動成功。

```bash
docker logs -f kibana
```

存取 `<localhost:5601>` 查看結果。

### IK 斷詞器

ES 在建立倒排索引時需要對文件斷詞；在搜尋時，需要對使用者輸入內容斷詞。但預設的斷詞規則對中文處理不太友善，例如測試：

```json
# 測試斷詞
POST /_analyze
{
  "analyzer": "standard",
  "text": "初次使用 Elasticsearch"
}
```

語法說明：

*   POST：請求方式。
*   /_analyze：請求路徑。這裡省略了 `http://localhost:9200`，由 Kibana 補充。
*   請求參數使用 JSON。
    *   analyzer：斷詞器型別，預設為 standard。
    *   text：需要斷詞的內容。

結果為：

```json
{
  "tokens" : [
    {
      "token" : "初",
      "start_offset" : 0,
      "end_offset" : 1,
      "type" : "<IDEOGRAPHIC>",
      "position" : 0
    },
    {
      "token" : "次",
      "start_offset" : 1,
      "end_offset" : 2,
      "type" : "<IDEOGRAPHIC>",
      "position" : 1
    },
    {
      "token" : "使",
      "start_offset" : 2,
      "end_offset" : 3,
      "type" : "<IDEOGRAPHIC>",
      "position" : 2
    },
    {
      "token" : "用",
      "start_offset" : 3,
      "end_offset" : 4,
      "type" : "<IDEOGRAPHIC>",
      "position" : 3
    },
    {
      "token" : "elasticsearch",
      "start_offset" : 5,
      "end_offset" : 18,
      "type" : "<ALPHANUM>",
      "position" : 4
    }
  ]
}
```

可以看到斷詞效果非常不好，處理中文斷詞，一般會使用 IK 斷詞器。

IK 斷詞器 Github：<https://github.com/medcl/elasticsearch-analysis-ik>

#### 線上安裝

注意安裝版本需與 ES 對應。

```bash
# 進入容器內部
docker exec -it elasticsearch /bin/bash

# 線上下載並安裝
./bin/elasticsearch-plugin  install https://github.com/medcl/elasticsearch-analysis-ik/releases/download/v7.12.1/elasticsearch-analysis-ik-7.12.1.zip

# 離開
exit
# 重新啟動容器
docker restart elasticsearch
```

#### 離線安裝

安裝插件需要知道 Elasticsearch 的 `plugins` 目錄位置，上述使用資料卷掛載到本機，可使用下面指令查看：

```bash
docker volume inspect es-plugins
```

輸出的 JSON 的 `Mountpoint` 即為目錄。

將從 Github 下載的壓縮檔解壓縮後，將資料夾重新命名為 `ik`，放到 `plugins` 目錄下。

重新啟動容器。

```bash
docker restart es
```

#### 測試效果

IK 斷詞器有兩種模式：

*   ik_smart：最少切分。
*   ik_max_word：最細切分。

還是上例：

```json
# 測試 IK 斷詞
POST /_analyze
{
  "analyzer": "ik_smart",
  "text": "初次使用 Elasticsearch"
}
```

結果：

```json
{
  "tokens" : [
    {
      "token" : "初次",
      "start_offset" : 0,
      "end_offset" : 2,
      "type" : "CN_WORD",
      "position" : 0
    },
    {
      "token" : "使用",
      "start_offset" : 2,
      "end_offset" : 4,
      "type" : "CN_WORD",
      "position" : 1
    },
    {
      "token" : "elasticsearch",
      "start_offset" : 5,
      "end_offset" : 18,
      "type" : "ENGLISH",
      "position" : 2
    }
  ]
}
```

> 此範例兩種斷詞模式結果相同，可使用其他更長語句測試結果。

#### 擴展詞庫

隨著網際網路發展，會不斷湧現新詞語，在原有的詞彙列表中並不存在，所以詞彙列表也需要不斷更新。若擴展 IK 詞庫，只需要修改 IK 目錄 `config` 目錄中的 `IKAnalyzer.cfg.xml` 文件即可。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE properties SYSTEM "http://java.sun.com/dtd/properties.dtd">
<properties>
    <comment>IK Analyzer 擴展設定</comment>
    <!--使用者可以在這裡設定自己的擴展字典 -->
    <entry key="ext_dict">ext.dic</entry>
     <!--使用者可以在這裡設定自己的擴展停用詞字典-->
    <entry key="ext_stopwords">stopwords.dic</entry>
    <!--使用者可以在這裡設定遠端擴展字典 -->
    <!-- <entry key="remote_ext_dict">words_location</entry> -->
    <!--使用者可以在這裡設定遠端擴展停用詞字典-->
    <!-- <entry key="remote_ext_stopwords">words_location</entry> -->
</properties>
```

如上將擴展詞放在 `./ext.dic`，停用詞放在 `./stopwords.dic`。

停用詞可以放一些無意義的詞，如 *的*、*啊* 等。

設定好後重新啟動 ES。

## DSL 索引庫操作

索引庫就類似資料庫表，要向 ES 中儲存資料，必須先建立「庫」和「表」。

### Mapping 映射屬性

Mapping 是對索引庫中文件的限制，常見的 Mapping 屬性包括：

*   type：欄位資料型別，常見的簡單型別有：
    *   字串：text（可斷詞的文字）、keyword（精確值，例如：品牌、國家、IP 位址）
    *   數值：long、integer、short、byte、double、float、
    *   布林：boolean
    *   日期：date
    *   物件：object
*   index：是否建立索引，預設為 true。
*   analyzer：使用哪種斷詞器。
*   properties：該欄位的子欄位。

### 建立索引庫

*   請求方式：PUT
*   請求路徑：/索引庫名稱，可以自訂。
*   請求參數：mapping 映射。

```json
PUT /索引庫名稱
{
  "mappings": {
    "properties": {
      "欄位名稱":{
        "type": "text",
        "analyzer": "ik_smart"
      },
      "欄位名稱2":{
        "type": "keyword",
        "index": "false"
      },
      "欄位名稱3":{
        "properties": {
          "子欄位": {
            "type": "keyword"
          }
        }
      },
      // code
    }
  }
}
```

例如：

```json
# 建立索引庫
PUT /hello
{
  "mappings": {
    "properties": {
      "info": {
        "type": "text",
        "analyzer": "ik_smart"
      },
      "email": {
        "type": "keyword",
        "index": false
      },
      "name": {
        "properties": {
          "firstName": {
            "type": "keyword"
          },
          "lastName": {
            "type": "keyword"
          }
        }
      }
    }
  }
}
```

執行後回傳類似即成功：

```json
{
  "acknowledged" : true,
  "shards_acknowledged" : true,
  "index" : "hello"
}
```

### 查詢索引庫

*   請求方式：GET

*   請求路徑：/索引庫名稱

*   請求參數：無

格式：

```json
GET /索引庫名稱
```

例如：

```json
# 查看索引庫
GET /hello
```

結果：

```json
{
  "hello" : {
    "aliases" : { },
    "mappings" : {
      "properties" : {
        "email" : {
          "type" : "keyword",
          "index" : false
        },
        "info" : {
          "type" : "text",
          "analyzer" : "ik_smart"
        },
        "name" : {
          "properties" : {
            "firstName" : {
              "type" : "keyword"
            },
            "lastName" : {
              "type" : "keyword"
            }
          }
        }
      }
    },
    "settings" : {
      "index" : {
        "routing" : {
          "allocation" : {
            "include" : {
              "_tier_preference" : "data_content"
            }
          }
        },
        "number_of_shards" : "1",
        "blocks" : {
          "read_only_allow_delete" : "true"
        },
        "provided_name" : "hello",
        "creation_date" : "1703683379263",
        "number_of_replicas" : "1",
        "uuid" : "zn-kPdsETZeFcB0nXK79hg",
        "version" : {
          "created" : "7120199"
        }
      }
    }
  }
}
```

### 修改索引庫

索引庫和 Mapping 一旦建立，不允許修改，但可以新增欄位。

```json
PUT /索引庫名稱/_mapping
{
  "properties": {
    "新欄位名稱":{
      "type": "integer"
    }
  }
}
```

例如：

```json
# 新增欄位
PUT /hello/_mapping
{
  "properties": {
    "age": {
      "type": "integer",
      "index": false
    }
  }
}
```

---

如果遇到 `read-only-allow-delete` 類似錯誤，產生原因為磁碟剩餘空間不足 5%，可透過以下請求解決：

```json
PUT _settings
{
  "index": {
    "blocks": {
      "read_only_allow_delete": "false"
    }
  }
}
```

### 刪除索引庫

*   請求方式：DELETE

*   請求路徑：/索引庫名稱

*   請求參數：無

格式：

```json
DELETE /索引庫名稱
```

例如：

```json
DELETE /hello
```

結果：

```json
{
  "acknowledged" : true
}
```

### 索引庫操作總結

*   建立索引庫：PUT /索引庫名稱
*   查詢索引庫：GET /索引庫名稱
*   刪除索引庫：DELETE /索引庫名稱
*   新增欄位：PUT /索引庫名稱/_mapping

## DSL 文件操作

### 新增文件

```json
POST /索引庫名稱/_doc/文件id
{
    "欄位1": "值1",
    "欄位2": "值2",
    "欄位3": {
        "子屬性1": "值3",
        "子屬性2": "值4"
    },
    // code
}
```

範例：

```json
# 新增文件
PUT /hello/_doc/1
{
  "info": "hello es",
  "email": "blog@yexca.net",
  "name": {
    "firstName": "yexca",
    "lastName": "Dale"
  }
}
```

結果：

```json
{
  "_index" : "hello",
  "_type" : "_doc",
  "_id" : "1",
  "_version" : 1,
  "result" : "created",
  "_shards" : {
    "total" : 2,
    "successful" : 1,
    "failed" : 0
  },
  "_seq_no" : 0,
  "_primary_term" : 1
}
```

### 查詢文件

```json
GET /{索引庫名稱}/_doc/{id}
```

範例：

```json
# 查詢文件
GEt /hello/_doc/1
```

結果：

```json
{
  "_index" : "hello",
  "_type" : "_doc",
  "_id" : "1",
  "_version" : 1,
  "_seq_no" : 0,
  "_primary_term" : 1,
  "found" : true,
  "_source" : {
    "info" : "hello es",
    "email" : "blog@yexca.net",
    "name" : {
      "firstName" : "yexca",
      "lastName" : "Dale"
    }
  }
}
```

### 修改文件

修改有兩種方式，完整修改與增量修改。

#### 完整修改

完整修改是覆蓋原來的文件的內容，其本質是：

1.  根據指定的 id 刪除文件。
2.  新增一個相同 id 的文件。

如果 id 不存在，也會執行第二步，也就從修改變成新增了 (覆蓋寫入)。

```json
PUT /{索引庫名稱}/_doc/文件id
{
    "欄位1": "值1",
    "欄位2": "值2",
    // code
}
```

例如：

```json
# 修改-完整修改
PUT /hello/_doc/1
{
  "info": "hello es",
  "email": "es@yexca.net",
  "name": {
    "firstName": "yexca",
    "lastName": "Dale"
  }
}
```

結果：

```json
{
  "_index" : "hello",
  "_type" : "_doc",
  "_id" : "1",
  "_version" : 2,
  "result" : "updated",
  "_shards" : {
    "total" : 2,
    "successful" : 1,
    "failed" : 0
  },
  "_seq_no" : 1,
  "_primary_term" : 1
}
```

查詢可發現信箱已經修改。

#### 增量修改

增量修改是只修改指定 id 匹配的文件中的部分欄位。

```json
POST /{索引庫名稱}/_update/文件id
{
    "doc": {
         "欄位名稱": "新的值",
    }
}
```

例如：

```json
# 修改-增量修改
POST /hello/_update/1
{
  "doc": {
    "email": "blog@yexca.net"
  }
}
```

結果：

```json
{
  "_index" : "hello",
  "_type" : "_doc",
  "_id" : "1",
  "_version" : 3,
  "result" : "updated",
  "_shards" : {
    "total" : 2,
    "successful" : 1,
    "failed" : 0
  },
  "_seq_no" : 2,
  "_primary_term" : 1
}
```

查詢可發現信箱已經修改。

### 刪除文件

```json
DELETE /{索引庫名稱}/_doc/id值
```

例如：

```json
# 刪除文件
DELETE /hello/_doc/1
```

結果：

```json
{
  "_index" : "hello",
  "_type" : "_doc",
  "_id" : "1",
    // 因為中間我修改了其他的，版本號變高了
  "_version" : 8,
  "result" : "deleted",
  "_shards" : {
    "total" : 2,
    "successful" : 1,
    "failed" : 0
  },
  "_seq_no" : 7,
  "_primary_term" : 1
}
```

### 文件操作總結

*   新增文件：POST /{索引庫名稱}/_doc/文件id   { json 文件 }
*   查詢文件：GET /{索引庫名稱}/_doc/文件id
*   刪除文件：DELETE /{索引庫名稱}/_doc/文件id
*   修改文件：
    *   完整修改：PUT /{索引庫名稱}/_doc/文件id { json 文件 }
    *   增量修改：POST /{索引庫名稱}/_update/文件id { "doc": {欄位}}
