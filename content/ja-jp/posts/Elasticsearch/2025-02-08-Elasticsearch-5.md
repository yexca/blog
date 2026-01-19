---
slug: 231
title: 'Elasticsearch データアグリゲーション'
# draft: true
author: yexca
date: '2025-02-08T14:56:36+09:00'
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
> | Elasticsearch 基礎操作 | <https://blog.yexca.net/archives/226> |
> | Elasticsearch クエリ操作 | <https://blog.yexca.net/archives/227> |
> | RestClient 基礎操作 | <https://blog.yexca.net/archives/228> |
> | RestClient クエリ操作 | <https://blog.yexca.net/archives/229> |
> | Elasticsearch データアグリゲーション | この記事 |
> | Elasticsearch 自動補完 | <https://blog.yexca.net/archives/232> |
> | Elasticsearch データ同期 | <https://blog.yexca.net/archives/234> |
> | Elasticsearch クラスター | <https://blog.yexca.net/archives/235> |

[アグリゲーション (aggregations)](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations.html) を使うと、データの統計、分析、演算がすごく簡単にできちゃうんだ。例えばこんな感じ:

*   どんなブランドのスマホが一番人気？
*   これらのスマホの平均価格、最高価格、最低価格は？
*   これらのスマホの月ごとの販売状況はどうなってる？

## アグリゲーションの種類

よく使われるのは3種類だよ:

*   バケット (bucket) アグリゲーション：ドキュメントをグループ分けするのに使うんだ。
    *   TermAggregation：ドキュメントのフィールド値でグループ分けするよ。例えばブランド別、国別とかね。
    *   Date Histogram：日付の区切りでグループ分けするんだ。例えば1週間ごととか1ヶ月ごととか。
*   メトリック (metric) アグリゲーション：最大値、最小値、平均値などを計算するのに使うよ。
    *   Avg：平均値
    *   Max：最大値
    *   Min：最小値
    *   Stats：最大値、最小値、平均値、合計などをまとめて求めるんだ。
*   パイプライン (pipeline) アグリゲーション：他のアグリゲーションの結果をベースにして、さらにアグリゲーションを行うんだ。

> アグリゲーションに参加するフィールドは、keyword、日付、数値、ブーリアン型である必要があるよ。

## DSL アグリゲーションクエリ

### bucket

全データの中でホテルのブランドが何種類あるか数える、つまりブランドごとにデータをグループ分けするよ。

```json
# bucket term
GET /hotel/_search
{
  "size": 0, // sizeを0に設定すると、結果にドキュメントは含まれず、アグリゲーション結果だけになるよ。
  "aggs": {
    "brandAgg": { // アグリゲーション名
      "terms": { // アグリゲーションタイプ
        "field": "brand", // アグリゲーション対象フィールド
        "size": 20 // 取得するアグリゲーション結果の数
      }
    }
  }
}
```

### アグリゲーション結果のソート

デフォルトでは、バケットアグリゲーションはバケット内のドキュメント数を数えて（これをcountと呼ぶよ）、countの降順でソートされるんだ。order属性を指定すれば、ソート方法をカスタマイズできるよ。

```json
GET /hotel/_search
{
  "size": 0,
  "aggs": {
    "brandAgg": {
      "terms": {
        "field": "brand",
        "size": 20,
        "order": { // ソート
          "_count": "asc"
        }
      }
    }
  }
}
```

### アグリゲーション範囲の限定

デフォルトではインデックス内の全ドキュメントに対してアグリゲーションが実行されるんだけど、実際にはユーザーが検索条件を入力するから、アグリゲーションは検索結果に対して行われるべきだよね。だから、アグリゲーションには条件を追加する必要があるんだ。

```json
# bucket query
GET /hotel/_search
{
  "query": {
    "range": {
      "price": {
        "lte": 200 // 価格が200未満のドキュメントのみをアグリゲーションする。
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

さっきのbucketアグリゲーションでブランドごとにグループ分けしたけど、今度は各ブランドのユーザー評価の最小値、最大値、平均値を取得したいな。

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
      "aggs": { // bucketのサブアグリゲーションで、グループ分けされた各グループに対して演算を行うよ。
        "scoreStats": { // アグリゲーション名
          "stats": { // アグリゲーションタイプ
            "field": "score" // アグリゲーションフィールド
          }
        }
      }
    }
  }
}
```

平均値でソート

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
          "scoreStats.avg": "desc" // 平均値の降順
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

## RestAPI アグリゲーション

### 構文

アグリゲーション条件はqueryと同じ階層だから、`request.source()` を使ってアグリゲーション条件を指定するよ。

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

レスポンス処理

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

    // アグリゲーション結果をパースする。
    Aggregations aggregations = response.getAggregations();
    // 名前でアグリゲーション結果を取得する。
    Terms term = aggregations.get("brandAgg");
    // バケットを取得する。
    List<? extends Terms.Bucket> buckets = term.getBuckets();
    // イテレートする。
    for (Terms.Bucket bucket : buckets) {
        // キーを取得する。
        String name = bucket.getKeyAsString();
        System.out.println(name);
    }
}
```

### 実装要件

フロントエンドページの都市、星評価、ブランドは選択肢が固定されていて、検索入力によって変わらないんだ。

でも、「東方明珠」で検索したら、都市は上海だけになるべきで、他の都市は表示されるべきじゃないよね。

つまり、選択可能な都市などは検索入力の内容に応じて変わるべきなんだ。そのためには、フロントエンドは内容に基づいて選択可能な都市をリクエストする必要があるよ。インターフェースはこんな感じを想定:

*   リクエスト方式：`POST`
*   リクエストパス：`/hotel/filters`
*   リクエストパラメータ：`RequestParams`、検索ドキュメントのパラメータと同じ
*   戻り値の型：`Map<String, List<String>>`

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
    // リクエスト
    SearchRequest request = new SearchRequest("hotel");
    // DSL
    basicQuery(params, request);
    // sizeを設定
    request.source().size(0);
    // アグリゲーション
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
    // リクエスト実行
    try {
        SearchResponse response = client.search(request, RequestOptions.DEFAULT);

        // レスポンスをパース
        Map<String, List<String>> result = new HashMap<>();
        Aggregations aggregations = response.getAggregations();
        // ブランド
        List<String> brandList = getAggName(aggregations, "brandAgg");
        result.put("ブランド", brandList);
        // 都市
        List<String> cityList = getAggName(aggregations, "cityAgg");
        result.put("都市", cityList);
        // 星評価
        List<String> starList = getAggName(aggregations, "starAgg");
        result.put("星級", starList);
        return result;
    } catch (IOException e) {
        throw new RuntimeException(e);
    }
}

private static List<String> getAggName(Aggregations aggregations, String name) {
    // ブランドを取得
    Terms brand = aggregations.get(name);
    // バケットを取得
    List<? extends Terms.Bucket> buckets = brand.getBuckets();
    // イテレート
    List<String> brandList = new ArrayList<>();
    for (Terms.Bucket bucket : buckets) {
        // キーを取得
        String key = bucket.getKeyAsString();
        brandList.add(key);
    }
    return brandList;
}
```
