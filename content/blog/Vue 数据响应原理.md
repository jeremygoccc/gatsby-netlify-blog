---
title: Vue 数据响应原理
date: 2019-07-10 00:34:40
tags: Vue
---

第二部分针对 `Vue` 的数据响应系统来进行解析，之前我写过一篇 `MVVM` 的实现，而 `Vue` 本身也是借鉴了 `MVVM` 的思想，那这篇就详细看一看它关于这部分核心的数据响应系统是如何处理实现的。

首先看到 `src/core/instance/state.js` 下的 `initState` 方法：

```js
export function initState (vm: Component) {
    vm._watchers = []
    const opts = vm.$options
    if (opts.props) initProps(vm, opts.props)
    if (opts.methods) initMethods(vm, opts.methods)
    if (opts.data) {
        initData(vm)
    } else {
        observe(vm._data = {}, true /* asRootData */)
    }
    if (opts.computed) initComputed(vm, opts.computed)
    if (opts.watch && opts.watch !== nativaWatch) {
        initWatch(vm, opts.watch)
    }
}
```

这个函数内部根据对应的函数名分别初始化了 `props`、`methods`、`data`、`computed` 和 `watch` 选项，而 `Vue` 整个响应系统就是从 `initData` 开始的，看到对应这几行代码：

```js
if (opts.data) {
    initData(vm)
} else {
    observe(vm._data = {}, true /* asRootData */)
}
```

如果 `opts.data` 存在即调用 `initData(vm)` 来初始化 `data` 选项，否则就通过 `observe` 函数观测一个空对象，这个函数就是将 `data` 转换成响应式数据的核心入口。

然后找到同文件下的 `initData` 函数，开始的一段代码：

```js
let data = vm.$options.data
data = vm._data = typeof data === 'function'
	? getData(data, vm)
	: data || {}
```

如果 `vm.$options.data` 的类型为函数，则调用 `getData` 获取真正的数据，看它的代码：

```js
export function getData (data: Function, vm: Component): any {
    // #7573 disable dep collection when invoking data getters
    pushTarget()
    try {
        return data.call(vm, vm)
    } catch (e) {
        handleError(e, vm, `data()`)
        return {}
    } finally {
        popTarget()
    }
}
```

这里看关键的部分，它的作用就是通过调用 `data` 选项获取真正的数据对象，并且用 `try...catch` 包了一下，捕获 `data` 函数中可能出现的错误。此时 `vm._data` 属性和 `data` 变量都变成了最终的数据对象。

然后是一个 `data` 是否为纯对象的判断，使用 `isPlainObject` 函数来判断，如果不是在非生产环境就会打印警告信息。

然后是这样一段代码：

```js
// proxy data on instance
const keys = Object.keys(data)
const props = vm.$options.props
const methods = vm.$options.methods
let i = keys.length
while (i--) {
    const key = keys[i]
    if (process.env.NODE_ENV !== 'production') {
        if (methods && hasOwn(methods, key)) {
            warn(
            	`Method "${key}" has already been defined as a data property`,
                vm
            )
        }
    }
    if (props && hasOwn(props, key)) {
        process.env.NODE_ENV !== 'production' && warn(
        	`The data property "${key}" is already declared as a prop. ` +
            `Use prop default value instead.`,
            vm
        )
    } else if (!isReserved(key)) {
        proxy(vm, `_data`, key)
    }
}
// observe data
observe(data, true /* asRootData */)
```

上述代码首先用 `keys` 变量保存由 `data` 对象的键所组成的数组，然后获取到 `vm.$options.props` 和 `vm.$options.methods`，然后开始遍历 `keys` 数组，第一个 `if` 判断如果在非生产环境下发现 `methods` 定义了与 `data` 数据同样的 `key`，则会打印一个警告，这是为了避免 `data` 与 `methods` 中的 `key` 冲突产生覆盖现象，第二个 `if` 判断如果 `data` 中的 `key` 已经在 `props` 中定义了，也会打印警告，这里可以看出一个声明优先级的关系：**props > data > methods** 。如果都不冲突就会走到 `!isReserved(key)` 的判断，这个函数是在判断 `data` 中的 `key` 是否为保留键（`$` 或 `_` 开头），如果不是保留键就会执行 `proxy` 函数：

```js
export function proxy (target: Object, sourceKey: string, key: string) {
    sharedPropertyDefinition.get = function proxyGetter () {
        return this[sourceKey][key]
    }
    sharedPropertyDefinition.set = function proxySetter (val) {
        this[sourceKey][key] = val
    }
    Object.defineProperty(target, key, sharedPropertyDefinition)
}
```

这样就在实例对象 `vm` 上定义了与 `data` 数据字段同名的访问器属性，即访问 `vm.a` 时实际访问的是 `vm._data.a` 。

