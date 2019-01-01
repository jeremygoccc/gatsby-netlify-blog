---
title: 从零实现一个Promise
date: 2018-09-28 09:01:38
tags: Wheels
---

> 从暑假开始开发Vue项目，其中使用最频繁的库就是官方推荐的[axios](https://github.com/axios/axios)，基于Promise的HTTP库，这里参考了几篇优秀的解读文章尝试实现自己的Promise~

> Promise 是 ES6 新增的语法，解决了回调地狱的问题

本文将根据 [Promise A+ 规范](https://promisesaplus.com) 解读并从零实现一个Promise，通过 [promises-aplus/promises-tests](https://github.com/promises-aplus/promises-tests#promisesa-compliance-test-suite) 所有测试

### Promise 标准解读

Promise 表示一个异步操作的最终结果，主要通过 `then` 方法与之进行交互，该方法注册了两个回调函数，用来接收 Promise resolve 的终值或者 Promise reject 被拒绝的原因

#### Promises States

一个 Promise 必须是以下三个状态之一: 

- pending
- fulfilled (resolved)
- rejected

初始状态为 pending, 一旦转为 fulfilled 或 rejected, 就不能再次转为其它状态, 状态确定的过程叫做 settle

#### `then` 方法

- 一个 Promise 必须提供一个 `then`方法，并且接收两个参数，返回的也是一个Promise

```js
promise.then(onFulfilled, onRejected)
```

####  The Promise Resolution Procedure

不同实现的 Promise 之间可以无缝地相互调用, 比如：

```js
new MyPromise((resolve, reject) => { // MyPromise 表示自己实现的Promise库
    resolve(1)
}).then(() => {
    return Promise.reject(2)　　　　　// ES6 Promise
})
```

### 实现Promise

#### 基本构造函数

```js
const PENDING = 'pending'
const RESOLVED = 'resolved'
const REJECTED = 'rejected'

function MyPromise (fn) {
  var _this = this
  _this.currentState = PENDING // Promise当前状态
  _this.value = undefined      // Promise的值

  _this.resolvedCallbacks = [] // 用于状态为 pending 时保存 then　中的回调
  _this.rejectedCallbacks = []

  _this.resolve = function (value) {
    if (value instanceof MyPromise) { // 若 value 是一个 Promise　则递归执行
      return value.then(_this.resolve, _this.reject)
    }
    setTimeout(() => { // 标准3.1: 异步执行
      if (_this.currentState === PENDING) {
        _this.currentState = RESOLVED
        _this.value = value
        _this.resolvedCallbacks.forEach(cb => cb())
      }
    })
  }

  _this.reject = function (reason) {
    setTimeout(() => {
      if (_this.currentState === PENDING) {
        _this.currentState = REJECTED
        _this.value = reason
        _this.rejectedCallbacks.forEach(cb => cb())
      }
    })
  }

  try {  // 考虑到执行fn时可能出错, 所以这里try/catch一下, 并将catch到的值reject回去
    fn(_this.resolve, _this.reject)
  } catch (e) {
    _this.reject(e)
  }
}
```

#### `then` 方法

```js
MyPromise.prototype.then = function (onResolved, onRejected) {
  const self = this
  // 规范 2.2.7: then 必须返回一个新的Promise
  let promise2
  // 规范 2.2: onResolved 和 onRejected 为可选参数 如果类型不是函数需要忽略并且实现了透传
  onResolved = typeof onResolved === 'function' ? onResolved : v => v
  onRejected = typeof onRejected === 'function' ? onRejected : r => { throw r }

  if (self.currentState === RESOLVED) {
    // promise1(this/self)的状态已经确定并且为resolved, 调用onResolved
    return promise2 = new MyPromise(function (resolve, reject) {
      // 规范 2.2.4: 保证 onFulfilled onRjected 异步执行
      setTimeout(function () {
        try {
          const x = onResolved(self.value)
          resolutionProcedure(promise2, x, resolve, reject)
        } catch (e) {
          reject(e)
        }
      })
    })
  }

  if (self.currentState === REJECTED) {
    return promise2 = new MyPromise(function (resolve, reject) {
      setTimeout(function () {
        try {
          const x = onRejected(self.value)
          resolutionProcedure(promise2, x, resolve, reject)
        } catch (e) {
          reject(e)
        }
      })
    })
  }

  if (self.currentState === PENDING) {
    // 当前Promise还处于pending状态不能确定调用onResolved还是onRejected
    // 所以需要将 两种情况的判断处理逻辑 作为callback 放入当前Promise对象的回调数组里
    return promise2 = new Promise(function (resolve, reject) {
      self.resolvedCallbacks.push(function (value) {
        try {
          const x = onResolved(self.value)
          resolutionProcedure(promise2, x, resolve, reject)
        } catch (e) {
          reject(e)
        }
      })
      self.rejectedCallbacks.push(function (reason) {
        try {
          const x = onRejected(self.value)
          resolutionProcedure(promise2, x, resolve, reject)
        } catch (e) {
          reject(e)
        }
      })
    })
  }
}
```

#### 不同Promise间的交互

`then` 方法返回 `x` 可能是一个Promise对象(thenable)，为了确保调用成功，需要实现标准2.3的内容，这样即使实现方式不同，但遵循同样的标准不同的Promise之间也可以无缝地相互调用

```js
// 规范2.3: 针对不同的Promise实现交互
function resolutionProcedure (promise2, x, resolve, reject) {
  // 规范2.3.1: x与promise2不能相同, 避免循环引用
  if (promise2 === x) {
    return reject(new TypeError('Chaing cycle detected for promise'))
  }

  // 规范2.3.2: x是一个Promise 状态为pending则需要继续等待 否则执行
  if (x instanceof MyPromise) {
    if (x.currentState === PENDING) {
      x.then(function (value) {
        resolutionProcedure(promise2, value, resolve, reject)
      }, reject)
    } else {
      x.then(resolve, reject)
    }
    return
  }

  // 2.3.3.3: resolve或reject其中一个执行过则忽略其它的
  let thenCalledOrThrow = false
  if (x !== null && (typeof x === 'object' || typeof x === 'function')) { // 规范2.3.3
    try {
      // 2.3.3.1: x.then可能是getter（函数）, 如果是函数就执行
      let then = x.then
      if (typeof then === 'function') {
        // 2.3.3.3
        then.call(
          x, 
          y => {
            if (thenCalledOrThrow) return  // 2.3.3.3.3 三处谁执行就以谁的为准
            thenCalledOrThrow = true
            resolutionProcedure(promise2, y, resolve, reject)  // 2.3.3.3.1
          },
          r => {
            if (thenCalledOrThrow) return  // 2.3.3.3.3 三处谁执行就以谁的为准
            thenCalledOrThrow = true
            reject(r)
          }
        )
      } else {
        resolve(x)
      }
    } catch (e) {
      if (thenCalledOrThrow) return
      thenCalledOrThrow = true
      reject(e)
    }
  } else { // 2.3.4
    resolve(x)
  }
}
```

### 测试

在上述完整代码最后加入测试的脚本:

```js
MyPromise.deferred = function () {
  var dfd = {}
  dfd.promise = new MyPromise(function (resolve, reject) {
    dfd.resolve = resolve
    dfd.reject = reject
  })
  return dfd
}

try {
  module.exports = MyPromise
} catch (e) {}
```

然后安装 `promises-aplus-tests `  执行测试

```
npm i -g promises-aplus-tests
promises-aplus-tests Promise.js
```

Success !

![](http://ww1.sinaimg.cn/large/e4336439gy1fvp1uj1rk3j20kt09cjsa.jpg)



参考链接：

[面试图谱: Promise实现](https://yuchengkai.cn/docs/zh/frontend/#promise-%E5%AE%9E%E7%8E%B0)

[剖析Promise内部结构，一步一步实现一个完整的、能通过所有Test case的Promise类](https://github.com/xieranmaya/blog/issues/3)

