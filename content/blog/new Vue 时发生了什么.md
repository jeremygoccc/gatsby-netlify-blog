---
title: new Vue 时发生了什么
date: 2019-07-04 00:34:40
tags: Vue
---

今天结束了大学最后的期末考试，从实习开始博客学习一直都搁置了，结合组内的技术栈，接下来会主要针对 `Vue` 进行源码输出系列的学习，加油！



第一步主要来研究 `Vue` 的构造函数，我们开发时 `Vue` 是如何引入的？而 `new Vue` 这个操作又具体执行了怎样一个过程？

当我们在本地开发 `Vue` 项目时都会用到 `npm run dev` 这个命令，在 `package.json` 中完整的命令是：

```bash
rollup -w -c scripts/config.js --environment TARGET:web-full-dev
```

当我们执行 `npm run dev` 命令时，`rollup` 就会找到 `scripts/config.js` 文件中的配置：

```js
// Runtime+compiler development build (Browser)
'web-full-dev': {
  entry: resolve('web/entry-runtime-with-compiler.js'),
  dest: resolve('dist/vue.js'),
  format: 'umd',
  env: 'development',
  alias: { he: './entity-decoder' },
  banner
},
```

然后找到入口文件 `web/entry-runtime-with-compiler.js` ，最终输出了 `dist/vue.js`。

而这个入口文件中的 `web` 是一个别名配置，打开 `scripts/alias.js` 文件：

```js
const path = require('path')

const resolve = p => path.resolve(__dirname, '../', p)

module.exports = {
  vue: resolve('src/platforms/web/entry-runtime-with-compiler'),
  compiler: resolve('src/compiler'),
  core: resolve('src/core'),
  shared: resolve('src/shared'),
  web: resolve('src/platforms/web'),
  weex: resolve('src/platforms/weex'),
  server: resolve('src/server'),
  sfc: resolve('src/sfc')
}
```

其中的 `web: resolve('src/platforms/web)` 即指向了 `src/platforms/web` 目录。

当我们打开 `src/platforms/web/entry-runtime-with-compiler.js` 文件会看到这样一个引入：

```js
import Vue from './runtime/index'
```

我们顺着引入文件打开 `./runtime/index.js` 文件，又会看到这样一句：

```js
import Vue from 'core/index'
```

这里的 `core` 在 `scripts/alias.js` 中即指向了 `src/core`，打开 `src/core/index.js` 文件：

```js
import Vue from './instance/index'
```

继续打开 `./instance/index.js` 文件：

```js
import { initMixin } from './init'
import { stateMixin } from './state'
import { renderMixin } from './render'
import { eventsMixin } from './events'
import { lifecycleMixin } from './lifecycle'
import { warn } from '../util/index'

function Vue (options) {
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  this._init(options)
}

initMixin(Vue)
stateMixin(Vue)
eventsMixin(Vue)
lifecycleMixin(Vue)
renderMixin(Vue)

export default Vue

```

终于看到了 `Vue` 的构造函数，其中使用了安全模式提醒你要使用 `new` 操作符来调用 `Vue`，然后将 `Vue` 构造函数作为参数，分别调用导入的五个方法最后导出 `Vue`。

我们先看一下这五个方法做了什么，首先是 `initMixin`，定位到 `./init.js` 文件中的 `initMixin` 方法：

```js
export function initMixin (Vue: Class<Component>) {
	Vue.prototype._init = function (options?: Object) {
        //...
    }
}
```

这个方法就是在 `Vue` 的原型上添加了 `_init` 方法，在 `Vue` 的构造函数中有这样一句：`this._init(options)`，当我们执行 `new Vue()` 时，`this._init(options)` 就会执行。

然后是 `stateMixin`，定位到 `./state.js` 中的 `stateMixin` 方法：

```js
export function stateMixin (Vue: Class<Component>) {
  // flow somehow has problems with directly declared definition object
  // when using Object.defineProperty, so we have to procedurally build up
  // the object here.
  const dataDef = {}
  dataDef.get = function () { return this._data }
  const propsDef = {}
  propsDef.get = function () { return this._props }
  if (process.env.NODE_ENV !== 'production') {
    dataDef.set = function () {
      warn(
        'Avoid replacing instance root $data. ' +
        'Use nested data properties instead.',
        this
      )
    }
    propsDef.set = function () {
      warn(`$props is readonly.`, this)
    }
  }
  Object.defineProperty(Vue.prototype, '$data', dataDef)
  Object.defineProperty(Vue.prototype, '$props', propsDef)
    
  ...
}
```

先看主要的部分，最后两句是使用 `Object.defineProperty` 在 `Vue.prototype` 上定义了两个属性：`$data` 和 `$props`，它们的定义在 `dataDef` 和 `propsDef` 中：

```js
const dataDef = {}
dataDef.get = function () { return this._data }
const propsDef = {}
propsDef.get = function () { return this._props }
```

同时当处于非生产环境时就给 `$data` 和 `$props` 设置一下 `set`，这样就实现了两个只读属性。

