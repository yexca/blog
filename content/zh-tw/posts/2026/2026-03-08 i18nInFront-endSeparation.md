---
slug: 269
title: '前後端分離下的國際化實作'
# draft: true
author: yexca
date: '2026-03-08T18:21:05+09:00'
categories:
    - 技術學習
tags:
    - i18n
---

{{< notice >}} 本文由 gemini-3-flash-preview 翻譯 {{< /notice >}}

當前國際化的實作方法繁多，各項技術都相當成熟，根據需求選擇合適的國際化實作即可。

## 資料類型

一般資料類型分為兩種，不同的類型適合的處理方法不同。

### 靜態資料

像是國家、語言、貨幣、時區等幾乎不會改變，有相關國際標準的屬於靜態資料。

對於這種資料直接存在前端即可，後端資料庫中只需要儲存相關代碼（Code）即可，比如標準國家代碼 (US, UK, JP)。

然後前端拿到代碼後，透過 i18n 配合在地化 JSON 語言包進行渲染即可，例如：

`zh-TW.json`

```json
{
    "country":{
        "US": "美國",
        "UK": "英國"
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

這樣做的好處是可以減輕資料庫查詢壓力。

### 動態資料

對於自己的業務內容中會改變的資料，像是分類名稱、簡介、文章內容等，這些屬於動態業務資料。

這類資料不可能在前端 JSON 檔案提前寫死翻譯，所以必須在後端進行國際化儲存處理。

對於這類資料，當前主流有兩種解決方案。

## 關聯翻譯表

這種方式最嚴謹，擴充性最好，將實體基本資訊和多語言資訊拆分。

以分類表為例，準備兩個表，一個存非語言資訊，一個存多語言欄位。

主表：`category`

```sql
CREATE TABLE category (
    category_id BIGINT NOT NULL AUTO_INCREMENT,
    status int NOT NULL,
    PRIMARY KEY (category_id)
)
```

翻譯表：`category_i18n`

```sql
CREATE TABLE category_i18n (
    id BIGINT NOT NULL AUTO_INCREMENT,
    category_id BIGINT NOT NULL,
    language_code VARCHAR(10) NOT NULL COMMENT 'zh-TW, en-US',
    name VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    PRIMARY KEY (id),
    UNIQUE KEY idx_cat_lang (category_id, language_code)
)
```

前端請求的時候帶上語言代碼，後端返回對應語言的資料即可。

## JSON 欄位儲存

對於中小型專案，資料量不是很大的話，可以使用 JSON 欄位儲存方式，這種方式需要 MySQL 5.7 以上，同時使用像是 MyBatis-Plus 等現代框架。

建表語句如下：

```sql
CREATE TABLE category (
    category_id BIGINT NOT NULL AUTO_INCREMENT,
    name JSON NOT NULL COMMENT '{"zh-TW": "資料庫", "en-US": "Database"}',
    description JSON NOT NULL,
    status int NOT NULL,
    PRIMARY KEY (category_id)
)
```

如果是 Spring 實體類的話，可以直接將 `name` 和 `description` 映射為 `Map<String, String>`。

關於返回資料，有兩種方式：在後端處理，或者將字串直接返回前端。

### 對應語言互動

對於前端請求的資料，在後端進行多語言處理，這樣只會給前端返回對應語言的資料，網路頻寬壓力小，適合資料量大的情況。

### 全量語言互動

這種方式直接將所有語言資料返回給前端，適合資料量小的情況，同時可以充分利用像是 Vue 的響應式優勢，從而實現無刷新即時切換。

對於這種情況，可以寫一個函數用於處理多語言資料，例如 (Vue3)：

```vue
<template>
  <div class="category-selector">
    <div style="margin-bottom: 20px;">
      <button @click="currentLang = 'zh-TW'">切換中文</button>
      <button @click="currentLang = 'en-US'">Switch to English</button>
      <span> 當前語言: {{ currentLang }}</span>
    </div>

    <label>請選擇資料分類：</label>
    
    <select v-model="selectedCategoryId">
      <option disabled value="">請選擇 / Please select</option>
      
      <option 
        v-for="item in categoryList" 
        :key="item.category_id" 
        :value="item.category_id"
      >
        {{ getI18nName(item.name) }}
      </option>
    </select>

    <div style="margin-top: 20px;">
      您當前選中的分類 ID 是: {{ selectedCategoryId }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// 1. 模擬當前的語言環境（實際專案中應從 vue-i18n 或 Pinia/Vuex 中獲取）
const currentLang = ref('zh-TW');

// 2. 表單綁定的選中值
const selectedCategoryId = ref('');

// 3. 模擬從後端獲取到的全量 JSON 分類資料
const categoryList = ref([
  { 
    category_id: 1, 
    name: { "zh-TW": "數位產品", "en-US": "Digital Products" } 
  },
  { 
    category_id: 2, 
    name: { "zh-TW": "男裝", "en-US": "Men's Clothing" } 
  },
  { 
    category_id: 3, 
    // 模擬管理員偷懶，只輸入了中文，沒輸入英文的情況
    name: { "zh-TW": "生鮮特產" } 
  },
  { 
    category_id: 4, 
    // 極端異常資料：什麼都沒填
    name: {} 
  }
]);

// 4. 【核心邏輯】多語言名稱解析與兜底（Fallback）函數
const getI18nName = (nameObj) => {
  // 如果欄位為空或不是物件，直接返回佔位符
  if (!nameObj || typeof nameObj !== 'object') {
    return '未命名分類';
  }

  // 優先級 1: 嘗試獲取當前語言的值
  const currentName = nameObj[currentLang.value];
  if (currentName) return currentName;

  // 優先級 2: 如果當前語言沒有，強制使用繁體中文（zh-TW）兜底
  const fallbackName = nameObj['zh-TW'];
  if (fallbackName) return fallbackName;

  // 優先級 3: 連中文都沒有，隨便抓取物件裡的第一個值顯示
  const values = Object.values(nameObj);
  if (values.length > 0) return values[0];

  // 優先級 4: 極端情況，物件是空的
  return '未命名分類';
};
</script>
```