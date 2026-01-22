---
slug: 226
title: 'Elasticsearch Getting Started'
# draft: true
author: yexca
date: '2025-01-29T23:38:51+09:00'
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
> | Content                    | Link                                  |
> | :------------------------- | :------------------------------------ |
> | Elasticsearch Basic Operations | This Article                          |
> | Elasticsearch Query Operations | <https://blog.yexca.net/en/archives/227> |
> | RestClient Basic Operations | <https://blog.yexca.net/en/archives/228> |
> | RestClient Query Operations | <https://blog.yexca.net/en/archives/229> |
> | Elasticsearch Data Aggregation | <https://blog.yexca.net/en/archives/231> |
> | Elasticsearch Autocompletion | <https://blog.yexca.net/en/archives/232> |
> | Elasticsearch Data Sync    | <https://blog.yexca.net/en/archives/234> |
> | Elasticsearch Cluster      | <https://blog.yexca.net/en/archives/235> |

Elasticsearch is a super powerful open-source search engine. It helps us quickly find what we need in massive datasets. Combined with Kibana, Logstash, and Beats, it forms the Elastic Stack (ELK). It's widely used in log data analysis, real-time monitoring, and more.

Elasticsearch is the core of the Elastic Stack, handling data storage, search, and analysis.

Under the hood, Elasticsearch is built on Lucene, a Java search engine library.

## Forward Index

Traditional databases (like MySQL) use a forward index. Take this table:

| id   | title          | price |
| ---- | -------------- | ----- |
| 1    | 小米手机       | 3499  |
| 2    | 华为手机       | 4999  |
| 3    | 华为小米充电器 | 49    |
| 4    | 小米手环       | 239   |

For exact queries based on `id`, an index makes it super fast.

But for fuzzy queries on `title`, you're stuck with a row-by-row scan. Here's how it goes:

1. User searches for *手机* (phone), database condition `%手机%`.
2. Fetch data row by row, e.g., the row with `id` 1.
3. Check if the `title` in the data matches the condition.
4. If it matches, keep it; otherwise, discard and move to the next row.

As data grows, row-by-row scanning gets less and less efficient.

## Inverted Index

The inverted index concept is contrasted with forward indexes like those in MySQL.

Elasticsearch uses an inverted index. Key concepts:

* Document: Each piece of data is a document.
* Term: Words derived from documents through semantic analysis.

Building an inverted index is a specific way to process a forward index. The steps:

1. Tokenize each document's data into individual terms using an algorithm.
2. Create a table where each row includes the term, document ID(s) where it appears, position, etc.
3. Since terms are unique, you can index them, perhaps using a hash table structure.

For example, the table above could have an inverted index like this:

| Term     | Doc ID  |
| -------- | ------- |
| 小米 (Xiaomi)   | 1, 3, 4 |
| 手机 (phone)    | 1, 2    |
| 华为 (Huawei)   | 2, 3    |
| 充电器 (charger) | 3       |
| 手环 (band)     | 4       |

Inverted index search flow:

1. User searches for `小米手机` (Xiaomi phone).
2. Tokenize the search query, getting `小米` (Xiaomi), `手机` (phone).
3. Use terms to search the inverted index, getting doc IDs containing the terms: 1, 2, 3, 4.
4. Use doc IDs to find the actual documents in the forward index.

### Document

Elasticsearch is document-oriented. A document can be a product record, an order, or similar data from a database. Document data is serialized into JSON format and stored in Elasticsearch.

The JSON for the forward index table mentioned above would look like this:

```json
{
    "id": 1,
    "title": "小米手机",
    "price": 3499
}
{
    "id": 2,
    "title": "华为手机",
    "price": 4999
}
{
    "id": 3,
    "title": "华为小米充电器",
    "price": 49
}
{
    "id": 4,
    "title": "小米手环",
    "price": 299
}
```

A JSON document contains many fields, similar to columns in a database.

### Index and Mapping

An index is a collection of documents of the same type.

Mapping defines the field constraints for documents within an index, similar to table structure constraints.

You can think of an index as a database table. Database tables have constraints defining their structure, field names, types, etc. Similarly, an index has a mapping, which describes the field constraints for its documents, much like a table's schema.

## MySQL vs. Elasticsearch

| MySQL  | Elasticsearch | Explanation                                                         |
| ------ | ------------- | ------------------------------------------------------------------- |
| Table  | Index         | An index is a collection of documents, similar to a database table. |
| Row    | Document      | A document is a single piece of data, like a database row. All documents are in JSON format. |
| Column | Field         | A field is a key within a JSON document, similar to a database column. |
| Schema | Mapping       | Mapping defines constraints for documents within an index, like field type constraints. It's similar to a database schema. |
| SQL    | DSL           | DSL (Domain Specific Language) is Elasticsearch's JSON-based query language used for CRUD operations. |

In enterprises, these two are often used together:

* For write operations requiring high security, use MySQL.
* For search needs requiring high query performance, use Elasticsearch.
* Data synchronization between them, using some method, ensures consistency.

### Pros & Cons

**Forward Index**:

