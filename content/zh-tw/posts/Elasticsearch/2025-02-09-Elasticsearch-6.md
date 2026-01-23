---
slug: 232
title: 'Elasticsearch 自動補齊'
# draft: true
author: yexca
date: '2025-02-09T17:29:28+09:00'
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
> | Elasticsearch 基礎操作 | <https://blog.yexca.net/zh-tw/archives/226> |
> | Elasticsearch 查詢操作 | <https://blog.yexca.net/zh-tw/archives/227> |
> | RestClient 基礎操作 | <https://blog.yexca.net/zh-tw/archives/228> |
> | RestClient 查詢操作 | <https://blog.yexca.net/zh-tw/archives/229> |
> | Elasticsearch 資料聚合 | <https://blog.yexca.net/zh-tw/archives/231> |
> | Elasticsearch 自動補齊 | 本文 |
> | Elasticsearch 資料同步 | <https://blog.yexca.net/zh-tw/archives/234> |
> | Elasticsearch 叢集 | <https://blog.yexca.net/zh-tw/archives/235> |

當使用者在搜尋框輸入字元時，應該提示與該字元相關的搜尋項目，根據輸入的字母提供完整的詞彙功能，這就是自動補齊。

## 拼音斷詞

要實現根據字母進行補齊，就必須對文件依照拼音斷詞。

專案位址：<https://github.com/medcl/elasticsearch-analysis-pinyin>

安裝方式與 IK 斷詞器相同，以下為線上安裝方式，首先進入容器：

```bash
docker exec -it es /bin/bash
```

執行指令：

```bash
./bin/elasticsearch-plugin  install https://github.com/infinilabs/analysis-pinyin/releases/download/v7.12.1/elasticsearch-analysis-pinyin-7.12.1.zip
```

然後退出並重啟：

```bash
# 退出
exit
# 重啟
docker restart es
```

測試：

```json
# 測試拼音斷詞
POST /_analyze
{
  "text": "世界第一可爱",
  "analyzer": "pinyin"
}
```

## 自訂斷詞器

預設的拼音斷詞器會將每個漢字單獨斷成拼音，而我們希望的是每個詞彙形成一組拼音，因此需要對拼音斷詞器進行客製化設定，以形成自訂斷詞器。

Elasticsearch 中斷詞器 (analyzer) 的組成份為三部分：

- character filters：在詞元分析器 (tokenizer) 之前對文字進行處理。例如刪除字元、替換字元。
- tokenizer：將文字依照一定的規則切割成詞彙 (term)。例如 keyword，就是不斷詞；還有 ik_smart。
- tokenizer filter：將詞元分析器 (tokenizer) 輸出後的詞彙做進一步處理。例如大小寫轉換、同義詞處理、拼音處理等。

