---
title: ES6基础概念
date: 2017-11-23 19:14:24
tags: javascript
---

# let命令
### 基本用法

► 用来声明变量，类似于 **var**，但只在 **let** 命令所在的代码块内有效


```
{
    let a = 10;
    var b = 1;
}

a // ReferenceError
b // 1
```


► 使用 **let** ，声明的变量只在块级作用域内有效，因此 **for** 循环的计数器很适合用 **let** 命令

► **for** 循环还有一个特别之处，设置循环变量的那部分是一个副作用域，而循环体内部是一个单独的子作用域

```
for (let i = 0; i < 3; i++) {
    let i = 'abs';
    console.log(i);
}
```


### 不存在变量提升

► **var** 命令会有变量提升，也就是变量可以在声明之前使用，值为 **undefined**

► **let** 命令改变了这种语法行为，它所声明的变量一定要在声明后使用，否则就报错

### 暂时性死区

► 只要块级作用域内存在 **let** 命令，它所声明的变量就绑定这个区域，不受外部的影响

```
var tmp = 123;

if(true) {
    tmp = 'abc';  //ReferenceError
    let temp;
}
```
► 上述代码中虽然存在全局变量 **tmp**,但是块级作用域内 **let** 又声明了一个局部变量 **tmp**，导致后者绑定了这个块级作用域，所以在 **let** 声明变量之前，对 **tmp** 赋值都会报错

► ES6 明确规定，区块中如果存在 **let** 和 **const** 命令，在语法上，这个区块就形成了"暂时性死区"

► 这也意味着 **typeof** 命令不再是一个百分百安全的操作，这样规定暂时性死区和 **let**、**const** 语句不出现变量提升，主要就是为了防止变量在声明前就使用它从而减少错误

### 不可重复声明

► **let** 不允许在相同作用域内，重复声明同一个变量，也即不能在函数内部重新声明参数

```
function func(arg) {
    let arg;  //执行会报错
}

function func(arg) {
    {
        let arg;  //不会报错
    }
}
```


# const命令
### 基本用法

► 用来声明一个只读的常量，一旦声明，值就不能改变，这也意味着，**const** 一旦声明变量就必须立即初始化，不能留到之后再赋值，其它与 **let** 命令类似

### 本质

► **const** 实际保证的，不是变量的值不能改动，而是变量所指向的内存地址不能改动

```
const foo = {};

//添加属性可以成功
foo.prop = 123;
foo.prop;

//指向另一个对象就会报错
foo = {};
```

# 箭头函数
### 基本用法
► ES6 允许使用“箭头”（=>）定义函数

```
var f = v => v;

//等同于
var f = function(v) {
    return v;
};
```
► 如果箭头函数不需要参数或者需要多个参数，就使用圆括号

```
var f = () => 5;
//等同于
var f = function() {
    return 5;
};

var sum = (num1,num2) => num1 + num2;
//等同于
var sum = function(num1,num2) {
    return num1 + num2;
}
```
► 代码块多于一条语句的话就要用大括号括起来并且使用 **return** 语句返回

► 由于大括号被解释为代码块，所以箭头函数返回的是一个对象的话，必须在对象外面加上括号

```
var getTempItem = id => ({ id: id, name: "Temp"});
//等同于
var getTempItem = function(id) {
    return { id: id, name: "Temp"};
};
```

► 箭头函数使表达式更简洁
```
const isEven = n => n % 2 == 0;
const square = n => n * n;
```
► 其它用途...

### 使用注意点

► 函数体内的 **this** 对象，就是定义时所在的对象，而不是使用时所在的对象

► 不可以当作构造函数，即不能使用 **new** 命令

► 没有 **arguments** 对象，需要的话可以用 **rest** 参数代替

► 不能使用 **yield** 命令，所以箭头函数不能用作 **Generator** 函数

尤其注意第一点，在箭头函数中 **this** 对象的指向是固定的

```
function foo() {
    setTimeout(() => {
        console.log('id:', this.id);
    },100);
}

var id = 21;

foo.call({ id: 42 });  // id: 42
```

