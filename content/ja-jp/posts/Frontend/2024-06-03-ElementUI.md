---
slug: 174
# layout: post
title: 'ElementUI'
author: yexca
date: 2024-06-03T18:04:58+08:00
# permalink: /archives/174
categories:
    - 技術学習
tags:
    - フロントエンド技術
    - ElementUI
---

{{< notice >}} この記事は gemini-2.5-flash によって翻訳されました {{< /notice >}}

ElementUIは、餓了么（Ele.me）チームが開発した、開発者、デザイナー、プロダクトマネージャー向けのVue2.0ベースのデスクトップUIコンポーネントライブラリだよ。

コンポーネントってのは、ハイパーリンク、ボタン、画像、テーブル、フォーム、ページネーションバーみたいに、ウェブページを構成するパーツのことね。

Vue2.x 公式サイト：[国際版](https://element.eleme.io/#/zh-CN) [中国大陸版](https://element.eleme.cn/#/zh-CN)

Vue3.x 公式サイト：<https://element-plus.org/zh-CN/#/zh-CN>

## ElementUIのインストール

ElementUIライブラリをインストールするよ（現在のプロジェクトディレクトリで）。コマンドはこれ。

```bash
npm install element-ui@2.15.3
```

ElementUIコンポーネントライブラリの読み込み

```javascript
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

Vue.use(ElementUI);
```

## 入門的な使い方

`src/views/element/elementView.vue`コンポーネントを作成して、公式サイトからコードをコピーする感じね。例えばこんな風に。

```vue
<template>
    <div>
        <!-- ボタン -->
        <el-row>
            <el-button>デフォルトボタン</el-button>
            <el-button type="primary">主要ボタン</el-button>
            <el-button type="success">成功ボタン</el-button>
            <el-button type="info">情報ボタン</el-button>
            <el-button type="warning">警告ボタン</el-button>
            <el-button type="danger">危険ボタン</el-button>
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

App.vueでコンポーネントをインポート

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

> 他のコンポーネントについても、こんな感じだよ。

## Axiosのインポート

インストール

```bash
npm install axios
```

インポート

```javascript
import axios from 'axios';
```

## Vue ルーティング

Vue RouterはVueの公式ルーティングだよ。構成要素はこれね：

*   VueRouter：ルータークラスで、ルーティングリクエストに基づいてルーティングビューに選択されたコンポーネントを動的にレンダリングするやつ。
*   `<router-link>`：リクエストリンクコンポーネントで、ブラウザがリンクタグとして解析するよ。
*   `<router-view>`：動的ビューコンポーネントで、ルーティングに対応するコンポーネントを表示するために使うんだ。

### Axiosのインストール

コマンド

```bash
npm install vue-router@3.5.1
```

### ルーティングの定義

`src/router/index.js`で

```javascript
import HomeView from '../views/HomeView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView // 上でのインポート方法
  },
  {
    path: '/emp',
    name: 'emp',
      // 直接インポートする方法
    component: () => import('../views/tlias/empView.vue')
  },
  {
    path: '/redirect',
      // リダイレクト
    redirect: '/emp'
  }
]
```

### 使い方

使いたい場所で

```html
<router-link to="/dept">部署管理</router-link>
```

App.vueで

```vue
<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>
```

main.jsで

```javascript
import router from './router'

new Vue({
  router, // ルーティングを使う
  render: h => h(App)
}).$mount('#app')
```

## ビルドとデプロイ

コマンド

```bash
npm run build
```

コマンド実行が終わったらdistディレクトリが生成されるから、そのディレクトリのファイルをデプロイすればOKだよ。
