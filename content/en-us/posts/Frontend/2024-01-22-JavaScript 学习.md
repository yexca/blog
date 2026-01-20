---
slug: 148
# layout: post
title: Learning JavaScript
author: yexca
date: 2024-01-22T19:51:24+08:00
# permalink: /archives/148
categories:
    - Tech Learning
tags:
    - Frontend
    - JavaScript
---

{{< notice >}} This article was translated by gemini-3-flash-preview {{< /notice >}}

JS is a cross-platform, object-oriented scripting language used to control webpage behavior and make pages interactive.

## Ways to Import JS

There are two main ways: internal and external scripts.

### Internal Scripts

Define JS code directly within an HTML page.

* JS code must be placed between `<script></script>` tags.
* You can place any number of `<script>` tags anywhere in the HTML document.
* Usually, scripts are placed at the bottom of the `<body>` element to improve page load speed.

```html
<script>
	alert("Hello JavaScript")
</script>
```

### External Scripts

Define JS code in an external `.js` file, then import it into the HTML page.

* External JS files contain only JS code, without `<script>` tags.

```html
<html>
    <head>
        <script src="./js/1.js"></script>
    </head>
</html>
```

JS file content:

```javascript
alert("Hello JavaScript")
```

## JS Basic Syntax

JS is case-sensitive. Semicolons at the end of lines are optional. There are two types of comments:

```javascript
// Single-line comment

/*
	Multi-line comment
*/
```

Curly braces denote code blocks.

```javascript
// Conditional statement
if(count==3){
    alert(count);
}
```

### Output Statements

You can output data to alert boxes, the HTML page, or the console.

```javascript
// Browser alert box
window.alert("Hello from alert")
// Write directly to HTML
document.write("Hello from HTML")
// Log to browser console
console.log("Hello from console")
```

### Variables

JS is a weakly typed language. Variables can hold values of different types. Variable names should follow these rules:

* Characters can be letters, digits, underscores, or dollar signs.
* Cannot start with a digit.
* CamelCase is recommended.

There are three keywords for defining variables: `var`, `let`, and `const`.

#### var

Short for "variable". Variables declared with `var` are global (or function-scoped) and can be re-declared.

```javascript
// Re-declaration
var a = 1;
var a = 'A';
alert(a);

// Global scope behavior
{
    var b = 'B';
}
alert(b);
```

#### let

Introduced in ECMAScript 6. Variables declared with `let` are block-scoped and cannot be re-declared within the same scope.

```javascript
let a = 'A';
alert(a);

// Block scope
{
    let a = 'A';
}
alert(a); // No output, throws error in console
```

#### const

Used to declare read-only constants. Once declared, the value cannot be changed.

```javascript
const a = 'A';
a = 1;
alert(a); // No output, throws error in console
```

### Data Types

JS has primitive types and reference types (objects).

There are five primitive types:

* number: Numbers (integers, decimals, NaN (Not a Number))
* string: Strings, single or double quotes are both fine
* boolean: true and false
* null: Empty object reference
* undefined: Default value when a declared variable isn't initialized

Use the `typeof` operator to check the data type.

```javascript
// number
console.log("number type");
console.log(typeof 3);
console.log(typeof 3.14);

// string
console.log("\nstring type");
console.log(typeof 'A');
console.log(typeof "string");

// boolean
console.log("\nboolean type");
console.log(typeof true);
console.log(typeof false);

// null - object
console.log("\nnull-object type");
console.log(typeof null);

// undefined
var a;
console.log("\nundefined type");
console.log(typeof a);
```

> You might wonder why `typeof null` returns "object". This is a legacy bug from the original JavaScript implementation that was kept for backward compatibility. Now, `null` is considered a placeholder for an object, explaining the contradiction, though technically it is still a primitive.
>
> Reference: <https://www.w3school.com.cn/js/pro_js_primitivetypes.asp>

### Operators

* Arithmetic: +, -, *, /, %, ++, --
* Assignment: =, +=, -=, *=, /=, %=
* Comparison: >, <, >=, <=, !=, ==, ===
* Logical: &&, ||, !
* Ternary: condition ? true : false

> `==` vs `===`
>
> `==` performs type conversion before comparing. `===` (strict equality) does not; both type and value must match to be true.

```javascript
var a = 20;
var aStr = "20";
var aInt = 20;

console.log(a==aStr); // true
console.log(a===aStr);// false
console.log(a===aInt);// true
```

### Type Conversion

Use `parseInt()` to convert strings to numbers.

Conversion starts from the first character and stops at the first non-numeric character. If the first character is non-numeric, it returns `NaN`.

```javascript
var a = "12";
var b = "12A34";
var c = "A34";

console.log(parseInt(a)); // 12
console.log(parseInt(b)); // 12
console.log(parseInt(c)); // NaN
```

Boolean conversion:

* Number: 0 and NaN are false, others are true.
* String: Empty strings are false, others are true.
* Null and undefined: Both are false.

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
// Result: -1

