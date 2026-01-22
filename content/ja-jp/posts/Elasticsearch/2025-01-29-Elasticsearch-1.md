---
slug: 226
title: 'Elasticsearch 入門'
# draft: true
author: yexca
date: '2025-01-29T23:38:51+09:00'
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
> | Elasticsearch の基本操作 | この記事                                  |
> | Elasticsearch 検索操作 | <https://blog.yexca.net/ja/archives/227> |
> | RestClient の基本操作 | <https://blog.yexca.net/ja/archives/228> |
> | RestClient 検索操作 | <https://blog.yexca.net/ja/archives/229> |
> | Elasticsearch データ集計 | <https://blog.yexca.net/ja/archives/231> |
> | Elasticsearch オートコンプリート | <https://blog.yexca.net/ja/archives/232> |
> | Elasticsearch データ同期 | <https://blog.yexca.net/ja/archives/234> |
> | Elasticsearch クラスター | <https://blog.yexca.net/ja/archives/235> |

Elasticsearchって、めちゃくちゃ強力なオープンソース検索エンジンなんだ。膨大なデータの中から、必要なものをサッと見つけるのに役立ってくれるよ。kibana、Logstash、Beatsと組み合わせると、elastic stack（ELK）になるんだ。ログデータ分析とか、リアルタイム監視みたいな分野で広く使われてるんだよね。

で、ElasticsearchはそのElastic Stackの核となる部分で、データの保存、検索、分析を担当してるんだ。

Elasticsearchの根幹はLuceneっていうJavaの検索エンジンライブラリでできてて、それをベースにしてるんだよ。

## 順方向インデックス

従来のデータベース（例えばMySQL）は順方向インデックスを使ってるんだ。例えば下の表みたいにね。

| id   | title          | price |
| ---- | -------------- | ----- |
| 1    | Xiaomi スマホ       | 3499  |
| 2    | Huawei スマホ       | 4999  |
| 3    | Huawei Xiaomi 充電器 | 49    |
| 4    | Xiaomi スマートバンド       | 239   |

もしIDで正確に検索するなら、直接インデックスを使うからすごく速いんだ。

でも、タイトルであいまい検索しようとすると、データを1行ずつスキャンしていくしかないんだよね。流れとしてはこんな感じ。

1.  ユーザーが「スマホ」って検索すると、データベースでは「%スマホ%」って条件になる。
2.  データを1行ずつ取得して、例えばIDが1のデータとか。
3.  そのデータのタイトルが条件に合ってるか判断する。
4.  合ってればリストに入れて、合ってなければ捨てる。そして次の行へ、って感じ。

データ量が増えれば増えるほど、この1行ずつのスキャンの効率はどんどん悪くなっちゃうんだ。

## 転置インデックス

転置インデックスの考え方は、MySQLみたいな順方向インデックスを基準にしてるんだ。

Elasticsearchは転置インデックスを採用してるよ。コンセプトはこんな感じ。

*   ドキュメント：1つ1つのデータがドキュメントになる。
*   ターム：ドキュメントが意味に基づいて分割された単語のこと。

転置インデックスを作るのは、順方向インデックスに対する特殊な処理なんだ。流れはこう。

1.  各ドキュメントのデータをアルゴリズムを使って単語に分割し、タームを1つ1つ取得する。
2.  テーブルを作成して、各行にはターム、そのタームが含まれるドキュメントID、位置などの情報を含める。
3.  タームはユニークだから、タームにインデックス（例えばハッシュテーブル構造のインデックス）を作ることができるんだ。

例えば、さっきの表からはこんな転置インデックスが作れるよ。

| ターム   | ドキュメントID |
| ------ | ------- |
| Xiaomi   | 1，3，4 |
| スマホ   | 1，2    |
| Huawei   | 2，3    |
| 充電器 | 3       |
| スマートバンド   | 4       |

転置インデックスの検索フロー：

1.  ユーザーが「Xiaomiスマホ」って検索する。
2.  検索内容を形態素解析して、「Xiaomi」、「スマホ」を得る。
3.  タームを使って転置インデックスを検索し、タームを含むドキュメントID：1、2、3、4を得る。
4.  ドキュメントIDを使って順方向インデックスから具体的なドキュメントを探す。

### ドキュメント

Elasticsearchはドキュメント指向でデータを保存するんだ。データベースにある1つの商品データとか、注文情報とかになるんだよ。ドキュメントデータはJSON形式にシリアライズされてから、Elasticsearchに保存されるんだ。

さっきの順方向インデックスの表をJSONにするとこうなるよ。

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

JSONドキュメントにはたくさんのフィールドが含まれてて、データベースの列みたいなものだね。

### インデックスとマッピング

インデックスは、同じ種類のドキュメントの集まりのこと。

マッピングは、インデックス内のドキュメントのフィールドに関する制約情報で、テーブルの構造制約みたいなものだよ。

