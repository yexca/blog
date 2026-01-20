---
slug: 148
# layout: post
title: JavaScript 學習
author: yexca
date: 2024-01-22T19:51:24+08:00
# permalink: /archives/148
categories:
    - 技術學習
tags:
    - 前端技術
    - JavaScript
---

{{< notice >}} 本文由 gemini-3-flash-preview 翻譯 {{< /notice >}}

JS 是一門跨平台、物件導向的腳本語言，是用來控制網頁行為的，使網頁具備互動性。

## JS 引入方式

分為內部腳本和外部腳本兩種。

### 內部腳本

將 JS 程式碼定義在 HTML 頁面中。

* JS 程式碼必須位於 `<script></script>` 標籤之間。
* 在 HTML 文件中，可以在任何地方放置任意數量的 `<script>`。
* 一般會把腳本置於 `<body>` 元素的底部，可以改善顯示速度。

```html
<script>
    alert("Hello JavaScript")
</script>
```

### 外部腳本

將 JS 程式碼定義在外部 JS 檔案中，然後引入到 HTML 頁面中。

* 外部 JS 檔案中，只包含 JS 程式碼，不包含 `<script>` 標籤。

```html
<html>
    <head>
        <script src="./js/1.js"></script>
    </head>
</html>
```

JS 檔案內容：

```javascript
alert("Hello JavaScript")
```

## JS 基礎語法

區分大小寫，每行結尾的分號可有可無。註解有兩種：

```javascript
// 單行註解

/*
    多行註解
*/
```

大括號表示程式碼區塊：

```javascript
// 判斷
if(count==3){
    alert(count);
}
```

### 輸出語句

可以輸出到警告框、HTML 或主控台（Console）。

```javascript
// 瀏覽器彈出警告框
window.alert("Hello from alert")
// 寫入 HTML 在瀏覽器展示
document.write("Hello from HTML")
// 寫入瀏覽器主控台
console.log("Hello from console")
```

### 變數

JS 是一門弱型別語言，變數可以存放不同型別的值，變數名稱需要遵循如下規則：

* 組成字元可以是任意字母、數字、底線或者錢字號（$）。
* 數字不能開頭。
* 建議使用駝峰式命名（camelCase）。

定義變數有三個關鍵字：`var`、`let` 和 `const`。

#### var

var 是 variable 的縮寫，宣告的變數為全域變數，可以重複定義。

```javascript
// 重複宣告
var a = 1;
var a = 'A';
alert(a);

// 全域變數
{
    var b = 'B';
}
alert(b);
```

#### let

在 ECMAScript 6 新增，所宣告的變數只在 let 所在的程式碼區塊內有效，且不允許重複宣告。

```javascript
let a = 'A';
alert(a);

// 區域變數
{
    let a='A';
}
alert(a); // 無輸出，且在主控台報錯
```

#### const

用來宣告一個唯讀的常數，一旦宣告，無法被改變。

```javascript
const a = 'A';
a = 1;
alert(a); // 無輸出，且在主控台報錯
```

### 資料型別

JS 中分為原始型別與引用型別，即基本資料型別與物件。

原始型別有五種：

* number：數字（整數、小數、NaN (Not a Number)）。
* string：字串，單雙引號皆可。
* boolean：布林值。true 和 false。
* null：物件為空。
* undefined：當宣告的物件未初始化時，該變數預設值是 undefined。

使用 `typeof` 運算子可以獲取資料型別。

```javascript
// number
console.log("number 型別");
console.log(typeof 3);
console.log(typeof 3.14);

// string
console.log("\nstring 型別");
console.log(typeof 'A');
console.log(typeof "string");

// boolean
console.log("\nboolean 型別");
console.log(typeof true);
console.log(typeof false);

// null - object
console.log("\nnull-object 型別");
console.log(typeof null);

// undefined
var a;
console.log("\nundefined 型別");
console.log(typeof a);
```

> 您也許會問，為什麼 typeof 運算子對於 null 值會回傳 "Object"。這實際上是 JavaScript 最初實作中的一個錯誤，然後被 ECMAScript 沿用了。現在，null 被認為是物件的佔位符，從而解釋了這一矛盾，但從技術上來說，它仍然是原始值。
>
> 參考來源: <https://www.w3school.com.cn/js/pro_js_primitivetypes.asp>

### 運算子