最后就是调用 `observe` 函数将 `data` 数据对象转成响应式的。

我们看到 `core/observer/index.js` 下的 `observe` 函数：

```js
export function observe (value: any, asRootData: ?boolean): Observer | void {
    if (!isObject(value) || value instanceof VNode) {
        return
    }
    let ob: Observer | void
    if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
        ob = value.__ob__
    } else if (
    	shouldObserve &&
        !isServerRendering() &&
        (Array.isArray(value) || isPlainObject(value)) &&
        Object.isExtensible(value) &&
        !value._isVue
    ) {
        ob = new Observer(value)
    }
    if (asRootData && ob) {
        ob.vmCount++
    }
    return ob
}
```

`observe` 函数接收两个参数：要观测的数据和布尔值（代表将要被观测的数据是否是根级数据）。

首先一个 `if` 判断如果要观测的数据不是对象或者是 `VNode` 实例，则直接 `return`。

然后又是一个判断，`hasOwn` 函数检测数据对象 `value` 是否含有 `__ob__` 属性同时 `__ob__` 也应该是 `Observer` 的实例，如果是就直接将 `__ob__` 属性作为 `ob` 的值，这里的 `__ob__` 其实就是一个数据对象被观测后就会被定义的属性，所以这里是避免重复观测一个数据对象。

如果没有 `__ob__` 属性即没有被观测则进入 `else...if` 分支，满足以下条件就会被观测：

- `shouldObserve` 必须为 `true` (类比一个开关，在一些场景下需要)
- `!isServerRendering()` 必须为 `true`（当不是服务端渲染时，可查看相关文档）
- `(Array.isArray(value) || isPlainObject(value))` 必须为 `true`（当数据对象是数组或者纯对象时才进行观测）
- `Object.isExtensible(value)` 必须为 `true`（要被观测的数据对象必须是可扩展的，不可扩展处理：`Object.preventExtensions()`、`Object.freeze()`、`Object.seal()`）
- `!value._isVue` 必须为 `true`（避免 `Vue` 实例对象被观测）

真正执行观测的是 `Observer` 构造函数：

```js
export class Observer {
    value: any
    dep: Dep
    vmCount: number
    
    constructor (value: any) {
        this.value = value
        this.dep = new Dep()
        this.vmCount = 0
        def(value, '__ob__', this)
        if (Array.isArray(value)) {
            if (hasProto) {
                protoAugment(value, arrayMethods)
            } else {
                copyAugment(value, arrayMethods, arrayKeys)
            }
            this.observeArray(value)
        } else {
            this.walk(value)
        }
    }

	/**
	* Walk through all properties and convert them into
	* getters/setters. This method should only be called when
	* value type is Object.
	*/
	walk (obj: Object) {
    	const keys = Objects.keys(obj)
        for (let i = 0; i < keys.length; i++) {
            defineReactive(obj, keys[i])
        }
	}

	/**
	* Observe a list of Array items.
	*/
	observeArray (items: Array<any>) {
        for (let i = 0, l = items.length; i < l; i++) {
            observe(items[i])
        }
	}
}
```

`Observer` 实例对象有三个实例属性：`value` 、`dep` 和 `vmCount`，两个实例方法：`walk` 和 `observeArray`。

首先看到 `constructor` 方法，前三句先是定义引用数据对象的 `value` 属性，然后定义一个保存 `Dep` 实例对象的 `dep` 属性，最后定义初始为 0 的 `vmCount` 属性。之后使用 `def` 函数定义了 `__ob__` 属性，值就是当前 `Observer` 的实例对象，这样定义 `__ob__` 属性是为了定义一个不可枚举的属性，这样后面遍历数据对象时就能够防止遍历到 `__ob__` 属性。

然后进入一个判断分支，用来区分数据对象到底是数组还是纯对象，当是一个纯对象时，会执行 `this.walk(value)` 函数，这个函数就是首先用 `Object.keys(obj)` 获取对象所有可枚举的属性，然后循环遍历并给每个属性都调用 `defineReactive` 函数。

我们看到 `core/observer/index.js` 下的 `defineReactive` 函数：

```js
export function defineReactive (
	obj: Object,
    key: string,
    val: any,
    customSetter?: ?Function,
    shallow?: boolean
) {
	const dep = new Dep()
    const property = Object.getOwnPropertyDescriptior(obj, key)
    if (property && property.configurable === false) {
        return
    }
    
    // cater for pre-defined getter/setters
  const getter = property && property.get
  const setter = property && property.set
  if ((!getter || setter) && arguments.length === 2) {
    val = obj[key]
  }

  let childOb = !shallow && observe(val)
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter () {
      // ...
    },
    set: function reactiveSetter (newVal) {
      // ...
    }
  })
}
```

这个函数的核心就是将数据对象的数据属性转换为访问器属性，也就是给数据属性设置 `getter/setter`，同时还做了很多处理边界条件的工作。

