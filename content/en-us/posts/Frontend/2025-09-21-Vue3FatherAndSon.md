---
slug: 255
title: 'Vue3 Parent-Child Component Communication'
# draft: true
author: yexca
date: '2025-09-21T19:17:40+09:00'
categories:
    - Tech Learning
tags:
    - Frontend
    - Vue
---

{{< notice >}} This article was translated by gemini-2.5-flash {{< /notice >}}

Alright, article #255! Haven't had any super special ideas lately, so let's just dive into some Vue notes.

## Introducing Child Components

Define the Child Component

```vue
<script setup>
</script>

<template>
    <div>
        this is a son component
    </div>
</template>
```

Use in the Parent Component

```vue
<script setup>
    import SonCom from '@/components/son-com.vue'
</script>

<template>
    <h2>this is a father component</h2>
    <!-- Direct usage -->
    <SonCom></SonCom>
</template>
```

## Parent Component to Child Component Props

Pass Props from Parent Component

```vue
<script setup>
    import SonCom from '@/components/son-com.vue'
</script>

<template>
    <h2>this is a father component</h2>
    <!-- Props passing -->
    <SonCom msg="a msg from father"></SonCom>
</template>
```

Receive Props in Child Component

```vue
<script setup>
    // In setup, we use a compiler macro to receive props
    const props = defineProps({
        msg: String
    })
    // Access in script is via object property
    console.log(props.msg)
</script>

<template>
    <div>
        this is a son component
    </div>
    <div>
        <!-- But in template, use the variable name directly -->
        {{ msg }}
    </div>
</template>
```

---

Reactive data works too. In the parent component:

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
    <!-- Props passing -->
    <SonCom msg="a msg from father" :count="count"></SonCom>
</template>
```

Receive in Child Component

```vue
<script setup>
    // In setup, we use a compiler macro to receive props
    const props = defineProps({
        msg: String,
        count: Number
    })
    // Access in script is via object property
    console.log(props.msg)
</script>

<template>
    <div>
        this is a son component
    </div>
    <div>
        <!-- But in template, use the variable name directly -->
        {{ msg }} - {{ count }}
    </div>
</template>
```

> But essentially, it's still receiving data via `props` just like with the Options API.

## Child Component to Parent Component Communication

Register an Event in the Child Component

```vue
<script setup>
    // In setup, we use a compiler macro to receive props
    const props = defineProps({
        msg: String,
        count: Number
    })
    // Access in script is via object property
    console.log(props.msg)

    // Define event to emit to parent
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
        <!-- But in template, use the variable name directly -->
        {{ msg }} - {{ count }}
    </div>
    <div>
        <button @click="minusCountFun">minus count</button>
    </div>
</template>
```

Then, Receive the Event in the Parent Component

```vue
<script setup>
    import {ref} from 'vue'
    import SonCom from '@/components/son-com.vue'

    const count = ref(100)

    const addCount = () => {
        count.value++
    }

    // Receive arguments
    const minusCountFun = (c) => {
        count.value -= c
    }
</script>

<template>
    <h2>this is a father component</h2>
    <button @click="addCount">add count</button>
    <br/><hr/>
    <!-- Props passing, event name must match child component -->
    <SonCom msg="a msg from father" :count="count" @minusCount="minusCountFun"></SonCom>
</template>
```
