---
title: Hooks 详解
date: 2019-09-17 14:00:40
tags: Hooks

---

在 Hooks 正式推出不久时我写了一篇 [Hooks 随谈]([https://jeremy.netlify.com/Hooks-%E9%9A%8F%E8%B0%88/](https://jeremy.netlify.com/Hooks-随谈/)) ，主要是从概念介绍上对它的简单的一个分析理解，实习时开发的新控制台则完全使用了这个特性，因此想结合目前的实践经验对 Hooks 做一个最佳实践与对比的分析。

### Capture Value

从 Hooks 出现后，函数式组件也具有了状态的特性，因此避免 Stateless Component 而统一叫 Function Component 更为恰当。这里先从 props 的不可变性上对 Function Component 与 Class Component 做一个对比：

**Function Component:**

````js
function ProfilePage(props) {
    setTimeout(() => {
        // 父组件 Rerender 了，props 也是初始的
        console.log(props)
    }, 3000)
}
````

**Class Component:**

```js
class ProfilePage extends React.Component {
    render() {
        setTimeout(() => {
            // 父组件 Rerender 了，this.props 也会改变，因为 this 变了
            console.log(this.props)
        }, 3000)
    }
}
```

如果想在 Class Component 中捕获初始的 props，可以 `const props = this.props`，但是这样有点 hack，所以想拿到稳定的 `props` 推荐使用 Function Component。

**Hooks:**

```js
function MessageThread() {
    const [message, setMessage] = useState("")
    
    const showMessage = () => {
        alert("You said: " + message)
    }
    const handleSendClick = () => {
        setTimeout(showMessage, 3000)
    }
    const handleMessageChange = e => {
        setMessage(e.target.value)
    }
    return (
    	<>
        	<input value={message} onChange={handleMessageChange} />
        	<button onClick={handleSendClick}>Send</button>
        </>
    )
}
```

点 `send` 后修改输入框的值，3 秒后输出还是点击前输入框的值，说明 Hooks 也具有 Capture Value 的特性。

> 可以认为每次 Render 的内容都会形成一个快照，每个 Render 状态都有自己固定不变的 Props 和 State。
>
> 不仅仅是对象，函数在每次渲染时也是独立的，这就是 Capture Value 特性。

实际开发中就被这个特性坑过，避免 capture value 可以利用 `useRef` ：

```js
function MessageThread() {
    const latestMessage = useRef("")
    
    const showMessage = () => {
        alert("You said: " + latestMessage.current)
    }
    const handleSendClick = () => {
        setTimeout(showMessage, 3000)
    }
    const handleMessageChange = e => {
        latestMessage.current = e.target.value
    }
}
```

> 可以认为 `ref` 在所有 Render 过程中保持着唯一引用，所以 `ref` 的取值或赋值拿到的都是一个最终状态，也可以简洁地认为 `ref` 是 Mutable 而 `state` 的 Immutable 的。

### 生命周期方法的替代

- constructor：Function Component 不需要初始构造函数，可以初始化状态通过调用 `useState`，如果初始值计算很消耗时间，可以传入函数，这样只会执行一次。
- getDerivedStateFromProps：当渲染时合理调度更新。
- shouldComponentUpdate：见`[React.memo](https://reactjs.org/docs/hooks-faq.html#how-do-i-implement-shouldcomponentupdate)`。
- render：就是 Function Component 本身。
- componentDidMount、componentDidUpdate、componentWillUnmount：它们的集合对应`useEffect`。
- componentDidCatch、getDerivedStateFromError：近期会增加对应的 Hook 方法。 

### 最佳实践

#### 组件定义

```js
const App: React.FC<{ title: string }> = ({ title }) => {
    return React.useMemo(() => <div>{title}</div>, [title])
}
App.defaultProps = {
	title: 'Function Component'                         
}
```

- 用 `React.FC` 申明 Function Component 组件类型与定义 Props 参数类型。
- 用 `React.useMemo` 优化渲染性能。
- 用 `App.defaultProps` 定义 Props 默认值。

> 为什么不用 React.memo?

因为组件通信时存在 `React.useContext` 的用法，会使所有用到的组件重渲染，只有 `React.useMemo` 可以按需渲染，同时考虑到未来维护，随时可能通过 `useContext` 等注入数据，即使没有性能问题的组件也建议使用 `useMemo`。

> 为什么不用解构方式代替 defaultProps?

虽然书写上解构方式更优雅，但是存在一个性能问题：对于对象类型每次 Rerender 时引用都会变化。

#### 局部状态

按常用程度排列：`useState`、`useRef`、`useReducer`。

**useState**

```js
const [hide, setHide] = React.useState(false)
const [name, setName] = React.useState("jeremy")
```

状态和函数名要见名知意，推荐都放在顶部声明，方便查阅。

**useRef**

```js
const dom = React.useRef(null)
```

`useRef` 尽量少用，因为大量 Mutable 的数据会影响代码的可维护性，对于不需要重复初始化的对象推荐使用。

**useReducer**

局部状态不推荐使用 `useReducer`，容易导致内部状态过于复杂，建议在多组件间通信时结合 `useContext` 使用。

> 在函数内直接声明普通常量或普通函数合适吗？

因为 Function Component 每次渲染都会重新执行，常量推荐放到函数外层避免性能问题，函数推荐使用 `useCallback` 声明以保证准确性与性能，`useCallback` 第二个参数必须填写，[eslint-plugin-react-hooks](https://www.npmjs.com/package/eslint-plugin-react-hooks) 会自动填写依赖项。

#### 组件通信

简单的组件通信使用 Props 透传的方式，频繁组件间通信使用 `useContext`。

### useEffect 指南

Function Component 没有生命周期，仅描述 UI 状态，然后 React 将其同步到 DOM。每次渲染的状态都会固化下来，包括 `state` `props` `useEffect` 和内部的所有函数。

舍弃了生命周期的同步会带来一些性能问题，我们需要告诉 React 如何对比 Effects。

#### useEffect 的依赖项

React 在 DOM 渲染时会 diff 内容，只修改改变了的部分，但是做不到对 Effect 的增量修改识别，需要开发者通过 `useEffect` 的第二个参数告诉 React 用到了哪些外部变量：

```js
useEffect(() => {
    document.title = 'Hello, ' + name
}, [name])
```

直到 `name` 改变的 Rerender，`useEffect` 才会再次执行。手动维护比较麻烦，可以利用 [eslint](https://github.com/facebook/react/issues/14920) 自动提示 fix。

这里需要关注的是依赖项的设置很重要：

由于 useEffect 符合 Capture Value 的特性，必须处理好依赖项才能保证获取值的准确性：

```js
useEffect(() => {
    const id = setInterval(() => {
        setCount(count + 1)
    }, 1000)
    return () => clearInterval(id)
}, [count])
```

如果这里不传入 `count` 作为依赖项，拿到的 `count` 值就永远是初始化的 `0`，这样之后的 `setCount` 就没有作用了。

传入了 `count` 可以获取到最新的 `count`，但是导致了两个问题：

- 计时器不准确了，因为每次 `count` 变化都会销毁重新计时。
- 频繁生成和销毁定时器带来了一定性能负担。

这里设不设依赖都有问题，本质上是因为我们在一个只想执行一次的 Effect 里依赖了外部变量。

```js
useEffect(() => {
    const id = setInterval(() => {
        setCount(c => c + 1)
    }, 1000)
    return () => clearInterval(id)
}, [])
```

`setCount` 还有一种函数回调模式，不需要关心当前值是什么，只要对旧的值进行修改即可，这样虽然代码永远运行在第一次 Render 中，但总是可以访问到最新的 `state`。

上面的解法并没有彻底解决所有场景的问题，比如同时依赖了两个 `state` 的情况：

```js
useEffect(() => {
    const id = setInterval(() => {
        setCount(c => c + step)
    }, 1000)
    return () => clearInterval(id)
}, [step])
```

这里就不得不依赖 `step` 这个变量，那么现在该怎么处理呢？

利用 `useReducer` 函数将更新与动作解耦：

```js
const [state, dispatch] = useReducer(reducer, initialState)
const { count, step } = state

useEffect(() => {
    const id = setInterval(() => {
        dispatch({ type: "tick" })
    }, 1000)
    return () => clearInterval(id)
}, [dispatch])
```

这样形成了一个局部 Redux，不管更新时需要依赖多少变量，在实际更新时都不需要依赖任何变量，具体更新操作写在 `reducer` 函数里即可。

#### Function 与 Effect

如果函数定义不在 `useEffect` 中，不仅可能遗漏依赖，而且 eslint 插件也无法帮助自动收集依赖。

只要不依赖 Function Component 内变量的函数都可以直接抽出去，但是依赖了变量的函数怎么办？

`useCallback` :

```js
function Parent() {
  const [query, setQuery] = useState("react");

  // ✅ Preserves identity until query changes
  const fetchData = useCallback(() => {
    const url = "https://hn.algolia.com/api/v1/search?query=" + query;
    // ... Fetch data and return it ...
  }, [query]); // ✅ Callback deps are OK

  return <Child fetchData={fetchData} />;
}

function Child({ fetchData }) {
  let [data, setData] = useState(null);

  useEffect(() => {
    fetchData().then(setData);
  }, [fetchData]); // ✅ Effect deps are OK

  // ...
}
```

因为函数也具有 Capture Value 特性，经过 `useCallback` 包装的函数可以当成普通变量来作为 `useEffect` 的依赖。

`useCallback` 就是在它的依赖变化时返回一个新的函数引用，从而触发 `useEffect` 的依赖变化并激活它重新执行。

在 Class Component 中，如果希望参数变化就重新取数，我们不能直接对比取数函数的 diff 而是要对比取数参数是否变化，这样的代码不内聚难维护；对比 Function Component 中利用 `useCallback` 封装的取数函数，`useEffect` 只需关心这个依赖是否变化，参数的变化在 `useCallback` 内关系，再配合 eslint 插件扫描就能做到依赖不丢、逻辑内聚易维护。

#### 回收机制

在组件被销毁时，通过 `useEffect` 注册的监听需要被销毁，可以通过它的返回值处理：

```js
useEffect(() => {
  ChatAPI.subscribeToFriendStatus(props.id, handleStatusChange);
  return () => {
    ChatAPI.unsubscribeFromFriendStatus(props.id, handleStatusChange);
  };
});
```

在组件销毁时会执行返回值函数内回调函数，由于 Capture Value 特性，每次注册与回收拿到的都是成对的固定值。

如果没有合理的返回回收，很容易造成内存泄露，如果直接传了一个 `async` 这样的异步函数 useEffect 也会警告，那如何做到销毁时取消异步函数呢？

如果使用的异步方式支持取消可以直接在清除函数中取消异步请求，更简单的一个方式是借助一个布尔值：

```js
function Article({ id }) {
  const [article, setArticle] = useState(null);

  useEffect(() => {
    let didCancel = false;

    async function fetchData() {
      const article = await API.fetchArticle(id);
      if (!didCancel) {
        setArticle(article);
      }
    }

    fetchData();

    return () => {
      didCancel = true;
    };
  }, [id]);

  // ...
}
```

[这篇文章](https://www.robinwieruch.de/react-hooks-fetch-data/) 讨论了更多关于如何处理错误和加载状态的场景。

#### 其它优势

`useEffect` 在渲染结束时执行，也就不会阻塞浏览器渲染进程，符合 React Fiber 的理念，因为 Fiber 是会根据情况暂停或插队执行不同组件的 Render，遵循 Capture Value 特性的代码可以保证值的安全访问，弱化生命周期也能解决中断执行带来的问题。



React Hooks 目前还在完善发展中，官方与社区的实践方案与轮子都有值得参考学习的地方，同时 Vue 3.0 也借鉴了 React Hooks 的思想，产生了 Vue Hooks，两者各有优劣，对这一部分深入了解后会再补充到这里。



参考：

- [精读 React Hooks 最佳实践]([https://github.com/dt-fe/weekly/blob/v2/120.%E7%B2%BE%E8%AF%BB%E3%80%8AReact%20Hooks%20%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5%E3%80%8B.md](https://github.com/dt-fe/weekly/blob/v2/120.精读《React Hooks 最佳实践》.md))
- [A Complete Guide to useEffect](<https://overreacted.io/a-complete-guide-to-useeffect/>)
- [精读 useEffect 完全指南]([https://github.com/dt-fe/weekly/blob/v2/096.%E7%B2%BE%E8%AF%BB%E3%80%8AuseEffect%20%E5%AE%8C%E5%85%A8%E6%8C%87%E5%8D%97%E3%80%8B.md](https://github.com/dt-fe/weekly/blob/v2/096.精读《useEffect 完全指南》.md))
- [精读 Function VS Class 组件]([https://github.com/dt-fe/weekly/blob/v2/095.%E7%B2%BE%E8%AF%BB%E3%80%8AFunction%20VS%20Class%20%E7%BB%84%E4%BB%B6%E3%80%8B.md](https://github.com/dt-fe/weekly/blob/v2/095.精读《Function VS Class 组件》.md))