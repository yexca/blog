---
slug: 227
title: 'Elasticsearch クエリ'
# draft: true
author: yexca
date: '2025-02-01T15:16:28+09:00'
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
> | Elasticsearch 基本操作 | <https://blog.yexca.net/ja/archives/226> |
> | Elasticsearch クエリ操作 | この記事 |
> | RestClient 基本操作 | <https://blog.yexca.net/ja/archives/228> |
> | RestClient クエリ操作 | <https://blog.yexca.net/ja/archives/229> |
> | Elasticsearch データ集計 | <https://blog.yexca.net/ja/archives/231> |
> | Elasticsearch オートコンプリート | <https://blog.yexca.net/ja/archives/232> |
> | Elasticsearch データ同期 | <https://blog.yexca.net/ja/archives/234> |
> | Elasticsearch クラスター | <https://blog.yexca.net/ja/archives/235> |

前回の記事では主にESのデータ保存機能について話したけど、ESが一番得意なのはやっぱり検索とデータ分析なんだ。

ESのクエリも相変わらずJSON形式のDSLで実装するよ。

## クエリの分類

よくあるクエリの種類はこんな感じ。

*   全件検索: 全てのデータを検索するやつ。だいたいテストで使うね。例: `match_all`
*   全文検索 (full text) クエリ: アナライザーを使ってユーザー入力の内容を分かち書きして、転置インデックスからマッチするものを探すよ。例:
    *   `match_query`
    *   `multi_match_query`
*   厳密検索: 正確なターム値に基づいてデータを検索するやつ。だいたい `keyword`、数値、日付、`boolean` などのフィールドタイプを探す時に使うよ。例:
    *   `ids`
    *   `range`
    *   `term`
*   地理情報 (geo) クエリ: 緯度経度に基づいて検索するやつ。例:
    *   `geo_distance`
    *   `geo_bounding_box`
*   複合クエリ (compound): 上記の簡単なクエリ条件を組み合わせて、検索条件をまとめるやつ。例:
    *   `bool`
    *   `function_score`

クエリの文法はだいたい同じだよ:

```json
GET /indexName/_search
{
    "query": {
        "クエリタイプ": {
            "検索条件": "条件値"
        }
    }
}
```

## 全件検索

クエリタイプは `match_all` で、検索条件はないよ。

```json
// 全件検索
GET /indexName/_search
{
    "query": {
        "match_all": {}
    }
}
```

## 全文検索クエリ

ユーザーの入力内容を分かち書きするよ。検索ボックスでの検索によく使われるね。タームを使ってマッチさせるから、検索対象のフィールドは分かち書きできる `text` タイプじゃないといけないんだ。

よくあるのは:

*   `match`: 単一フィールド検索
*   `multi_match`: 複数フィールド検索。どれか一つのフィールドが条件に合えば検索条件に合うとみなされるよ。

`match` クエリの文法:

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