* 算術運算子：+、-、*、/、%、++、--
* 賦值運算子：=、+=、-=、*=、/=、%=
* 比較運算子：>、<、>=、<=、!=、==、===
* 邏輯運算子：&&、||、!
* 三元運算子：condition ? true : false

> == 與 ===
>
> == 會進行型別轉換，而 === 不會進行型別轉換，即型別與值都相等才為 true。

```javascript
var a = 20;
var aStr = "20";
var aInt = 20;

console.log(a==aStr); // true
console.log(a===aStr);// false
console.log(a===aInt);// true
```

### 型別轉換

字串轉換為數字使用 `parseInt()` 函式即可。

轉換是從第一個字元開始，直到遇到非數值。若開頭就是非數值，則轉為 `NaN`。

```javascript
var a = "12";
var b = "12A34";
var c = "A34";

console.log(parseInt(a)); // 12
console.log(parseInt(b)); // 12
console.log(parseInt(c)); // NaN
```

其他型別轉為 Boolean：

* Number：0 和 NaN 為 false，其他均為 true。
* String：空字串為 false，其他均為 true。
* Null 和 undefined：均為 false。

```javascript
// number
if (0) {
    console.log("0");
}
if (NaN) {
    console.log("NaN");
}
if (-1) {
    console.log("-1");
}
// 執行結果：-1

// String
if ("") {
    console.log("空字元");
}
if (" ") {
    console.log("空格");
}
// 執行結果：空格

// Null 和 undefined
if (null) {
    console.log("null")
}
if (undefined) {
    console.log("undefined")
}
if (1) {
    console.log("null 和 undefined 都是 false")
}
// 執行結果：null 和 undefined 都是 false
```

### 流程控制

* if...else if...else
* switch
* for
* while
* do...while

參考來源: <https://www.w3school.com.cn/jsref/jsref_statements.asp>

## 函式

函式是被設計為執行特定任務的程式碼區塊。

函式的定義有兩種形式，通常的語法為：

```javascript
function functionName(var1,var2,...){
    // code
}
```

其中：

* 形式參數不需要型別。
* 回傳值也不需要定義型別，可以直接在函式內部使用 return 回傳。

```javascript
function add1(a, b){
    return a+b;
}

var result = add1(10, 20);
console.log(result); // 30
```

---

定義函式的方式二：

```javascript
var functionName = function(var1, var2,...){
    // code
}
```

上例採用此方法：

```javascript
var add2 = function(a, b){
    return a+b;
}

var result = add2(10, 20);
console.log(result); // 30
```

> JS 中，函式呼叫可以傳遞任意個數的參數，但只接收定義的形參個數。

## 物件

基礎物件、瀏覽器物件模型 BOM、文件物件模型 DOM。

### Array 陣列

定義方式一：

```javascript
var name = new Array(element1,element2,...);
// 例如
var arr = new Array(1,2,3,4);
```

定義方式二：

```javascript
var name = [element];
// 例如
var arr = [1,2,3,4];
```

存取與賦值：

```javascript
// 存取，索引從 0 開始
arr[2];
// 賦值
arr[4]=5;
```

> 陣列長度可變，也可以儲存任意型別的資料。

```javascript
var arr = [1,2,3,4];
// console.log(arr);

// 長度可變
arr[9] = 8;
// console.log(arr);

// 型別可變
arr[8] = 'A';
console.log(arr);
```

#### 屬性

length 屬性可以回傳陣列中元素的數量，可用此屬性遍歷陣列。

```javascript
var arr = [1,2,3,4];
for (let i = 0; i < arr.length; i++) {
    console.log(arr[i]);
}
```

#### 方法

| 方法      | 描述                                                 |
| --------- | ---------------------------------------------------- |
| forEach() | 遍歷陣列中的每個**有值**的元素，並呼叫一次傳入的函式 |
| push()    | 將新元素添加到陣列的末尾，並回傳新的長度             |
| splice()  | 從陣列中刪除元素                                     |

forEach 遍歷：

```javascript
var arr = [1,2,3,4];
arr.forEach(function(e){
    console.log(e);
})
```

上述程式碼可以用箭頭函式簡化：

```javascript
// 箭頭函式：(...) => {...} 簡化函式定義
arr.forEach(e => {
    console.log(e);
});
```

push 函式添加數值：

```javascript
var arr = [1,2,3,4];
// 可以有多個值
arr.push(5,6,7,8);
console.log(arr);// [1,2,3,4,5,6,7,8]
```

splice 刪除元素：

