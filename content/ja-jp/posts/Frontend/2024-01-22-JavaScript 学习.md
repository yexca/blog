---
slug: 148
# layout: post
title: JavaScriptの勉強
author: yexca
date: 2024-01-22T19:51:24+08:00
# permalink: /archives/148
categories:
    - 技術学習
tags:
    - フロントエンド技術
    - JavaScript
---

{{< notice >}} この記事は gemini-3-flash-preview によって翻訳されました {{< /notice >}}

JSは、クロスプラットフォームでオブジェクト指向のスクリプト言語だよ。ウェブページの挙動を制御して、ユーザーとやり取りできるようにするために使われるんだ。

## JSの導入方法

内部スクリプトと外部スクリプトの2種類があるよ。

### 内部スクリプト

JSのコードをHTMLページの中に直接書く方法だよ。

* JSのコードは必ず `<script></script>` タグの間に書くこと。
* HTMLドキュメント内のどこにでも、いくつでも `<script>` を置けるよ。
* 一般的には、表示速度を上げるために `<body>` 要素の最後に置くことが多いかな。

```html
<script>
    alert("Hello JavaScript")
</script>
```

### 外部スクリプト

JSのコードを外部のJSファイルに定義して、それをHTMLページに読み込む方法だよ。

* 外部JSファイルにはJSのコードだけを書いて、 `<script>` タグは含めないよ。

```html
<html>
    <head>
        <script src="./js/1.js"></script>
    </head>
</html>
```

JSファイルの内容：

```javascript
alert("Hello JavaScript")
```

## JSの基本構文

大文字と小文字を区別するよ。行末のセミコロンはあってもなくても大丈夫。コメントは2種類あるんだ。

```javascript
// 一行コメント

/*
    複数行コメント
*/
```

波括弧 `{}` はコードブロックを表すよ。

```javascript
// 判断
if(count==3){
    alert(count);
}
```

### 出力ステートメント

警告ボックス、HTML、またはコンソールに出力できるよ。

```javascript
// ブラウザに警告ボックスを表示
window.alert("Hello from alert")
// HTMLに書き込んでブラウザに表示
document.write("Hello from HTML")
// ブラウザのコンソールに書き込む
console.log("Hello from console")
```

### 変数

JSは弱型言語で、変数には異なる型の値を入れられるんだ。変数名は以下のルールに従う必要があるよ。

* 使える文字は、文字、数字、アンダースコア（_）、またはドル記号（$）。
* 数字から始めてはいけない。
* キャメルケース（camelCase）での命名がおすすめ。

変数を定義するキーワードは `var`、`let`、`const` の3つがあるよ。

#### var

variableの略。宣言された変数はグローバル変数になり、重複して定義することもできちゃう。

```javascript
// 重複宣言
var a = 1;
var a = 'A';
alert(a);

// グローバル変数
{
    var b = 'B';
}
alert(b);
```

#### let

ECMAScript 6で追加されたよ。宣言された変数は、その `let` があるコードブロック内でのみ有効で、重複宣言はできないんだ。

```javascript
let a = 'A';
alert(a);

// ローカル変数
{
    let a='A';
}
alert(a); // 何も表示されず、コンソールでエラーになる
```

#### const

読み取り専用の定数を宣言するために使うよ。一度宣言すると、値を変えることはできないんだ。

```javascript
const a = 'A';
a = 1;
alert(a); // 何も表示されず、コンソールでエラーになる
```

### データ型

JSにはプリミティブ型と参照型の2種類があるよ。つまり、基本データ型とオブジェクトだね。

プリミティブ型は5種類：

* number：数字（整数、小数、NaN (Not a Number)）
* string：文字列。シングルクォートでもダブルクォートでもOK。
* boolean：論理値。true と false。
* null：オブジェクトが空。
* undefined：宣言された変数が初期化されていない時のデフォルト値。

`typeof` 演算子を使えばデータ型を確認できるよ。

```javascript
// number
console.log("number 型");
console.log(typeof 3);
console.log(typeof 3.14);

// string
console.log("\nstring 型");
console.log(typeof 'A');
console.log(typeof "string");

// boolean
console.log("\nboolean 型");
console.log(typeof true);
console.log(typeof false);

// null - object
console.log("\nnull-object 型");
console.log(typeof null);

// undefined
var a;
console.log("\nundefined 型");
console.log(typeof a);
```

> なんで `typeof null` が "Object" を返すのか不思議に思うかもしれないけど、これは実はJavaScriptの初期の実装ミスがそのまま引き継がれちゃったものなんだ。今は `null` はオブジェクトのプレースホルダーだと解釈されているけど、技術的には依然としてプリミティブ値なんだよ。
>
> 参考: <https://www.w3school.com.cn/js/pro_js_primitivetypes.asp>

