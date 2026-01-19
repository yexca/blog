---
slug: 174
# layout: post
title: 'ElementUI'
author: yexca
date: 2024-06-03T18:04:58+08:00
# permalink: /archives/174
categories:
    - 技術學習
tags:
    - 前端技術
    - ElementUI
---

{{< notice >}} 本文由 gemini-2.5-flash 翻譯 {{< /notice >}}

ElementUI 是餓了麼團隊開發的，一套為開發者、設計師和產品經理準備的基於 Vue2.0 的桌面端元件函式庫

元件是組成網頁的部分，例如超連結、按鈕、圖片、表格、表單、分頁條等

Vue2.x 官方網站：[國際](https://element.eleme.io/#/zh-CN) [中國大陸](https://element.eleme.cn/#/zh-CN)

Vue3.x 官方網站：<https://element-plus.org/zh-CN/#/zh-CN>

## ElementUI 安裝

安裝 ElementUI 函式庫 (在目前的專案目錄下)，指令

```bash
npm install element-ui@2.15.3
```

導入 ElementUI 元件函式庫

```javascript
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

Vue.use(ElementUI);
```

## 入門使用

建立 `src/views/element/elementView.vue` 元件，從官方網站複製程式碼，如下

```vue
<template>
    <div>
        <!-- 按鈕 -->
        <el-row>
            <el-button>預設按鈕</el-button>
            <el-button type="primary">主要按鈕</el-button>
            <el-button type="success">成功按鈕</el-button>
            <el-button type="info">資訊按鈕</el-button>
            <el-button type="warning">警告按鈕</el-button>
            <el-button type="danger">危險按鈕</el-button>
        </el-row>
    </div>
</template>

<script>
export default {
    
}
</script>

<style>

</style>
```

在 App.vue 導入元件

```vue
<template>
  <div id="app">
    <element-view></element-view>
  </div>
</template>

<script>
import elementView from './views/element/elementView.vue'
export default {
  components: { elementView },
}
</script>

<style></style>
```

> 對於其他元件也是如此

## 導入 Axios

安裝

```bash
npm install axios
```

導入

```javascript
import axios from 'axios';
```

## Vue 路由

Vue Router 是 Vue 的官方路由，組成：

*   VueRouter：路由器類別，根據路由請求在路由檢視中動態渲染選定的元件
*   `<router-link>`：請求連結元件，瀏覽器會解析成連結標籤
*   `<router-view>`：動態檢視元件，用於渲染顯示與路由對應的元件

### Axios 安裝

指令

```bash
npm install vue-router@3.5.1
```

### 定義路由

在 `src/router/index.js`

```javascript
import HomeView from '../views/HomeView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView // 上方導入方式
  },
  {
    path: '/emp',
    name: 'emp',
      // 直接導入方式
    component: () => import('../views/tlias/empView.vue')
  },
  {
    path: '/redirect',
      // 重新導向
    redirect: '/emp'
  }
]
```

### 使用

在需要使用的地方

```html
<router-link to="/dept">部門管理</router-link>
```

在 App.vue

```vue
<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>
```

在 main.js

```javascript
import router from './router'

new Vue({
  router, // 使用路由
  render: h => h(App)
}).$mount('#app')
```

## 打包部署

指令

```bash
npm run build
```

指令執行完成後會產生 dist 目錄，將該目錄的檔案部署即可
