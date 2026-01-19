---
slug: 255
title: 'Vue3 父子元件傳遞參數'
# draft: true
author: yexca
date: '2025-09-21T19:17:40+09:00'
categories:
    - 技術學習
tags:
    - 前端技術
    - Vue
---

{{< notice >}} 本文由 gemini-2.5-flash 翻譯 {{< /notice >}}

第 255 篇文章耶，雖然最近沒什麼特別的想法，就順勢寫 Vue 筆記吧

## 引入子元件

定義子元件

```vue
<script setup>
</script>

<template>
    <div>
        this is a son component
    </div>
</template>
```

在父元件中使用

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

## 父元件向子元件傳遞參數

在父元件中透過屬性傳值

```vue
<script setup>
    import SonCom from '@/components/son-com.vue'
</script>

<template>
    <h2>this is a father component</h2>
    <!-- 屬性傳值 -->
    <SonCom msg="a msg from father"></SonCom>
</template>
```

在子元件中接收值

```vue
<script setup>
    // 因為處於 setup，所以需要借助編譯器巨集函式接收
    const props = defineProps({
        msg: String
    })
    // 程式碼中存取是物件存取方式
    console.log(props.msg)
</script>

<template>
    <div>
        this is a son component
    </div>
    <div>
        <!-- 但是直接使用變數名 -->
        {{ msg }}
    </div>
</template>
```

---

當然響應式資料也是可以的，父元件中

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
    <!-- 屬性傳值 -->
    <SonCom msg="a msg from father" :count="count"></SonCom>
</template>
```

在子元件中接收

```vue
<script setup>
    // 因為處於 setup，所以需要借助編譯器巨集函式接收
    const props = defineProps({
        msg: String,
        count: Number
    })
    // 程式碼中存取是物件存取方式
    console.log(props.msg)
</script>

<template>
    <div>
        this is a son component
    </div>
    <div>
        <!-- 但是直接使用變數名 -->
        {{ msg }} - {{ count }}
    </div>
</template>
```

> 不過本質上還是和 Option API 一樣是透過 props 接收

## 子元件向父元件傳遞參數

需要在子元件註冊事件

```vue
<script setup>
    // 因為處於 setup，所以需要借助編譯器巨集函式接收
    const props = defineProps({
        msg: String,
        count: Number
    })
    // 程式碼中存取是物件存取方式
    console.log(props.msg)

    // 定義事件，向父元件傳遞參數
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
        <!-- 但是直接使用變數名 -->
        {{ msg }} - {{ count }}
    </div>
    <div>
        <button @click="minusCountFun">minus count</button>
    </div>
</template>
```

然後在父元件接收事件

```vue
<script setup>
    import {ref} from 'vue'
    import SonCom from '@/components/son-com.vue'

    const count = ref(100)

    const addCount = () => {
        count.value++
    }

    // 接收參數
    const minusCountFun = (c) => {
        count.value -= c
    }
</script>

<template>
    <h2>this is a father component</h2>
    <button @click="addCount">add count</button>
    <br/><hr/>
    <!-- 屬性傳值，事件名稱要和子元件一樣 -->
    <SonCom msg="a msg from father" :count="count" @minusCount="minusCountFun"></SonCom>
</template>
```
