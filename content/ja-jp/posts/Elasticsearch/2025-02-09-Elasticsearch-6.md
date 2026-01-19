---
slug: 232
title: 'Elasticsearch オートコンプリート'
# draft: true
author: yexca
date: '2025-02-09T17:29:28+09:00'
lastmod: '2025-02-15T17:17:08+09:00'
categories:
    - テック学習
tags:
    - バックエンド技術
    - Elasticsearch
    - SpringCloud
---

{{< notice >}} この記事は gemini-2.5-flash によって翻訳されました {{< /notice >}}

> **Elasticsearch シリーズ**
>
> | 内容                   | リンク                                |
> | :--------------------- | :------------------------------------ |
> | Elasticsearch 基本操作 | <https://blog.yexca.net/archives/226> |
> | Elasticsearch 検索操作 | <https://blog.yexca.net/archives/227> |
> | RestClient 基本操作 | <https://blog.yexca.net/archives/228> |
> | RestClient 検索操作 | <https://blog.yexca.net/archives/229> |
> | Elasticsearch データ集計 | <https://blog.yexca.net/archives/231> |
> | Elasticsearch オートコンプリート | この記事 |
> | Elasticsearch データ同期 | <https://blog.yexca.net/archives/234> |
> | Elasticsearch クラスター | <https://blog.yexca.net/archives/235> |

ユーザーが検索ボックスに文字を入力したときに、その文字に関連する検索候補を表示し、入力された文字に基づいて単語を補完する機能、それがオートコンプリートだよ。

## ピンイン分かち書き

文字に基づいて補完を実現するには、ドキュメントをピンインで分かち書きする必要があるんだ。

プロジェクトのURL：<https://github.com/medcl/elasticsearch-analysis-pinyin>

インストール方法はIKアナライザーと同じだよ。以下はオンラインインストール方法で、まずコンテナに入るんだ。

```bash
docker exec -it es /bin/bash
```

コマンドを実行するよ。

```bash
./bin/elasticsearch-plugin  install https://github.com/infinilabs/analysis-pinyin/releases/download/v7.12.1/elasticsearch-analysis-pinyin-7.12.1.zip
```

それから終了して再起動するんだ。

```bash
# 終了
exit
# 再起動
docker restart es
```

テストしてみよう。

```json
# ピンイン分かち書きのテスト
POST /_analyze
{
  "text": "世界第一可爱",
  "analyzer": "pinyin"
}
```

## カスタムアナライザー

デフォルトのピンインアナライザーだと、各漢字を個別のピンインに分けちゃうんだ。でも、僕らが欲しいのは、各単語がピンインのまとまりになることだから、ピンインアナライザーをカスタマイズして、独自のカスタムアナライザーを作る必要があるね。

Elasticsearchのアナライザーは3つの部分で構成されてるよ。

- character filters：tokenizerの前にテキストを処理する部分。例えば、文字の削除や置換とかね。
- tokenizer：テキストを一定のルールに従って単語（term）に分割する部分。例えばkeywordだと分かち書きしないし、ik_smartとかもあるね。
- tokenizer filter：tokenizerが出力した単語をさらに処理する部分。例えば、大文字小文字変換、同義語処理、ピンイン処理とかだよ。

