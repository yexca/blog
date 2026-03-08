---
slug: 269
title: '前后端分离下的国际化实现'
# draft: true
author: yexca
date: '2026-03-08T18:21:05+09:00'
categories:
    - 技术学习
tags:
    - i18n
---

当前国际化的实现方法繁多，各项技术都相当成熟，根据需求选择合适的国际化实现即可

## 数据类型

一般数据类型分为两种，不同的类型适合的处理方法不同

### 静态数据

像是国家、语言、货币、时区等几乎不会改变，有相关国际标准的属于静态数据

对于这种数据直接存在前端即可，后端数据库中只需要存储相关代码即可，比如标准国家代码 (US, UK, JP)

然后前端拿到代码后，通过 i18n 配合本地 JSON 语言包进行渲染即可，例如

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

这样做的好处是可以减轻数据库查询压力

### 动态数据

对于自己的业务内容中会改变的数据，像是分类名称、简介、文章内容等，这些属于动态业务数据

这类数据不可能在前端 json 文件提前写死翻译，所以必须在后端进行国际化存储处理

对于这类数据当前主流有两种解决方案

## 关联翻译表

这种方式最严谨，拓展性最好，将实体基本信息和多语言信息拆分

以分类表为例，准备两个表，一个存非语言信息，一个存多语言字段

主表: `category`

```sql
CREATE TABLE category (
    category_id BIGINT NOT NULL AUTO_INCREMENT,
    status int NOT NULL,
    PRIMARY KEY (category_id)
)
```

翻译表: `category_i18n`

```sql
CREATE TABLE category_i18n (
    id BIGINT NOT NULL AUTO_INCREMENT,
    category_id BIGINT NOT NULL,
    language_code VARCHAR(10) NOT NULL COMMENT 'zh-CN, en-US',
    name VRCHAR(255) NOT NULL,
    description VARCHAR(255),
    PRIMARY KEY (id),
    UNIQUE KEY idx_cat_lang (category_id, language_code)
)
```

前端请求的时候带上语言代码，后端返回对应语言的数据即可

## JSON 字段存储

对于中小型项目，数据量不是很大的话，可以使用 JSON 字段存储方式，这种方式需要 MySQL 5.7 以上，同时使用像是 MyBatis-Plus 等现代框架

这样建表语句为

```sql
CREATE TABLE category (
    category_id BIGINT NOT NULL AUTO_INCREMENT,
    name JSON NOT NULL COMMENT '{"zh-CN": "数据库", "en-US": "Database"}',
    description JSON NOT NULL,
    status int NOT NULL,
    PRIMARY KEY (category_id)
)
```

如果是在 Spring 实体类的话，可以直接将 `name` 和 `description` 映射为 `Map<String, String>`

不过关于返回数据的话，有两种方式，在后端处理或者将字符串直接返回前端

### 对应语言交互

对于前端请求的数据，在后端进行多语言处理，这样只会给前端返回对应语言的数据，网络带宽压力小，适合数据量大的情况

### 全量语言交互

这种直接将所有数据返回给前端，适合数据量小的情况，同时可以充分利用像是 vue 的响应式优势，从而实现无刷新实时切换

对于这种情况，可以写一个函数用于处理多语言数据，例如 (Vue3)

```vue
<template>
  <div class="category-selector">
    <div style="margin-bottom: 20px;">
      <button @click="currentLang = 'zh-CN'">切换中文</button>
      <button @click="currentLang = 'en-US'">Switch to English</button>
      <span> 当前语言: {{ currentLang }}</span>
    </div>

    <label>请选择数据分类：</label>
    
    <select v-model="selectedCategoryId">
      <option disabled value="">请选择 / Please select</option>
      
      <option 
        v-for="item in categoryList" 
        :key="item.category_id" 
        :value="item.category_id"
      >
        {{ getI18nName(item.name) }}
      </option>
    </select>

    <div style="margin-top: 20px;">
      你当前选中的分类 ID 是: {{ selectedCategoryId }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// 1. 模拟当前的语言环境（实际项目中应从 vue-i18n 或 Pinia/Vuex 中获取）
const currentLang = ref('zh-CN');

// 2. 表单绑定的选中值
const selectedCategoryId = ref('');

// 3. 模拟从后端获取到的全量 JSON 分类数据
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
    // 模拟管理员偷懒，只录入了中文，没录入英文的情况
    name: { "zh-CN": "生鲜特产" } 
  },
  { 
    category_id: 4, 
    // 极端异常数据：啥都没录
    name: {} 
  }
]);

// 4. 【核心逻辑】多语言名称解析与兜底函数
const getI18nName = (nameObj) => {
  // 如果字段为空或不是对象，直接返回占位符
  if (!nameObj || typeof nameObj !== 'object') {
    return '未命名分类';
  }

  // 优先级 1: 尝试获取当前语言的值
  const currentName = nameObj[currentLang.value];
  if (currentName) return currentName;

  // 优先级 2: 如果当前语言没有，强制使用中文（zh-CN）兜底
  const fallbackName = nameObj['zh-CN'];
  if (fallbackName) return fallbackName;

  // 优先级 3: 连中文都没有，随便抓取对象里的第一个值显示
  const values = Object.values(nameObj);
  if (values.length > 0) return values[0];

  // 优先级 4: 极端情况，对象是空的
  return '未命名分类';
};
</script>
```