```javascript
var arr = [1,2,3,4];// [1,2,3,4,5,6,7,8]
arr.push(5,6,7,8);
// 從第幾個元素開始，刪除幾個元素
arr.splice(2,4); // 從第 2 個元素開始，刪除 4 個元素
console.log(arr);// [1,2,7,8]
```

#### 兩種遍歷的區別

for 遍歷會遍歷所有元素，包括 undefined。而 forEach 僅遍歷有值的元素。

```javascript
var arr = [1,2,3,4];
arr[9] = 10;

for (let i = 0; i < arr.length; i++) {
    console.log(arr[i]);
}// 1,2,3,4,undefined,,,,,10

console.log("==============================");

arr.forEach(e => {
    console.log(e);
})// 1,2,3,4,10
```

### String 字串

建立方式有兩種：

```javascript
// 方式一
var name = new String("");
// 方式二
var name = ""; // 單雙引號皆可
```

#### 屬性與方法

| 屬性或方法  | 描述                                   |
| ----------- | -------------------------------------- |
| length      | 字串的長度                             |
| charAt()    | 回傳在指定位置的字元                   |
| indexOf()   | 檢索字串                               |
| trim()      | 去除字串兩邊的空格                     |
| substring() | 提取字串中兩個指定的索引號之間的字元     |

```javascript
var str = "Hello String";

console.log(str.length); // 12

// 從 0 開始
console.log(str.charAt(4)); // o

console.log(str.indexOf("lo")); // 3

var s = "    Hello String    ";
var s = s.trim();
console.log(s); // Hello String

// 開始，結束，含頭不含尾
var s = s.substring(0,5);
console.log(s); // Hello
```

### JS 自定義物件

定義格式：

```javascript
var 物件名 = {
    屬性名: 屬性值,
    函式名: function(形參){
        
    }
}
```

例如：

```javascript
var person = {
    name: "tom",
    age: 18,
    gender: "male",
    eat: function(){
        console.log("吃飯nya");
    }
}

console.log(person.age);
person.eat();
```

其中方法有簡寫：

```javascript
var person = {
    name: "tom",
    age: 18,
    gender: "male",
    // eat: function(){
    //     console.log("吃飯nya");
    // }
    eat(){
        console.log("吃飯nya");
    }
}
```

### JSON

JavaScript Object Notation，JavaScript 物件標記法。JSON 是透過 JavaScript 物件標記法書寫的**文本**，由於其語法簡單，層次結構鮮明，現在多用於作為資料載體，在網路中進行資料傳輸。

定義與實例：

```javascript
// 定義
var 變數名 = '{"key1":value1,"key2":value2}';
// 示例
var userStr = '{"name":"Tom","age":18,"addr":["台北","台中"]}';
```

其中 value 的資料型別為：

* 數字 (整數或浮點數)
* 字串 (在雙引號中)
* 邏輯值 (true 或 false)
* 陣列 (在方括號中)
* 物件 (在花括號中)
* null

---

在 JS 中有把物件轉為 JSON 字串的方法：

```javascript
var jsonStr = JSON.stringify(jsObject)
```

也有把 JSON 字串轉為物件的方法：

```javascript
var userStr = '{"name":"Tom","age":18,"addr":["台北","台中"]}';
var jsObject = JSON.parse(userStr)
```

### BOM

Browser Object Model，瀏覽器物件模型，允許 JavaScript 與瀏覽器對話，JavaScript 將瀏覽器的各個組成部分封裝成物件。

* Window：瀏覽器視窗物件
* Navigator：瀏覽器物件
* Screen：螢幕物件
* History：歷史紀錄物件
* Location：網址列物件

#### Window

瀏覽器視窗物件可直接使用，其中 `window.` 可以省略。屬性有：

| 屬性      | 描述                           |
| --------- | ------------------------------ |
| history   | 對 History 物件的唯讀引用      |
| location  | 用於視窗或框架的 Location 物件 |
| navigator | 對 Navigator 物件的唯讀引用    |

方法有：

| 方法          | 描述                                             |
| ------------- | ------------------------------------------------ |
| alert()       | 顯示帶有一段訊息和一個確認按鈕的警告框           |
| confirm()     | 顯示帶有一段訊息以及確認按鈕和取消按鈕的對話框   |
| setInterval() | 按照指定的週期 (以毫秒計) 來呼叫函式或計算表達式 |
| setTimeout()  | 在指定的毫秒數後呼叫函式或計算表達式             |

