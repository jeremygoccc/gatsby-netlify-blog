从准备实习入职到现在已经过了一个多月，从前期的业务熟悉到现在基本完成组内第一个需求模块，整体的节奏暂时稳定下来了，趁着这段时间重新构思了一下接下来的计划，博客方面主要会结合组内的技术栈对 `Vue` 的源码进行一个实际的剖析并输出系列的学习，频率大概在一周一篇左右，加油！

## Vue 构造函数

第一部分会主要研究 `Vue` 的构造函数，我们开发时 `Vue` 是如何引入的？而 `new Vue` 这个操作又具体执行了怎样一个过程？

当我们在本地开发 `Vue` 项目时都会用到 `npm run dev` 这个命令，在 `package.json` 中完整的命令是：

```bash
rollup -w -c scripts/config.js --environment TARGET:web-full-dev
```

当我们执行 `npm run dev` 命令时，`rollup` 会找到 `scripts/config.js` 文件中的配置：

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















