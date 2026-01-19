---
slug: 135
# layout: post
title: "Ajax 與 Axios"
author: yexca
date: 2023-12-21T13:32:15+08:00
# permalink: /archives/135
categories:
    - 技術學習
tags:
    - 前端技術
    - Ajax
    - Axios
---

{{< notice >}} 本文由 gemini-2.5-flash 翻譯 {{< /notice >}}

Asynchronous JavaScript And XML，非同步的 JS 與 XML。功能：

*   資料交換：透過 Ajax 可以向伺服器送出請求，並取得伺服器回應的資料
*   非同步互動：可以在不重新載入整個頁面的情況下，與伺服器交換資料並更新部分網頁的技術

使用情境：搜尋聯想、使用者名稱是否可用等

## 同步與非同步

同步指的是在造訪網頁時，執行某個操作需要向伺服器發出請求，在伺服器處理時網頁無法操作，直到伺服器回應客戶端時才能繼續操作。

而非同步則是在向伺服器發出請求的同時，客戶端可以執行其他操作。

## 原生 Ajax

首先建立 XMLHttpRequest 物件 (用於和伺服器交換資料)，然後向伺服器送出請求，最後取得伺服器回應資料。

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ajax</title>
</head>
<body>
    <input type="button" value="取得資料" onclick="getDate()">
    <div id="div1"></div>
</body>
<script>
    function getDate(){
        // 建立 XMLHttpRequest
        var xmlHttpRequest = new XMLHttpRequest();

        // 送出非同步請求
        xmlHttpRequest.open('GET', '//127.0.0.1:8080/listEmp');
        xmlHttpRequest.send();

        // 取得服務回應資料
        xmlHttpRequest.onreadystatechange=function(){
            if(xmlHttpRequest.readyState==4 && xmlHttpRequest.status==200){
                document.getElementById("div1").innerHTML=xmlHttpRequest.responseText;
            }
        }
    }
</script>
</html>
```

> 詳細參考：<https://www.w3school.com.cn/js/js_ajax_intro.asp>

## Axios

Axios 對原生的 Ajax 進行了封裝，簡化撰寫，快速開發。官方網站：<https://www.axios-http.cn/>

使用 Axios 需要先引入 Axios 檔案

```html
<script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
```

使用 Axios 送出請求並回應結果

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Axios</title>
    <!-- 檔案已下載到本機 -->
    <script src="./js/axios-0.18.0.js"></script>
</head>
<body>
    <input type="button" value="取得資料" onclick="getData()">
</body>
<script>
    function getData(){
        axios({
            method: "get",
            url: "//127.0.0.1:8080/listEmp"
        }).then(result => {
            console.log(result.data);
        })
    }
</script>
</html>
```

上述是 GET 方法，POST 方法需要新增資料

```javascript
function deleteData(){
    axios({
        method: "POST",
        url: "//127.0.0.1:8080/deleteEmpById",
        data: "id=1"
    }).then(result => {
        console.log(result.data);
    })
}
```

---

當然，這樣寫還是過於繁瑣，Axios 提供了別名

*   axios.get(url[, config])
*   axios.delete(url[, config])
*   axios.post(url[, data[, config]])
*   axios.put(url[, data[, config]])

```javascript
function getData(){
    // axios({
    //     method: "get",
    //     url: "//127.0.0.1:8080/listEmp"
    // }).then(result => {
    //     console.log(result.data);
    // })

    axios.get("//127.0.0.1:8080/listEmp").then(result => {
        console.log(result.data);
    })
}

function deleteData(){
    // axios({
    //     method: "POST",
    //     url: "//127.0.0.1:8080/deleteEmpById",
    //     data: "id=1"
    // }).then(result => {
    //     console.log(result.data);
    // })
    
    axios.post("//127.0.0.1:8080/deleteEmpById","id=1").then(result => {
        console.log(result.data);
    })
}
```
