---
slug: 174
# layout: post
title: 'ElementUI'
author: yexca
date: 2024-06-03T18:04:58+08:00
# permalink: /archives/174
categories:
    - 技术学习
tags:
    - 前端技术
    - ElementUI
---  

ElementUI 是饿了么团队开发的，一套为开发者、设计师和产品经理准备的基于 Vue2.0 的桌面端组件库

组件是组成网页的部件，例如超链接、按钮、图片、表格、表单、分页条等

Vue2.x 官网：[国际](https://element.eleme.io/#/zh-CN) [中国大陆](https://element.eleme.cn/#/zh-CN)

Vue3.x 官网：<https://element-plus.org/zh-CN/#/zh-CN>

## ElementUI 安装

安装 ElementUI 库 (在当前工程的目录下)，命令

```bash
npm install element-ui@2.15.3
```

引入 ElementUI 组件库

```javascript
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

Vue.use(ElementUI);
```

## 入门使用

创建 `src/views/element/elementView.vue` 组件，从官网复制代码，如

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

在 App.vue 导入组件

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

> 针对其他组件亦是如此

## 导入 Axios

安装

```bash
npm install axios
```

导入

```javascript
import axios from 'axios';
```

## Vue 路由

Vue Router 是 Vue 的官方路由，组成：

* VueRouter：路由器类，根据路由请求在路由视图中动态渲染选中的组件
* `<router-link>`：请求链接组件，浏览器会解析成链接标签
* `<router-view>`：动态视图组件，用于渲染展示与路由对应的组件

### Axios 安装

命令

```bash
npm install vue-router@3.5.1
```

### 定义路由

在 `src/router/index.js`

```javascript
import HomeView from '../views/HomeView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView // 上方导入方式
  },
  {
    path: '/emp',
    name: 'emp',
      // 直接导入方式
    component: () => import('../views/tlias/empView.vue')
  },
  {
    path: '/redirect',
      // 重定向
    redirect: '/emp'
  }
]
```

### 使用

在需要使用的地方

```html
<router-link to="/dept">部门管理</router-link>
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

命令

```bash
npm run build
```

命令执行完成后会生成 dist 目录，将该目录文件部署即可