### 演算子

* 算術演算子：+、-、*、/、%、++、--
* 代入演算子：=、+=、-=、*=、/=、%=
* 比較演算子：>、<、>=、<=、!=、==、===
* 論理演算子：&&、||、!
* 三項演算子：条件 ? trueの場合 : falseの場合

> == と ===
>
> `==` は型変換を行うけど、 `===` は型変換を行わないんだ。つまり、型と値の両方が一致して初めて true になるよ。

```javascript
var a = 20;
var aStr = "20";
var aInt = 20;

console.log(a==aStr); // true
console.log(a===aStr);// false
console.log(a===aInt);// true
```

### 型変換

文字列を数字に変換するには `parseInt()` 関数を使えばいいよ。

変換は最初の文字から始まって、数値以外の文字にぶつかるまで続くんだ。最初が数値以外なら `NaN` になるよ。

```javascript
var a = "12";
var b = "12A34";
var c = "A34";

console.log(parseInt(a)); // 12
console.log(parseInt(b)); // 12
console.log(parseInt(c)); // NaN
```

他の型から Boolean への変換：

* Number：0 と NaN は false、それ以外は true。
* String：空文字列は false、それ以外は true。
* Null と undefined：どちらも false。

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
// 実行結果：-1

// String
if ("") {
    console.log("空文字");
}
if (" ") {
    console.log("スペース");
}
// 実行結果：スペース

// Null と undefined
if (null) {
    console.log("null")
}
if (undefined) {
    console.log("undefined")
}
if (1) {
    console.log("null と undefined はどちらも false")
}
// 実行結果：null と undefined はどちらも false
```

### 制御フロー

* if...else if...else
* switch
* for
* while
* do...while

参考: <https://www.w3school.com.cn/jsref/jsref_statements.asp>

## 関数

関数は、特定のタスクを実行するために設計されたコードブロックだよ。

定義の方法は2種類あるけど、一般的な構文はこんな感じ。

```javascript
function functionName(var1, var2, ...){
    // コード
}
```

ポイント：

* 引数に型指定はいらない。
* 戻り値の型定義もいらなくて、関数内で `return` すればOK。

```javascript
function add1(a, b){
    return a+b;
}

var result = add1(10, 20);
console.log(result); // 30
```

---

関数の定義方法その2：

```javascript
var functionName = function(var1, var2, ...){
    // コード
}
```

さっきの例をこの方法で書くと：

```javascript
var add2 = function(a, b){
    return a+b;
}

var result = add2(10, 20);
console.log(result); // 30
```

> JSでは、関数を呼び出す時に引数をいくつ渡してもいいんだけど、実際に受け取れるのは定義した引数の数だけだよ。

## オブジェクト

基本オブジェクト、ブラウザオブジェクトモデル (BOM)、ドキュメントオブジェクトモデル (DOM) があるよ。

### Array 配列

定義方法1：

```javascript
var name = new Array(element1, element2, ...);
// 例えば
var arr = new Array(1, 2, 3, 4);
```

定義方法2：

```javascript
var name = [element];
// 例えば
var arr = [1, 2, 3, 4];
```

アクセスと代入：

```javascript
// アクセス（インデックスは0から）
arr[2];
// 代入
arr[4]=5;
```

> 配列の長さは可変だし、どんな型のデータでも混ぜて保存できるよ。

```javascript
var arr = [1, 2, 3, 4];
// console.log(arr);

// 長さが変わる
arr[9] = 8;
// console.log(arr);

// 型も変わる
arr[8] = 'A';
console.log(arr);
```

#### プロパティ

`length` プロパティは配列の要素の数を返してくれるよ。これを使ってループを回したりするね。

```javascript
var arr = [1, 2, 3, 4];
for (let i = 0; i < arr.length; i++) {
    console.log(arr[i]);
}
```

#### メソッド

| メソッド   | 説明                                                 |
| --------- | ---------------------------------------------------- |
| forEach() | 配列内の**値がある**各要素をループして、関数を呼び出す |
| push()    | 配列の末尾に新しい要素を追加して、新しい長さを返す     |
| splice()  | 配列から要素を削除する                               |

forEach でループ：

```javascript
var arr = [1, 2, 3, 4];
arr.forEach(function(e){
    console.log(e);
})
```

アロー関数を使えばもっとスッキリ書けるよ。

```javascript
// アロー関数：(...) => {...} で定義を簡略化
arr.forEach(e => {
    console.log(e);
});
```

push で要素追加：

```javascript
var arr = [1, 2, 3, 4];
// 複数の値を一度に入れられる
arr.push(5, 6, 7, 8);
console.log(arr);// [1, 2, 3, 4, 5, 6, 7, 8]
```

splice で削除：

```javascript
var arr = [1, 2, 3, 4];
arr.push(5, 6, 7, 8); // [1, 2, 3, 4, 5, 6, 7, 8]
// 何番目の要素から、何個削除するか
arr.splice(2, 4); // 2番目の要素から4個削除
console.log(arr);// [1, 2, 7, 8]
```

#### 2つのループの違い

`for` ループは `undefined` を含めて全ての要素を回るけど、 `forEach` は値がある要素だけを回るんだ。

```javascript
var arr = [1, 2, 3, 4];
arr[9] = 10;

