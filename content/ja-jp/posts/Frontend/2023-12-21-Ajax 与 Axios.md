---
slug: 135
# layout: post
title: "AjaxとAxios"
author: yexca
date: 2023-12-21T13:32:15+08:00
# permalink: /archives/135
categories:
    - 技術学習
tags:
    - フロントエンド技術
    - Ajax
    - Axios
---

{{< notice >}} この記事は gemini-2.5-flash によって翻訳されました {{< /notice >}}

Asynchronous JavaScript And XML、非同期のJSとXMLってことだね。役割はこんな感じ。

*   データ交換：Ajaxを使えば、サーバーにリクエストを送って、サーバーからデータを受け取ることができるんだ。
*   非同期インタラクション：ページ全体をリロードせずに、サーバーとデータをやり取りして、一部のウェブページを更新する技術だね。

使う場面：検索の予測候補とか、ユーザー名が使えるかどうかの確認とかだね。

## 同期と非同期

同期っていうのは、ウェブページにアクセスして何か操作するときにサーバーにリクエストが必要で、サーバーが処理してる間はウェブページは操作できないんだ。サーバーがクライアントに応答するまで、次の操作に進めないってこと。

一方、非同期はサーバーにリクエストを送ってる間に、クライアントは他の操作を実行できるんだ。

## 素のAjax

まずXMLHttpRequestオブジェクト（サーバーとデータをやり取りするためのもの）を作って、それからサーバーにリクエストを送って、最後にサーバーからの応答データを受け取るんだ。

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ajax</title>
</head>
<body>
    <input type="button" value="获取数据" onclick="getDate()">
    <div id="div1"></div>
</body>
<script>
    function getDate(){
        // 创建XMLHttpRequest
        var xmlHttpRequest = new XMLHttpRequest();

        // 发送异步请求
        xmlHttpRequest.open('GET', '//127.0.0.1:8080/listEmp');
        xmlHttpRequest.send();

        // 获取服务响应数据
        xmlHttpRequest.onreadystatechange=function(){
            if(xmlHttpRequest.readyState==4 && xmlHttpRequest.status==200){
                document.getElementById("div1").innerHTML=xmlHttpRequest.responseText;
            }
        }
    }
</script>
</html>
```

> 詳しい参考情報はこちら：<https://www.w3school.com.cn/js/js_ajax_intro.asp>

## Axios

Axiosは素のAjaxをラップして、記述をシンプルにして、素早い開発を可能にしてくれるんだ。公式サイトはこちら：<https://www.axios-http.cn/>

Axiosを使うには、まずAxiosファイルを読み込む必要があるよ。

```html
<script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
```

Axiosを使ってリクエストを送って結果を受け取る方法。

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Axios</title>
    <!-- 文件下载到了本地 -->
    <script src="./js/axios-0.18.0.js"></script>
</head>
<body>
    <input type="button" value="获取数据" onclick="getData()">
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

これはGETメソッドだけど、POSTメソッドはデータを追加する必要があるよ。

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

もちろん、こう書くのもまだちょっと面倒だよね。Axiosにはエイリアスが用意されてるんだ。

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