// String
if ("") {
    console.log("Empty string");
}
if (" ") {
    console.log("Space");
}
// Result: Space

// Null and undefined
if (null) {
    console.log("null")
}
if (undefined) {
    console.log("undefined")
}
if (1) {
    console.log("null and undefined are both false")
}
// Result: null and undefined are both false
```

### Flow Control

* if...else if...else
* switch
* for
* while
* do...while

Reference: <https://www.w3school.com.cn/jsref/jsref_statements.asp>

## Functions

Functions are blocks of code designed to perform specific tasks.

There are two ways to define them. Standard syntax:

```javascript
function functionName(var1, var2, ...){
    // code
}
```

Key points:

* Parameters don't need types.
* Return values don't need defined types; just use `return`.

```javascript
function add1(a, b){
    return a+b;
}

var result = add1(10, 20);
console.log(result); // 30
```

---

Alternative syntax (Anonymous function / Expression):

```javascript
var functionName = function(var1, var2, ...){
    // code
}
```

Example:

```javascript
var add2 = function(a, b){
    return a+b;
}

var result = add2(10, 20);
console.log(result); // 30
```

> In JS, you can call a function with any number of arguments, but it only accepts the number of parameters defined in the signature.

## Objects

Includes basic objects, Browser Object Model (BOM), and Document Object Model (DOM).

### Array

Definition method 1:

```javascript
var name = new Array(element1, element2, ...);
// e.g.
var arr = new Array(1, 2, 3, 4);
```

Definition method 2 (Literal):

```javascript
var name = [element];
// e.g.
var arr = [1, 2, 3, 4];
```

Access and assignment:

```javascript
// Access (0-indexed)
arr[2];
// Assignment
arr[4]=5;
```

> Arrays are dynamic in size and can store any data type.

```javascript
var arr = [1, 2, 3, 4];
// console.log(arr);

// Dynamic length
arr[9] = 8;
// console.log(arr);

// Mixed types
arr[8] = 'A';
console.log(arr);
```

#### Properties

The `length` property returns the number of elements. Use it to iterate.

```javascript
var arr = [1, 2, 3, 4];
for (let i = 0; i < arr.length; i++) {
    console.log(arr[i]);
}
```

#### Methods

| Method    | Description                                                           |
| --------- | --------------------------------------------------------------------- |
| forEach() | Iterates through each **defined** element and calls a callback function |
| push()    | Adds new elements to the end and returns the new length               |
| splice()  | Removes elements from an array                                        |

forEach iteration:

```javascript
var arr = [1, 2, 3, 4];
arr.forEach(function(e){
    console.log(e);
})
```

Simplify with arrow functions:

```javascript
// Arrow function: (...) => {...}
arr.forEach(e => {
    console.log(e);
});
```

push:

```javascript
var arr = [1, 2, 3, 4];
arr.push(5, 6, 7, 8);
console.log(arr); // [1,2,3,4,5,6,7,8]
```

splice:

```javascript
var arr = [1, 2, 3, 4, 5, 6, 7, 8];
// Start index, number of elements to delete
arr.splice(2, 4); 
console.log(arr); // [1,2,7,8]
```

#### Difference between iterations

A `for` loop iterates through all indices, including `undefined` holes. `forEach` only iterates over elements that actually have values.

```javascript
var arr = [1, 2, 3, 4];
arr[9] = 10;

for (let i = 0; i < arr.length; i++) {
    console.log(arr[i]);
}// 1,2,3,4,undefined,undefined,undefined,undefined,undefined,10

console.log("==============================");

arr.forEach(e => {
    console.log(e);
})// 1,2,3,4,10
```

### String

Two ways to create:

```javascript
// Method 1
var name = new String("");
// Method 2
var name = ""; // Single or double quotes
```

#### Properties and Methods

| Property/Method | Description                                           |
| --------------- | ----------------------------------------------------- |
| length          | String length                                         |
| charAt()        | Returns character at specified index                  |
| indexOf()       | Searches for a substring                              |
| trim()          | Removes whitespace from both ends                     |
| substring()     | Extracts characters between two specified indices     |

```javascript
var str = "Hello String";

console.log(str.length); // 12

// 0-indexed
console.log(str.charAt(4)); // o

console.log(str.indexOf("lo")); // 3

var s = "    Hello String    ";
s = s.trim();
console.log(s); // Hello String

// Start, End (includes start, excludes end)
s = s.substring(0, 5);
console.log(s); // Hello
```

### Custom Objects

Definition format:

```javascript
var objectName = {
    propertyName: propertyValue,
    functionName: function(params){
        
    }
}
```

Example:

```javascript
var person = {
    name: "tom",
    age: 18,
    gender: "male",
    eat: function(){
        console.log("Eating nya");
    }
}

