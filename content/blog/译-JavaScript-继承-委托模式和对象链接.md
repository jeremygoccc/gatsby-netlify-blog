---
title: '[译]JavaScript-继承,委托模式和对象链接'
date: 2018-12-31 11:28:02
tags: 写作计划
---

> 学习 JavaScript (原型继承) 中的继承，行为/对象委托模式和关联到其它对象的对象



## 什么是继承

在大多数基于类的面向对象语言中，继承是一种让一个对象可以获得另一个对象所有的属性和方法的机制．虽然在 `ES2015` 中 提出了 `class` 关键字但 `JavaScript` 并不是一门基于类的语言，它仅仅只是语法糖，本质上还是原型链的方式．

## 经典继承与原型继承

![](http://ww1.sinaimg.cn/large/e4336439gy1fyq02t1mzbj21680kqmym.jpg)

### 经典继承（非 JavaScript）

- `Vehicle` 是 `v1` 的父类，`v2` 是 `Vehicle` 的实例
- `Car` 是 `Vehicle` 的子类而 `c1` 和 `c2` 是 `Car` 的实例
- 当我们继承类时，经典继承创建了一个来自父类行为的拷贝到子类中，然后父子类就是独立的实体了
- 这就像是汽车是用工具以及汽车图纸造出来的，但造完以后两者都是独立的个体，因为它就是一份拷贝所以它们之间没有关联，这就是所有箭头向下(属性和行为向下传递)的原因

### 原型继承（行为委托模式）

- `v1` 和 `v2` 关联到 `Vehicle.prototype` 因为它们是通过 *new* 创建的
- 同样的，`c1` 和 `c2` 关联到 `Car.prototype` 而 `Car.prototype` 关联到 `Vehicle.prototype` 
- 在 `JavaScript` 中当我们创建一个对象时，它不是复制属性或者行为，而是创建一个链接. 在继承一个类时也会创建类似的链接
- 与经典的非 `JavaScript` 继承相比，所有链接向着相反的方向，因为它是行为委托链接. 这些链接称为原型链
- 这个模式称为*行为委托模式*，通常称为 `JavaScript` 中的 **原型继承**

> 你可以通过这篇文章 [JavaScript-原型](https://codeburst.io/javascript-prototype-cb29d82b8809) 去深入理解 **原型链**

### 原型继承的例子

- 使用 `Object.create()` 实现经典继承
- 在下列代码片段中，`Car.prototype` 和 `Vehicle.prototype` 在 `Object.create()` 函数的帮助下相连接

```js
// Vehicle - 超类
function Vehicle (name) {
    this.name = name;
}
// 超类的方法
Vehicle.prototype.start = function () {
    return "engine of " + this.name + " starting...";
}

// Car - 子类
function Car (name) {
    Vehicle.call(this, name); //  调用超类的构造函数
}
// 子类扩展超类
Car.prototype = Object.create(Vehicle.prototype);
// 子类的方法
Car.prototype.run = function () {
    console.log("Hello " + this.start());
}

// 子类的实例
var c1 = new Car("Fiesta");
var c2 = new Car("Baleno");

// 访问 内部访问了超类方法 的子类方法
c1.run();   // "Hello engine of Fiesta starting..."
c2.run();   // "Hello engine of Baleno starting..."
```

- 在上述代码中，由于下面的原型链，对象 `c1` 可以访问到 `run()` 方法和 `start()` 方法. 如下图所示，我们可以看到 `c1` 没有这样的方法，但它有向上的链接. 
- 上面代码中的 `this` 只不过是每个方法当前的执行上下文，即 `c1` 和 `c2` .

> 你可以浏览这篇文章 [JavaScript-关于 this 和 new 的所有内容](https://codeburst.io/all-about-this-and-new-keywords-in-javascript-38039f71780c) 来详细了解 **this** 关键字

上述代码的图解表示: 

![](http://ww1.sinaimg.cn/large/e4336439gy1fyq03lccgij20rf0kqgp7.jpg)

### 与其它对象关联的对象

- 现在我们将会简化先前的继承示例代码，只关注对象与对象之间的链接.
- 所以我们将会尝试移除 *.prototype*，*constructor* 和 *new* 关键字，只考虑对象.
- 我们将会使用 `Object.create()` 函数来创建函数之间的所有链接.

下面是先前示例代码的简化版: 

```js
// 包含初始化方法的基础对象
var Vehicle = {
    init: function (name) {
        this.name = name;
    },
    start: function () {
        return "engine of " + this.name + "starting...";
    }
}

// 在子对象和基础对象之间创建的委托链接
var Car = Object.create(Vehicle);

// 子对象的方法
Car.run = function () {
    console.log("Hello " + this.start());
};

// 具有委托链接的实例对象指向子对象
var c1 = Object.create(Car);
c1.init('Fiesta');

var c2 = Object.create(Car);
c2.init('Baleno');

c1.run();   // "Hello engine of Fiesta starting..."
c2.run();   // "Hello engine of Baleno starting..."
```

上述代码的图解展示

![](http://ww1.sinaimg.cn/large/e4336439gy1fyq042suhzj20gc0ejgn6.jpg)

- 现在我们可以看到，我们如何消除了*new*，所有*.prototype*，构造函数和调用方法的复杂性，并且仍然实现了相同的结果.
- 唯一重要的是 `c1` 链接到一个对象然后再链接到另一个对象，依次类推.
- 这也被称作对象委托模式.

## 总结

为了规避复杂性，在代码中使用原型继承与原型链前先理解它们是很重要的.



参考:  You Don't Know JS 系列丛书