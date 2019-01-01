---
title: Js基础笔记
date: 2018-03-04 21:42:07
tags: javascript
---

Github关于js面试题的知识整理，这里慢慢积累~

### 解释事件委托

事件委托是一种利用事件冒泡机制，只监听父元素而不用监听每个子元素的技术。

优点：只有父元素需要一个监听器，不需要每个子元素都去监听，减少了内存占用

​       避免了对子元素的繁杂处理，可以只针对父元素进行处理

例子：

- e.target 点击元素
- e.currentTarget 当前元素

```
<style>
    #par {
      background: blue;
      width: 100px;
      height: 600px;
    }
</style>
<body>
    <div id="par">
      <div id="child1">Item 1</div>
      <div id="child2">Item 2</div>
      <div id="child3">Item 3</div>
      <div id="child4">Item 4</div>
      <div id="child5">Item 5</div>
    </div>
</body>
<script>
    document.getElementById("par")
            .addEventListener("click", function(e) {
              console.log(e.target);
              console.log(e.currentTarget);
    });
</script>
```

### 解释js中的this如何工作

关键：this的值取决于函数怎样被调用

- 使用了 `new` ，则 `this` 指向函数内部

  ```
  function Constructor() {
     console.log(this);
     this.value = 10;
     console.log(this);
  }

  new Constructor();
  // Constructor{}
  // Constructor{value: 10}
  ```

- 使用了 `apply` `call` 或 `bind`  , `this` 指向作为参数传入的对象

  ```
  function fn() {
      console.log(this);
  }
  var obj = {
      value: 5
  };
  var boundFn = fn.bind(obj);
  boundFn();     // -> { value: 5 }  // 这里bind只是作为定义绑定了this
  fn.call(obj);  // -> { value: 5 }
  fn.apply(obj); // -> { value: 5 }
  ```

- 作为方法调用，如 `obj.method()`，`this` 指向这个函数属性的对象

  ```
  var obj = {
      value: 5,
      printThis: function() {
          console.log(this);
      }
  };
  obj.printThis(); // -> { value: 5, printThis: ƒ }
  ```

- 以上都没有，则 `this` 指向全局对象即 window，在严格模式下是undefined

  ```
  function fn() {
      console.log(this);
  }
  fn(); // -> Window {stop: ƒ, open: ƒ, alert: ƒ, ...}
  ```

- 以上两种以上方式，则优先级更高的规则决定 `this` 的值

- ES6箭头函数中，this 指向函数创建时作用域的值，忽略以上所有规则

