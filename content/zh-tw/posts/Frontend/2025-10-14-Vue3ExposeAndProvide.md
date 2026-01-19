---
slug: 259
title: 'vue3 取得元件與跨層傳遞'
# draft: true
author: yexca
date: '2025-10-14T20:58:25+09:00'
categories:
    - 技術學習
tags:
    - 前端技術
    - Vue
---

{{< notice >}} 本文由 gemini-2.5-flash 翻譯 {{< /notice >}}

## 取得元素

透過定義一個 ref 物件來取得元素

```vue
<script setup>
import { onMounted, ref } from 'vue'

// 定義 ref 物件
const inp = ref(null)

const clickFun = () => {
    inp.value.focus()
}
</script>

<template>
    <div>
        <!-- 透過 ref 屬性綁定 -->
        <input ref="inp" type="text"></input>
        <button @click="clickFun">focus on input</button>
    </div>
</template>
```

當然，因為需要元件掛載後才能取得，所以若要頁面一載入就使用的話，需要使用 `onMounted()` 函式。

```vue
<script setup>
import { onMounted, ref } from 'vue'

// 定義 ref 物件
const inp = ref(null)

// 頁面一載入就執行
onMounted(() => {
    inp.value.focus()
})
</script>

<template>
    <div>
        <!-- 透過 ref 屬性綁定 -->
        <input ref="inp" type="text"></input>
</template>
```

## 取得子元件

與上述類似，但若要取得子元件的屬性或方法，需要暴露（expose）出來。

在子元件中定義並選擇暴露

```vue
<script setup>
const count = 255
const hiFun = () => {
    console.log('hi from son component')
}

// 暴露給父元件
defineExpose({
    count,
    hiFun
})
</script>

<template>
    <div>
        這是一個子元件
    </div>
</template>
```

在父元件中取得並使用

```vue
<script setup>
import { onMounted, ref } from 'vue'
import sonComExp from './components/son-com-exp.vue'

const sonCom = ref(null)
onMounted(() => {
    // 存取資料
    console.log(sonCom.value.count)
    // 呼叫函式
    sonCom.value.hiFun()
})
</script>

<template>
    <sonComExp ref="sonCom"></sonComExp>
</template>
```

## 跨層傳遞資料

使用 `provide()` 函式和 `inject()` 函式可以跨層傳遞資料。

在頂層元件

```vue
<script setup>
import { ref, provide } from 'vue';
import centerCom from './components/center-com.vue';

// 傳遞資料
provide('count', 20)
// 傳遞響應式資料
const total = ref(100)
provide('total', total)

const clickFn = () => {
    total.value++
}
</script>

<template>
    <div>頂層元件</div>
    <button @click="clickFn">改變總數</button>
    <centerCom></centerCom>
</template>
```

中層元件

```vue
<script setup>
import bottomCom from './bottom-com.vue';
</script>

<template>
    <div>這是中層元件</div>
    <bottomCom></bottomCom>
</template>
```

底層元件

```vue
<script setup>
import { inject } from 'vue';
// 取得資料
const count = inject('count')
const total = inject('total')
</script>

<template>
    <div>這是底層元件</div>
    <div>來自頂層的計數: {{ count }}</div>
    <div>來自頂層的總數: {{ total }}</div>
</template>
```

## 跨層傳遞函式

當然，也可以傳遞一個函式，這樣底層元件就能操作頂層元件的資料了。

在頂層元件中傳遞函式

```vue
<script setup>
import { ref, provide } from 'vue';
import centerCom from './components/center-com.vue';

// 傳遞資料
provide('count', 20)

// 傳遞響應式資料
const total = ref(100)
provide('total', total)

const clickFn = () => {
    total.value++
}

// 傳遞函式
provide('changeTotal', (newTotal) => {
    total.value = newTotal
})
</script>

<template>
    <div>頂層元件</div>
    <button @click="clickFn">改變總數</button>
    <centerCom></centerCom>
</template>
```

在底層元件中接收函式

```vue
<script setup>
import { inject } from 'vue';

// 取得資料
const count = inject('count')
const total = inject('total')

// 取得函式
const changeTotal = inject('changeTotal')
const clickFn = () => {
    changeTotal(233)
}
</script>

<template>
    <div>這是底層元件</div>
    <div>來自頂層的計數: {{ count }}</div>
    <div>來自頂層的總數: {{ total }}</div>
    <button @click="clickFn">從底層改變總數</button>
</template>
```
