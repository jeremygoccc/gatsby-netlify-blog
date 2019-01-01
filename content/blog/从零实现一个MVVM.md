---
title: 从零实现一个MVVM
date: 2018-09-30 18:08:01
tags: Wheels
---



### 介绍

MVVM 由以下三个内容组成:

- Model: 数据模型
- View: 界面
- ViewModal: 沟通 View 和 Model

MVVM 的思想是数据驱动视图，相比于 jQuery 操作 DOM 的时代，数据逻辑与页面实现了解耦，数据改变<=>UI改变，数据与业务的处理都放在 ViewModel 中并且可以复用

MVVM 中最核心的就是数据双向绑定，如 Angluar 的脏数据检测，Vue 中的数据劫持

接下来就详细解析实现基于数据劫持的双向绑定，功能上参考 v-model 还会完善一下编译的过程

### 数据劫持

首先是 DOM 元素以及类的实例化使用: 

```html
<div id="app">             
	<input type="text" v-model="message">
	{{message}}
</div>
```

```js
let vm = new MVVM({
    el: '#app',
    data: {
        message: 'Hello Jeremy!'
    }
})
```

这里实例化了一个 MVVM 类，我们来实现它的初始结构:

```js
class MVVM {
    constructor (options) {
        this.$el = options.el
        this.$data = options.data
        
        if (this.$el) {
            new Observer(this.$el, this) // 数据劫持
        }
    }
}
```

接下来就是 Observer 类:

```js
class Observer {
    constructor (data) {
        this.observe(data) // 劫持函数
    }
    observe (data) {
        if (!data || typeof data !== 'object') return
        Object.keys(data).forEach(key => {
            this.defineReactive(data, key, datat[key])
            this.observe(data[key]) // 递归劫持 ->　针对嵌套对象
        })
    }
    defineReactive (data, key, value) {
        const _this = this
        const dep = new Dep()　// Observer 与 Watcher 解耦
        Object.defineProperty(data, key, {  // 双向绑定关键
            enumerable: true,
            configurable: true,
            get () {
                Dep.target && dep.subscribe(Dep.target) // 订阅 Watcher 对象
                return value
            },
            set () {
                if (newValue !== value) {
                    value = newValue
                    _this.observe(newValue) // 赋值也劫持
                    dep.notify()
                }
            }
        })
    }
}
```

Dep 类:

```js
class Dep {
    constructor () {
        this.subs = []
    }
    subscribe (watcher) {
        this.subs.push(watcher)
    }
    notify () {
        this.subs.forEach(watcher => watcher.update())
    }
}
```

接下来就是 Watcher 类:

```js
class Watcher {
    constructor (vm, expr, cb) {
        this.vm = vm
        this.expr = expr
        this.cb = cb
        this.value = this.get() // 初始化时保存当前值
    }
    getVal (vm, expr) {  // 兼容嵌套对象的取值
        const attrs = expr.split('.')
        return attrs.reduce((prev, next) => {
            return prev[next]
        }, vm.$data)
    }
    get () {
        Dep.target = this  // 将 target 指向自己
        const value = this.getVal(this.vm, this.expr)　// 触发 getter 监听
        Dep.target = null  // 置空
        return value
    }
    update () {
        const newValue = this.getVal(this.vm, this.expr)
        const oldValue = this.value
        
        if (newValue !== oldValue) {
            this.cb(newValue) // 对应 watcher 的更新回调
        }
    }
}
```

以上三个类就是关于数据劫持的核心代码，new MVVM 时将 data 传入 observe 类中进行劫持，通过 `Object.defineProperty` 属性设置 getter 与 setter，在 new Watcher 类时构造函数调用 get 方法，触发 getter 监听并将对应 watcher 实例保存在 dep 对象数组中，修改数据值时 触发 setter 调用 notify 方法，遍历所有 watcher 实例，值修改了的实例就更新

那么 new Watcher 在哪里会调用呢？．．．

### 编译过程

数据劫持完之后便是对节点的编译:

```js
class MVVM {
    constructor (options) {
        ...
        if (this.$el) {
            new Observer(this.$data) // 数据劫持
            new Compile(this.$el, this) // 节点编译
        }
    }
}
```

所以最后我们要来实现 Compile 类:

```js
class Compile {
    constructor (el, vm) {
        this.el = isElementNode(el) ? el : document.querySelector(el)
        this.vm = vm
        
        if (this.el) {
            const fragment = this.nodeToFragment(this.el) // 将真实DOM移入内存中
            this.compile(fragment)　　　　　　　　　　　　　　// 编译 v-model 和 {{}} 节点
            this.el.appendChild(fragment)                // 重新塞回页面中
        }
    }
    isElementNode (el) {
        return el.nodeType === 1
    }
    isDirective (attr) {
        return attr.inculdes('v-')
    }
    nodeToFragment (el) {
        const fragment = document.createDocumentFragment()
        let firstChild
        while (firstChild = el.firstChild) {
            fragment.appendChild(firstChild)
        }
        return fragment
    }
    compile (fragment) {
        const nodes = fragment.childNodes
        Array.from(nodes).forEach(node => {
            if (this.isElementNode(node)) { // 判断元素节点与文本节点
                this.compileElement(node)
                this.compile(node) // 元素节点需要递归判断
            } else {
                this.compileText(node)
            }
        })
    }
    compileElement (node) {
        const attrs = node.attributes
        Array.from(attrs).forEach(attr => {
            if (this.isDirective(attr)) {
                const [, type] = attr.split('-')  // 现在这里 type 就是 model
                CompileUtil[type](node, this.vm, attr.value)
            }
        })
    }
    compileText (node) {
        const expr = node.textContent
        const reg = /\{\{([^}]+)\}\}/g  // {{ message }}
        if (reg.test(expr)) {
            CompileUtil['text'](node, this.vm, expr)
        }
    }
}
```

