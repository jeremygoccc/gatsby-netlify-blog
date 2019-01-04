---
title: 从五个规则来介绍 this
date: 2019-01-04 20:47:59
tags: 写作计划
---



在文章开始以前我们先做一道题: 

```js
window.name = "window";

function User(name) {
  this.name = name;
  this.greet1 = function() {
    console.log(this.name);
  };
  this.greet2 = function() {
    return function() {
      console.log(this.name);
    };
  };
  this.greet3 = function() {
    return () => console.log(this.name);
  };
}

const UserA = new User("UserA");
const UserB = new User("UserB");

UserA.greet1();
UserA.greet1.call(UserB);

UserA.greet2()();
UserA.greet2.call(UserB)();

UserA.greet3()();
UserA.greet3.call(UserB)();
```

你可以自己先试着写出答案，如果你想检验自己的答案可以直接移到文末，我们也会在最后进行解析。

本文将会从以下五个规则来介绍 `JavaScript` 中的 *this* :

- 隐式绑定
- 显式绑定
- *new* 绑定
- 词法绑定
- *window* 绑定

## 隐式绑定

首先让我们看一段代码: 

```js
const user = {
    name: 'Jeremy',
    greet () {
        console.log(`My name is ${this.name}`)
    }
}
```

让我们调用 `user` 对象中的 `greet` 方法:

```js
user.greet();  // My name is Jeremy
```

我们可以看到，当我们通过 `user` 对象来调用它的方法 `greet` 时，`greet` 中的 `this` 指向的就是 `user` 对象，这就是隐式绑定的关键: **当函数引用有上下文对象时，隐式绑定会把函数调用中的 `this` 绑定到这个上下文对象**，因此这里的 `this.name` 等同于 `user.name`。

让我们稍微扩展一下: 

```js
const user = {
    name: 'Jeremy',
    greet () {
        console.log(`My name is ${this.name}`)
    },
    son: {
        name: 'lap',
        greet () {
            console.log(`My name is ${this.name}`)
        }
    }
}
```

调用 `user.son.greet()` 的结果是否符合你的预期呢?

现在让我们改写一下代码:

```js
function greet () {
    console.log(`My name is ${this.name}`)
}

const user = {
    name: 'Jeremy'
}
```

我们将 `greet` 拆成了独立的函数，现在我们该怎么做让 `greet` 中的 `this` 指向 `user` 对象呢 ?

## 显示绑定

在 JavaScript 中，每一个函数都有一个方法可以让你实现这个功能 (即改变 `this` 的指向) ，这就是 `call`:

> **`call()`** 方法调用一个具有给定 `this` 值的函数, 以及分别提供的参数(**参数的列表**)。

因此我们可以这样调用: 

```js
greet.call(user)
```

这就是 **显示绑定** 的含义，我们显示地(使用 `.call` )指定了 `this` 的指向。

如果我们想给 `greet` 传入一些参数，这就需要用到 `call` 方法的其余参数: 

```js
function greet (l1, l2, l3) {
    console.log(`My name is ${this.name} and I know ${l1}, ${l2} and ${3}`)
}

const user = {
    name: 'Jeremy'
}

const languages = ['JavaScript', 'Java', 'PHP']

greet.call(user, languages[0], languages[1], languages[2]) // My name is Jeremy and I know JavaScript, Java and PHP
```

当我们实际实践这些代码的时候就会发现把 `languages` 数组一个一个传进去是很烦人的，在这种情况下我们有一个更好的选择 `.apply`: 

