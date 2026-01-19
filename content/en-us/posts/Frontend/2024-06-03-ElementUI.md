---
slug: 174
# layout: post
title: 'ElementUI'
author: yexca
date: 2024-06-03T18:04:58+08:00
# permalink: /archives/174
categories:
    - Tech Learning
tags:
    - Frontend Tech
    - ElementUI
---  

{{< notice >}} This article was translated by gemini-2.5-flash {{< /notice >}}

ElementUI, built by the Ele.me team, is a desktop UI component library for developers, designers, and product managers, powered by Vue 2.0.

Components are the building blocks of a webpage, like links, buttons, images, tables, forms, and pagination.

Vue2.x Official Site: [International](https://element.eleme.io/#/zh-CN) [Mainland China](https://element.eleme.cn/#/zh-CN)

Vue3.x Official Site: <https://element-plus.org/zh-CN/#/zh-CN>

## ElementUI Installation

Install the ElementUI library (in your current project directory) using this command:

```bash
npm install element-ui@2.15.3
```

Import the ElementUI component library:

```javascript
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

Vue.use(ElementUI);
```

## Getting Started

Create the `src/views/element/elementView.vue` component. Copy code from the official docs, like this:

```vue
<template>
    <div>
        <!-- 按钮 -->
        <el-row>
            <el-button>默认按钮</el-button>
            <el-button type="primary">主要按钮</el-button>
            <el-button type="success">成功按钮</el-button>
            <el-button type="info">信息按钮</el-button>
            <el-button type="warning">警告按钮</el-button>
            <el-button type="danger">危险按钮</el-button>
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

Import the component in App.vue:

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

> The same applies to other components.

## Importing Axios

Install:

```bash
npm install axios
```

Import:

```javascript
import axios from 'axios';
```

## Vue Router

Vue Router is Vue's official router. It consists of:

* VueRouter: The router class. It dynamically renders the correct component in the router view based on the route.
* `<router-link>`: A link component that the browser renders as an `<a>` tag.
* `<router-view>`: The dynamic view component that displays the component matching the current route.

### Vue Router Installation

Command:

```bash
npm install vue-router@3.5.1
```

### Defining Routes

In `src/router/index.js`:

```javascript
import HomeView from '../views/HomeView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView // Imported above
  },
  {
    path: '/emp',
    name: 'emp',
      // Direct import method
    component: () => import('../views/tlias/empView.vue')
  },
  {
    path: '/redirect',
      // Redirect
    redirect: '/emp'
  }
]
```

### Usage

Where you need to use it:

```html
<router-link to="/dept">部门管理</router-link>
```

In App.vue:

```vue
<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>
```

In main.js:

```javascript
import router from './router'

new Vue({
  router, // Use the router
  render: h => h(App)
}).$mount('#app')
```

## Build and Deploy

Command:

```bash
npm run build
```

After running the command, a `dist` directory will be generated. Just deploy its contents.
