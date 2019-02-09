---
title: Hooks 随谈
date: 2019-02-08 13:24:15
tags:
---

[React 16.8](https://reactjs.org/blog/2019/02/06/react-v16.8.0.html) 正式推出了 `Hooks` 的特性，这期间也从一些方面了解尝试过 Hooks，谨参考多篇文章来谈谈 `Hooks` 。

> `Hooks` 可以让你不需要通过类来使用 `React` 的 `state` 以及其它特性。你也可以自定义自己的 `Hooks` 来在组件之间共享可复用的状态逻辑 。

## 起源

当下，组件以及自顶向下的数据流可以帮助我们将大型 UI 组织成小型、独立可复用的部分。但是很多时候，我们的逻辑是带有状态的，因此不能进一步打破复杂的组件，也不能拆分出一个函数或是另一个组件。这些情况包括**动画**、**表单控件**、**连接外部数据源** 等等是非常普遍的 。

虽然现在对于 `React` 应用我们已经有很多种方式来复用这些逻辑，比如写简单的函数来调用，或是通过组件（函数或类的形式），但是对于非可视化的逻辑它就不是那么方便了，所以我们又提出了一些复杂的模式，比如 `render props` 和 高阶组件 。

**如果 `React` 只有一种通用的方式来复用逻辑是不是会更简单呢？**

对于代码复用，函数似乎是一种完美的机制，但是函数并不能包含本地 `React` 的状态，我们不能简单从类组件提取一些行为，比如 依据 window 的大小来更新状态 或是 让一个值随时间变化。我们通常都需要重构这部分代码或者是采用抽象的模式比如观察者。这些都破坏了 `React` 的简洁性 。

基于以上的思考，`React` 开发团队提出了 `Hooks` 。它可以让我们通过函数来使用 `React` 的特性（比如状态)，并且 `React` 官方也提供了一些内置的与 `React` 构建模块相关的 `Hooks` : **状态**、**生命周期**、**上下文**，因为`Hooks` 就是普通的 `JavaScript` 函数，因此我们也可以自定义 `Hooks` 来使用 。

## Demo

让我们看一个例子 : 随 window 大小的调整来更新 `React` 的状态 。

```js
import { useState, useEffect } from 'react'

function useWindowWidth () {
    const [width, setWidth] = useState(window.innerWidth)
    
    useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth)
        window.addEventListener('resize', handleResize)
        return () => {
            window.removeEventListener('resize', handleResize)
        }
    })
    
    return width
}
```

上述代码用到了 `React` 自带最常用的两个 `Hooks` : `useState` 和 `useEffect` :

