---
slug: 135
# layout: post
title: "Ajax and Axios"
author: yexca
date: 2023-12-21T13:32:15+08:00
# permalink: /archives/135
categories:
    - Tech Learning
tags:
    - Frontend Tech
    - Ajax
    - Axios
---

{{< notice >}} This article was translated by gemini-2.5-flash {{< /notice >}}

Asynchronous JavaScript And XML (AJAX). What it does:

* **Data Exchange**: Ajax lets you send requests to a server and get data back.
* **Asynchronous Interaction**: It's a technique to exchange data with the server and update parts of a webpage without a full page reload.

Use cases: Search suggestions, checking username availability, etc.

## Sync vs. Async

Sync means when you perform an operation on a webpage that requires a server request, the page becomes unresponsive while the server processes it. You can't interact again until the server sends a response to the client.

With async, the client can do other tasks while waiting for the server response.

## Native Ajax

First, create an `XMLHttpRequest` object (for exchanging data with the server). Then, send the request. Finally, get the server's response data.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ajax</title>
</head>
<body>
    <input type="button" value="Get Data" onclick="getDate()">
    <div id="div1"></div>
</body>
<script>
    function getDate(){
        // Create XMLHttpRequest
        var xmlHttpRequest = new XMLHttpRequest();

        // Send async request
        xmlHttpRequest.open('GET', '//127.0.0.1:8080/listEmp');
        xmlHttpRequest.send();

        // Get server response data
        xmlHttpRequest.onreadystatechange=function(){
            if(xmlHttpRequest.readyState==4 && xmlHttpRequest.status==200){
                document.getElementById("div1").innerHTML=xmlHttpRequest.responseText;
            }
        }
    }
</script>
</html>
```

> For more details: <https://www.w3school.com.cn/js/js_ajax_intro.asp>

## Axios

Axios wraps native Ajax, making it simpler to write and speeding up development. Official website: <https://www.axios-http.cn/>

To use Axios, you first need to include the Axios file.

```html
<script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
```

Using Axios to send a request and handle the response:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Axios</title>
    <!-- File downloaded locally -->
    <script src="./js/axios-0.18.0.js"></script>
</head>
<body>
    <input type="button" value="Get Data" onclick="getData()">
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

That was a GET method. For POST, you need to add data.

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

Sure, that's still a bit verbose. Axios offers aliases:

* `axios.get(url[, config])`
* `axios.delete(url[, config])`
* `axios.post(url[, data[, config]])`
* `axios.put(url[, data[, config]])`

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
