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