for (let i = 0; i < arr.length; i++) {
    console.log(arr[i]);
}// 1, 2, 3, 4, undefined, undefined, undefined, undefined, undefined, 10

console.log("==============================");

arr.forEach(e => {
    console.log(e);
})// 1, 2, 3, 4, 10
```

### String 文字列

作成方法は2つ。

```javascript
// 方法1
var name = new String("");
// 方法2
var name = ""; // シングルでもダブルでもOK
```

#### プロパティとメソッド

| プロパティ・メソッド | 説明                                   |
| ----------- | -------------------------------------- |
| length      | 文字列の長さ                           |
| charAt()    | 指定された位置の文字を返す               |
| indexOf()   | 文字列を検索する                       |
| trim()      | 文字列の両端の空白を削除する             |
| substring() | 指定された2つのインデックス間の文字を抽出する |

```javascript
var str = "Hello String";

console.log(str.length); // 12

// 0から数えるよ
console.log(str.charAt(4)); // o

console.log(str.indexOf("lo")); // 3

var s = "    Hello String    ";
var s = s.trim();
console.log(s); // Hello String

// 開始、終了（開始位置を含み、終了位置は含まない）
var s = s.substring(0, 5);
console.log(s); // Hello
```

### JS カスタムオブジェクト

定義の形式：

```javascript
var オブジェクト名 = {
    プロパティ名: プロパティ値,
    関数名: function(引数){
        
    }
}
```

例えば：

```javascript
var person = {
    name: "tom",
    age: 18,
    gender: "male",
    eat: function(){
        console.log("ご飯食べるにゃ");
    }
}

console.log(person.age);
person.eat();
```

メソッドは短縮して書くこともできるよ。

```javascript
var person = {
    name: "tom",
    age: 18,
    gender: "male",
    // eat: function(){
    //     console.log("ご飯食べるにゃ");
    // }
    eat(){
        console.log("ご飯食べるにゃ");
    }
}
```

### JSON

JavaScript Object Notation。JavaScriptのオブジェクト記法を使った**テキスト**のことだよ。構文がシンプルで構造が分かりやすいから、今はネットワーク上でのデータ伝送によく使われているんだ。

定義と例：

```javascript
// 定義
var 変数名 = '{"key1":value1, "key2":value2}';
// 例
var userStr = '{"name":"Tom", "age":18, "addr":["北京", "上海"]}';
```

valueに使えるデータ型：

* 数値（整数または浮点数）
* 文字列（ダブルクォートで囲む）
* 論理値（true または false）
* 配列（角括弧の中）
* オブジェクト（波括弧の中）
* null

---

JSにはオブジェクトをJSON文字列に変換するメソッドがあるよ。

```javascript
var jsonStr = JSON.stringify(jsObject)
```

逆に、JSON文字列をオブジェクトに変換するメソッドもあるよ。

```javascript
var userStr = '{"name":"Tom", "age":18, "addr":["北京", "上海"]}';
var jsObject = JSON.parse(userStr)
```

### BOM

Browser Object Model。JavaScriptがブラウザと対話するための仕組みで、ブラウザの各パーツをオブジェクトとして扱えるようにしたものだよ。

* Window：ブラウザウィンドウオブジェクト
* Navigator：ブラウザ情報オブジェクト
* Screen：画面オブジェクト
* History：履歴オブジェクト
* Location：アドレスバーオブジェクト

#### Window

ブラウザウィンドウオブジェクトは直接使えるし、 `window.` は省略してもいいよ。プロパティにはこんなのがある：

| プロパティ      | 説明                           |
| --------- | ------------------------------ |
| history   | Historyオブジェクトへの読み取り専用参照 |
| location  | ウィンドウのLocationオブジェクト |
| navigator | Navigatorオブジェクトへの読み取り専用参照 |

メソッド：

| メソッド          | 説明                                             |
| ------------- | ------------------------------------------------ |
| alert()       | メッセージとOKボタンがある警告ボックスを表示する     |
| confirm()     | メッセージとOK・キャンセルボタンがあるダイアログを表示する |
| setInterval() | 指定した周期（ミリ秒）で関数を繰り返し呼び出す       |
| setTimeout()  | 指定したミリ秒後に一度だけ関数を呼び出す           |

```javascript
// windowオブジェクトを取得して使用
window.alert("windowオブジェクトだよ");
// 省略してもOK
alert("windowを省略したよ");