这之后 `stateMixin` 在 `Vue` 原型上又定义了三个方法：$set，$delete，$watch，具体可以看它们的引入：

```js
Vue.prototype.$set = set
Vue.prototype.$delete = del

Vue.prototype.$watch = function (
	expOrFn: string | Function,
    cb: any,
    option?: Object
): Function {
    ...
}
```

然后是 `eventsMixin` ，定位到 `./events.js` 中的 `eventsMixin` 方法：

```js
export function eventsMixin (Vue: Class<Component>) {
	Vue.prototype.$on = function (event: string | Array<string>, fn: Function): 
    Component {}

	Vue.prototype.$once = function (event: string, fn: Function): Component {}

  	Vue.prototype.$off = function (event?: string | Array<string>, fn?: Function): 
  	Component {}

  	Vue.prototype.$emit = function (event: string): Component {}
}
```

这个方法就是在 `Vue` 原型上添加了四个方法：`$on`、`$once`、`$off`、`$emit`。

然后是 `lifecycleMixin` ，定位到 `./lifecycle.js` 中的 `lifecycleMixin` 方法：

```js
export function eventsMixin (Vue: Class<Component>) {
    Vue.prototype._update = function (vnode: VNode, hydrating?: boolean) {}

    Vue.prototype.$forceUpdate = function () {}

    Vue.prototype.$destroy = function () {}
}
```

这个方法也是在 `Vue` 原型上添加了三个方法：`update`、`$forceUpdate`、`$destroy`。

最后就是 `renderMixin`，定位到 `./render.js` 中的 `renderMixin` 方法：

```js
export function renderMixin (Vue: Class<Component>) {
  // install runtime convenience helpers
  installRenderHelpers(Vue.prototype)

  Vue.prototype.$nextTick = function (fn: Function) {}

  Vue.prototype._render = function (): VNode {}
}
```

这个方法一开始以 `Vue.prototype` 为参数调用了 `installRenderHelpers` 函数，它在 `./render-helper/index.js` 文件中：

```js
export function installRenderHelpers (target: any) {
  target._o = markOnce
  target._n = toNumber
  target._s = toString
  target._l = renderList
  target._t = renderSlot
  target._q = looseEqual
  target._i = looseIndexOf
  target._m = renderStatic
  target._f = resolveFilter
  target._k = checkKeyCodes
  target._b = bindObjectProps
  target._v = createTextVNode
  target._e = createEmptyVNode
  target._u = resolveScopedSlots
  target._g = bindObjectListeners
  target._d = bindDynamicKeys
  target._p = prependModifier
}
```

这个函数就是在 `Vue.prototype` 上添加一系列助手方法。

之后 `renderMixin` 方法又给 `Vue` 原型添加了两个方法：`$nextTick`、`_render`。 

这样 `npm run dev` 时构建的运行就结束了。

回到 `src/core/index.js` 文件：

```js
import Vue from './instance/index'
import { initGlobalAPI } from './global-api/index'
import { isServerRendering } from 'core/util/env'
import { FunctionalRenderContext } from 'core/vdom/create-functional-component'

initGlobalAPI(Vue)

// Vue.prototype 上添加 $isServer 属性，它代理了来自 core/util/env 文件的 isServerRendering 方法
Object.defineProperty(Vue.prototype, '$isServer', {
  get: isServerRendering
})

// Vue.prototype 上添加 $ssrContext 属性
Object.defineProperty(Vue.prototype, '$ssrContext', {
  get () {
    /* istanbul ignore next */
    return this.$vnode && this.$vnode.ssrContext
  }
})

// expose FunctionalRenderContext for ssr runtime helper installation
Object.defineProperty(Vue, 'FunctionalRenderContext', {
  value: FunctionalRenderContext
})

Vue.version = '__VERSION__'

export default Vue
```

这里首先以 `Vue` 构造函数为参数调用了 `initGlobalAPI` 函数，然后在 `Vue.prototype` 上添加了两个只读属性：`$isServer` 和 `$ssrContext`，然后在 `Vue` 构造函数上定义了 `FunctionalRenderContext` 静态属性，这里是为了能在 `ssr` 中使用它。

然后来看 `src/core/global-api/index.js` 下的 `initGlobalAPI` 方法：

```js
const configDef = {}
configDef.get = () => config
if (process.env.NODE_ENV !== 'production') {
    configDef.set = () => {
        warn(
        	'Do not replace the Vue.config object, set individual fields instead.'
        )
    }
}
Object.defineProperty(Vue, 'config', configDef)
```

这里就是在 `Vue` 构造函数上添加了 `config` 只读属性，代理的是从 `core/config.js` 文件导出的对象。

然后是这样一段代码：

```js
// exposed util methods.
// NOTE: these are not considered part of the public API - avoid relying on
// them unless you are aware of the risk.
Vue.util = {
    warn,
    extend,
    mergeOptions,
    defineReactive
}
```