* Pros:
  * Can create indexes on multiple fields.
  * Searches and sorting based on indexed fields are very fast.
* Cons:
  * Searching by non-indexed fields or partial terms within indexed fields requires a full table scan.

**Inverted Index**:

* Pros:
  * Term-based and fuzzy searches are extremely fast.
* Cons:
  * Can only create indexes on terms, not on entire fields directly.
  * Cannot sort directly by fields.

## Installation

Typically, Elasticsearch alone is sufficient. Kibana provides a visual interface for Elasticsearch, making it easier to learn and write DSL queries.

### Elasticsearch

To link Elasticsearch and Kibana containers, first create a network.

```bash
docker network create es-net
```

> There are multiple ways to link containers, such as Docker Compose or direct IP (e.g., 172.17.0.1).

Pull Elasticsearch.

```bash
docker pull elasticsearch:7.12.1
```

Single-node deployment.

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

Remember to adjust mapping directories. The above uses Docker volumes. Here's a partial explanation:

* `-e "cluster.name=es-docker-cluster"`: Sets the cluster name.
* `-e "http.host=0.0.0.0"`: The listening address, allowing external access.
* `-e "ES_JAVA_OPTS=-Xms512m -Xmx512m"`: Memory allocation.
* `-e "discovery.type=single-node"`: Single-node mode (not a cluster).
* `-v es-data:/usr/share/elasticsearch/data`: Mounts a volume, binding to ES data directory.
* `-v es-logs:/usr/share/elasticsearch/logs`: Mounts a volume, binding to ES logs directory.
* `-v es-plugins:/usr/share/elasticsearch/plugins`: Mounts a volume, binding to ES plugins directory.
* `--privileged`: Grants access rights to the volume.
* `--network es-net`: Joins a network named `es-net`.

Visit <localhost:9200>. If you see output similar to below, it's successfully started.

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

Pull the same version image.

```bash
docker pull kibana:7.12.1
```

Run.

```bash
docker run -d \
--name kibana \
-e ELASTICSEARCH_HOSTS=http://es:9200 \
--network=es-net \
-p 5601:5601  \
kibana:7.12.1
```

Here, `-e ELASTICSEARCH_HOSTS=http://es:9200"` sets the Elasticsearch address. Since Kibana and Elasticsearch are on the same network, you can access Elasticsearch directly by its container name.

Kibana typically takes a while to start. Wait a bit, and check the logs. If you see the port number, it's successfully launched.

```bash
docker logs -f kibana
```

Visit <localhost:5601> to see the result.

### IK Analyzer

ES needs to tokenize documents when creating an inverted index, and tokenize user input during searches. However, the default tokenization rules aren't very friendly for Chinese. For example, test this:

```json
# Test tokenization
POST /_analyze
{
  "analyzer": "standard",
  "text": "初次使用 Elasticsearch"
}
```

Syntax explanation:

* POST: Request method.
* /_analyze: Request path. `<http://localhost:9200>` is omitted here, Kibana fills it in.
* Request parameters use JSON.
* analyzer: Analyzer type, `standard` by default.
* text: Content to be tokenized.

Result:

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

As you can see, the tokenization isn't great. For Chinese tokenization, we usually use the IK Analyzer.

IK Analyzer Github: <https://github.com/medcl/elasticsearch-analysis-ik>

#### Online Installation

Ensure the installed version matches your ES version.

```bash
# Enter the container
docker exec -it es /bin/bash

# Download and install online
./bin/elasticsearch-plugin  install https://github.com/medcl/elasticsearch-analysis-ik/releases/download/v7.12.1/elasticsearch-analysis-ik-7.12.1.zip

# Exit
exit
# Restart container
docker restart es
```

#### Offline Installation

To install plugins, you need to know the Elasticsearch plugins directory. The above setup uses a volume mounted locally; you can check its location with this command:

```bash
docker volume inspect es-plugins
```

The `Mountpoint` in the output JSON is the directory.

Unzip the downloaded archive from Github, rename the folder to `ik`, and place it in the plugins directory.

Restart container.

```bash
docker restart es
```

#### Test Effect

IK Analyzer has two modes:

* `ik_smart`: Minimal segmentation.
* `ik_max_word`: Maximum segmentation.

Using the same example:

```json
# Test IK tokenization
POST /_analyze
{
  "analyzer": "ik_smart",
  "text": "初次使用 Elasticsearch"
}
```

Result:

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

> In this example, both tokenization modes yield the same result. You can test with longer sentences to see the difference.

#### Extend Dictionary

With the internet's evolution, new words constantly emerge that aren't in existing vocabulary lists. Thus, these lists need continuous updates. To extend the IK Analyzer dictionary, simply modify the `IKAnalyzer.cfg.xml` file in the `config` directory within your IK Analyzer installation.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE properties SYSTEM "http://java.sun.com/dtd/properties.dtd">
<properties>
    <comment>IK Analyzer 扩展配置</comment>
    <!--用户可以在这里配置自己的扩展字典 -->
    <entry key="ext_dict">ext.dic</entry>
     <!--用户可以在这里配置自己的扩展停止词字典-->
    <entry key="ext_stopwords">stopwords.dic</entry>
    <!--用户可以在这里配置远程扩展字典 -->
    <!-- <entry key="remote_ext_dict">words_location</entry> -->
    <!--用户可以在这里配置远程扩展停止词字典-->
    <!-- <entry key="remote_ext_stopwords">words_location</entry> -->
