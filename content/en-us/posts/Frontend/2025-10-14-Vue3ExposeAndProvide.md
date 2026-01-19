---
slug: 259
title: 'Vue 3: Get Elements, Components, and Cross-Component Data Transfer'
# draft: true
author: yexca
date: '2025-10-14T20:58:25+09:00'
categories:
    - Tech Learning
tags:
    - Frontend Tech
    - Vue
---

{{< notice >}} This article was translated by gemini-2.5-flash {{< /notice >}}

## Getting Elements

You grab elements by defining a `ref` object.

```vue
<script setup>
import { onMounted, ref } from 'vue'

// Define a ref object
const inp = ref(null)

const clickFun = () => {
    inp.value.focus()
}
</script>

<template>
    <div>
        <!-- Bind via ref attribute -->
        <input ref="inp" type="text"></input>
        <button @click="clickFun">focus on input</button>
    </div>
</template>
```

Of course, you can only get the element after the component mounts. So, if you need to use it right when the page loads, use the `onMounted()` function.

```vue
<script setup>
import { onMounted, ref } from 'vue'

// Define a ref object
const inp = ref(null)

// Executes as soon as the page loads
onMounted(() => {
    inp.value.focus()
})
</script>

<template>
    <div>
        <!-- Bind via ref attribute -->
        <input ref="inp" type="text"></input>
</template>
```

## Getting Child Components

Similar to above, but you need to expose child component properties or methods to access them.

Define and selectively expose in the child component.

```vue
<script setup>
const count = 255
const hiFun = () => {
    console.log('hi from son component')
}

// Expose to parent component
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

Get and use in the parent component.

```vue
<script setup>
import { onMounted, ref } from 'vue'
import sonComExp from './components/son-com-exp.vue'

const sonCom = ref(null)
onMounted(() => {
    // Access data
    console.log(sonCom.value.count)
    // Call function
    sonCom.value.hiFun()
})
</script>

<template>
    <sonComExp ref="sonCom"></sonComExp>
</template>
```

## Cross-Component Data Transfer

Use `provide()` and `inject()` functions to pass data across component layers.

In the Top-Level Component

```vue
<script setup>
import { ref, provide } from 'vue';
import centerCom from './components/center-com.vue';

// Provide data
provide('count', 20)
// Provide reactive data
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

Middle-Level Component

```vue
<script setup>
import bottomCom from './bottom-com.vue';
</script>

<template>
    <div>this is center component</div>
    <bottomCom></bottomCom>
</template>
```

Bottom-Level Component

```vue
<script setup>
import { inject } from 'vue';
// Inject data
const count = inject('count')
const total = inject('total')
</script>

<template>
    <div>this is bottom component</div>
    <div>count from top: {{ count }}</div>
    <div>total from top: {{ total }}</div>
</template>
```

## Cross-Component Function Transfer

You can also pass a function. This lets the bottom-level component manipulate data in the top-level component.

Providing a Function in the Top-Level Component

```vue
<script setup>
import { ref, provide } from 'vue';
import centerCom from './components/center-com.vue';

// Provide data
provide('count', 20)

// Provide reactive data
const total = ref(100)
provide('total', total)

const clickFn = () => {
    total.value++
}

// Provide a function
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

Injecting a Function in the Bottom-Level Component

```vue
<script setup>
import { inject } from 'vue';

// Inject data
const count = inject('count')
const total = inject('total')

// Inject function
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
