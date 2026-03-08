---
slug: 269
title: 'i18n Implementation in Decoupled Architectures'
# draft: true
author: yexca
date: '2026-03-08T18:21:05+09:00'
categories:
    - Tech Notes
tags:
    - i18n
---

{{< notice >}} This article was translated by gemini-3-flash-preview {{< /notice >}}

There are many ways to implement internationalization (i18n) today. The technology is mature, so it's all about choosing the right approach for your specific needs.

## Data Types

Data generally falls into two categories, each requiring a different handling strategy.

### Static Data

Static data includes things like countries, languages, currencies, and timezones. These rarely change and usually follow international standards.

For this type of data, just store it on the frontend. The backend database only needs to store the relevant standard codes (e.g., US, UK, JP).

When the frontend receives a code, it renders the label using an i18n library paired with local JSON language packs. For example:

`zh-CN.json`

```json
{
    "country":{
        "US": "美国",
        "UK": "英国"
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

This approach reduces database query overhead.

### Dynamic Data

Dynamic data refers to business content that changes, such as category names, descriptions, and article content.

Since you can't hardcode these in frontend JSON files, they must be stored and handled by the backend.

There are two mainstream solutions for this.

## Related Translation Tables

This is the most rigorous approach and offers the best scalability. It involves splitting basic entity info and multi-language info into separate tables.

Using a category table as an example, you would have one table for non-language data and another for multi-language fields.

Main table: `category`

```sql
CREATE TABLE category (
    category_id BIGINT NOT NULL AUTO_INCREMENT,
    status int NOT NULL,
    PRIMARY KEY (category_id)
)
```

Translation table: `category_i18n`

```sql
CREATE TABLE category_i18n (
    id BIGINT NOT NULL AUTO_INCREMENT,
    category_id BIGINT NOT NULL,
    language_code VARCHAR(10) NOT NULL COMMENT 'zh-CN, en-US',
    name VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    PRIMARY KEY (id),
    UNIQUE KEY idx_cat_lang (category_id, language_code)
)
```

The frontend includes a language code in the request, and the backend returns the data for that specific language.

## JSON Field Storage

For small to medium projects with moderate data volumes, you can use JSON fields. This requires MySQL 5.7+ and a modern framework like MyBatis-Plus.

The table structure would look like this:

```sql
CREATE TABLE category (
    category_id BIGINT NOT NULL AUTO_INCREMENT,
    name JSON NOT NULL COMMENT '{"zh-CN": "数据库", "en-US": "Database"}',
    description JSON NOT NULL,
    status int NOT NULL,
    PRIMARY KEY (category_id)
)
```

In a Spring entity, `name` and `description` can be directly mapped to a `Map<String, String>`.

Regarding data delivery, there are two common patterns: handling it on the backend or returning the raw JSON to the frontend.

### Language-Specific Interaction

The backend processes the multi-language data based on the request and returns only the data for the specific language. This minimizes network bandwidth and is suitable for large datasets.

### Full-Payload Interaction

The backend returns the entire JSON object to the frontend. This is suitable for smaller datasets and leverages the reactivity of frameworks like Vue to allow instant, refresh-free language switching.

In this scenario, you can write a utility function to handle the multi-language data. Example (Vue 3):

```vue
<template>
  <div class="category-selector">
    <div style="margin-bottom: 20px;">
      <button @click="currentLang = 'zh-CN'">Switch to Chinese</button>
      <button @click="currentLang = 'en-US'">Switch to English</button>
      <span> Current Language: {{ currentLang }}</span>
    </div>

    <label>Select Category:</label>
    
    <select v-model="selectedCategoryId">
      <option disabled value="">Please select</option>
      
      <option 
        v-for="item in categoryList" 
        :key="item.category_id" 
        :value="item.category_id"
      >
        {{ getI18nName(item.name) }}
      </option>
    </select>

    <div style="margin-top: 20px;">
      Selected Category ID: {{ selectedCategoryId }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// 1. Mock locale (In a real project, get this from vue-i18n or Pinia/Vuex)
const currentLang = ref('zh-CN');

// 2. Bound form value
const selectedCategoryId = ref('');

// 3. Mock full JSON category data from backend
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
    // Case: Admin only entered Chinese, no English
    name: { "zh-CN": "生鲜特产" } 
  },
  { 
    category_id: 4, 
    // Case: Edge case, no data entered
    name: {} 
  }
]);

// 4. [Core Logic] i18n Name Parser with Fallback
const getI18nName = (nameObj) => {
  // If field is null or not an object, return placeholder
  if (!nameObj || typeof nameObj !== 'object') {
    return 'Unnamed Category';
  }

  // Priority 1: Try current language
  const currentName = nameObj[currentLang.value];
  if (currentName) return currentName;

  // Priority 2: Fallback to Chinese (zh-CN)
  const fallbackName = nameObj['zh-CN'];
  if (fallbackName) return fallbackName;

  // Priority 3: Grab the first available value in the object
  const values = Object.values(nameObj);
  if (values.length > 0) return values[0];

  // Priority 4: Final fallback for empty objects
  return 'Unnamed Category';
};
</script>
```