首先定义了一个 `dep` 常量引用了 `Dep` 实例对象，然后通过 `Object.getOwnPropertyDescriptor` 函数获取该字段可能已有的属性描述对象，然后判断该字段是否可配置，不可配置就直接返回，然后定义了 `getter` 和 `setter` 常量分别保存了来自 `property` 对象的 `get` 和 `set` 函数，这里是因为 `property` 对象是属性的描述对象，它可能已经是一个访问器属性，也就是可能存在 `get` 或 `set` 方法。因为接下来会使用 `Object.defineProperty` 函数重新定义属性 `setter/getter`，会导致属性原有的 `set` 和 `get` 方法被覆盖，所以要将原有 `setter/getter` 缓存，并在重新定义的 `set` 和 `get` 方法中调用缓存的函数，从而做到不影响属性的原有读写操作。

然后是一个判断语句：

```js
(!getter || setter) && arguments.length === 2
```

`arguments.length === 2` 表明当只传递两个参数即没有传递第三个参数 `val` 时，需要根据 `key` 主动获取对象上相应的值，`!(getter || setter)` 这个条件略过。

然后定义了 `childOb` 变量，在上面的判断语句块中获取到了对象属性的值 `val`，但是 `val` 本身有可能也是一个对象，所以需要继续调用 `observe(val)` 函数进行深度观测，前提是 `defineReactive` 最后一个 `shallow` 参数应该为 `false`，在 `walk` 函数中没有传递这个参数，所以默认就是深度观测。

接下来我们看看 `get` 和 `set` 函数中的代码。

首先是 `get` 函数，也就是当属性被读取时会做哪些事情：

```js
get: function reactiveGetter () {
    const value = getter ? getter.call(obj) : val
    if (Dep.target) {
        dep.depend()
        if (childOb) {
            childOb.dep.depend()
            if (Array.isArray(value)) {
                dependArray(value)
            }
        }
    }
    return value
}
```

它主要做了两件事情：返回属性值以及收集依赖。第一行代码首先判断是否存在 getter，因为 `getter` 保存的是属性原有的 `get` 函数，如果存在则直接调用该函数，保证属性原有的读取操作正常运作，如果不存在就使用 `val` 作为属性的值，在最后一行代码中就将 `value` 返回，即做到了正确地返回属性值；而收集依赖的部分都在中间的代码，首先判断 `Dep.target` 是否存在，它保存的值就是要被收集的依赖，如果存在才需要收集，然后就执行 `dep` 对象的 `depend` 方法将依赖收集到 `dep` 中，再判断 `childOb` 是否存在，如果存在就执行 `childOb.dep.depend()`，这里的 `childOb === dep.__ob__` ，这句代码的执行就说明除了要将依赖收集到 `dep` 中，也要收集到 `dep.__ob__.dep` 中，那么为什么要将同样的依赖收集到不同的 `dep` 中呢？原因就是**它们收集的依赖的触发时机不同**，`dep` 中的依赖的触发时机是属性值被修改时，即在 `set` 函数中的 `dep.notify()`，`dep.__ob__.dep` 中的依赖是在使用 `$set` 或者 `Vue.set` 给数据对象添加新属性时触发，因为 `js` 语言本身的限制，在 `Proxy` 之前的 `Vue` 没有办法拦截到给对象添加属性的操作，所以提供了 `$set` 和 `Vue.set` 等方法让我们可以在给对象添加新属性时触发依赖，也就是说**`__ob__` 属性和 `__ob__.dep` 的主要作用就是为了添加、删除属性时有能力触发依赖**，这也就是 `Vue.set` 或者 `Vue.delete` 的原理。最后一个是对于数组属性值的处理，如果读取的属性值是数组就需要调用 `dependArray` 逐个触发数组每个元素的依赖收集，这也说明了 `Observe` 类对于纯对象和数组的处理方式是不同的。

然后是 `set` 函数，当属性被修改时如何触发依赖：

```js
set: function reactiveSetter (newVal) {
    const value = getter ? getter.call(obj) : val
    /* eslint-disable no-self-compare */
    if (newVal === val || (newVal !== newVal && value !== value)) {
        return
    }
    /* eslint-enable no-self-compare */
    if (process.env.NODE_ENV !== 'production' && customSetter) {
        customSetter()
    }
    if (setter) {
        setter.call(obj, newVal)
    } else {
        val = newVal
    }
    childOb = !shallow && observe(newVal)
    dep.notify()
}
```

