---
slug: 269
title: 'フロントエンド・バックエンド分離での国際化（i18n）の実装'
# draft: true
author: yexca
date: '2026-03-08T18:21:05+09:00'
categories:
    - 技術学習
tags:
    - i18n
---

{{< notice >}} この記事は gemini-3-flash-preview によって翻訳されました {{< /notice >}}

最近は国際化（i18n）のやり方もたくさんあって、どの技術もかなり成熟してるよね。プロジェクトのニーズに合わせて、適切な実装方法を選べば大丈夫だよ。

## データタイプ

一般的にデータは2つのタイプに分けられるんだ。タイプによって、おすすめの処理方法が違うよ。

### 静的データ

国、言語、通貨、タイムゾーンみたいに、ほとんど変わることがなくて、国際標準があるものは「静的データ」に分類される。

こういうデータは、フロントエンド側に持たせちゃうのが一番いい。バックエンドのデータベースには、標準の国コード（US, UK, JPなど）だけを保存しておけばOK。

フロント側でコードを受け取ったら、i18nライブラリとローカルのJSON言語パックを使ってレンダリングするんだ。例えばこんな感じ。

`ja-JP.json`

```json
{
    "country":{
        "US": "アメリカ",
        "UK": "イギリス"
    }
}
```

`en-US.json`

```json
{
    "country":{
        "US": "United States",
        "UK": "United Kingdom"
    }
}
```

このやり方のメリットは、データベースのクエリの負荷を減らせることだね。

### 動的データ

自分のビジネスコンテンツの中で変わっていくデータ、例えばカテゴリー名、紹介文、記事の内容などは「動的データ」になる。

こういうデータはフロントエンドのJSONファイルにあらかじめ書いておくわけにいかないから、バックエンド側で国際化を考慮した保存処理が必要になるんだ。

動的データについては、今のところ主に2つの解決策があるよ。

## 翻訳テーブルを分ける

この方法は一番厳格で、拡張性も高い。エンティティの基本情報と、多言語情報を切り分けるやり方だね。

カテゴリーテーブルを例にすると、非言語情報を保存するテーブルと、多言語フィールドを保存するテーブルの2つを用意する。

メインテーブル: `category`

```sql
CREATE TABLE category (
    category_id BIGINT NOT NULL AUTO_INCREMENT,
    status int NOT NULL,
    PRIMARY KEY (category_id)
)
```

翻訳テーブル: `category_i18n`

```sql
CREATE TABLE category_i18n (
    id BIGINT NOT NULL AUTO_INCREMENT,
    category_id BIGINT NOT NULL,
    language_code VARCHAR(10) NOT NULL COMMENT 'zh-CN, en-US, ja-JP',
    name VRCHAR(255) NOT NULL,
    description VARCHAR(255),
    PRIMARY KEY (id),
    UNIQUE KEY idx_cat_lang (category_id, language_code)
)
```

フロントエンドがリクエストを送るときに言語コードを添えて、バックエンドがそれに対応する言語のデータを返せばOK。

## JSONフィールドでの保存

中・小規模なプロジェクトで、データ量があまり多くないなら、JSONフィールドに保存する方法も使えるよ。この場合はMySQL 5.7以上が必要で、MyBatis-Plusみたいなモダンなフレームワークを使うのがおすすめ。

テーブル作成のSQLはこんな感じになる。

```sql
CREATE TABLE category (
    category_id BIGINT NOT NULL AUTO_INCREMENT,
    name JSON NOT NULL COMMENT '{"zh-CN": "数据库", "en-US": "Database", "ja-JP": "データベース"}',
    description JSON NOT NULL,
    status int NOT NULL,
    PRIMARY KEY (category_id)
)
```

Springのエンティティクラスなら、`name` や `description` を直接 `Map<String, String>` にマッピングできるよ。

データの返し方については、バックエンドで処理するか、文字列をそのままフロントエンドに返すかの2パターンがある。

### リクエストされた言語のみ返す

フロントエンドからのリクエストに合わせて、バックエンド側で多言語処理を行う。フロントには指定された言語のデータだけを返すから、通信量が少なくて済むし、データ量が多い場合に適してる。

### 全言語データをまとめて返す

すべての言語データをフロントエンドにまるごと返しちゃう方法。データ量が少ない場合に適していて、Vueのリアクティブな特性をフルに活用できるから、画面更新なしでリアルタイムに言語を切り替えられるのが強みだね。

この場合、多言語データを処理するための関数を書いておくと便利だよ。例えばVue3ならこんな感じ。

```vue
<template>
  <div class="category-selector">
    <div style="margin-bottom: 20px;">
      <button @click="currentLang = 'zh-CN'">中国語に切り替え</button>
      <button @click="currentLang = 'en-US'">Switch to English</button>
      <span> 現在の言語: {{ currentLang }}</span>
    </div>

    <label>カテゴリーを選択してください：</label>
    
    <select v-model="selectedCategoryId">
      <option disabled value="">選択してください / Please select</option>
      
      <option 
        v-for="item in categoryList" 
        :key="item.category_id" 
        :value="item.category_id"
      >
        {{ getI18nName(item.name) }}
      </option>
    </select>

    <div style="margin-top: 20px;">
      現在選択されているカテゴリーID: {{ selectedCategoryId }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// 1. 現在の言語環境のシミュレート（実際は vue-i18n や Pinia/Vuex から取得するよ）
const currentLang = ref('zh-CN');

// 2. フォームにバインドする選択値
const selectedCategoryId = ref('');

// 3. バックエンドから取得した全言語入りのJSONカテゴリーデータのシミュレーション
const categoryList = ref([
  { 
    category_id: 1, 
    name: { "zh-CN": "数码产品", "en-US": "Digital Products" } 
  },
  { 
    category_id: 2, 
    name: { "zh-CN": "男装", "en-US": "Men's Clothing" } 
  },
  { 
    category_id: 3, 
    // 管理者が入力を忘れて、中国語しかない場合をシミュレート
    name: { "zh-CN": "生鲜特产" } 
  },
  { 
    category_id: 4, 
    // データが何もない極端な異常ケース
    name: {} 
  }
]);

// 4. 【コアロジック】多言語名称の解析とフォールバック関数
const getI18nName = (nameObj) => {
  // フィールドが空だったりオブジェクトじゃなかったら、プレースホルダーを返す
  if (!nameObj || typeof nameObj !== 'object') {
    return '未命名カテゴリー';
  }

  // 優先順位1: 現在の言語の設定があるか試す
  const currentName = nameObj[currentLang.value];
  if (currentName) return currentName;

  // 優先順位2: 現在の言語がない場合、強制的に中国語（zh-CN）をフォールバックとして使う
  const fallbackName = nameObj['zh-CN'];
  if (fallbackName) return fallbackName;

  // 優先順位3: 中国語すらない場合、オブジェクト内の最初の値を適当に表示する
  const values = Object.values(nameObj);
  if (values.length > 0) return values[0];

  // 優先順位4: 完全に空のオブジェクトだった場合
  return '未命名カテゴリー';
};
</script>
```