![image](https://raw.githubusercontent.com/yexca/picx-images-hosting/master/2024/01-SpringCloud/image.x508n2xgxgw.webp)

カスタムアナライザーを宣言する構文はこんな感じ。

```json
# カスタムアナライザー
PUT /test
{
  "settings": {
    "analysis": {
      "analyzer": { // カスタムアナライザー
        "my_analyzer": { // アナライザー名
          "tokenizer": "ik_max_word",
          "filter": "py"
        }
      },
      "filter": { // カスタムtokenizerフィルター
        "py": { // フィルター名
          "type": "pinyin", // フィルタータイプ
            // 設定項目はGithubで説明されてるよ
          "keep_full_piny": false,
          "keep_joined_full_pinyin": true,
          "keep_original": true,
          "limit_first_letter_length": 16,
          "remove_duplicated_term": true,
          "none_chinese_pinyin_tokenize": false
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "name": {
        "type": "text",
        "analyzer": "my_analyzer",
        "search_analyzer": "ik_smart"
      }
    }
  }
}
```

テストしてみよう。

```json
# カスタムアナライザーのテスト
POST /test/_analyze
{
  "text": "世界第一可爱",
  "analyzer": "my_analyzer"
}
```

## オートコンプリート検索

Elasticsearchはオートコンプリート機能を実現するために、[Completion Suggester]([https://www.elastic.co/guide/en/elasticsearch/reference/7.6/search-suggesters.html#completion-suggester](https://www.elastic.co/guide/en/elasticsearch/reference/7.6/search-suggesters.html)) という検索を提供してるんだ。このクエリは、ユーザーが入力した内容で始まる単語をマッチさせて返すよ。補完検索の効率を上げるために、ドキュメント内のフィールドタイプにはいくつか制約があるんだ。

- 補完検索に関わるフィールドはcompletionタイプである必要があるんだ。
- フィールドの内容は通常、補完に使われる複数の単語からなる配列だよ。

テスト用のインデックスを作成するよ。

```json
PUT /test
{
  "mappings": {
    "properties": {
      "title": {
        "type": "completion"
      }
    }
  }
}
```

テストデータを挿入するよ。

```json
# サンプルデータ
POST /test/_doc
{
  "title": ["Sony", "WH-1000XM3"]
}
POST /test/_doc
{
  "title": ["SK-II", "PITERA"]
}
POST /test/_doc
{
  "title": ["Nintendo", "switch"]
}
```

検索

```json
# オートコンプリート検索
GET /test/_search
{
  "suggest": {
    "title_suggest": {
      "text": "s", // キーワード
      "completion": {
        "field": "title", // オートコンプリート検索のフィールド
        "skip_duplicates": true, // 重複をスキップ
        "size": 10 // 上位10件のデータを取得
      }
    }
  }
}
```

## オートコンプリート Java

上記のDSLをJavaでリクエストするよ。

```java
@Test
public void testAutoIn(){
    SearchRequest request = new SearchRequest("hotel");
    // リクエストパラメータ
    request.source()
            .suggest(new SuggestBuilder().addSuggestion(
                    "title_suggest", // クエリ名
                    SuggestBuilders
                            .completionSuggestion("title") // オートコンプリート検索のフィールド
                            .prefix("s") // キーワード
                            .skipDuplicates(true) // 重複をスキップ
                            .size(10) // 上位10件のデータを取得
            ));
    // リクエストを送信
    SearchResponse response = client.search(request, RequestOptions.DEFAULT);
}
```

レスポンスの処理だよ。

```java
@Test
public void testAutoIn(){
    SearchRequest request = new SearchRequest("hotel");
    // リクエストパラメータ
    request.source()
            .suggest(new SuggestBuilder().addSuggestion(
                    "mySuggestion",
                    SuggestBuilders
                            .completionSuggestion("suggestion")
                            .prefix("h")
                            .skipDuplicates(true)
                            .size(10)
            ));
    // リクエストを送信
    try {
        SearchResponse response = client.search(request, RequestOptions.DEFAULT);
        // レスポンスを処理
        Suggest suggest = response.getSuggest();
        // 名前で補完結果を取得
        CompletionSuggestion mySuggestion = suggest.getSuggestion("mySuggestion");
        // optionsを取得してループ処理
        for (CompletionSuggestion.Entry.Option option : mySuggestion.getOptions()) {
            String text = option.getText().string();
            System.out.println(text);
        }
    } catch (IOException e) {
        throw new RuntimeException(e);
    }
}
```

## ホテル検索のオートコンプリート

以前のhotelインデックスはピンインアナライザーが設定されてなかったんだ。でも、インデックスは変更できないから、削除して再構築する必要があるよ。

```json
# 削除して再構築
DELETE /hotel
PUT /hotel
{
  "settings": {
    "analysis": {
      "analyzer": {
        "text_analyzer": {
          "tokenizer": "ik_max_word",
          "filter": "py"
        },
        "completion_analyzer": {
          "tokenizer": "keyword",
          "filter": "py"
        }
      },
      "filter": {
        "py": {
          "type": "pinyin",
          "keep_full_pinyin": false,
          "keep_joined_full_pinyin": true,
          "keep_original": true,
          "limit_first_letter_length": 16,
          "remove_duplicated_term": true,
          "none_chinese_pinyin_tokenize": false
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "id": {
        "type": "keyword"
      },
      "name": {
        "type": "text",
        "analyzer": "text_analyzer",
        "search_analyzer": "ik_smart",
        "copy_to": "all"
      },
      "address": {
        "type": "keyword",
        "index": false
      },
      "price": {
        "type": "integer"
      },
      "score": {
        "type": "integer"
      },
      "brand": {
        "type": "keyword",
        "copy_to": "all"
      },
      "city": {
        "type": "keyword"
      },
      "starName": {
        "type": "keyword"
      },
      "business": {
        "type": "keyword",
        "copy_to": "all"
      },
      "location": {
        "type": "geo_point"
      },
      "pic": {
        "type": "keyword",
        "index": false
      },
      "all": {
        "type": "text",
        "analyzer": "text_analyzer",
        "search_analyzer": "ik_smart"
      },
      "suggestion": {
        "type": "completion",
        "analyzer": "completion_analyzer"
      }
    }
  }
}
```

HotelDocエンティティクラスを修正して、suggestionフィールドを追加するよ。

```java
@Data
@NoArgsConstructor
public class HotelDoc {
    private Long id;
    private String name;
    private String address;
    private Integer price;
    private Integer score;
    private String brand;
    private String city;
    private String starName;
    private String business;
    private String location;
    private String pic;
    private Object distance;
    // 広告
    private Boolean isAD;
    // オートコンプリート
    private List<String> suggestion;

    public HotelDoc(Hotel hotel) {
        this.id = hotel.getId();
        this.name = hotel.getName();
        this.address = hotel.getAddress();
        this.price = hotel.getPrice();
        this.score = hotel.getScore();
        this.brand = hotel.getBrand();
        this.city = hotel.getCity();
        this.starName = hotel.getStarName();
        this.business = hotel.getBusiness();
        this.location = hotel.getLatitude() + ", " + hotel.getLongitude();
        this.pic = hotel.getPic();
        // suggestionを組み立てる
        if(this.business.contains("/")){
            // businessに複数の値がある場合、分割する必要がある
            String[] arr = this.business.split("/");
            // 要素を追加
            this.suggestion = new ArrayList<>();
            this.suggestion.add(this.brand);
            Collections.addAll(this.suggestion, arr);
        }else {
            this.suggestion = Arrays.asList(this.brand, this.business);
        }
    }
}
```

データを再インポートするよ。

```java
@Test
public void testBulk() throws IOException {
    // データを一括検索
    List<Hotel> hotelList = hotelService.list();

    // bulkリクエストを作成
    BulkRequest request = new BulkRequest();
    // bulkリクエストを追加
    for (Hotel hotel : hotelList) {
        // ドキュメントタイプを変換
        HotelDoc hotelDoc = new HotelDoc(hotel);
        // 新規ドキュメントのrequestオブジェクトを作成
        request.add(new IndexRequest("hotel")
                .id(hotelDoc.getId().toString())
                .source(JSON.toJSONString(hotelDoc), XContentType.JSON)
        );
    }

    // bulkリクエストを発行
    client.bulk(request, RequestOptions.DEFAULT);
}
```

検索テスト

```json
GET /hotel/_search
{
  "query": {
    "match_all": {}
  }
}
```

検索結果のsuggestionフィールドを確認できるはずだよ。そしたら、ビジネスコードを書こう。

Controller

```java
@GetMapping("/suggestion")
public List<String> getSuggestion(@RequestParam("key") String prefix){
    return hotelService.getSuggestion(prefix);
}
```

Service

```java
public List<String> getSuggestion(String prefix) {
    SearchRequest request = new SearchRequest("hotel");
    request.source().suggest(
            new SuggestBuilder().addSuggestion(
                    "mySuggestion",
                    SuggestBuilders
                            .completionSuggestion("suggestion")
                            .prefix(prefix)
                            .size(10)
                            .skipDuplicates(true)
            )
    );
    try {
        SearchResponse response = client.search(request, RequestOptions.DEFAULT);
        Suggest suggestions = response.getSuggest();
        CompletionSuggestion mySuggestion = suggestions.getSuggestion("mySuggestion");
        List<CompletionSuggestion.Entry.Option> options = mySuggestion.getOptions();
        ArrayList<String> list = new ArrayList<>(options.size());
        for (CompletionSuggestion.Entry.Option option : options) {
            String text = option.getText().string();
            list.add(text);
        }
        return list;
    } catch (IOException e) {
        throw new RuntimeException(e);
    }
}
```