在 `Vue` 构造函数上添加了 `util` 对象，它有来自 `core/util/index.js` 文件的四个属性：`warn`，`entend`，`mergeOptions` 和 `defineReactive`。同时注意这里的注释警告，因为它们不被认为是公共 API 的一部分，所以要避免依赖它们，包括在官方文档上也没有介绍 `util` 这个全局 API。

接下来的代码是：

```js
Vue.set = set
Vue.delete = del
Vue.nextTick = nextTick

Vue.options = Object.create(null)
```

这里在 `Vue` 上添加了四个属性：`set`、`delete`、`nextTick` 和 `options`，通过 `Object.create(null)` 创建了一个空对象 `Vue.options`。

接下来密切关注 `Vue.options` 的变化，下面这段代码：

```js
ASSET_TYPES.forEach(type => {
	Vue.options[type + 's'] = Object.create(null)
})

// this is used to identify the "base" constructor to extend all plain-object
// components with in Weex's multi-instance scenarios.
Vue.options._base = Vue
```

结合来自 `shard/constants.js` 文件的 `ASSET_TYPES` 数组：

```js
export const ASSET_TYPES = [
    'component',
    'directive',
    'filter'
]
```

`Vue.options` 先是变成了这样：

```js
Vue.options = {
    components: Object.create(null),
    directives: Object.create(null),
    filters: Object.create(null),
    _base: Vue
}
```

然后通过这句代码

```js
extend(Vue.options.components, builtInComponents)
```

`extend` 来自 `shared/util.js`，`builtInComponents` 来自 `core/components/index.js`，这句代码将 `builtInComponents` 属性混合到 `Vue.options.components` 中，所以 `Vue.options` 变成了这样：

```js
Vue.options = {
    components: {
        KeepAlive
    },
    directives: Object.create(null),
    filters: Object.create(null),
    _base: Vue
}
```

最后就是以 `Vue` 为参数调用了四个方法：

```js
initUse(Vue)  // 在 Vue 构造函数上添加 use 方法，即 Vue.use，用来安装 Vue 插件
initMixin(Vue) // Vue.mixin 方法
initExtend(Vue) // 添加 Vue.cid 静态属性和 Vue.extend 方法
initAAssetRegisters(Vue) // Vue.component Vue.directive Vue.filter 静态方法，对应全局注册组件 指令和过滤器
```

以上我们介绍 `Vue` 构造函数主要是从两个文件：`core/instance/index.js` 和 `core/index.js`。第一个是 `Vue` 够赞函数的定义文件，主要作用是定义 `Vue` 构造函数并给它的原型添加属性和方法，第二个的主要作用是给 `Vue` 添加全局的 API，即静态的方法和属性。它们都在 `core` 目录下，也就是都是与平台无关的代码，我们知道 `Vue` 本身是一个多平台的项目，不同平台可能会内置不同的组件指令或者加一些平台特有的功能等等，这就需要对 `Vue` 根据不同的平台进行处理，这个文件就是 `platforms/web/runtime/index.js`。

打开这个文件在导入语句下是这样的代码：

```js
// install platform specific utils
Vue.config.mustUseProp = mustUseProp
Vue.config.isReservedTag = isReservedTag
Vue.config.isReservedAttr = isReservedAttr
Vue.config.getTagNamespace = getTagNamespace
Vue.config.isUnknownElement = isUnknownElement
```

这里覆盖了默认导出的 `Vue.config` 对象的属性，即安装平台特定的工具方法。

然后是这两句代码：

```js
// install platform runtime directives & components
extend(Vue.options.directive, platformDirectives)
extend(Vue.options.components, platformComponents)
```

结合 `platformDirectives` 和 `platformComponents` 的内容最终 `Vue.options` 将变成：

```js
Vue.options = {
    components: {
        keepAlive,
        Transition,
        TrasnsitionGroup
    },
    directives: {
        model,
        show
    },
    filters: Object.create(null),
    _base: Vue
}
```

这样即在 `Vue.options` 上添加了 `web` 平台运行的特定组件和指令。

然后是这样一段代码：

```js
// install platform patch function
Vue.prototype.__patch__ = inBrowser ? patch : noop

// public mount method
Vue.prototype.$mount = functon (
	el?: string | Element,
    hydrating?: boolean
): Component {
    el = el && inBrowser ? query(el) : undefined
    return mountComponent(this, el, hydrating)
}
```

在 `Vue.prototype` 上添加了 `__patch__` 方法：如果是浏览器环境运行则值为 `patch` 函数否则为空函数 `noop`，然后又添加了 `$mount` 方法。

到这里运行时版本的 `Vue` 构造函数就成型了，入口文件也是直接导出这个运行时版。

完整版就是在运行版上多了一个 `Vue.compiler`，在 `entry-runtime-with-compiler.js` 文件中从 `./compiler/index` 中导入了 `compileToFunctions` 并赋值给 `Vue.compiler`，这个文件运行下来就是重写了 `Vue.prototype.$mount` 同时添加了 `Vue.compile` 全局 API。

至此 `Vue` 整个构造函数运行过程就结束了。