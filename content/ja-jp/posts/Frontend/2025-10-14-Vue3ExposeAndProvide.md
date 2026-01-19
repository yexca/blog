---
slug: 259
title: 'Vue 3: コンポーネントの取得と階層を跨いだデータの受け渡し'
# draft: true
author: yexca
date: '2025-10-14T20:58:25+09:00'
categories:
    - 技術学習
tags:
    - フロントエンド技術
    - Vue
---

{{< notice >}} この記事は gemini-2.5-flash によって翻訳されました {{< /notice >}}

## 要素を取得する

refオブジェクトを定義して要素を取得するんだ。

```vue
<script setup>
import { onMounted, ref } from 'vue'

// refオブジェクトを定義する
const inp = ref(null)

const clickFun = () => {
    inp.value.focus()
}
</script>

<template>
    <div>
        <!-- ref属性でバインド -->
        <input ref="inp" type="text"></input>
        <button @click="clickFun">focus on input</button>
    </div>
</template>
```

もちろん、コンポーネントがマウントされてからじゃないと取得できないから、ページに入ったらすぐに使いたい場合は `onMounted()` 関数を使う必要があるよ。

```vue
<script setup>
import { onMounted, ref } from 'vue'

// refオブジェクトを定義する
const inp = ref(null)

// ページに入ったらすぐに実行
onMounted(() => {
    inp.value.focus()
})
</script>

<template>
    <div>
        <!-- ref属性でバインド -->
        <input ref="inp" type="text"></input>
</template>
```

## 子コンポーネントを取得する

上と似てるけど、子コンポーネントのプロパティやメソッドを取得するには公開してあげる必要があるんだ。

子コンポーネントで定義して公開を選択。

```vue
<script setup>
const count = 255
const hiFun = () => {
    console.log('hi from son component')
}

// 親コンポーネントに公開
defineExpose({
    count,
    hiFun
})
</script>

<template>
    <div>
        this is a son component
    </div>
</template>
```

親コンポーネントで取得して使うよ。

```vue
<script setup>
import { onMounted, ref } from 'vue'
import sonComExp from './components/son-com-exp.vue'

const sonCom = ref(null)
onMounted(() => {
    // データにアクセス
    console.log(sonCom.value.count)
    // 関数を呼び出す
    sonCom.value.hiFun()
})
</script>

<template>
    <sonComExp ref="sonCom"></sonComExp>
</template>
```

## 階層を跨いでデータを渡す

`provide()` 関数と `inject()` 関数を使えば、階層を跨いでデータを渡せるんだ。

トップレベルで。

```vue
<script setup>
import { ref, provide } from 'vue';
import centerCom from './components/center-com.vue';

// データを渡す
provide('count', 20)
// リアクティブなデータを渡す
const total = ref(100)
provide('total', total)

const clickFn = () => {
    total.value++
}
</script>

<template>
    <div>Top component</div>
    <button @click="clickFn">change total</button>
    <centerCom></centerCom>
</template>
```

中間層。

```vue
<script setup>
import bottomCom from './bottom-com.vue';
</script>

<template>
    <div>this is center component</div>
    <bottomCom></bottomCom>
</template>
```

最下層。

```vue
<script setup>
import { inject } from 'vue';
// データを取得
const count = inject('count')
const total = inject('total')
</script>

<template>
    <div>this is bottom component</div>
    <div>count from top: {{ count }}</div>
    <div>total from top: {{ total }}</div>
</template>
```

## 階層を跨いで関数を渡す

もちろん、関数も渡せるよ。そうすれば、最下層のコンポーネントからトップレベルのコンポーネントのデータを操作できるようになるんだ。

トップレベルのコンポーネントで関数を渡す。

```vue
<script setup>
import { ref, provide } from 'vue';
import centerCom from './components/center-com.vue';

// データを渡す
provide('count', 20)

// リアクティブなデータを渡す
const total = ref(100)
provide('total', total)

const clickFn = () => {
    total.value++
}

// 関数を渡す
provide('changeTotal', (newTotal) => {
    total.value = newTotal
})
</script>

<template>
    <div>Top component</div>
    <button @click="clickFn">change total</button>
    <centerCom></centerCom>
</template>
```

最下層のコンポーネントで関数を受け取る。

```vue
<script setup>
import { inject } from 'vue';

// データを取得
const count = inject('count')
const total = inject('total')

// 関数を取得
const changeTotal = inject('changeTotal')
const clickFn = () => {
    changeTotal(233)
}
</script>

<template>
    <div>this is bottom component</div>
    <div>count from top: {{ count }}</div>
    <div>total from top: {{ total }}</div>
    <button @click="clickFn">change total from bottom</button>
</template>
```