インデックスはデータベースのテーブルみたいなものって考えたらいいよ。データベースのテーブルには、テーブルの構造やフィールド名、型などを定義する制約情報があるよね。だから、インデックスにはマッピングがあって、これはインデックス内のドキュメントのフィールド制約情報、つまりテーブルの構造制約みたいなものなんだ。

## MySQL と Elasticsearch

| MySQL  | Elasticsearch | 説明                                                         |
| ------ | ------------- | ------------------------------------------------------------ |
| Table  | Index         | インデックスはドキュメントの集まりで、データベースのテーブルみたいなものだよ。         |
| Row    | Document      | ドキュメントは1つ1つのデータで、データベースの行みたいなもの。ドキュメントは全部JSON形式だよ。 |
| Column | Field         | フィールドはJSONドキュメントの中のフィールドで、データベースの列みたいなものだね。 |
| Schema | Mapping       | マッピングはインデックス内のドキュメントの制約、例えばフィールドの型制約のこと。データベースのテーブル構造みたいなものだよ。 |
| SQL    | DSL           | DSLはElasticsearchが提供するJSON形式のリクエスト文で、Elasticsearchを操作してCRUDを実現するのに使うんだ。 |

企業では、よく両方を組み合わせて使うことが多いんだ。

*   セキュリティの要求が高い書き込み操作は、MySQLで実装する。
*   検索性能の要求が高い検索ニーズは、Elasticsearchで実装する。
*   そして、両者は何らかの方法でデータ同期を実現して、一貫性を保つんだ。

### メリット・デメリット

**順方向インデックス**：

*   メリット：
    *   複数のフィールドにインデックスを作成できる。
    *   インデックスフィールドによる検索やソートがすごく速い。
*   デメリット：
    *   非インデックスフィールドや、インデックスフィールド内の一部のタームで検索する時は、全表スキャンするしかない。

**転置インデックス**：

*   メリット：
    *   タームによる検索やあいまい検索の時に、ものすごく速い。
*   デメリット：
    *   フィールドじゃなくて、タームにしかインデックスを作成できない。
    *   フィールドでソートできない。

## インストール

普通はElasticsearchだけで十分だけど、kibanaを使うとElasticsearchの可視化インターフェースを提供してくれるから、DSL文の学習や記述が楽になるよ。

### Elasticsearch

Elasticsearchとkibanaコンテナを相互接続させるために、まずネットワークを作るといいよ。

```bash
docker network create es-net
```

> 相互接続する方法はいくつかあって、docker-composeとか172.17.0.1とかね。

Elasticsearchをプルする

```bash
docker pull elasticsearch:7.12.1
```

シングルノードデプロイ

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

マッピングディレクトリの変更に注意してね。上記ではデータボリュームを使ってるんだけど、一部を説明するよ。

*   `-e "cluster.name=es-docker-cluster"`：クラスター名を指定する。
*   `-e "http.host=0.0.0.0"`：リスニングアドレスで、外部からのアクセスを許可する。
*   `-e "ES_JAVA_OPTS=-Xms512m -Xmx512m"`：メモリサイズ。
*   `-e "discovery.type=single-node"`：非クラスターモード。
*   `-v es-data:/usr/share/elasticsearch/data`：論理ボリュームをマウントして、ESのデータディレクトリをバインドする。
*   `-v es-logs:/usr/share/elasticsearch/logs`：論理ボリュームをマウントして、ESのログディレクトリをバインドする。
*   `-v es-plugins:/usr/share/elasticsearch/plugins`：論理ボリュームをマウントして、ESのプラグインディレクトリをバインドする。
*   `--privileged`：論理ボリュームへのアクセス権を付与する。
*   `--network es-net` ：es-netという名前のネットワークに参加させる。

`<localhost:9200>`にアクセスして、下みたいなレスポンスが返ってきたら起動成功だよ。

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

### kibana

同じバージョンのイメージをプルする

```bash
docker pull kibana:7.12.1
```

実行

```bash
docker run -d \
--name kibana \
-e ELASTICSEARCH_HOSTS=http://es:9200 \
--network=es-net \
-p 5601:5601  \
kibana:7.12.1
```

この`-e ELASTICSEARCH_HOSTS=http://es:9200"`はElasticsearchのアドレスを設定してるんだ。kibanaはElasticsearchと同じネットワークにいるから、コンテナ名で直接Elasticsearchにアクセスできるってわけ。

kibanaの起動はだいたい遅いから、少し待ってみてね。ログを確認して、ポート番号が表示されたら起動成功だよ。

```bash
docker logs -f kibana
```

`<localhost:5601>`にアクセスして結果を見てみて。

### IK形態素解析器

