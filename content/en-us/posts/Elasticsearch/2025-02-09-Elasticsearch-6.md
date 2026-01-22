---
slug: 232
title: 'Elasticsearch Autocomplete'
# draft: true
author: yexca
date: '2025-02-09T17:29:28+09:00'
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
> | Elasticsearch Basic Operations | <https://blog.yexca.net/en/archives/226> |
> | Elasticsearch Query Operations | <https://blog.yexca.net/en/archives/227> |
> | RestClient Basic Operations | <https://blog.yexca.net/en/archives/228> |
> | RestClient Query Operations | <https://blog.yexca.net/en/archives/229> |
> | Elasticsearch Data Aggregation | <https://blog.yexca.net/en/archives/231> |
> | Elasticsearch Autocomplete | This Article |
> | Elasticsearch Data Synchronization | <https://blog.yexca.net/en/archives/234> |
> | Elasticsearch Cluster      | <https://blog.yexca.net/en/archives/235> |

When a user types characters into a search box, they expect relevant suggestions. Providing full word completion based on typed letters is what we call autocomplete.

## Pinyin Tokenization

To enable letter-based autocomplete, documents must be tokenized by pinyin.

Project URL: <https://github.com/medcl/elasticsearch-analysis-pinyin>

Installation is similar to the IK tokenizer. Here's how to install it online, starting with entering the container:

```bash
docker exec -it es /bin/bash
```

Execute the command:

```bash
./bin/elasticsearch-plugin install https://github.com/infinilabs/analysis-pinyin/releases/download/v7.12.1/elasticsearch-analysis-pinyin-7.12.1.zip
```

Then exit and restart:

```bash
# Exit
exit
# Restart
docker restart es
```

Test:

```json
# Test Pinyin Tokenization
POST /_analyze
{
  "text": "世界第一可爱",
  "analyzer": "pinyin"
}
```

## Custom Analyzer

The default pinyin tokenizer splits each Chinese character into individual pinyin. However, we want each term to form a group of pinyin. This requires customizing the pinyin tokenizer to create a custom analyzer.

In ES, an analyzer consists of three parts:

-   character filters: Process text before the tokenizer. For example, deleting or replacing characters.
-   tokenizer: Splits text into terms based on specific rules. For example, 'keyword' tokenizes nothing; 'ik_smart' is another.
-   token filter: Further processes terms output by the tokenizer. For example, case conversion, synonym handling, pinyin processing.

![image](https://raw.githubusercontent.com/yexca/picx-images-hosting/master/2024/01-SpringCloud/image.x508n2xgxgw.webp)

Here's the syntax for declaring a custom analyzer:

```json
# Custom Analyzer
PUT /test
{
  "settings": {
    "analysis": {
      "analyzer": { // Custom analyzers
        "my_analyzer": { // Analyzer name
          "tokenizer": "ik_max_word",
          "filter": "py"
        }
      },
      "filter": { // Custom token filter
        "py": { // Filter name
          "type": "pinyin", // Filter type
            // Configuration options explained on GitHub
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

Test:

```json
# Test Custom Analyzer
POST /test/_analyze
{
  "text": "世界第一可爱",
  "analyzer": "my_analyzer"
}
```

## Autocomplete Query

ES provides the [Completion Suggester](https://www.elastic.co/guide/en/elasticsearch/reference/7.6/search-suggesters.html#completion-suggester) query for autocomplete. This query matches and returns terms starting with the user's input. To boost efficiency, there are some constraints on the field types in documents for completion queries:

-   Fields involved in completion queries must be of 'completion' type.
-   Field content is typically an array of terms used for completion.

Create test index:

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

Insert test data:

```json
# Example data
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

Query:

```json
# Autocomplete Query
GET /test/_search
{
  "suggest": {
    "title_suggest": {
      "text": "s", // Keyword
      "completion": {
        "field": "title", // Field for autocomplete query
        "skip_duplicates": true, // Skip duplicates
        "size": 10 // Get top 10 results
      }
    }
  }
}
```

## Autocomplete in Java

Java request for the above DSL:

```java
@Test
public void testAutoIn(){
    SearchRequest request = new SearchRequest("hotel");
    // Request parameters
    request.source()
            .suggest(new SuggestBuilder().addSuggestion(
                    "title_suggest", // Query name
                    SuggestBuilders
                            .completionSuggestion("title") // Field for autocomplete query
                            .prefix("s") // Keyword
                            .skipDuplicates(true) // Skip duplicates
                            .size(10) // Get top 10 results
            ));
    // Send request
    SearchResponse response = client.search(request, RequestOptions.DEFAULT);
}
```

Response handling:

```java
@Test
public void testAutoIn(){
    SearchRequest request = new SearchRequest("hotel");
    // Request parameters
    request.source()
            .suggest(new SuggestBuilder().addSuggestion(
                    "mySuggestion",
                    SuggestBuilders
                            .completionSuggestion("suggestion")
                            .prefix("h")
                            .skipDuplicates(true)
                            .size(10)
            ));
    // Send request
    try {
        SearchResponse response = client.search(request, RequestOptions.DEFAULT);
        // Process response
        Suggest suggest = response.getSuggest();
        // Get completion results by name
        CompletionSuggestion mySuggestion = suggest.getSuggestion("mySuggestion");
        // Get options and iterate
        for (CompletionSuggestion.Entry.Option option : mySuggestion.getOptions()) {
            String text = option.getText().string();
            System.out.println(text);
        }
    } catch (IOException e) {
        throw new RuntimeException(e);
    }
}
```

## Hotel Search Autocomplete

The previous 'hotel' index didn't have a pinyin tokenizer configured. Since indexes can't be modified, we need to delete and recreate it.

```json
# Delete and Recreate
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

Modify the HotelDoc entity class to add the 'suggestion' field:

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
    // Ad
    private Boolean isAD;
    // Autocomplete
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
        // Assemble suggestion
        if(this.business.contains("/")){
            // Business has multiple values, needs splitting
            String[] arr = this.business.split("/");
            // Add elements
            this.suggestion = new ArrayList<>();
            this.suggestion.add(this.brand);
            Collections.addAll(this.suggestion, arr);
        }else {
            this.suggestion = Arrays.asList(this.brand, this.business);
        }
    }
}
```

Re-import data:

```java
@Test
public void testBulk() throws IOException {
    // Batch query data
    List<Hotel> hotelList = hotelService.list();

    // Create bulk request
    BulkRequest request = new BulkRequest();
    // Add batch requests
    for (Hotel hotel : hotelList) {
        // Convert document type
        HotelDoc hotelDoc = new HotelDoc(hotel);
        // Create new document request object
        request.add(new IndexRequest("hotel")
                .id(hotelDoc.getId().toString())
                .source(JSON.toJSONString(hotelDoc), XContentType.JSON)
        );
    }

    // Send bulk request
    client.bulk(request, RequestOptions.DEFAULT);
}
```

Query test:

```json
GET /hotel/_search
{
  "query": {
    "match_all": {}
  }
}
```

You should see the 'suggestion' field in the query result. Now, let's write the business logic.

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
