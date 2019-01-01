---
title: React入门
date: 2018-12-07 09:41:59
tags: React
---



本文将会从零开始介绍 React 的核心知识点，以下是参考大纲~

- [React](#react)
  - [React 是什么](#react-%E6%98%AF%E4%BB%80%E4%B9%88)
  - [为什么要使用 React](#%E4%B8%BA%E4%BB%80%E4%B9%88%E8%A6%81%E4%BD%BF%E7%94%A8-react)
- [项目预览](#%E9%A1%B9%E7%9B%AE%E9%A2%84%E8%A7%88)
- [JSX](#jsx)
- [Styles](#styles)
- [组件](#%E7%BB%84%E4%BB%B6)
  - [props](#props)
- [类组件](#%E7%B1%BB%E7%BB%84%E4%BB%B6)
  - [State](#state)
  - [事件处理](#%E4%BA%8B%E4%BB%B6%E5%A4%84%E7%90%86)
  - [生命周期](#%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F)
- [更多](#%E6%9B%B4%E5%A4%9A)
  - [脚手架](#%E8%84%9A%E6%89%8B%E6%9E%B6)
  - [状态管理与路由](#%E7%8A%B6%E6%80%81%E7%AE%A1%E7%90%86%E4%B8%8E%E8%B7%AF%E7%94%B1)

话不多说，直接进入~

### React

#### React 是什么

> 官方定义: 一个用来构建用户界面的 JavaScript 库

从定义中我们要有一个认知: React 本身所做的只是构建用户界面，而大型的 React 项目一般都会紧密结合它的生态圈(路由: React-Router 状态管理库: Redux等等)来实现，这篇文章主要专注的还是 React 的核心知识点

#### 为什么要使用 React

- 虚拟 DOM: 我们都知道 js 频繁操作 dom 的成本是非常昂贵的，而 React 首创的 virtual dom 实现了在 js 层面来操作 dom，极大地提高了应用的效率
- 可复用组件: React 的流行带动了组件化的思想，组件化的核心就是在于可复用性，相比于传统的 Web 开发模式也更容易维护，很好地提高了开发效率
- 由 Facebook 维护: React 背靠 Facebook 这座大山，其身后有许多优秀的开发者在维护迭代，同时社区也十分的活跃，开发遇到的大部分问题很快都可以得到解决
- 现实: 最后一点就是国内的现状，大厂的技术栈基本都是基于 React 的，所以向公司(qian)看齐的话 React 也是必不可少的技能 

### 项目预览

先看一下最终的项目效果，可以思考一下利用原生 js 如何实现 ? 

![preview](https://jeremy-bucket.oss-cn-shenzhen.aliyuncs.com/%E5%9B%BE%E5%BA%8A/deepin-screen-recorder_Select%20area_20181208103016.gif)

初始的空模板: 

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Document</title>
</head>
<body>
  
</body>
</html>
```

### JSX

我们首先来看 React 是如何构建界面即渲染元素的: 

- React 的语法为 JSX, 即混合了 JavaScript 和 HTML 的语法

这里我们采用外链引入的方式加入 React 项目最基本的两个链接: 

```html
	<script crossorigin src="https://unpkg.com/react@16/umd/react.development.js"></script>   // react 核心
	<script crossorigin src="https://unpkg.com/react-dom@16/umd/react-dom.development.js"></script>  // react-dom 浏览器(dom)的渲染
```

同时为了直接能够使用 JSX 的语法, 我们还需要**引入 babel 的外链**: 

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/6.26.0/babel.min.js"></script>

// script 标注 type
<script type="text/babel">
// coding....
</script>
```

然后敲上第一行 React 代码:

```js
ReactDOM.render(<h1>Hello React!</h1>, document.getElementById('app'));
```

刷新浏览器:

![Hello React](https://jeremy-bucket.oss-cn-shenzhen.aliyuncs.com/%E5%9B%BE%E5%BA%8A/DeepinScreenshot_select-area_20181207175719.png)

`ReactDOM` 对象来自 `react-dom`, 这里我们调用了它的 `render` 方法, 第一个参数是要渲染的元素, 第二个是实际的 DOM 对象, 这样就成功的将 JSX 元素渲染到了页面上

我们可以看到 JSX 语法实际上跟 HTML 还是很像的, 那么 CSS 呢 ? 

### Styles

内联样式: 

```js
ReactDOM.render(<h1 style={{backgroundColor: 'lightblue'}}>Hello React!</h1>, document.getElementById('app'))
```

外部样式:

```js
const h1Style = {
    backgroundColor: 'lightblue'
}

ReactDOM.render(<h1 style={h1Style}>Hello React!</h1>, document.getElementById('app'))
```

PS: 如果是使用了 css 类选择器, 那么 JSX 中的写法是 **className** (为了与 ES6 的 `class` 区分) 

目前学会这几种写法就足够了

### 组件

我们刚刚在 `render` 方法中直接写的 JSX , 当你的 JSX 元素变得复杂起来就需要单独定义一个 `Component`,  我们先来看看 **无状态组件** 的写法:

```js
function App () {
  return (
    <div>
      <h1>Hello React!</h1>
      <p>react is so awesome!</p>
    </div>
  )
}

ReactDOM.render(<App />, document.getElementById('app'))
```

刷新浏览器: 

![awesome](https://jeremy-bucket.oss-cn-shenzhen.aliyuncs.com/%E5%9B%BE%E5%BA%8A/DeepinScreenshot_select-area_20181207183529.png)

这里需要注意的是**返回的组件必须只由一个最大的标签来包含**

接下来让我们敲一些有意思的: 

```js
function App () {
  const books = ['dataBase', 'data structure', 'computer network']
  return (
    <div>
      <h3>My books: </h3>
      <ul>
        {books.map(book => 
          <li>{book}</li>
        )}  
      </ul>  
    </div>
  )
}

ReactDOM.render(<App />, document.getElementById('app'))
```

我们定义一个 `books` 数组, 然后在函数组件内部使用 ES6 的 `map` 方法循环渲染出对应的 `book` 元素

刷新浏览器:

![books](https://jeremy-bucket.oss-cn-shenzhen.aliyuncs.com/%E5%9B%BE%E5%BA%8A/DeepinScreenshot_select-area_20181207190721.png)

首先我们可以看到界面上出现了三个 `li` , 但是更显眼的是控制台出现了显眼的报错, 这个报错提示很重要, 意即**每一个循环出的元素都需要有一个 `key`** , 这样的话 React 就能在列表变化时识别其中成员的添加 、更改和删除的操作(diff 算法), 会有更好的性能, 因此这里我们使用 `map` 的第二个参数来加上对应的 `key`:

```js
function App () {
  const books = ['dataBase', 'data structure', 'computer network']
  return (
    <div>
      <h3>My books: </h3>
      <ul>
        {books.map((book, i) => 
          <li key={i}>{book}</li>
        )}  
      </ul>  
    </div>
  )
}
```

 刷新控制台不再报错

这里我们也可以发现, `App` 组件内部的循环列表更适合抽出来单独做一个列表组件以实现更好的复用性: 

```js
function BookList () {
  return (
    <ul>
      {books.map((book, i) => 
        <li key={i}>{book}</li>
      )}  
    </ul>  
  )
}

function App () {
  const books = ['dataBase', 'data structure', 'computer network']
  return (
    <div>
      <h3>My books: </h3>
      <BookList />
    </div>
  )
}
```

但是很明显我们又发现了另一个问题,  `books` 数组是定义在 `App` 组件内部的, **`bookList` 组件如何获取到它的值?**

#### props

上面的问题即是父子组件如何传递值? 很直接的想法, 我们可以在父组件内部放置子组件时传入一些自定义的参数:

```js
function App () {
  const books = ['dataBase', 'data structure', 'computer network']
  return (
    <div>
      <h3>My books: </h3>
      <BookList list={books} />
    </div>
  )
}
```

然后我们在 `BookList` 子组件内捕捉到传下来的参数: 

```js
function BookList (props) {
  console.log('props: ', props)
  const books = props.list
  return (
    <ul>
      {books.map((book, i) => 
        <li key={i}>{book}</li>
      )}  
    </ul>  
  )
}
```

刷新浏览器:

![props](https://jeremy-bucket.oss-cn-shenzhen.aliyuncs.com/%E5%9B%BE%E5%BA%8A/DeepinScreenshot_select-area_20181207194244.png)

OK! 这就是 `props`, 我们同时在控制台打印了这个对象, 从这就可以看出数据在不同组件间传递的方式.

现在来思考一个新问题: 目前的数据只是默默地在传递, 不同组件只是单纯地把它显示出来, 如果我们需要添加或者删除这些数据该如何操作, **React 又如何获知这些数据被更改了并及时更新 UI 呢?**

### 类组件

让我们来认识 React 自身给我们提供的另一种组件---类组件

类组件的来源于 ES6 中 的`class`, 这里我们看一下将 `App` 组件改写成类组件的写法:

```js
class App extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      books: ['dataBase', 'data structure', 'computer network']
    }
  }
  render () {
    return (
      <div>
        <h3>My books: </h3>
        <BookList list={this.state.books} />
      </div>
    )
  }
}
```

`React.Component` 是 React 自带的通用类, 它封装了所有 React 类需要的实现细节, 类组件都是通过继承它来实现, 通过重写 `render` 方法来定义返回的组件元素

#### State

我们可以看到原来的 `books` 数组放到了 `constructor` 构造函数中作为该类组件的内部状态来使用: 

```js
this.state = {
	books: ['dataBase', 'data structure', 'computer network']
}
```

`state` 通过使用 `this` 绑定在类上, 我们可以在整个组件内访问到 `state`, 每次修改组件的 `state`, 组件的 `render` 方法会再次运行即组件重新渲染, 那我们可以直接修改 `state` 吗 ?

React 有两个重要的原则: 一个是单向数据流, 另一个是明确的状态改变.  我们**唯一改变 `state` 的方式是通过 `setState()`**

![setState](https://jeremy-bucket.oss-cn-shenzhen.aliyuncs.com/%E5%9B%BE%E5%BA%8A/DeepinScreenshot_select-area_20181207202840.png)

组件在 `render` 中获取最新 `state` 的信息进行渲染, 在 `View` 层通过调用 `setState` 来更新 `state`, 然后组件再次运行 `render` 方法并更新界面.

我们来尝试一下:

```js
class App extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      books: ['database', 'data structure', 'computer network']
    }
  }
  render () {
    return (
      <div>
        <h3>My books: </h3>
        <BookList list={this.state.books} />
        <button onClick={() => this.setState({ books: ['Compilation principle', 'operating system'] })}>Change</button>
      </div>
    )
  }
}
```

![change](https://jeremy-bucket.oss-cn-shenzhen.aliyuncs.com/%E5%9B%BE%E5%BA%8A/deepin-screen-recorder_Select%20area_20181207204543.gif)

#### 事件处理

当 `setState` 关联的逻辑复杂起来以后, 包括我们需要在不同组件间调用 `setState` 时, 从复用性与维护性角度上来说, 我们都需要将事件处理抽离成自定义的函数来调用, React 中推荐事件处理函数的前缀都为 `handle` , 监听函数的前缀都为 `on`:

```js
class App extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      books: ['database', 'data structure', 'computer network'],
      input: ''
    }

    this.handleAddBook = this.handleAddBook.bind(this)
    this.handleRemoveBook = this.handleRemoveBook.bind(this)
    this.updateInput = this.updateInput.bind(this)
  }

  handleAddBook () {
    this.setState(currentState => {
      return {
        books: currentState.books.concat([this.state.input])
      }
    })
  }

  handleRemoveBook (name) {
    this.setState(currentState => {
      return {
        books: currentState.books.filter(book => book !== name)
      }
    })
  }

  updateInput (e) {
    this.setState({
      input: e.target.value
    })
  }

  render () {
    return (
      <div>
        <h3>My books: </h3>
        <input 
          type="text"
          placeholder="new book"
          value={this.state.input}
          onChange={this.updateInput}
        />
        <button onClick={this.handleAddBook}>Add</button>
        <BookList 
          list={this.state.books}
          onRemoveBook={this.handleRemoveBook}
        />
      </div>
    )
  }
}
```

`handleAddBook` 和 `handleRemoveBook` 为新增和修改的操作, 这里还需要特别强调的是构造函数中的这三行代码:

```js
this.handleAddBook = this.handleAddBook.bind(this)
this.handleRemoveBook = this.handleRemoveBook.bind(this)
this.updateInput = this.updateInput.bind(this)
```

当我们想在自定义的类方法中调用 `this.setState` 时, 这里的 `this` 是 `undefined`, 所以为了类组件的 `this` 在类方法中可以访问, 我们需要将 `this` 绑定到类方法上, 而放在构造函数里面的话绑定只会在组件实例化时运行一次, 性能消耗更少.

OK! 事实上到这里我们已经可以基本完成项目预览所呈现的内容了, 现在请你试着做更多的改进以达到下面的效果:

![preview](https://jeremy-bucket.oss-cn-shenzhen.aliyuncs.com/%E5%9B%BE%E5%BA%8A/deepin-screen-recorder_Select%20area_20181208074535.gif)

如果你已经完成, 可以参考以下的代码:

```js
function ActiveBooks (props) {
  return (
    <div>
      <h2>Reading Books</h2>
      <ul>
        {props.list.map((book, i) => (
          <li key={i}>
            <span>{book.name}</span>
            <button onClick={() => props.onRemoveBook(book.name)}>Remove</button>
            <button onClick={() => props.onDeactive(book.name)}>Readed</button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function InactiveBooks (props) {
  return (
    <div>
      <h2>Readed Books</h2>
      <ul>
        {props.list.map((book, i) => (
          <li key={i}>
            <span>{book.name}</span>
            <button onClick={() => props.onActive(book.name)}>Reading</button>
          </li>
        ))}
      </ul>
    </div>
  )
}

class App extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      books: [
        {
          name: 'database',
          active: true
        }, 
        {
          name: 'data structure',
          active: true
        }, 
        {
          name: 'computer network',
          active: true
        }],
      input: ''
    }

    this.handleAddBook = this.handleAddBook.bind(this)
    this.handleRemoveBook = this.handleRemoveBook.bind(this)
    this.handleToggleBook = this.handleToggleBook.bind(this)
    this.updateInput = this.updateInput.bind(this)
  }

  handleAddBook () {
    this.setState(currentState => {
      return {
        books: currentState.books.concat([{
          name: this.state.input,
          active: true
        }]),
        input: ''
      }
    })
  }

  handleRemoveBook (name) {
    this.setState(currentState => {
      return {
        books: currentState.books.filter(book => book.name !== name)
      }
    })
  }

  handleToggleBook (name) {
    this.setState(currentState => {
      const book = currentState.books.find(book => book.name === name)

      return {
        books: currentState.books.filter(book => book.name !== name)
        .concat([{
          name,
          active: !book.active
        }])
      }
    })
  }

  updateInput (e) {
    this.setState({
      input: e.target.value
    })
  }

  render () {
    return (
      <div>
        <h3>My books: </h3>
        <input 
          type="text"
          placeholder="new book"
          value={this.state.input}
          onChange={this.updateInput}
        />
        <button onClick={this.handleAddBook}>Add</button>
        <button onClick={() => this.setState({ books: [] })}> Clear All </button>
        <ActiveBooks 
          list={this.state.books.filter(book => book.active)}
          onRemoveBook={this.handleRemoveBook}
          onDeactive={this.handleToggleBook}
        />
        <InactiveBooks 
          list={this.state.books.filter(book => !book.active)}
          onActive={this.handleToggleBook}
        />
      </div>
    )
  }
}
```

走到这里, 你已经可以自己再写几个小 demo 熟悉一下了, 那么让我们再来思考最后一个问题: 

- 项目中很多时候的数据都是要与后台交互的, 也就是会有**异步的操作**, 在数据还未请求到时我们希望显示加载样式, 请求到以后再更新界面, **这样的逻辑应该放在哪里**?

#### 生命周期

对于上面的问题, 我们实际希望的是当组件被挂载到 DOM 上以后再来渲染界面, 同时对于有很多组件的应用, 当组件销毁时, 我们也需要释放它所占用的资源, 这就是 React **生命周期** 当中很重要的两个函数: `componentDidMount`和 `componentWillUnmout`

让我们整体感觉一下生命周期函数执行的过程: 

```js
class App extends React.Component {
  constructor (props) {
    ......

    console.log('--constructor--')
  }

  componentDidMount () {
    console.log('--componentDidMount--')
  }

  componentDidUpdate () {
    console.log('--componentDidUpdate--')
  }

  componentWillUnmout () {
    console.log('--componentWillUnmout--')
  }

 ......

  render () {
    console.log('--render--')

    return (
      ......
    )
  }
}
```

![life-cycle](https://jeremy-bucket.oss-cn-shenzhen.aliyuncs.com/%E5%9B%BE%E5%BA%8A/deepin-screen-recorder_Select%20area_20181208090707.gif)

我们可以看出, 组件整个的生命周期是从 `constructor` --> `render` --> `componentDidMount`, 然后组件更新再次 `render` --> `componentDidUpdate` , 组件销毁前则会调用 `componentWillUnmout`

接下来我们将会深入使用这几个函数:

让我们先手动模拟一个 API:

```js
  window.API = {
    fetchBooks () {
      return new Promise((res, rej) => {
        const books =  [
          {
            name: 'database',
            active: true
          }, 
          {
            name: 'data structure',
            active: true
          }, 
          {
            name: 'computer network',
            active: false
          }
        ]
        setTimeout(() => res(books), 2000)
      })
    }
  }
```

然后在 `componentDidMount` 函数中调用它:

```js
componentDidMount () {
  console.log('--componentDidMount--')
  
  API.fetchBooks()
    .then(books => {
      this.setState({
        books
      })
    })
}
```

![API](https://jeremy-bucket.oss-cn-shenzhen.aliyuncs.com/%E5%9B%BE%E5%BA%8A/deepin-screen-recorder_Select%20area_20181208093956.gif)

我们可以看到在 `componentDidMount` 之后再去请求数据, 然后 `render` 重新渲染再执行了 `componentDidUpdate`

让我们再来提升一下用户体验加上 Loading 的逻辑:

```js
class App extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      books: [],
      loading: true,
      input: ''
    }

    ......

    console.log('--constructor--')
  }

  componentDidMount () {
    console.log('--componentDidMount--')
    
    API.fetchBooks()
      .then(books => {
        this.setState({
          books,
          loading: false
        })
      })
  }

  componentDidUpdate () {
    console.log('--componentDidUpdate--')
  }

  componentWillUnmout () {
    console.log('--componentWillUnmout--')
  }
  
  ......

  render () {
    console.log('--render--')

    if (this.state.loading === true) {
      return <h2>Loading...</h2>
    }

    return (
      ......
    )
  }
}
```

![Loading](https://jeremy-bucket.oss-cn-shenzhen.aliyuncs.com/%E5%9B%BE%E5%BA%8A/deepin-screen-recorder_Select%20area_20181208094435.gif)

OK! 现在我们整个的 React 入门历程已经结束了, 当然并没有完全实现预览的效果, 鼓励你进一步独立封装一个 `Loading` 组件, 最后让我们简单谈一下更进一步的开发操作

### 更多

#### 脚手架

我们的入门教程是用传统的外链引入方式来使用 React 的, 并且为了使用 JSX  我们还需要再引入 babel , 现代化的 Web 开发流程都是基于 [Webpack](https://webpack.js.org/) 的模块化构建与部署过程, 对于实际成型的项目来说, 一般都推荐使用官方的脚手架 [create-react-app](https://github.com/facebook/create-react-app) 来一步构建, 简化依赖安装与环境部署的流程, 更多地专注在代码逻辑的编写上

#### 状态管理与路由

还记得 React 的定义吗? 它只是专注在用户界面的构建上面, 虽然我们通过类组件可以管理一定的内部状态, 但是当项目复杂到一定程度以后, 避免不了是要引入外部的状态管理库, 这里推荐使用跟 React 理念相合的 [Redux](https://redux.js.org/) ; 目前的单页面应用都需要用到路由管理, 推荐使用 [React-Router](https://github.com/ReactTraining/react-router) 

最后我想说, 前端的技术表面是发展得很快的, 但是内部的原理基本都是万变不离其宗, React 带来的是一种新的变革的开发方式, 希望你以此为起点, 结合 React 的设计理念去深入它更多的特性.