ESは転置インデックスを作る時にドキュメントを形態素解析する必要があるし、検索する時もユーザーの入力内容を形態素解析する必要があるんだ。でも、デフォルトの形態素解析ルールは日本語の処理にはあまり優しくないんだ。例えばテストしてみよう。

```json
# 形態素解析のテスト
POST /_analyze
{
  "analyzer": "standard",
  "text": "初次使用 Elasticsearch"
}
```

構文の説明

*   POST：リクエスト方式
*   `/_analyze`：リクエストパス。ここでは`<http://localhost:9200>`が省略されてて、kibanaが補完してくれるんだ。
*   リクエストパラメータはJSONを使う。
    *   `analyzer`：形態素解析器のタイプで、デフォルトはstandardだよ。
    *   `text`：形態素解析したい内容。

結果はこんな感じ。

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

形態素解析の結果がすごく良くないのがわかるでしょ。日本語の形態素解析を処理するには、だいたいIK形態素解析器を使うんだ。

IK形態素解析器 Github：<https://github.com/medcl/elasticsearch-analysis-ik>

#### オンラインインストール

インストールするバージョンがESと合ってるか注意してね。

```bash
# コンテナの中に入る
docker exec -it elasticsearch /bin/bash

# オンラインでダウンロードしてインストール
./bin/elasticsearch-plugin  install https://github.com/medcl/elasticsearch-analysis-ik/releases/download/v7.12.1/elasticsearch-analysis-ik-7.12.1.zip

# 終了する
exit
# コンテナを再起動する
docker restart elasticsearch
```

#### オフラインインストール

プラグインをインストールするには、Elasticsearchのpluginsディレクトリの場所を知る必要があるんだ。上記ではデータボリュームをローカルにマウントしてるから、以下のコマンドで確認できるよ。

```bash
docker volume inspect es-plugins
```

出力されるJSONの`Mountpoint`がディレクトリだよ。

Githubからダウンロードした圧縮ファイルを解凍して、フォルダ名を`ik`にリネームしてからpluginsディレクトリに置いてね。

コンテナを再起動する

```bash
docker restart es
```

#### 効果のテスト

IK形態素解析器には2つのモードがあるんだ。

*   `ik_smart`：最小分割
*   `ik_max_word`：最大分割（最も細かく分割）

さっきの例でまた試してみるね。

```json
# IK形態素解析のテスト
POST /_analyze
{
  "analyzer": "ik_smart",
  "text": "初次使用 Elasticsearch"
}
```

結果

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

> この例では2つの形態素解析モードで結果が同じになったけど、もっと長い文で試すと結果の違いがわかるよ。

#### 辞書の拡張

インターネットが発展するにつれて、新しい言葉がどんどん生まれてくるから、既存の語彙リストにはない言葉も出てくるよね。だから、語彙リストも常に更新していく必要があるんだ。IK辞書を拡張するなら、ikディレクトリの中のconfigディレクトリにある`IKAnalyzer.cfg.xml`ファイルを変更するだけでOKだよ。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE properties SYSTEM "http://java.sun.com/dtd/properties.dtd">
<properties>
    <comment>IK Analyzer 拡張設定</comment>
    <!--ここで自分の拡張辞書を設定できるよ。 -->
    <entry key="ext_dict">ext.dic</entry>
     <!--ここで自分の拡張ストップワード辞書を設定できるよ。-->
    <entry key="ext_stopwords">stopwords.dic</entry>
    <!--ここでリモートの拡張辞書を設定できるよ。 -->
    <!-- <entry key="remote_ext_dict">words_location</entry> -->
    <!--ここでリモートの拡張ストップワード辞書を設定できるよ。-->
    <!-- <entry key="remote_ext_stopwords">words_location</entry> -->
</properties>
```

上の設定みたいに、拡張語は`./ext.dic`に置いて、禁止語は`./stopwords.dic`に置くんだ。

禁止語には、「の」とか「ね」みたいな意味のない言葉を入れてもいいよ。

設定が終わったら、ESを再起動してね。

## DSL インデックス操作

インデックスはデータベースのテーブルみたいなものなんだ。ESにデータを保存するには、まず「データベース」と「テーブル」を作る必要があるんだよ。

### マッピングプロパティ

マッピングはインデックス内のドキュメントに対する制約で、よく使われるマッピングプロパティはこんな感じだよ。

*   `type`：フィールドのデータ型。よくある簡単な型はね。
    *   文字列：`text`（形態素解析可能なテキスト）、`keyword`（厳密な値、例えばブランド、国、IPアドレス）
    *   数値：`long`、`integer`、`short`、`byte`、`double`、`float`
    *   ブール：`boolean`
    *   日付：`date`
    *   オブジェクト：`object`
*   `index`：インデックスを作成するかどうか。デフォルトはtrueだよ。
*   `analyzer`：どの形態素解析器を使うか。
*   `properties`：このフィールドの子フィールド。

### インデックスの作成

*   リクエスト方式：PUT
*   リクエストパス：`/インデックス名`、自由に設定できるよ。
*   リクエストパラメータ：マッピング

```json
PUT /インデックス名
{
  "mappings": {
    "properties": {
      "フィールド名":{
        "type": "text",
        "analyzer": "ik_smart"
      },
      "フィールド名2":{
        "type": "keyword",
        "index": "false"
      },
      "フィールド名3":{
        "properties": {
          "子フィールド": {
            "type": "keyword"
          }
        }
      },
      // code
    }
  }
}
```

例えば

```json
# インデックスを作成
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