可以看到对于元素或者文本节点的具体处理我们封装了一个 CompileUtil 对象，来实现它: 

```js
CompileUtil = {
    text (node, vm, expr) {
        const updateFn = this.updater['textUpdater']
        expr.replace(/\{\{([^}]+)\}\}/g, (...arguments) => {
            // Boom~, new Watcher 在这
            new Watcher(vm, arguments[1].trim(), newValue => {
                updateFn && updateFn(node, this.getTextVal(vm, expr)) // 数据变化时文本节点需要重新获取依赖属性更新文本内容
            })
        })
        updateFn && updateFn(node, thie.getTextVal(vm, expr)) // 初始编译
    },
    model (node, vm, expr) {
        const udpateFn = this.updater['modelUpdater']
        new Watcher(vm, expr, newValue => {
            updateFn && updateFn(node, newValue)
        })
        node.addEventListener('input', e => { // 监听 input 事件
            const newValue = e.target.value
            this.setVal(vm, expr, newValue)
        })
        updateFn && updateFn(node, this.getVal(vm, expr))
    },
    updater: {
        textUpdater (node, value) {
            node.textContent = value // 文本节点赋值
        },
        modelUpdater (node, value) {
            node.value = value // 元素节点赋值
        }
    },
    getVal (vm, expr) { // 对嵌套对象值的获取
        const attrs = expr.split('.')
        return attrs.reduce((prev, next) => {
            return prev[next]
        }, vm.$data)
    },
    getTextVal (vm, expr) {
        return expr.replace(/\{\{([^}]+)\}\}/g, (...arguemnts) => {
            return this.getVal(vm, arguments[1].trim())
        })
    },
    setVal (vm, expr, value) {
        const attrs = expr.split('.')
        return attrs.reduce((prev, next, currentIndex) => {
            if (currentIndex === attrs.length - 1) {
                return prev[next] = value // 对最后的非对象赋值
            }
            return prev[next]
        }, vm.$data)
    }
}
```

编译时首先将真实DOM节点放入内存中编译 v-model 与 {　{ }　} 两类节点，对于元素节点与文本节点分别以不同的回调函数实例化 Watcher 类，并且完善了对于多层嵌套对象的处理，至此，在编译的过程了关联了对应的 watcher 实例，重新塞回页面后更改属性值便会触发 setter 进而更新页面

### 扩展: Proxy

`Object.defineProperty` 目前实现的双向绑定的缺陷:

- 只能对属性进行数据劫持，所以需要深度遍历整个对象
- 不能监听到数组数据的变化

而对于 Vue 来说，它本身做了一定的 hack 可以检测到数组数据的变化:

```js
// src/core/observer/array.js

import { def } from '../util/index'

const arrayProto = Array.prototype
export const arrayMethods = Object.create(arrayProto)

const methodsToPatch = [
    'push',
    'pop',
    'shift',
    'unshift',
    'splice',
    'sort',
    'reverse'
]

/**
 * 拦截变异方法并且触发事件
 */
methodsToPatch.forEach(function (method) {
    // 获得原生函数
    const original = arrayProto[method]
    def(arrayMethods, method, function mutator (...args) {
        const result = original.call(this, args) // 先调用原生函数
        const ob = this.__ob__
        let inserted
        switch (method) {  //　获取到插入的值
            case 'push':
            case 'unshift':
                inserted = args
                break
            case 'splice':
            	inserted = args.splice(2)
                break
        }
        if (inserted) ob.observeArray(inserted)
        // 触发更新
        ob.dep.notify()
        return result
    })
})
```

通过对原生函数的 hack， Vue 可以检测到数据数组的变化，但是还是有局限性：

- 不能检测到以下变动的数组
  - 利用索引直接设置一个项时，如：`vm.items[indexOfItem] = newValue`
  - 修改数组的长度时，如：`vm.items.length = newLength`



什么是[Proxy](http://es6.ruanyifeng.com/#docs/proxy)?  原生支持监听数组变化并且可以直接对整个对象进行拦截

```js
const onWatch = (obj, setBind, getLogger) => {
    const handler = {
        get(target, property, receiver) {
        	getLogger(target, property)
        	return Reflect.get(target, property, receiver)
    	},
        set(target, property, value) {
            setBind(value)
            return Reflect.set(target, property, value)
        }
    }
	return new Proxy(obj, handler)
}
const obj = {
    a: {
        b: 1
    }
}
const arr = [0, 1]
let value
const pObj = onWatch(obj, v => { value = v }, (target, property) => {
    console.log(`Get '${property}' = ${target[property]}`)
})
pObj.a.b = 2
const pArr = onWatch(obj, v => { value = v }, (target, property) => {
    console.log(`Get '${property}' = ${target[property]}`)
})
pArr[0] = 1
```

如今 Proxy 已经基本被各大浏览器都支持，Vue3.0 的计划中就有基于Proxy实现全语言覆盖的变动侦测



参考链接:

1. [Vue.js技术揭秘：检测变化的注意事项](https://ustbhuangyi.github.io/vue-analysis/reactive/questions.html)
2. [面试图谱：Proxy 与 Object.defineProperty 对比](https://yuchengkai.cn/docs/zh/frontend/framework.html#proxy-%E4%B8%8E-object-defineproperty-%E5%AF%B9%E6%AF%94)