```javascript
// 獲取 window 物件
window.alert("獲取 window 物件");
// 或者省略前面
alert("省略了 window");

// confirm
var flag = confirm("是否確認");
console.log(flag);

// 定時器 1
var i = 0;
setInterval(function(){
    i++;
    console.log("定時器執行 "+i+" 次");
},2000); // 每兩秒執行一次

// 定時器 2
setTimeout(function(){
    console.log("只會執行一次");
},3000); // 三秒後執行一次
```

#### Location

網址列物件，使用 `window.location` 獲取，其中 `window.` 可以省略。

屬性 `href` 可以設置或回傳完整的 URL。

```javascript
// 獲取目前網址列地址
console.log(location.href);
// 設置網址列地址，會自動跳轉
location.href = "https://blog.yexca.net/"
```

### DOM

Document Object Model，文件物件模型，將標記語言的各個組成部分封裝為對應的物件。

DOM 是 W3C 的標準，定義了存取 HTML 和 XML 文件的標準，分為三部分：

1. Core DOM - 所有文件類型的標準模型
  * Document：整個文件物件
  * Element：元素物件
  * Attribute：屬性物件
  * Text：文字物件
  * Comment：註解物件
2. XML DOM - XML 文件的標準模型
3. HTML DOM - HTML 文件的標準模型
  * Image: `<img>`
  * Button: `<input type='button'>`

JS 透過 DOM，就能夠對 HTML 進行操作，例如：

* 改變 HTML 元素的內容
* 改變 HTML 元素的樣式 (CSS)
* 對 HTML DOM 事件做出反應
* 添加和刪除 HTML 元素

HTML 中的 Element 物件可以透過 Document 物件獲取，而 Document 物件是透過 window 物件獲取的。

Document 物件中提供了以下獲取 Element 元素物件的函式：

1. 根據 id 屬性值獲取，回傳單個 Element 物件：

```javascript
var app = document.getElementById('app');
```

2. 根據標籤名稱獲取，回傳 Element 物件陣列：

```javascript
var links = document.getElementsByTagName("a");
```

3. 根據 name 屬性值獲取，回傳 Element 物件陣列：

```javascript
var hobbys = document.getElementsByName('hobby');
```

4. 根據 class 屬性值獲取，回傳 Element 物件陣列：

```javascript
var classes = document.getElementsByClassName('cls');
```

以上範例 HTML：

```html
<!DOCTYPE html>
<html lang="zh-Hant">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DOM</title>
    
</head>
<body>
    <div id="app">
        <a href="#">abc</a><br>
        <input type="checkbox" name="hobby">hobby1 <br>
        <input type="checkbox" name="hobby">hobby2 <br>
        <a href="#">def</a><br>
        <div class="cls">class</div>
    </div>
</body>
<script src="./js/10-DOM.js"></script>
</html>
```

---

在獲取元素後，就可以修改了，修改參考可見 <https://www.w3school.com.cn/jsref/index.asp> 左側 HTML 物件。

例如上例修改第一個 a 標籤文字：

```javascript
// 獲取
var links = document.getElementsByTagName("a");
// 修改
links[0].innerHTML = "修改值";
```

## 事件監聽

事件是發生在 HTML 元素上的事情，比如按鈕被點擊、滑鼠移動到元素上、按下鍵盤按鍵等。

而事件監聽則指 JavaScript 可以在事件被偵測到時執行程式碼。

### 事件綁定

事件綁定有兩種方式，方式一：透過 HTML 標籤中的事件屬性進行綁定。

```html
<button id="btn" onclick="on()">按鈕</button>
<script>
    function on(){
        alert("按鈕被點擊 1");
    }
</script>
```

方式二：透過 DOM 元素屬性綁定。

```javascript
document.getElementById("btn").onclick=function(){
    alert("按鈕被點擊 2");
}
```

### 常見事件

| 事件名      | 描述                     |
| ----------- | ------------------------ |
| onclick     | 滑鼠點擊事件             |
| onblur      | 元素失去焦點             |
| onfocus     | 元素獲得焦點             |
| onload      | 某個頁面或圖像被完成載入 |
| onsubmit    | 當表單提交時觸發該事件   |
| onkeydown   | 某個鍵盤的鍵被按下       |
| onmouseover | 滑鼠被移到某元素之上     |
| onmouseout  | 滑鼠從某元素移開         |