console.log(person.age);
person.eat();
```

Method shorthand:

```javascript
var person = {
    name: "tom",
    age: 18,
    gender: "male",
    eat(){
        console.log("Eating nya");
    }
}
```

### JSON

JavaScript Object Notation. JSON is **text** written in JavaScript object notation. Because of its simple syntax and clear structure, it's widely used for data transfer across networks.

Definition:

```javascript
// Definition
var variableName = '{"key1":value1, "key2":value2}';
// Example
var userStr = '{"name":"Tom", "age":18, "addr":["Beijing", "Shanghai"]}';
```

JSON value types:

* Numbers (int or float)
* Strings (in double quotes)
* Booleans (true or false)
* Arrays (in square brackets)
* Objects (in curly braces)
* null

---

Convert object to JSON string:

```javascript
var jsonStr = JSON.stringify(jsObject)
```

Convert JSON string to object:

```javascript
var userStr = '{"name":"Tom", "age":18, "addr":["Beijing", "Shanghai"]}';
var jsObject = JSON.parse(userStr)
```

### BOM

Browser Object Model. Allows JS to "talk" to the browser. JS encapsulates browser components into objects.

* Window: Browser window object
* Navigator: Browser info object
* Screen: Screen info object
* History: Browser history object
* Location: URL bar object

#### Window

The browser window object can be used directly; the `window.` prefix is optional.

Properties:

| Property  | Description                       |
| --------- | --------------------------------- |
| history   | Read-only reference to History    |
| location  | Location object for the window    |
| navigator | Read-only reference to Navigator  |

Methods:

| Method        | Description                                       |
| ------------- | ------------------------------------------------- |
| alert()       | Shows an alert box with a message and OK button   |
| confirm()     | Shows a dialog with message, OK, and Cancel       |
| setInterval() | Calls a function repeatedly at specific intervals  |
| setTimeout()  | Calls a function once after a specific delay      |

```javascript
// Get window object
window.alert("Using window object");
// Omit prefix
alert("Window omitted");

// confirm
var flag = confirm("Are you sure?");
console.log(flag);

// Timer 1
var i = 0;
setInterval(function(){
    i++;
    console.log("Timer ran "+i+" times");
}, 2000); // Every 2 seconds

// Timer 2
setTimeout(function(){
    console.log("Runs only once");
}, 3000); // Once after 3 seconds
```

#### Location

Address bar object, accessed via `window.location` (or just `location`).

The `href` property can set or return the full URL.

```javascript
// Get current URL
console.log(location.href);
// Set URL (triggers redirect)
location.href = "https://blog.yexca.net/"
```

### DOM

Document Object Model. Encapsulates parts of the markup language into objects.

DOM is a W3C standard for accessing HTML and XML documents, split into three parts:

1. Core DOM - Standard model for all document types
  * Document: Entire document
  * Element: Element objects
  * Attribute: Attribute objects
  * Text: Text content
  * Comment: Comment objects
2. XML DOM - Standard model for XML
3. HTML DOM - Standard model for HTML
  * Image: `<img>`
  * Button: `<input type='button'>`

Via DOM, JS can manipulate HTML:

* Change content
* Change styles (CSS)
* React to events
* Add/Remove elements

HTML Element objects are retrieved via the `document` object (which comes from `window`).

Retrival functions:

1. By `id`: Returns a single Element.

```javascript
var app = document.getElementById('app');
```

2. By tag name: Returns an array of Elements.

```javascript
var links = document.getElementsByTagName("a");
```

3. By `name` attribute: Returns an array of Elements.

```javascript
var hobbys = document.getElementsByName('hobby');
```

4. By `class` attribute: Returns an array of Elements.

```javascript
var classes = document.getElementsByClassName('cls');
```

HTML Example for above:

```html
<!DOCTYPE html>
<html lang="en">
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

Once you have the element, you can modify it. Check the HTML Object reference on W3School for more.

Example: Changing text of the first `<a>` tag:

```javascript
// Get
var links = document.getElementsByTagName("a");
// Modify
links[0].innerHTML = "Updated Value";
```

## Event Listening

Events are things that happen to HTML elements, like clicks, mouse movement, or key presses. JS can execute code when these events are detected.

### Event Binding

Method 1: Binding via event attributes in HTML tags.

```html
<button id="btn" onclick="on()">Button</button>
<script>
	function on(){
    	alert("Button clicked 1");
	}
</script>
```

Method 2: Binding via DOM element properties.

```javascript
document.getElementById("btn").onclick=function(){
    alert("Button clicked 2");
}
```

### Common Events

| Event Name  | Description                            |
| ----------- | -------------------------------------- |
| onclick     | Mouse click                            |
| onblur      | Element loses focus                    |
| onfocus     | Element gains focus                    |
| onload      | Page or image finished loading         |
| onsubmit    | Form submission                        |
| onkeydown   | Key is pressed                         |
| onmouseover | Mouse moves over an element            |
| onmouseout  | Mouse moves out of an element          |
