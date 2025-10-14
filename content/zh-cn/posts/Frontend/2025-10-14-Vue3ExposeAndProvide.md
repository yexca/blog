---
slug: 259
title: 'vue3 获取组件与跨层传递'
# draft: true
author: yexca
date: '2025-10-14T20:58:25+09:00'
categories:
    - 技术学习
tags:
    - 前端技术
    - Vue
---

## 获取元素

通过定义一个 ref 对象来获取元素

```vue
<script setup>
import { onMounted, ref } from 'vue'

// 定义 ref 对象
const inp = ref(null)

const clickFun = () => {
    inp.value.focus()
}
</script>

<template>
    <div>
        <!-- 通过 ref 属性绑定 -->
        <input ref="inp" type="text"></input>
        <button @click="clickFun">focus on input</button>
    </div>
</template>
```

当然因为需要组件挂载后才能获取到，所以要进入页面就使用的话需要使用 `onMounted()` 函数

```vue
<script setup>
import { onMounted, ref } from 'vue'

// 定义 ref 对象
const inp = ref(null)

// 一进页面就执行
onMounted(() => {
    inp.value.focus()
})
</script>

<template>
    <div>
        <!-- 通过 ref 属性绑定 -->
        <input ref="inp" type="text"></input>
</template>
```

## 获取子组件

和上述类似，但是要获得子组件的属性或方法需要暴露

子组件中定义并选择暴露

```vue
<script setup>
const count = 255
const hiFun = () => {
    console.log('hi from son component')
}

// 暴露给父组件
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

在父组件中获取并使用

```vue
<script setup>
import { onMounted, ref } from 'vue'
import sonComExp from './components/son-com-exp.vue'

const sonCom = ref(null)
onMounted(() => {
    // 访问数据
    console.log(sonCom.value.count)
    // 调用函数
    sonCom.value.hiFun()
})
</script>

<template>
    <sonComExp ref="sonCom"></sonComExp>
</template>
```

## 跨层传递数据

使用 `provide()` 函数和 `inject()` 函数可以跨层传递数据

在顶层

```vue
<script setup>
import { ref, provide } from 'vue';
import centerCom from './components/center-com.vue';

// 传递数据
provide('count', 20)
// 传递响应式数据
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

中间层

```vue
<script setup>
import bottomCom from './bottom-com.vue';
</script>

<template>
    <div>this is center component</div>
    <bottomCom></bottomCom>
</template>
```

底层

```vue
<script setup>
import { inject } from 'vue';
// 获取数据
const count = inject('count')
const total = inject('total')
</script>

<template>
    <div>this is bottom component</div>
    <div>count from top: {{ count }}</div>
    <div>total from top: {{ total }}</div>
</template>
```

## 跨层传递函数

当然，也可以传一个函数，这样底层的组件就可以操作顶层组件数据了

顶层组件中传递函数

```vue
<script setup>
import { ref, provide } from 'vue';
import centerCom from './components/center-com.vue';

// 传递数据
provide('count', 20)

// 传递响应式数据
const total = ref(100)
provide('total', total)

const clickFn = () => {
    total.value++
}

// 传递函数
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

底层组件中接收函数

```vue
<script setup>
import { inject } from 'vue';

// 获取数据
const count = inject('count')
const total = inject('total')

// 获取函数
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