>  **`apply()`** 方法调用一个具有给定 `this ` 值的函数，以及作为一个数组（或[类似数组对象](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Indexed_collections#Working_with_array-like_objects)）提供的参数。

`.apply` 与 `.call` 唯一的区别就是传入参数的方式，因此我们可以这样调用:

```js
greet.apply(user, languages) // My name is Jeremy and I know JavaScript, Java and PHP
```

最后介绍的方法是 `.bind` :

> **`bind() `**方法创建一个新的函数，在调用时设置 `this `关键字为提供的值。并在调用新函数时，将给定参数列表作为原函数的参数序列的前若干项。

`.bind` 和 `.call` 类似，区别在于不同于 `.call` 的立即调用，`.bind` 会返回一个新函数可以让你**之后再调用**:

```js
const newFn = greet.bind(user, languages[0], languages[1], languages[2])
newFn() // My name is Jeremy and I know JavaScript, Java and PHP
```

## new 绑定

让我们看新的一段代码:

```js
function User (name) {
    this.name = name
}

const me = new User('Jeremy')
console.log(me.name) // Jeremy
```

`JavaScript` 中的 `new` 使用起来跟传统面向类的语言一样，但内部机制是完全不一样的，当我们使用 `new` 来调用函数，或者说发生构造函数调用时，会执行以下操作:

- 创建一个新对象
- 将这个对象链接到原型上
- 将这个对象绑定到函数调用的 `this` 上
- 如果该函数没有返回其它对象，那么就返回这个新对象

## 词法绑定

上述介绍的四种规则已经可以包含所有的正常函数，但是在 `ES6` 中介绍了一种特殊的函数: 箭头函数。

> **箭头函数表达式**的语法比[函数表达式](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/function)更短，并且没有自己的 [this](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/this)，[arguments](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Functions/arguments)，[super](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/super)或 [new.target](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/new.target) 。这些函数表达式更适用于那些本来需要匿名函数的地方，并且它们不能用作构造函数。

箭头函数没有自己的 `this` ，根据外层(函数或者全局)作用域来决定 `this` 。

让我们再来改写一下代码: 

```js
const user = {
    name: 'Jeremy',
    languages: ['JavaScript', 'Java', 'PHP'],
    greet () {
        return function () {
            console.log(this.name);
        }
    }
}
```

我们在 `greet` 方法中返回了一个函数，当我们试着调用 `user.greet()()` 时，返回的是 `undefined `。

出现这个的原因是我们调用返回的函数时没有绑定的上下文对象(默认就变成了 `window` )，因此很直接的一种想法就是我们运用 **显式绑定** ，更改代码如下: 

```js
const user = {
    name: 'Jeremy',
    languages: ['JavaScript', 'Java', 'PHP'],
    greet () {
        return function () {
            console.log(this.name);
        }.bind(this)
    }
}

user.greet()() // Jeremy
```

那我们如果用 **箭头函数** 来改写呢 ? 

```js
const user = {
    name: 'Jeremy',
    languages: ['JavaScript', 'Java', 'PHP'],
    greet () {
        return () => {
            console.log(this.name);
        }
    }
}

user.greet()() // Jeremy
```

箭头函数 `this` 的查找规则其实与 **变量查找** 类似，在 `ES6` 以前我们就在使用一种几乎等效的模式: 

```js
var user = {
    name: 'Jeremy',
    languages: ['JavaScript', 'Java', 'PHP'],
    greet () {
        var self = this;
        return function () {
            console.log(self.name);
        }
    }
}

user.greet()() // Jeremy
```
## window 绑定

最后让我们重新看这一段代码:

```js
function greet () {
    console.log(`My name is ${this.name}`)
}

const user = {
    name: 'Jeremy'
}
```

如果我们直接调用 `greet` 会发生什么 ?

```js
greet() // My name is undefined
```

这就引出了我们最后一个规则，如果我们没有 **隐式绑定** (对象调用)，也没有 **显式绑定** (`.call` ，`.apply` ，`.bind`) 或是 **new 绑定**，那么 `JavaScript` 会默认将 `this` 指向 `window` 对象: 

```js
window.name = 'window'

function greet () {
    console.log(`My name is ${this.name}`)
}

const user = {
    name: 'Jeremy'
}

greet() // window
```

> 在 ES5 中，如果你启动了**严格模式**，那么 `JavaScript` 会将 `this` 保持为 `undefined `。

## 总结

我们来总结一套判断 `this` 指向的流程: 

- 首先看函数在哪里被调用。
- 函数是通过对象来调用( . 左边是一个对象)吗? 如果是，`this` 指向这个对象，如果不是，继续。
- 函数是通过 `.call` ，`.apply` 或者`.bind` 来调用吗? 如果是，`this` 指向指定的上下文对象，如果不是，继续。
- 函数是通过 `new` 关键字来调用吗? 如果是，`this` 指向新创建的对象，如果不是，继续。
- 函数是一个箭头函数吗? 如果是，`this` 指向箭头函数向外第一个非箭头函数的函数，如果不是，继续。
- 运行环境是严格模式吗? 如果是，`this` 是 `undefined`，如果不是，继续。
- `this` 指向 `window` 对象。

最后回到文章开始的题目，先给出运行的答案: 

```js
window.name = "window";

function User(name) {
  this.name = name;
  this.greet1 = function() {
    console.log(this.name);
  };
  this.greet2 = function() {
    return function() {
      console.log(this.name);
    };
  };
  this.greet3 = function() {
    return () => console.log(this.name);
  };
}

const UserA = new User("UserA");
const UserB = new User("UserB");

UserA.greet1();  // UserA
UserA.greet1.call(UserB); // UserB

UserA.greet2()();  // window
UserA.greet2.call(UserB)(); // window

UserA.greet3()();  // UserA
UserA.greet3.call(UserB)();  // UserB
```

`UserA` 与 `UserB` 分别通过 `new` 构造出来，则对应的 `name` 分别为 `UserA` 和 `UserB`

- `UserA.greet1()` : 首先 `greet1` 由 `UserA` 调用，则 `greet1` 内的 `this` 指向 `UserA`，所以输出 `UserA`
- `UserA.greet1.call(UserB)`： `greet1` 通过 `.call` 调用，指定的对象是 `UserB`，所以输出 `UserB`
- `UserA.greet2()()`：首先 `greet2` 通过 `UserA` 调用，返回了一个没有绑定上下文对象的函数，所以此时输出为 `window`
- `User.greet2.call(UserB)()`：这里 `gree2` 通过 `.call` 指定 `UserB` 调用，但是同样返回了一个没有绑定上下文对象的函数，所以输出依然为 `window`
- `UserA.greet3()()`：这里返回的是词法绑定的箭头函数，绑定的上下文对象为 `UserA`，所以输出 `UserA`
- `UserA.gree3.call(UserB)()`：这里同样返回了箭头函数，绑定的上下文对象为通过 `.call` 指定的 `UserB`，所以输出 `UserB`