// confirm
var flag = confirm("確認してね");
console.log(flag);

// タイマー1
var i = 0;
setInterval(function(){
    i++;
    console.log("タイマー実行 "+i+"回目");
}, 2000); // 2秒ごとに実行

// タイマー2
setTimeout(function(){
    console.log("一度だけ実行されるよ");
}, 3000); // 3秒後に実行
```

#### Location

アドレスバーオブジェクトだね。 `window.location` で取得できるよ（ `window.` は省略可）。

`href` プロパティを使うと、URLを設定したり取得したりできるんだ。

```javascript
// 現在のアドレスを取得
console.log(location.href);
// アドレスを設定すると、自動的にジャンプするよ
location.href = "https://blog.yexca.net/"
```

### DOM

Document Object Model。マークアップ言語（HTMLとか）の各パーツをオブジェクトとして扱えるようにしたものだよ。

DOMはW3Cの標準で、HTMLやXMLドキュメントにアクセスするための標準を定義しているんだ。大きく分けて3つあるよ：

1. Core DOM - 全てのドキュメントタイプの標準モデル
  * Document：ドキュメント全体
  * Element：要素
  * Attribute：属性
  * Text：テキスト
  * Comment：コメント
2. XML DOM - XMLドキュメントの標準モデル
3. HTML DOM - HTMLドキュメントの標準モデル
  * Image: `<img>`
  * Button: `<input type='button'>`

JSはDOMを通じて、HTMLを操作できるんだ。例えば：

* HTML要素の内容を変える
* HTML要素のスタイル（CSS）を変える
* HTML DOMイベントに反応する
* HTML要素を追加したり削除したりする

HTMLの `Element` オブジェクトは `Document` オブジェクトから取得できて、その `Document` オブジェクトは `window` オブジェクトから取得するんだよ。

`Document` オブジェクトには、要素を取得するための関数がいくつか用意されているよ。

1. id属性で取得（1つの要素を返す）

```javascript
var app = document.getElementById('app');
```

2. タグ名で取得（要素の配列を返す）

```javascript
var links = document.getElementsByTagName("a");
```

3. name属性で取得（要素の配列を返す）

```javascript
var hobbys = document.getElementsByName('hobby');
```

4. class属性で取得（要素の配列を返す）

```javascript
var classes = document.getElementsByClassName('cls');
```

上の例で使ったHTML：

```html
<!DOCTYPE html>
<html lang="ja">
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

要素を取得したら、あとは書き換えるだけ。詳しい操作は [W3SchoolのHTMLオブジェクトリファレンス](https://www.w3school.com.cn/jsref/index.asp) を見てみて。

例えば、最初の `<a>` タグのテキストを変えるなら：

```javascript
// 取得
var links = document.getElementsByTagName("a");
// 変更
links[0].innerHTML = "書き換えたよ";
```

## イベントリスナー

イベントっていうのは、HTML要素の上で起きること（ボタンがクリックされた、マウスが乗った、キーが押された、とか）だよ。

イベントリスナーは、そのイベントを検知した時にJavaScriptのコードを実行させる仕組みのことなんだ。

### イベントの紐付け（バインド）

紐付けには2つの方法があるよ。方法1：HTMLタグの属性として書く。

```html
<button id="btn" onclick="on()">ボタン</button>
<script>
    function on(){
        alert("ボタンがクリックされたよ1");
    }
</script>
```

方法2：DOM要素のプロパティに代入する。

```javascript
document.getElementById("btn").onclick=function(){
    alert("ボタンがクリックされたよ2");
}
```

### よく使うイベント

| イベント名      | 説明                     |
| ----------- | ------------------------ |
| onclick     | マウスをクリックした時             |
| onblur      | フォーカスが外れた時             |
| onfocus     | フォーカスが当たった時             |
| onload      | ページや画像が読み込み終わった時 |
| onsubmit    | フォームが送信される時           |
| onkeydown   | キーボードのキーが押された時       |
| onmouseover | マウスが要素の上に乗った時     |
| onmouseout  | マウスが要素から離れた時         |