</properties>
```

As shown above, custom words go into `./ext.dic`, and stop words into `./stopwords.dic`.

Stop words are typically meaningless words like *的* (de), *啊* (a), etc. (common Chinese particles).

After configuration, restart ES.

## DSL Index Operations

An index is like a database table. Before storing data in ES, you must first create an "index" (like a database) and its "mapping" (like a table schema).

### Mapping Properties

Mapping defines constraints for documents within an index. Common mapping properties include:

* `type`: Field data type. Common simple types include:
  * String: `text` (tokenized text), `keyword` (exact values, e.g., brand, country, IP address).
  * Numeric: `long`, `integer`, `short`, `byte`, `double`, `float`.
  * Boolean: `boolean`.
  * Date: `date`.
  * Object: `object`.
* `index`: Whether to create an index for the field. Defaults to `true`.
* `analyzer`: Which analyzer to use.
* `properties`: Sub-fields of this field.

### Create Index

* Request method: `PUT`.
* Request path: `/index-name` (customizable).
* Request parameters: `mapping` definition.

```json
PUT /index-name
{
  "mappings": {
    "properties": {
      "field-name":{
        "type": "text",
        "analyzer": "ik_smart"
      },
      "field-name2":{
        "type": "keyword",
        "index": "false"
      },
      "field-name3":{
        "properties": {
          "sub-field": {
            "type": "keyword"
          }
        }
      },
      // code
    }
  }
}
```

For example:

```json
# Create index
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

If the response is similar to below after running, it's successful.

```json
{
  "acknowledged" : true,
  "shards_acknowledged" : true,
  "index" : "hello"
}
```

### Get Index

* Request method: `GET`.
* Request path: `/index-name`.
* Request parameters: None.

Format:

```json
GET /index-name
```

For example:

```json
# View index
GET /hello
```

Result:

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

### Update Index

Once an index and its mapping are created, they cannot be modified. However, you *can* add new fields.

```json
PUT /index-name/_mapping
{
  "properties": {
    "new-field-name":{
      "type": "integer"
    }
  }
}
```

For example:

```json
# Add new field
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

If you encounter a `read-only-allow-delete` error, it's usually because disk space is below 5%. You can resolve it with this request:

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

### Delete Index

* Request method: `DELETE`.
* Request path: `/index-name`.
* Request parameters: None.

Format:

```json
DELETE /index-name
```

For example:

```json
DELETE /hello
```

Result:

```json
{
  "acknowledged" : true
}
```

### Index Operations Summary

* Create index: `PUT /index-name`
* Get index: `GET /index-name`
* Delete index: `DELETE /index-name`
* Add field: `PUT /index-name/_mapping`

## DSL Document Operations

### Add Document

```json
POST /index-name/_doc/doc-id
{
    "field1": "value1",
    "field2": "value2",
    "field3": {
        "sub-property1": "value3",
        "sub-property2": "value4"
    },
    // code
}
```

Example:

```json
# Add document
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

Result:

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

### Get Document

```json
GET /{index-name}/_doc/{id}
```

Example:

```json
# Get document
GEt /hello/_doc/1
```

Result:

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

### Update Document

There are two ways to update a document: full update and partial update.

#### Full Update

A full update overwrites the original document. Essentially, it:

1. Deletes the document with the specified ID.
2. Adds a new document with the same ID.

If the ID doesn't exist, it will still perform step 2, turning an update into an add (upsert).

```json
PUT /{index-name}/_doc/doc-id
{
    "field1": "value1",
    "field2": "value2",
    // code
}
```

For example:

```json
# Update - Full update
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

Result:

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

Check the document; the email has been updated.

#### Partial Update

A partial update modifies only specific fields within the document matching the given ID.

```json
POST /{index-name}/_update/doc-id
{
    "doc": {
         "field-name": "new-value",
    }
}
```

For example:

```json
# Update - Partial update
POST /hello/_update/1
{
  "doc": {
    "email": "blog@yexca.net"
  }
}
```

Result:

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

Check the document; the email has been updated.

### Delete Document

```json
DELETE /{index-name}/_doc/id-value
```

For example:

```json
# Delete document
DELETE /hello/_doc/1
```

Result:

```json
{
  "_index" : "hello",
  "_type" : "_doc",
  "_id" : "1",
    // (My version number increased because I made other modifications in between.)
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

### Document Operations Summary

* Create document: `POST /{index-name}/_doc/doc-id { json-document }`
* Get document: `GET /{index-name}/_doc/doc-id`
* Delete document: `DELETE /{index-name}/_doc/doc-id`
* Update document:
  * Full update: `PUT /{index-name}/_doc/doc-id { json-document }`
  * Partial update: `POST /{index-name}/_update/doc-id { "doc": {field: value}}`
  