# 例
GET /hotel/_search
{
  "query": {
    "match": {
      "all": "外灘如家"
    }
  }
}
```

`multi_match` の文法

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

# 例
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

> 以前インデックスを作成した時に、`brand`、`name`、`business` の値を `copy_to` を使って `all` フィールドにコピーしたから、上記の2つのクエリの結果は同じになるよ。
>
> でも、検索フィールドが増えれば増えるほどパフォーマンスへの影響が大きくなるから、`copy_to` を使って、単一フィールドで検索するのがおすすめだよ。

## 厳密検索

厳密検索は検索条件を分かち書きしないよ。よくあるのは:

*   `term`: タームの厳密な値に基づいて検索
*   `range`: 値の範囲に基づいて検索

### `term` クエリ

検索条件は分かち書きされないタームじゃないといけないよ。入力値と完全に一致した場合にのみ条件に合うんだ。

文法:

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

例

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

### `range` クエリ

範囲検索だよ。だいたい数値タイプの範囲で絞り込みをする時に使うね。例えば、価格や日付の範囲でフィルタリングする時とか。

文法:

```json
# range
GET /hotel/_search
{
  "query": {
    "range": {
      "FIELD": {
        "gte": 10, // ここで`gte`は「以上」、`gt`は「より大きい」という意味だよ
        "lte": 20 // `lte`は「以下」、`lt`は「より小さい」という意味だね
      }
    }
  }
}
```

例

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

## 地理座標クエリ

これは要するに緯度経度に基づいて検索するやつだよ。公式ドキュメントはこちら: <https://www.elastic.co/guide/en/elasticsearch/reference/current/geo-queries.html>

よくあるシーン: 周囲のホテル、タクシー、人、グルメを検索する時とか。

### 矩形範囲検索

`geo_bounding_box` クエリ。特定の矩形範囲内にある座標を持つ全てのドキュメントを検索するよ。

左上と右下の2つの点の座標を指定する必要があるんだ。

```json
# geo_bounding_box
GET /indexName/_search
{
  "query": {
    "geo_bounding_box": {
      "FIELD": {
        "top_left": { // 左上隅の点
          "lat": 30,
          "lon": 20
        },
        "bottom_right": { // 右下隅の点
          "lat": 31,
          "lon": 21
        }
      }
    }
  }
}
```

### 近隣検索

距離検索 (`geo_distance`) とも呼ばれるね。指定した中心点から特定の距離以内にある全てのドキュメントを検索するよ。

```json
# geo_distance
GET /indexName/_search
{
  "query": {
    "geo_distance": {
      "distance": "15km", // 半径
      "FIELD": "31, 21" // 中心
    }
  }
}
```

例: 周囲 (31.21, 121.5) の15km以内にあるホテルを検索するよ。

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

## 複合クエリ

他のシンプルなクエリを組み合わせて、より複雑な検索ロジックを実現するんだ。よくあるのは2種類:

*   `function score`: スコア計算関数クエリ。ドキュメントの関連性スコアを制御して、ドキュメントのランキングを調整できるよ。
*   `bool query`: ブールクエリ。論理関係を使って複数の他のクエリを組み合わせ、複雑な検索を実現するよ。

### 関連性スコア

`match` クエリを使うと、ドキュメントの結果は検索タームとの関連度に基づいてスコア (`_score`) がつけられて、結果はスコアの高い順に並んで返ってくるんだ。こんな感じ:

```json
[
  {
    "_score" : 17.850193,
    "_source" : {
      "name" : "虹橋如家酒店真不错",
    }
  },
  {
    "_score" : 12.259849,
    "_source" : {
      "name" : "外灘如家酒店真不错",
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

ESでは、初期にはTF-IDFアルゴリズムがスコア計算に使われていたんだ。

![image](https://jsd.cdn.zzko.cn/gh/yexca/image_hosting@master/2024/01-SpringCloud/image-20210721190152134.z026lthgfsw.webp)

TF-IDFアルゴリズムには欠点があって、タームの頻度が高くなるほどドキュメントのスコアも高くなって、単一のタームがドキュメントに与える影響が大きすぎたんだ。5.1バージョン以降は、アルゴリズムがBM25アルゴリズムに変わり、単一のタームのスコアには上限が設けられるようになったよ。

![image](https://jsd.cdn.zzko.cn/gh/yexca/image_hosting@master/2024/01-SpringCloud/image-20210721190416214.erx3gt63494.webp)

### スコア計算関数クエリ

スコア計算関数はかなり合理的だけど、プロダクトが求めているものと必ずしも一致するとは限らないんだ。関連性スコアを制御したい場合は、ESの `function_score` クエリを使って、ドキュメントの関連性スコアを変更し、新しく得られたスコアに基づいてソートする必要があるよ。

構造:

```json
# function score
GET /indexName/_search
{
  "query": {
    "function_score": {
      "query": {}, // 元のクエリ
      "functions": [
        {
          "filter": {}, // フィルタ条件
          "weight": 1 // スコア計算関数
        }
      ],
      "boost_mode": "multiply" // 演算モード
    }
  }
}
```

元のクエリ: この条件に基づいてドキュメントを検索し、BM25アルゴリズムに基づいてドキュメントにスコアをつけるよ。これが元のスコア (query score) だね。

フィルタ条件: この条件に合致するドキュメントのみが再スコアリングされるよ。

スコア計算関数: フィルタ条件に合致するドキュメントは、この関数に基づいて計算されて、関数スコアが得られるんだ。4種類の関数があるよ:

*   `weight`: 関数の結果が定数になる。
*   `field_value_factor`: ドキュメント内の特定のフィールド値を関数の結果として使う。
*   `random_score`: 乱数を関数の結果として使う。
*   `script_score`: カスタムのスコア計算関数アルゴリズム。

演算モード: スコア計算関数の結果と、元のクエリの関連性スコアの間の演算方法。こんな感じ:

*   `multiply`: 乗算
*   `replace`: `function score` で `query score` を置き換える
*   その他、`sum`、`avg`、`max`、`min` など

例: 「如家」というブランドのホテルを上位に表示させるよ。

```json
GET /hotel/_search
{
  "query": { // 元のクエリ条件は任意だけど、ここでは動作させるために条件を追加してるよ
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

### ブールクエリ

ブールクエリは一つまたは複数のクエリ句の組み合わせで、それぞれの句がサブクエリになっているんだ。組み合わせ方はこんな感じ:

*   `must`: 各サブクエリに必ずマッチする必要がある。「AND」みたいなものだね。
*   `should`: サブクエリに選択的にマッチする。「OR」みたいなものだよ。
*   `must_not`: 必ずマッチしないこと。スコア計算には参加しない。「NOT」みたいなものだね。
*   `filter`: 必ずマッチすること。スコア計算には参加しない。

例えば、ホテルを検索する時に、地域、ブランド、価格などのフィールドで絞り込みたい場合、それぞれのフィールドで検索条件や方法が違うから、複数の異なるクエリが必要になるよね。それらを組み合わせるには`bool`クエリを使うんだ。

スコア計算に参加するフィールドは、検索パフォーマンスが悪くなるよ。多条件検索の時は、次のことをおすすめするね:

*   検索ボックスのキーワード検索は全文検索だから、`must` クエリを使って、スコア計算に参加させる。
*   その他のフィルタ条件は、`filter` クエリを使って、スコア計算には参加させない。

文法:

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

例: 名前が「如家」を含み、価格が400以下で、座標 (31.21, 121.5) の周囲10km以内にあるホテルを検索するよ。

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

## 検索結果の処理

検索で得られた結果は、ソート、ページネーション、ハイライトができるよ。

### ソート

ESはデフォルトでは関連性スコアに基づいてソートするけど、カスタム方式で検索結果をソートすることもできるんだ。ソートできるフィールドタイプは、`keyword` タイプ、数値タイプ、地理座標タイプ、日付タイプなどがあるよ。

#### 通常フィールドのソート

`keyword`、数値、日付タイプのソートの文法はだいたい同じだよ。

文法:

```json
# sort_normal
GET /indexName/_search
{
  "query": {
    
  },
  "sort": [
    {
      "FIELD": {
        "order": "desc" // ソートフィールド、昇順 (ASC)、降順 (DESC)
      }
    }
  ]
}
```

ソート条件は配列になっていて、複数のソート条件を書けるよ。宣言された順に、最初の条件が同じ場合は2番目の条件で、というように続くんだ。

例: ホテルデータをユーザー評価の降順で、評価が同じ場合は価格の昇順でソートするよ。

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
// または
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

#### 地理座標ソート

文法:

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
        "order": "asc", // ソート順
        "unit": "km" // ソート単位
      }
    }
  ]
}
```

例: ホテルを距離でソートするよ (位置を 31.034661, 121.612282 と仮定するね)。

> 高徳で緯度経度を取得するにはここ: <https://lbs.amap.com/demo/jsapi-v2/example/map/click-to-get-lnglat/>

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

### ページネーション

ESはデフォルトでTop10のデータしか返さないから、もっと多くのデータを検索したい場合はページネーションのパラメータを変更する必要があるよ。ESは `from`、`size` パラメータを変更して、返却するページング結果を制御するんだ:

*   `from`: 何番目のドキュメントから始めるか
*   `size`: 合計でいくつのドキュメントを検索するか

> MySQLの `limit ?,?` みたいなものだね。

#### 基本ページネーション

基本的な文法は以下の通りだよ。

```json
# 基本ページネーション
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

#### ディープページネーションの問題

もし990〜1000番目のデータを検索したいなら、クエリはこうなるよ。

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

でもESの仕組み上、ページネーションする時はまず0〜1000件を検索して、それから990〜1000件目を切り取って表示するんだ。

ESがシングルノードモードなら大きな影響はないけど、クラスター構成でデプロイされている場合、1000件検索するからといって各ノードが200件ずつ検索するわけじゃないんだ。なぜなら、Aノードの200件がBノードでは1000位以下になる可能性もあるからね。

上位1000件を取得するためには、各ノードがTop1000を検索し、それらをまとめて再ランキングして切り取る必要があるんだ。

もしTop10000、あるいはそれ以上を検索しようとすると、メモリとCPUに非常に大きな負荷がかかるから、ESは `from + size` が10000を超えるリクエストを禁止しているよ。

ディープページネーションに対しては、ESが2つの解決策を提供しているよ: <https://www.elastic.co/guide/en/elasticsearch/reference/current/paginate-search-results.html>

*   `search after`: ページネーション時にソートが必要で、原理は前回のソート値から次のページのデータを検索するんだ。公式が推奨する方法だね。
*   `scroll`: 原理はソートされたドキュメントIDのスナップショットをメモリに保存するんだけど、公式はもう推奨していないよ。

#### ページネーションまとめ

*   `from + size`:
    *   利点: ランダムなページ移動をサポートしているよ。
    *   欠点: ディープページネーションの問題があるのと、デフォルトの検索上限 (`from + size`) が10000なんだ。
    *   使うシーン: 百度、京東、Google、淘宝みたいなランダムなページ移動がある検索だね。
*   `after search`:
    *   利点: 検索上限がないよ (1回の検索で `size` が10000を超えなければね)。
    *   欠点: 次のページへ順次検索するだけで、ランダムなページ移動はできないんだ。
    *   使うシーン: ランダムなページ移動が必要ない検索、例えばスマホで下にスクロールするページ移動とか。
*   `scroll`:
    *   利点: 検索上限がないよ (1回の検索で `size` が10000を超えなければね)。
    *   欠点: 余分なメモリ消費があるし、検索結果はリアルタイムじゃないんだ。
    *   使うシーン: 大量のデータ取得や移行。ES7.1からは非推奨になってて、`after search` がおすすめだよ。

### ハイライト

検索エンジンでコンテンツを検索する時、キーワードが赤色になって目立つことがあるよね。それがハイライト表示で、通常はドキュメント内の全てのキーワードに `<em>` タグを追加して、そのタグにCSSスタイルを設定するんだ。

文法:

```json
# ハイライト
GET /indexName/_search
{
  "query": {
    
  },
  "highlight": {
    "fields": { // ハイライトするフィールドを指定する
      "FIELD": {
        "pre_tags": "<em>", // ハイライトフィールドをマークするための開始タグ
        "post_tags": "</em>" // ハイライトフィールドをマークするための終了タグ
      }
    }
  }
}
```

注意点:

*   ハイライトはキーワードに対して行われるから、検索条件にはキーワードが必要で、範囲検索はできないよ。
*   デフォルトでは、ハイライトするフィールドは検索で指定したフィールドと一致している必要があるよ。そうじゃないとハイライトされないんだ。
*   検索対象ではないフィールドをハイライトしたい場合は、`required_field_match=false` というプロパティを追加する必要があるよ。

例: 検索結果で、名前の部分をハイライトするよ。

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

// 結果の抜粋
"hits" : [
    {
    "_index" : "hotel",
    "_type" : "_doc",
    "_id" : "339952837",
    "_score" : 2.7875905,
    "_source" : {
      "address" : "良郷西路7号",
      "brand" : "如家",
      "business" : "房山風景区",
      "city" : "北京",
      "id" : 339952837,
      "location" : "39.73167, 116.132482",
      "name" : "如家酒店(北京良郷西路店)",
      "pic" : "https://m.tuniucdn.com/fb3/s1/2n9c/3Dpgf5RTTzrxpeN5y3RLnRVtxMEA_w200_h200_c1_t0.jpg",
      "price" : 159,
      "score" : 46,
      "starName" : "二钻"
    },
    "highlight" : {
      "name" : [
        "<em>如家</em>ホテル(北京良郷西路店)"
      ]
    }
  }
]
```

結果の `highlight` 部分に、タグが追加された後の結果が表示されているね。

### 検索結果処理のまとめ

DSLクエリは大きなJSONオブジェクトで、以下を含むよ:

*   `query`: クエリ
*   `from`、`size`: ページネーション条件
*   `sort`: ソート条件
*   `highlight`: ハイライト条件

総合的な例

```json
# クエリ総合
GET /hotel/_search
{
  "query": { // クエリ
    "match": {
      "city": "上海"
    }
  },
  "from": 10, // ページネーション開始
  "size": 10, // ページネーションサイズ
  "sort": [
    { // 通常ソート
      "price": {
        "order": "asc"
      }
    },
    { // 距離ソート
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
  "highlight": { // ハイライトフィールド
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