与 `get` 函数类似，它也做了两件事：为属性设置新值和触发相应的依赖。首先第一句与 `get` 函数体第一句相同，取得属性原有的值，从而可以与新的值作比较，也就下面的比较语句，这里提一下 `(newVal !== newVal && value !== value)` ，如果新值与新值自身不全等，旧值与旧值自身也不全等，说明新旧值都是 `NaN`，所以也不做处理。下一个判断语句块，如果 `customSetter` 函数存在，就在非生产环境执行它。然后一段代码首先判断 `setter` 是否存在，如果存在就用它存储的属性原有的 `set` 函数继续设置属性的值，不存在就设置 `val` 的值为 `newVal`。最后两句代码首先是在需要深度观测的情况下对新设置的值（数组或纯对象）进行观测，然后再触发依赖。

接下来我们看看响应式数据对于数组的处理方式，在 `Observer` 类中的 `constructor` 函数下的代码如下：

```js
if (Array.isArray(value)) {
    const augment = hasProto
    	? protoAugment
    	: copyAugment
    augment(value, arrayMethods, arrayKeys)
    this.observeArray(value)
} else {
    this.walk(value)
}
```

当被观测的值 `value` 是数组时就会执行对数组的观测处理。 因为数组是一个特殊的结构，它含有很多会改变数组自身的值的变异方法，比如：`push`、`pop`、`shift`、`unshift`等。当调用这些变异方法时也需要触发依赖，上面这段代码首先定义了 `augment` 常量，它依据 `hasProto` 的布尔值来定，就是检测当前环境是否可以使用 `__proto__` 属性，如果可以它的值就是 `protoAugment` 函数：

```js
/**
 * Augment an target Object or Array by intercepting
 * the prototype chain using __proto__
 */
function protoAugment (target, src: Object, keys: any) {
    /* eslint-disable no-proto */
    target.__proto__ = src
    /* eslint-disable no-proto */
}
```

这个函数就是通过设置数组实例的 `__proto__` 属性，让它指向一个代理原型从而做到拦截。

 `protoAugment` 函数调用时传了 `value`、`arrayMethods` 和 `arrayKeys`，实际用到的只有前两个，具体看到 `src/core/observer/array.js` 文件下的 `arrayMethods`：

```js
/*
 * not type checking this file because flow doesn't play well with
 * dynamically accessing methods on Array prototype
 */

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
 * Intercept mutating methods and emit events
 */
methodsToPatch.forEach(function (method) {
  // cache original method
  const original = arrayProto[method]
  def(arrayMethods, method, function mutator (...args) {
    const result = original.apply(this, args)
    const ob = this.__ob__
    let inserted
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args
        break
      case 'splice':
        inserted = args.slice(2)
        break
    }
    if (inserted) ob.observeArray(inserted)
    // notify change
    ob.dep.notify()
    return result
  })
})
```

首先两句将 `arrayMethods` 对象导出，这里可以看到它的原型就是真正数组构造函数的原型，然后定义了 `methodsToPatch` 常量，它包含了所有需要拦截的数组变异方法的名字，然后循环遍历它并使用 `def` 函数在 `arrayMethods` 对象上定义与数组变异方法同名的函数，做到拦截的目的，具体的处理方式就是先缓存数组原本的变异方法，然后在 `def` 函数体内先调用缓存的方法并将它的返回值作为整个函数的返回值返回，保证拦截函数的功能与原本数组变异方法的功能一致，中间一段代码是元素新增时需要将新增加的元素变为响应式数据，即用 `observeArray` 函数对其进行观测，最后再执行该数组的所有依赖，即 `ob.dep.notify()`。

当不支持 `__proto__` 属性时，`augment` 的值为 `copyAugment` 函数：

```js
/**
 * Augment an target Object or Array by defining
 * hidden properties.
 */
/* istanbul ignore next */
function copyAugment (target: Object, src: Object, keys: Array<string>) {
    for (let i = 0, l = keys.length; i < l; i++) {
        const key = keys[i]
        def(target, key, src[key])
    }
}
```

这个函数接收的参数与 `protoAugment` 函数相同，它使用了第三个参数 `arrayKeys`  即所有要拦截的数组变异方法的名称，再遍历 `arrayKeys` 使用 `def` 函数在数组实例上定义与数组变异方法同名的函数，从而实现拦截操作。

回到 `constructor` 函数，接下来是调用 `observeArray` 方法：

```js
/**
  * Observe a list of Array items.
  */
observeArray (items: Array<any>) {
  for (let i = 0, l = items.length; i < l; i++) {
    observe(items[i])
  }
}
```

对数组进行遍历，并逐个调用 `observe` 函数，这样当数组内嵌套数组或对象时就能递归观测对应的元素了。

到这里我们就理解了数据响应系统对于纯对象和数组的处理方式的区别，对于纯对象只需要逐个将对象的属性重新定义为访问器属性并且当属性为纯对象时递归定义即可，而对于数组则需要通过拦截数组变异方法的方式，这也是因为对于数组来说，它的索引不是“访问器属性”，所以当数组的某个元素有依赖时触发不了这个元素的 `get` 函数。