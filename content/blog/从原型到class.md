---
title: 从原型到class
date: 2018-11-30 20:18:54
tags: javascript
---



本文将会从原型介绍到原型实现继承与 ES6 的 `class` 实现继承并进行对比~

### 原型

JavaScript 并不是一门纯面向对象的语言，而是一门基于原型的动态类型语言．

- 每一个 js 对象都有一个特殊的内置 [[Prototype]] 属性，这个属性我们不能直接访问到，需要借助另一个 `__proto__` 属性，这个属性即指向了原型，而原型也是一个对象，这个对象当中定义了很多函数可以让我们使用(类似超类)
- 在原型对象中还有一个 `constructor` 属性，也就是构造函数，而这个构造函数又通过 `prototype` 属性指回原型（除了 `Function.prototype.bind()`，因为这个对象是由引擎创建出来的）
- 多个对象通过 `__proto__` 属性连接起来就形成了原型链

这里把经典的图放上来对照着理解：

![原型与原型链](https://user-gold-cdn.xitu.io/2018/11/16/1671d387e4189ec8?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

总结：

- `Object` 是所有对象的祖先，即所有对象都可以通过 `__proto__` 找到它
- `Function` 是所有函数的祖先，即所有函数都可以通过 `__proto__` 找到它
- 对象都是通过 `Function`  (构造器)创建的，即有 `Object.__proto__ === Function.prototype`
- 函数也是由 `Function ` 创建的，自然也有 `Fucntion.__proto__ === Function.prototype`
- 除了 `Function.prototype` 和 `Object.prototype` 由引擎创建，其余都是通过 `Function` new 出来的
- `__proto__` 将对象和原型连接起来形成了原型链，原型链最终为 `null`

### new

调用 `new` 的过程中会发生四件事情：

- 新生成一个中间对象
- 将这个中间对象链接到原型
- 绑定这个对象的 this 到构造函数上
- 返回该中间对象

实现一下：

```js
function create () {
    let obj = new Object()
    let Con = [].shift.call(arguments)
    obj.__proto__ = Con.prototype
    let res = Con.call(obj, arguments)
    return typeof res === 'object' ? res : obj
}
```

从这里可以看出两点：

- 通过 `new` 生成的对象 this 是永久绑定到对应构造函数的

- 创建对象最好使用字面量的方式，使用 `new Obejct()` 需要通过作用域链一层层向上找到 `Object` 并且可读性也不好 (内部都是通过 `new Object()` 方式，但是如果我们自己采用 `new Object()` ，引擎就会认为可能存在同名的构造函数而选择通过作用域链一层一层找至全局)

### instanceof

`instanceof` 可以正确的判断对象的类型，内部机制是通过判断该对象的原型链中是否能找到类型的 `prototype`

实现一下：

```js
function instanceof (obj, type) {
    let prototype = type.prototype
    obj = obj.__proto__
    while (true) {
        if (obj === null) return false
        if (prototype === obj) return true
        obj = obj.__proto__
    }
}
```

PS： `instanceof` 可不可以直接被用来判断基本类型？（自定义 `instanceof` 行为）

### 继承

#### 原型继承

##### 组合继承

在子类的构造函数中通过 `Parent.call(this)` 继承父类的属性，然后再改变子类的原型为继承父类的函数

```js
function Parent (value) {
    this.val = value
}
Parent.prototype.getValue = function () {
    return this.val
}
function Child (value) {
    Parent.call(this, value)
}
Child.prototype = new Parent()
```

这种继承的优点在于构造函数可以传参，不会与父类的引用属性共享，因此可以复用父类的函数，但是也有一个缺点就是继承父类函数时通过 `new` 调用了父类构造函数，导致子类的原型上多出了不需要的父类属性

##### 寄生组合继承

组合继承的优化版，即继承父类函数时不通过调用构造函数的方式，而是将父类的原型赋值给子类并将构造函数设置成子类

```js
function Parent (value) {
    this.val = value
}
Parent.prototype.getValue = function () {
    return this.val
}
function Child (value) {
    Parent.call(this, value)
}
Child.prototype = Object.create(Parent.prototype, {
    constructor: {
        value: Child,
        enumerable: false,
        writable: true,
        configurable: true
    }
})
```

#### class 继承

`class` 实际上只是语法糖，本质上还是函数：

```js
class Person {}
Person instanceof Function
```

通过 `class` 实现的继承：

```js
class Parent {
    constructor (value) {
        this.val = value
    }
    getValue () {
        return this.val
    }
}
class Child extends Parent {
    constructor (value) {
        super(value)  // 等同于 Parent.call(this.value)
        this.val = value
    }
}
```



参考链接：

1. https://yuchengkai.cn/docs/zh/frontend/#%E5%8E%9F%E5%9E%8B
2. https://github.com/amandakelake/blog/issues/39