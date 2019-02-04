---
title: '从零实现一个 React-Router '
date: 2019-02-04 14:36:16
tags: Wheels
---



在实现 `React` 单页面应用过程中，必须掌握的一个生态就是 `React-Router` 路由库，本文将会从零开始实现`React-Router` 的关键部分。

> React-Router v4 是一次颠覆性的更新，完全不兼容以前版本的写法，相比于之前更容易让人接受的配置式路由写法，v4 由一个个路由组件（`Link`、`Route`、`Redirect`...）实现，我觉得这才是真正贴合 `React` 本身的组件化思想，如果你已经会 `React` 了，那么 `React-Router` 只是多学习几个组件而已，所以我们实现的关键部分主要也是针对 v4 。

## 起步

首先我们通过 `create-react-app` 来快速启动一个项目，并在 `index.js` 中敲入官方的 [demo](https://reacttraining.com/react-router/web/example/basic)，我们先看最终会渲染的 `App` 组件: 

```js
const App = () => (
  <div>
    <ul>
      <li><Link to="/">Home</Link></li>
      <li><Link to="/about">About</Link></li>
      <li><Link to="/topics">Topics</Link></li>
    </ul>

    <hr/>
    <Route exact path="/" component={Home} />
    <Route path="/about" component={About} />
    <Route path="/topics" component={Topics} />
  </div>
)
```

其中就包含了 `React-Router ` 最核心的两个组件: `Route`、`Link` 。

接下来我们就将重点放在这两个组件的实现上～

## Route

在上述的例子中我们注意到 `Route` 可以传入四个 props :  `exact`、`path`、 `component` 和 `render`，我们先来实现基本的 `Route` 组件: 

```js
class Route extends Component {
    static propTypes = {
        path: PropTypes.string, // 匹配路径
        exact: PropTypes.bool,  // 是否精确匹配
        component: PropTypes.func, // 匹配会渲染的组件
        render: PropTypes.func  // 自定义渲染内容
    }

    render () {
        const { path, exact, component, render } = this.props
        // 看路由是否匹配
        const match = matchPath(window.location.pathname, { path, exact })
        // 如果不匹配就返回 null
        if (!match) return null
        // (优先)如果传了匹配组件
        if (component) return React.createElement(component, { match })
        // 如果自定义了渲染内容
        if (render) return render({ match })

        return null
    }
}
```

`Route` 组件的核心就是匹配成功就渲染，不成功就不渲染（返回 `null`）。

然后我们来看一下 `matchPath` 匹配函数的实现: 

```js
const match = (pathname, options) => {
    const { path, exact = false } = options
    
    // 如果没有传 path
    if (!path) return { path: null, url: pathname, isExact: true }
    
    // 正则匹配 url
    const match = new RegExp(`^${path}`).exec(pathname)
    // 不匹配则返回 null
    if (!match) return null
    
    // 判断是否完全匹配
    const url = match[0]
    const isExact = pathname === url
    if (exact && !isExact) return null
    
    return {
        path,
        url,
        isExact
    }
}
```

> `React-Router` 为了保证兼容性是引入了 [pathToRegex](https://github.com/pillarjs/path-to-regexp) 库来做正则匹配，这里我们就简单用 `js` 自带的 `RegExp` 正则对象来实现 。

到现在我们实现了 `Route` 组件的匹配渲染逻辑，那么在实际的路由切换中，如何做到 `Route` 的重新渲染？

```js
class Route extends Component {
    ...
    componentWillMount () {
        // 监听浏览器 前进/后退 按钮的点击
        window.addEventListener('popstate', this.handlePop)
    }
    componentWillUnmount () {
		window.addEventListener('popstate', this.handlePop)
    }
    handlePop = () => {
		this.forceUpdate()
    }
    ...
}
```

路由会切换有两种场景，其中一种就是 **浏览器 前进/后退 按钮的点击**，我们在两个生命周期函数中监听这个点击事件，一旦点击了就调用自带的 `forceUpdate` 方法强制更新 UI 。

> React-Router 中使用的是 history.listen 监听，同样我们避免引入依赖选择 HTML5 的 `popstate` 事件。

另一种路由切换的场景就是 `a` 标签的点击，也就是我们接下来 `Link` 组件的实现～

## Link

`Link` 组件的核心在于 **声明式** 更新 URL，很容易想到它内部最终还是一个 `a` 标签 :

```js
class Link extends Component {
    static propTypes = {
        to: PropTypes.string.isRequired,
        replace: PropTypes.bool
    }
	// 阻止默认跳转，调用自定义更新路由方法
    handleClick = e => {
		const { replace, to } = this.props
        e.preventDefault()
        replace ? historyReplace(to) : historyPush(to)
    }

    render () {
		const { to, children } = this.props
        
        return (
        	<a href={to} onClick={this.handleClick}>
            	{children}
            </a>
        )
    }
}
```

而自定义的 `historyReplace` 和 `historyPush` 方法区别在于是插入 history 栈还是替换 history 栈 : 

```js
const historyPush = path => window.history.pushState({}, null, path)
const historyReplace = path => window.history.replaceState({}, null, path)
```

`Link` 的实现就是这样，那我们就很容易引出一个问题，点击 `Link` 后如何匹配到对应的 `Route` ？ 在 `Route` 组件的挂载和销毁前我们有监听对应的事件，但是对于 `Link` 的点击它并不会生效。

因此在 `Route` 组件加载时我们有必要将它作为一个实例保存下来（不管它有没有被匹配到）。

```js
componentWillMount () {
	window.addEventListener('popstate', this.handlePop)
    register(this)
}

componentWillUnmount () {
	unregister(this)
    window.addEventListener('popstate', this.handlePop)
}
```

`register` 和 `unregister` 实现如下: 

```js
let instances = []

const register = comp => instances.push(comp)
const unregister = comp => instances.splice(instances.indexOf(comp), 1)
```

所以在 `historyPush` 和 `historyReplace` 方法中我们需要遍历调用各个 `Route` 实例进而让它们逐一匹配 :

```js
const historyPush = path => {
    window.history.pushState({}, null, path)
    instances.forEach(instance => instance.forceUpdate())
}

const historyReplace = path => {
    window.history.replaceState({}, null, path)
    instances.forEach(instance => instance.forceUpdate())
}
```

现在我们将 `Route` 和 `Link` 组件引入 `index.js` 中启动可以看到运行正常。

> `React-Router` 在路由组件内使用 `setState`、`context` 和 `history.listen` 的结合来解决这个问题。

## 最后

React Router v4 的原理是很值得学习的，`React` 可以让你成为一个更好的 `JavaScript` 开发者，而 `React-Router` 可以让你成为一个更好的 `React` 开发者。





