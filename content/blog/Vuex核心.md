---
title: Vuex核心
date: 2018-07-13 20:54:54
tags: Vue
---

在封装[Hy-Vue-Admin](https://github.com/fxbabys/hy-vue-admin) 的登录逻辑时，对于登录状态的管理设计刚开始利用很直观的全局cookie保存状态，写起来感觉很别扭而且麻烦，参考了成熟的后台管理模板登录的逻辑以后决定使用Vue官方推荐的Vuex进行全局状态的管理：

> Vuex 是一个专为Vue.js应用程序开发的状态管理模式。它采用集中式存储管理应用的所有组件的状态，并以相应的规则保证状态以一种可预测的方式发生变化。  —— 官方定义

### 使用原因

- 使用Vue开发单页应用时，经常需要操作一些组件间共享的数据或状态：
  - 应用规模较小时，可以使用 props、事件等常用的父子组件的组件间通信方法，单向数据流
  - 应用规模较大时，即多个组件共享状态时，单向数据流的简洁性很容易被破坏：
    - 多个视图依赖于同一状态
    - 不同视图的行为需要变更同一状态
- 传统解决方式存在的问题：
  - 对问题一：传参的方法在多层嵌套的组件下将会变得十分繁琐并且无法处理兄弟组件间状态传递的情况
  - 对问题二：经常采用父子组件直接引用或者通过事件来变更和同步多个组件间状态的多份拷贝，这种模式非常低效，很容易导致无法维护的代码
- 新的思路：
  - 将组件的共享状态抽取出来，以一个全局单例模式管理
  - 不管在组件树的哪个位置，任何组件都能直接获取状态或者触发行为
  - 通过定义和隔离状态管理中的各种概念并且强制遵守一定的规则，代码会更结构化且易维护

先放一张官方图~~

![](http://ww1.sinaimg.cn/large/e4336439gy1ft8jrzhbghj20jh0fb0ta.jpg)

### 核心概念

#### State

单一状态树理念，每个应用只包含一个 store 实例

- Vuex 通过 store 选项将状态从根组件注入到每一个子组件中（`Vue.use(Vuex)`）:

  ```js
  const app = new Vue({
      el: '#app',
      store, // 把 store 对象提供给 store 选项
      components: { Counter }
  })
  ```

- Vue 组件中获取 Vuex 状态：子组件通过 `this.$store` 访问到 store 实例

  ```js
  const Counter = {
      template: `<div>{{ Count }}</div>`,
      computed: {
          count () {
              return this.$store.state.count
          }
      }
  }
  ```


- mapState 辅助函数 与 对象展开运算符
- 组件仍然保有局部状态
  - 使用 Vuex 并不是一定需要将所有的状态放入Vuex
  - 如果有的状态严格属于单个组件，最好还是作为组件的局部状态

#### Mutation

更改 Vuex 中的 store 中的状态的唯一方法是提交 mutation：

- 每个 mutation 都有一个字符串的 事件类型（type） 和一个 回调函数（handler）。回调函数就是我们实际进行状态更改的地方，并且它会默认接受 state 作为第一个参数

```js
const store = new Vuex.Store({
    state: {
        count: 1
    },
    mutations: {
        increment (state) {
            state.count++
        }
    }
})
```

- 不能直接调用一个 mutation handler，要以事件注册的理念：当触发一个类型为 `increment` 的mutation时，调用此函数

```js
store.commit('increment')
```

- 提交载荷：可以向 `store.commit` 传入额外的参数
- Mutation 必须是同步函数：任何由 mutation 事件类型导致的状态变更都应在此刻完成

#### Action

类似于 mutation ，区别：

- Action 提交的是 mutation，不是直接变更状态
- Action 可以包含任意异步操作

```js
const store = new Vuex.Store({
    state: {
        count: 0
    },
    mutations: {
        increment (state) {
            state.count++
        }
    },
    actions: {
        increment (context) {
            context.commit('increment')
        }
    }
})
```

Action 函数接受一个与 store 实例具有相同方法和属性的 context 对象，即可以通过 `context.commit` 提交一个mutation

- Action 通过 `store.dispatch` 方法触发：

  ```js
  store.dispatch('increment')
  ```

#### Module

使用单一状态树，应用的所有状态将会集中到一个很大的对象，store对象容易变得臃肿

因此，Vuex允许我们将store分割成模块，每个模块拥有自己的 state、mutation、action甚至是嵌套子模块

### 解决方案

src 目录下写全局状态管理的代码，其中包含了 user 的状态

```
src
|—— api
  |—— login.js      # user login api接口
|—— ……
|—— ……
|—— store
  |—— modules
  	|—— user.js     # store中的user module
  |—— getters.js
  |—— index.js
|—— utils
  |—— auth.js       # 对user token的相关操作
  |—— request.js    # axios 登录请求的拦截器
```

store 中的user module：

![](http://ww1.sinaimg.cn/large/e4336439gy1ft95ctmkx1j20g50l8405.jpg)

Login.vue 中 点击登录分发 Action Login：

![](http://ww1.sinaimg.cn/large/e4336439gy1ft95ewfxw6j20cs0a4q3o.jpg)

user模块中actions首先调用登录接口，成功返回token后提交commit设置state token并且使用cookie保存token：

![](http://ww1.sinaimg.cn/large/e4336439gy1ft95holq1uj20ho06j0t8.jpg)

至此登录保存token状态的整体逻辑完成

退出的逻辑也与这个类似，点击退出分发action，调用退出接口返回成功状态码后提交commit设置state token为空并删除cookie，可自行阅读实现代码~