► 上例中 **setTimeout** 的参数是一个箭头函数，它的定义生效在  **foo** 函数生成时，真正执行就要等到100ms后，如果是普通函数的话，执行时 **this** 应该指向全局对象 **window** ，即输出 **21** ，但箭头函数导致this总是指向函数定义生效时所在的对象( **{id: 42}** )，所以输出 **42** .

► **this** 指向的固定化，不是箭头函数内部有这样的机制，而是它没有自己的 **this**，所以它内部的 **this** 就是外层代码块的 **this** ,这也是它不能用作构造函数的原因

所以箭头函数转换成ES5的代码如下：

```
function foo() {
    setTimeout(() => {
        console.log('id: ',this.id);
    },100);
}

function foo() {
    var _this = this;
    setTimeout(function() {
        console.log('id: ',_this.id);
    },100);
}
```

# 对象和数组

### 数组的解构赋值
► ES6 允许按照一定模式，从数组和对象中提取值同时对变量进行赋值，这被称为 **解构**

```
let [a,b,c] = [1,2,3];
```
上面的代码中从数组中提取值并按照对应位置对变量赋值

本质上这种写法属于"模式匹配", 只要等号两边的模式相同，左边的变量就会被赋予对应的值, 如果不完全解构即左边的模式只匹配一部分的右边的数组，解构也成功

一些例子：
```
/*完全解构*/
let [ , , third] = ['foo', 'bar', 'baz'];
third // 'baz'

let [head, ...tail] = [1,2,3,4];
head // 1
tail // [2,3,4]

/*不完全解构*/
let [x, y] = [1, 2, 3];
x // 1
y // 2

let [a, [b], d] = [1, [2, 3], 4]
a // 1
b // 2
d // 4
```
事实上，只要某种数据结构具有 **Iterator** 接口，都可以采用数组形式的解构赋值

### 对象的解构赋值

► 对象的解构与数组有一个重要的不同。数组的元素是按次序排列的，变量的取值由它的位置决定；而对象的属性没有次序，变量必须与属性同名才能正确取到值

```
let { bar, foo } = { foo: "aa", bar: "cc" };
foo // "aa"
bar // "cc"

let { baz } = { foo: "aa", bar: "cc" };
baz // undefined

/*变量名与属性名不一致的写法*/
let { foo: baz } = { foo: 'aa', bar: 'cc' };
baz // "aa"
```
变量名与属性名不一致的写法实际上说明，对象的解构赋值是下面形式的简写：

```
let { foo: foo, bar: bar } = { foo: "aa", bar: 'cc' };
```
即对象的解构赋值是先找到同名属性，再赋给对应的变量。真正被赋值的是后者而不是前者

► 对象的解构赋值，可以很方便地将现有对象的方法赋值给对应的变量

```
let { log, sin, cos } = Math;
```

解构赋值的规则是，只要等号右边的值不是对象或数组，都会先将其转为对象

### 用途


```
/*交换变量的值*/
let x = 1;
let y = 2;

[x, y] = [y, x]
```

```
/*从函数返回多个值*/

// 返回一个数组
function example() {
    return [1, 2, 3];
}
let [a, b, c] = example();

//返回一个对象
function example() {
    return {
        foo: 1,
        bar: 2
    };
}
let { foo, bar } = example();
```

```
/*函数参数的定义*/

// 参数是一组无次序的值时
function f({ x, y, z }) { ... }
f({ z: 3, y: 5, x: 0 })
```

```
/*提取JSON数据*/
let jsonData = {
    id: 42,
    data: [860, 504]
};

let { id, data: number } = jsonData;
```

```
jQuery.ajax = function(url, {
    async = true,
    beforeSend = function() {},
    cache = true,
    complete = function() {},
    crossDomain = false,
    global = true,
    // ... more config
}) {};
```

```
/* 输入模块的指定方法 */

const { SourceMapConsumer, SourceNode } = require("source-map");
```