実行後、こんな感じのが返ってきたら成功だよ。

```json
{
  "acknowledged" : true,
  "shards_acknowledged" : true,
  "index" : "hello"
}
```

### インデックスの検索

*   リクエスト方式：GET

*   リクエストパス：`/インデックス名`

*   リクエストパラメータ：なし

形式

```json
GET /インデックス名
```

例えば

```json
# インデックスを確認
GET /hello
```

結果

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

### インデックスの変更

インデックスとマッピングは一度作ったら変更できないんだけど、フィールドを追加することはできるよ。

```json
PUT /インデックス名/_mapping
{
  "properties": {
    "新しいフィールド名":{
      "type": "integer"
    }
  }
}
```

例えば

```json
# フィールドを追加
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

もし`read-only-allow-delete`みたいなエラーが出たら、それはディスクの空き容量が5%未満だからだよ。以下のリクエストで解決できるよ。

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

### インデックスの削除

*   リクエスト方式：DELETE

*   リクエストパス：`/インデックス名`

*   リクエストパラメータ：なし

形式

```json
DELETE /インデックス名
```

例えば

```json
DELETE /hello
```

結果

```json
{
  "acknowledged" : true
}
```

### インデックス操作まとめ

*   インデックスの作成：`PUT /インデックス名`
*   インデックスの検索：`GET /インデックス名`
*   インデックスの削除：`DELETE /インデックス名`
*   フィールドの追加：`PUT /インデックス名/_mapping`

## DSL ドキュメント操作

### ドキュメントの追加

```json
POST /インデックス名/_doc/ドキュメントid
{
    "フィールド1": "値1",
    "フィールド2": "値2",
    "フィールド3": {
        "サブプロパティ1": "値3",
        "サブプロパティ2": "値4"
    },
    // code
}
```

例

```json
# ドキュメントを追加
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

結果

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

### ドキュメントの検索

```json
GET /{インデックス名}/_doc/{id}
```

例

```json
# ドキュメントを検索
GEt /hello/_doc/1
```

結果

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

### ドキュメントの変更

変更には2つの方法があって、全量変更と増分変更だよ。

#### 全量変更

全量変更は、元のドキュメントを上書きするんだ。本質的にはこうだよ。

1.  指定されたIDに基づいてドキュメントを削除する。
2.  同じIDで新しいドキュメントを追加する。

もしIDが存在しなかったら、2番目のステップが実行されて、変更じゃなくて新規追加（上書き書き込み）になるんだ。

```json
PUT /{インデックス名}/_doc/ドキュメントid
{
    "フィールド1": "値1",
    "フィールド2": "値2",
    // code
}
```

例えば

```json
# 変更 - 全量変更
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

結果

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

検索してみると、メールアドレスが変更されてるのがわかるよ。

#### 増分変更

増分変更は、指定されたIDに一致するドキュメントの中の一部フィールドだけを変更するんだ。

```json
POST /{インデックス名}/_update/ドキュメントid
{
    "doc": {
         "フィールド名": "新しい値"
    }
}
```

例えば

```json
# 変更 - 増分変更
POST /hello/_update/1
{
  "doc": {
    "email": "blog@yexca.net"
  }
}
```

結果

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

検索してみると、メールアドレスが変更されてるのがわかるよ。

### ドキュメントの削除

```json
DELETE /{インデックス名}/_doc/id値
```

例えば

```json
# ドキュメントを削除
DELETE /hello/_doc/1
```

結果

```json
{
  "_index" : "hello",
  "_type" : "_doc",
  "_id" : "1",
    // 途中で他のを編集したから、バージョン番号が高くなってるよ
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

### ドキュメント操作まとめ

*   ドキュメントの作成：`POST /{インデックス名}/_doc/ドキュメントid { jsonドキュメント }`
*   ドキュメントの検索：`GET /{インデックス名}/_doc/ドキュメントid`
*   ドキュメントの削除：`DELETE /{インデックス名}/_doc/ドキュメントid`
*   ドキュメントの変更：
    *   全量変更：`PUT /{インデックス名}/_doc/ドキュメントid { jsonドキュメント }`
    *   増分変更：`POST /{インデックス名}/_update/ドキュメントid { "doc": {フィールド}}`