- [useState](https://reactjs.org/docs/hooks-reference.html#usestate) : 传入一个初始状态，返回带状态的值和可以更新这个值的函数 。
- [useEffect](https://reactjs.org/docs/hooks-reference.html#useeffect) : 传入带有副作用的函数（改变数据，订阅，定时器，日志记录等等）。

> `React` 基础的 `Hooks` 还有一个 [useContext](https://reactjs.org/docs/hooks-reference.html#usecontext) 。

同时我们还有一个基于内置 `Hooks` 的自定义 `Hooks` : `useWindowWidth` 。

我们来看看 `useWindowWidth` 做了什么 : 传入 window 的初始大小，返回状态值 `width` 和可以更新 `width` 的 `setWidth`，在 `useEffect` 内部我们定义了一个通过 `setWidth` 设置 window 大小的 `handleResize` 函数，并且监听了 window resize 事件来更新 window 的大小，最终返回取消监听的函数 。

这就是一个可以随 window 大小来调整布局的 `Hooks`  。

试想一下如果我们用类组件的方式来实现会是怎样？

```js
class setWidth extends React.Component {
    constructor (props) {
        super(props)
        this.state = {
             width: window.innerWidth
        }
    }
	handleResize = () => this.setState({ width: window.innerWidth })
    componentDidMount () {
		window.addEventListener('resize', handleResize)
    }
    componentWillUnmount () {
		window.removeEventListener('resize', handleResize)
    }
    render () {
		return <SomeUI />
    }
}
```

对比之下我们很容易感觉到类组件的写法我们要设置 `state`、结合繁琐的生命周期以及必须要渲染 UI （当然可以是 `null`），并且更大的问题是如果我们需要复用这个组件同时 `<SomeUI />` 又不能相同，我们往往就会采用高阶组件的写法，这又引入了抽象的模式。所以对比下来， `Hooks` 让开发者可以有更小的学习成本，同时也更贴合 `React` 简洁的理念 。

> 这里有一个类组件与 `Hooks` 更直观的对比的视频 : https://twitter.com/i/status/1056960391543062528 。

同时我们也能感受到自定义 `Hooks` 的魅力，随着 `Hooks` 的正式提出，之后将会有越来越多的 `Hooks` npm 包来更好的帮助开发者 。

> 这里有一个各类自定义 `Hooks` 实现的网站 : https://usehooks.com/ 。

## 深入

作为一个 `React` 开发者，`Hooks` 刚提出时我是感到很惊艳的，`React` 从一开始的定位就是为了更好地构建 UI，这就带给了我两个疑问 : 

- `Hooks` 的出现代表了什么？
- `Hooks` 是怎么实现的？

在 [对 React Hooks 的一些思考](https://zhuanlan.zhihu.com/p/48264713) 中有一句话 : **"有状态的组件没有渲染，有渲染的组件没有状态"**。`React` 团队想要推行的正确理念就是 "状态与 UI 分开"。而这其实也正与 `React Hooks` 的特性相合，我们来看一下使用 `Hooks` 的 [两个规则](https://reactjs.org/docs/hooks-rules.html) : 

- 只在函数顶部调用 `Hooks` 。
- 只在 `React` 函数中调用 `Hooks` 。

`Hooks` 必须集中在函数顶部来写，这其实很容易养成书写无状态 UI 组件的习惯，因此也会更容易践行 "状态与 UI 分开" 这个理念。个人觉得这也是 `React` 团队将 `Hooks` 视为 **状态共享问题** 长久以来最完美的解决方案的原因之一 。

那么为什么 `Hooks` 必须在函数顶部被调用？是为了防止我们用条件判断来包裹 `Hooks` 。为什么不能用条件判断包裹就涉及到 `Hooks` 的实现问题，简单解释一下就是 : `Hooks` 并不是通过 `Proxy` 或者 `getters` 实现的，而是通过类似数组的实现方式，因此 `Hooks` 的正常调用与下标顺序有关，每次 `useState` 都会改变下标，如果在条件判断中使用了 `Hooks` ，可能就会影响下标造成 `Hooks` 调用出错，因此官方也建议在 `Hooks` 内部进行条件判断是更正确的做法 。

> 具体原因可以见 [官方文档](https://reactjs.org/docs/hooks-rules.html#explanation) 。

> `Hooks` 的原理可以见 [React hooks: not magic, just arrays](https://medium.com/@ryardley/react-hooks-not-magic-just-arrays-cd4f1857236e) 。
>
> 如果你想更深入地了解 `Hooks` 体系，可以见 [Under the hood of React’s hooks system](https://medium.com/the-guild/under-the-hood-of-reacts-hooks-system-eb59638c9dba) 。

可能有人会感觉到 `Hooks` 是带有一些限制的，但是更正确的理解是我们应该遵循 `Hooks` 的约定，它也是 `React` 官方第一次将 "约定优先" 的理念引入 `React` 框架当中，有了限制，但也有了更好的便利性 。

> 在 `Next.js` 和 `Umi` 中都有 "约定路由" 的功能，这大大降低了路由配置的复杂度，而 `Hooks` 就像代码级别的约定，大大降低了代码的复杂度，因此我们可以考虑这是不是未来很重要的一个趋势 。

## 更多思考

`Hooks` 的设计并不是绑定在 `React` 上的，现在也已经有了 `Vue` 、`Web Components` 甚至是原生 `JavaScript` 函数的实现（实验性的 API设计）。

你可能会有这样的疑问 :  `Vue` 需要 `Hooks` 吗？ `Vue` 确实没有像 `React` 类组件一样的问题，如果是需要复用逻辑的话，`Mixins` 也可以解决。但是从本质上看的话，`Vue` 的确需要 `Hooks` 来解决 **状态共享** 的问题，相比于 `Mixins` ，`Hooks` 可以帮助 `Vue` 解决两个主要问题 :

- 实现状态的共享 。
- 更清晰地展示逻辑的来向 。

目前 `Vue` 团队也计划在 `Vue` 3.0 中集成 `Hooks` ，但是会偏离 `React` 的 API 而贴合 `Vue` 的思想去设计，并且很有可能会成为 `Mixins` 的替代品，因此也是十分值得探索的 。

> Vue 实验性质的实现 : https://github.com/yyx990803/vue-hooks



参考 :

- [Make Sense of React Hooks](https://medium.com/@dan_abramov/making-sense-of-react-hooks-fdbde8803889)
- [精读 React Hooks ](https://github.com/dt-fe/weekly/blob/master/79.%E7%B2%BE%E8%AF%BB%E3%80%8AReact%20Hooks%E3%80%8B.md?1549703008787)
- [What Hooks Mean for Vue](https://css-tricks.com/what-hooks-mean-for-vue/)