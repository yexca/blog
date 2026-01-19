---
slug: 255
title: 'Vue3 親子コンポーネント間のデータ受け渡し'
# draft: true
author: yexca
date: '2025-09-21T19:17:40+09:00'
categories:
    - 技術学習
tags:
    - フロントエンド技術
    - Vue
---

{{< notice >}} この記事は gemini-2.5-flash によって翻訳されました {{< /notice >}}

255本目の記事だね。最近特にアイデアもないし、ついでにVueのメモでも書いちゃおうか。

## 子コンポーネントの導入

子コンポーネントの定義

```vue
<script setup>
</script>

<template>
    <div>
        this is a son component
    </div>
</template>
```

親コンポーネントでの使用

```vue
<script setup>
    import SonCom from '@/components/son-com.vue'
</script>

<template>
    <h2>this is a father component</h2>
    <!-- 直接使用 -->
    <SonCom></SonCom>
</template>
```

## 親コンポーネントから子コンポーネントへのデータ受け渡し

親コンポーネントでプロパティを通じて値を渡す

```vue
<script setup>
    import SonCom from '@/components/son-com.vue'
</script>

<template>
    <h2>this is a father component</h2>
    <!-- 属性传值 -->
    <SonCom msg="a msg from father"></SonCom>
</template>
```

子コンポーネントで値を受け取る

```vue
<script setup>
    // setup内だから、コンパイラマクロ関数を使って受け取る必要があるよ
    const props = defineProps({
        msg: String
    })
    // スクリプト内ではオブジェクトアクセス方式でアクセスする
    console.log(props.msg)
</script>

<template>
    <div>
        this is a son component
    </div>
    <div>
        <!-- でも使うときは変数名を直接使うだけだよ -->
        {{ msg }}
    </div>
</template>
```

---

もちろんリアクティブなデータも渡せるよ。親コンポーネントではこんな感じ。

```vue
<script setup>
    import {ref} from 'vue'
    import SonCom from '@/components/son-com.vue'

    const count = ref(100)

    const addCount = () => {
        count.value++
    }
</script>

<template>
    <h2>this is a father component</h2>
    <button @click="addCount">add count</button>
    <br/>
    <!-- 属性传值 -->
    <SonCom msg="a msg from father" :count="count"></SonCom>
</template>
```

子コンポーネントでの受け取り方

```vue
<script setup>
    // setup内だから、コンパイラマクロ関数を使って受け取る必要があるよ
    const props = defineProps({
        msg: String,
        count: Number
    })
    // スクリプト内ではオブジェクトアクセス方式でアクセスする
    console.log(props.msg)
</script>

<template>
    <div>
        this is a son component
    </div>
    <div>
        <!-- でも使うときは変数名を直接使うだけだよ -->
        {{ msg }} - {{ count }}
    </div>
</template>
```

> でも本質的には、Option APIと同じでpropsで受け取るってことだね。

## 子コンポーネントから親コンポーネントへのデータ受け渡し

子コンポーネントでイベントを登録する必要があるよ

```vue
<script setup>
    // setup内だから、コンパイラマクロ関数を使って受け取る必要があるよ
    const props = defineProps({
        msg: String,
        count: Number
    })
    // スクリプト内ではオブジェクトアクセス方式でアクセスする
    console.log(props.msg)

    // イベントを定義して、親コンポーネントにデータを渡す
    const emit = defineEmits(['minusCount'])
    const minusCountFun = () => {
        emit('minusCount', 5)
    }
</script>

<template>
    <div>
        this is a son component
    </div>
    <div>
        <!-- でも使うときは変数名を直接使うだけだよ -->
        {{ msg }} - {{ count }}
    </div>
    <div>
        <button @click="minusCountFun">minus count</button>
    </div>
</template>
```

そして親コンポーネントでイベントを受け取る

```vue
<script setup>
    import {ref} from 'vue'
    import SonCom from '@/components/son-com.vue'

    const count = ref(100)

    const addCount = () => {
        count.value++
    }

    // パラメータを受け取る
    const minusCountFun = (c) => {
        count.value -= c
    }
</script>

<template>
    <h2>this is a father component</h2>
    <button @click="addCount">add count</button>
    <br/><hr/>
    <!-- 属性传值，事件名要和子组件一样 -->
    <SonCom msg="a msg from father" :count="count" @minusCount="minusCountFun"></SonCom>
</template>
```