![image](https://raw.githubusercontent.com/yexca/picx-images-hosting/master/2024/01-SpringCloud/image.x508n2xgxgw.webp)

宣告自訂斷詞器的語法如下：

```json
# 自訂斷詞器
PUT /test
{
  "settings": {
    "analysis": {
      "analyzer": { // 自訂斷詞器
        "my_analyzer": { // 斷詞器名稱
          "tokenizer": "ik_max_word",
          "filter": "py"
        }
      },
      "filter": { // 自訂詞元分析器過濾器
        "py": { // 過濾器名稱
          "type": "pinyin", // 過濾器類型
            // 配置項目在Github上有說明
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
      "name": {
        "type": "text",
        "analyzer": "my_analyzer",
        "search_analyzer": "ik_smart"
      }
    }
  }
}
```

測試：

```json
# 測試自訂斷詞器
POST /test/_analyze
{
  "text": "世界第一可爱",
  "analyzer": "my_analyzer"
}
```

## 自動補齊查詢

Elasticsearch 提供了 [Completion Suggester](https://www.elastic.co/guide/en/elasticsearch/reference/7.6/search-suggesters.html#completion-suggester) 查詢來實現自動補齊功能。這個查詢會匹配以使用者輸入內容開頭的詞彙並回傳。為了提高補齊查詢的效率，對於文件中的欄位類型有一些限制：

- 參與補齊查詢的欄位必須是 completion 類型
- 欄位的內容一般是為了補齊而由多個詞彙組成的陣列。

建立測試索引庫：

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

插入測試資料：

```json
# 範例資料
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

查詢：

```json
# 自動補齊查詢
GET /test/_search
{
  "suggest": {
    "title_suggest": {
      "text": "s", // 關鍵字
      "completion": {
        "field": "title", // 自動補齊查詢的欄位
        "skip_duplicates": true, // 跳過重複
        "size": 10 // 取得前10筆資料
      }
    }
  }
}
```

## 自動補齊 Java

上述 DSL 的 Java 請求：

```java
@Test
public void testAutoIn(){
    SearchRequest request = new SearchRequest("hotel");
    // 請求參數
    request.source()
            .suggest(new SuggestBuilder().addSuggestion(
                    "title_suggest", // 查詢名稱
                    SuggestBuilders
                            .completionSuggestion("title") // 自動補齊查詢的欄位
                            .prefix("s") // 關鍵字
                            .skipDuplicates(true) // 跳過重複
                            .size(10) // 取得前10筆資料
            ));
    // 送出請求
    SearchResponse response = client.search(request, RequestOptions.DEFAULT);
}
```

回應處理：

```java
@Test
public void testAutoIn(){
    SearchRequest request = new SearchRequest("hotel");
    // 請求參數
    request.source()
            .suggest(new SuggestBuilder().addSuggestion(
                    "mySuggestion",
                    SuggestBuilders
                            .completionSuggestion("suggestion")
                            .prefix("h")
                            .skipDuplicates(true)
                            .size(10)
            ));
    // 送出請求
    try {
        SearchResponse response = client.search(request, RequestOptions.DEFAULT);
        // 處理回應
        Suggest suggest = response.getSuggest();
        // 根據名稱取得補齊結果
        CompletionSuggestion mySuggestion = suggest.getSuggestion("mySuggestion");
        // 取得options並遍歷
        for (CompletionSuggestion.Entry.Option option : mySuggestion.getOptions()) {
            String text = option.getText().string();
            System.out.println(text);
        }
    } catch (IOException e) {
        throw new RuntimeException(e);
    }
}
```

## 飯店搜尋自動補齊

之前的 hotel 索引庫未設定拼音斷詞器，但索引庫無法修改，因此需要刪除並重建。

```json
# 刪除並重建
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

修改 HotelDoc 實體類別，新增 suggestion 欄位：

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
    // 廣告
    private Boolean isAD;
    // 自動補齊
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
        // 組裝 suggestion
        if(this.business.contains("/")){
            // business 有多個值，需要切割
            String[] arr = this.business.split("/");
            // 新增元素
            this.suggestion = new ArrayList<>();
            this.suggestion.add(this.brand);
            Collections.addAll(this.suggestion, arr);
        }else {
            this.suggestion = Arrays.asList(this.brand, this.business);
        }
    }
}
```

重新匯入資料：

```java
@Test
public void testBulk() throws IOException {
    // 批次查詢資料
    List<Hotel> hotelList = hotelService.list();

    // 建立 bulk 請求
    BulkRequest request = new BulkRequest();
    // 新增批次請求
    for (Hotel hotel : hotelList) {
        // 轉換文件類型
        HotelDoc hotelDoc = new HotelDoc(hotel);
        // 建立新增文件 request 物件
        request.add(new IndexRequest("hotel")
                .id(hotelDoc.getId().toString())
                .source(JSON.toJSONString(hotelDoc), XContentType.JSON)
        );
    }

    // 送出 bulk 請求
    client.bulk(request, RequestOptions.DEFAULT);
}
```

查詢測試：

```json
GET /hotel/_search
{
  "query": {
    "match_all": {}
  }
}
```

可以看到查詢結果的 suggestion 欄位，接著編寫業務程式碼。

Controller：

```java
@GetMapping("/suggestion")
public List<String> getSuggestion(@RequestParam("key") String prefix){
    return hotelService.getSuggestion(prefix);
}
```

Service：

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
