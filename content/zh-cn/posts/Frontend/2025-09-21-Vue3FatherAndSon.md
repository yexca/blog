---
slug: 255
title: 'Vue3 父子组件传参'
# draft: true
author: yexca
date: '2025-09-21T19:17:40+09:00'
categories:
    - 技术学习
tags:
    - 前端技术
    - Vue
---

第 255 篇文章欸，虽然最近没什么特殊的想法来着，顺势写 Vue 笔记吧

## 引入子组件

定义子组件

```vue
<script setup>
</script>

<template>
    <div>
        this is a son component
    </div>
</template>
```

在父组件中使用

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

## 父组件向子组件传参

在父组件中通过属性传值

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

在子组件中接收值

```vue
<script setup>
    // 因为处于 setup，所以需要借助编译器宏函数接收
    const props = defineProps({
        msg: String
    })
    // 脚本中访问是对象访问方式
    console.log(props.msg)
</script>

<template>
    <div>
        this is a son component
    </div>
    <div>
        <!-- 但是使用直接用变量名 -->
        {{ msg }}
    </div>
</template>
```

---

当然响应式数据也是可以的，父组件中

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

在子组件中接收

```vue
<script setup>
    // 因为处于 setup，所以需要借助编译器宏函数接收
    const props = defineProps({
        msg: String,
        count: Number
    })
    // 脚本中访问是对象访问方式
    console.log(props.msg)
</script>

<template>
    <div>
        this is a son component
    </div>
    <div>
        <!-- 但是使用直接用变量名 -->
        {{ msg }} - {{ count }}
    </div>
</template>
```

> 不过本质上还是和 Option API 一样是通过 props 接收

## 子组件向父组件传参

需要在子组件注册事件

```vue
<script setup>
    // 因为处于 setup，所以需要借助编译器宏函数接收
    const props = defineProps({
        msg: String,
        count: Number
    })
    // 脚本中访问是对象访问方式
    console.log(props.msg)

    // 定义事件，向父组件传参
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
        <!-- 但是使用直接用变量名 -->
        {{ msg }} - {{ count }}
    </div>
    <div>
        <button @click="minusCountFun">minus count</button>
    </div>
</template>
```

然后在父组件接收事件

```vue
<script setup>
    import {ref} from 'vue'
    import SonCom from '@/components/son-com.vue'

    const count = ref(100)

    const addCount = () => {
        count.value++
    }

    // 接收参数
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