扩展：[this](https://codeburst.io/the-simple-rules-to-this-in-javascript-35d97f31bde3)

### 解释原型继承如何工作

所有的js对象都有一个 `prototype` 属性，指向这个对象的原型对象

- 当一个属性被访问时，如果直接存在这个对象中则输出
- 如果不存在这个对象中则通过原型链去找它的原型对象，直到找到这个属性或者原型链末端
- 这个机制模拟了经典的继承但实际上更像是委托

### 对于AMD和CommonJS如何认识

两种方式都是用来实现模块系统，这个概念直到ES6才在js中出现

- CommonJS是同步的，为了服务端开发而设计，语法更接近于其它语言的风格，同时使用服务器端与浏览器端开发之间js切换开销也更小
- AMD是异步的，支持异步加载模块，更像是为了浏览器端开发而设计，但是语法风格冗杂，而且大部分时候不是必要的，特别是js只放在一个模块包时
- ES6中支持同步与异步加载模块，使得我们可以坚持用一种方法，虽然现在并没有在浏览器与Node端完全展开，但我们可以使用转换程序来转换代码

### 解释`function foo(){}()` 为什么没有像IIFE一样工作，需要修改哪些内容才能使它成为一个IIFE

IIFE 的含义是立即执行函数表达式，js解析器读取 `function foo(){}()` 成 `function foo(){}` 和 `()` ，前者是一个函数声明而后者是一个括号尝试调用一个函数但是并没有特别声明，因此会报错

- 修改：`(function foo() {})()`  or `(function foo() {}())`  它们不会在全局范围内公开，所以我们甚至可以省略 `foo` 

### `null`  ` undefined`  `undeclared` 之间的区别，怎样检查它们

- `undeclared` 变量是创建一个变量赋值时没有使用 `var` `let` 或 `const` ，这会导致它成为一个全局变量，在严格模式下会报 `ReferenceError` ，所以尽量避免使用，可以将它放入 try/catch块中检查

  ```
  function foo() {
    x = 1; // Throws a ReferenceError in strict mode
  }

  foo();
  console.log(x); // 1
  ```

- `undefined` 变量是已经被 `declared` 但是没有赋值，如果一个函数没有任何返回值也是 `undefined` ，可以使用 `===` 或者 `typeof` 去检查，如果使用 `==` 检查则 `null` 也会返回 `true`

  ```
  var foo;
  console.log(foo); // undefined
  console.log(foo === undefined); // true
  console.log(typeof foo === 'undefined'); // true

  console.log(foo == null); // true. Wrong, don't use this to check!

  function bar() {}
  var baz = bar();
  console.log(baz); // undefined
  ```

- `null` 变量是明确地被赋值为 `null` 的变量，代表没有值（与`undefined`不同）,使用 typeof 检查返回 object,  同样必须使用 `===`  比较检查，否则 `undefined` 也会返回 `true`

  ```
  var foo = null;
  console.log(foo === null); // true

  console.log(foo == undefined); // true. Wrong, don't use this to check!
  ```

### 解释闭包，如何使用

闭包是函数与函数声明时词法作用域的结合，词法的意思是词汇范围界定使用在源代码声明变量的位置来确定变量的位置(?)，闭包就是在外部函数返回以后也可以访问外部函数中变量作用域链的函数

使用场景：

- 用闭包实现数据隐私或是模拟private方法，模块模式中经常用到

- 部分应用程序嵌套调用的场合

  ​

### 描述 `forEach` 和 `map` 循环的区别，如何抉择
forEach

- 遍历数组中的所有元素

- 每个元素都执行回调函数

- 没有返回值

  ```
  const a = [1, 2, 3];
  const doubled = a.forEach((num, index) => {
    // Do something with num and/or index.
  });

  // doubled = undefined
  ```

map

- 遍历数组中的所有元素

- 每个元素都执行回调函数返回一个新元素，最终结果返回一个新数组

  ```
  const a = [1, 2, 3];
  const doubled = a.map(num => {
    return num * 2;
  });

  // doubled = [2, 4, 6]
  ```

主要区别：map 返回一个新数组而 forEach 不返回，即如果需要不影响原有数组的结果使用 map 更好，如果不在意原有数组的影响可以使用forEach

扩展：

filter

- 遍历数组所有元素

- 每个元素执行回调函数做判断，true保留，false取出，最终返回一个过滤的数组

  ```
  let ages = data.filter((animal) => {
    return animal.type === 'dog';
  })
  ```

reduce

- 遍历数组所有元素

- 每个元素执行回调函数，至少接收两个参数，专为累加这类操作而设计，最终返回一个相加的总和

  ```
  .reduce((sum, animal) => {
    return sum + animal.age;
  });
  ```

扩展阅读：[map、filter、reduce](https://codeburst.io/javascript-learn-to-chain-map-filter-and-reduce-acd2d0562cd4)

### 匿名函数的典例

- IIFE，避免变量泄露到全局

  ```
  (function() {
      // some code.
  })();
  ```

- 一次性使用的回调，在调用它们的代码内部进行声明时会更具有可读与自包含性

  ```
  setTimeout(function() {
      console.log("hei");
  }, 1000);
  ```

- 函数式编程或者Loadsh的参数（类似于回调）

  ```
  const arr = [1, 2, 3];
  const double = arr.map(funtion(e) {
      return e*2;
  });
  console.log(double);
  ```

### 怎样组织自己的代码，比如模块模式或者经典继承

一开始会使用面向对象的方式创建Backbobe模型并添加方法

但现在更好的趋势是使用基于React/Redux鼓励单向函数编程方式的Flux体系结构，使用普通对象与编写实用纯函数来操作这些对象，并且使用 actions 和 reducers 来处理状态

关于经典继承的扩展阅读  [new rules](https://medium.com/@dan_abramov/how-to-use-classes-and-sleep-at-night-9af8de78ccb4)

后续学深入再重新理解这个问题 ==