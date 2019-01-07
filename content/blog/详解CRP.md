---
title: 详解 CRP:如何最大化提升首屏渲染速度
date: 2019-01-06 21:43:42
tags: 写作计划
---



在前端性能优化树上有很多值得展开的话题，**从输入 URL 到页面加载完成发生了什么** 这一道经典的面试题就涉及到很多内容，但前端主要关注的部分就是 **浏览器解析响应的内容并渲染展示给用户** 这一步，本文将会详细分析这一步的具体过程并在分析的过程中理解该如何做性能优化。

首先介绍一个名词 **CRP**，即 **关键渲染路径** (Critical Rendering Path)（后文统一以 CRP 指代）:

> 关键渲染路径是浏览器将 HTML CSS JavaScript 转换为在屏幕上呈现的像素内容所经历的一系列步骤。

## 将 HTML 转换成 DOM 树

当我们请求某个 URL 以后，浏览器获得响应的数据并将所有的标记转换到我们在屏幕上所看到的 `HTML`，有没有想过这中间发生了什么？

浏览器会遵循定义好的完善步骤，从处理 HTML 和构建 DOM 开始: 

- 当遇到 HTML **标记**时，浏览器会发出一个令牌，生成诸如 `StartTag: HTML` `StartTag:head` `Tag: meta` `EndTag: head` 这样的令牌 ，整个浏览由令牌生成器来完成。
- 在令牌生成的同时，另一个流程会同时消耗这些令牌并转换成 `HTML` `head` 这些节点对象，起始和结束令牌表明了节点之间的关系。
- 当所有的令牌消耗完以后就转换成了DOM（文档对象模型）。

> DOM 是一个树结构，表示了 HTML 的**内容**和**属性**以及各个节点之间的关系。

![ToDOM](https://jeremy-bucket.oss-cn-shenzhen.aliyuncs.com/%E5%9B%BE%E5%BA%8A/DOM.png)

比如以下代码: 

```html
<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <link href="style.css" rel="stylesheet">
    <title>Critical Path</title>
  </head>
  <body>
    <p>Hello <span>web performance</span> students!</p>
    <div><img src="awesome-photo.jpg"></div>
  </body>
</html>
```

最终就转成下面的 DOM 树: 

![DOM](https://developers.google.com/web/fundamentals/performance/critical-rendering-path/images/dom-tree.png)

浏览器现在有了页面的内容，那么该如何展示这个页面本身呢？

## 将 CSS 转换成 CSSOM 树

与转换 HTML 类似，浏览器首先会识别 CSS 正确的令牌，然后将这些令牌转成 CSS 节点，子节点会继承父节点的样式规则，这就是层叠规则和层叠样式表。

![ToCSSOM](https://jeremy-bucket.oss-cn-shenzhen.aliyuncs.com/%E5%9B%BE%E5%BA%8A/CSSOM.png)

比如上面的 HTML 代码有以下的 CSS :

```css
body { font-size: 16px }
p { font-weight: bold }
span { color: red }
p span { display: none }
img { float: right }
```

最终就转成下面的 CSSOM 树:

![CSSOM](https://developers.google.com/web/fundamentals/performance/critical-rendering-path/images/cssom-tree.png)

这里需要特别区分的是，**DOM 树会逐步构建来使页面更快地呈现，但是 CSSOM 树构建时会阻止页面呈现**。

原因很简单，如果 CSSOM 树也可以逐步呈现页面的话，那么之后新生成的子节点样式规则有可能会覆盖之前的规则，这就会导致页面的错误渲染。

让我们来做一个思考题，请看以下的 HTML 代码:

```html
<div>
    <h1>H1 title</h1>
    <p>Lorem...</p>
</div>
```

对于以下两个样式规则，哪个样式规则会渲染得更快?

```css
h1 { font-size: 16px }
div p { font-size: 12px }
```

直觉上很容易觉得第二个规则是更具体的，应该会渲染更快，但实际上恰恰相反:

- 第一条规则是非常简单的，一旦遇到 h1 标记，就会将字号设成 16px。
- 第二条规则更复杂，首先它规定了我们应该满足所有 p 标记，但是当我们找到 p 标记时，还需要向上遍历 DOM 树，只有当父节点是 div 时才会应用这个规则。
- 所以**更加具体的标记要求浏览器处理的工作更多**，实际编写中应该尽可能避免编写过于具体的选择器。

那么到现在为止，DOM 树包含了页面的所有内容，CSSOM 树包含了页面的所有样式，接下来如何将内容和样式转成像素显示到屏幕上呢?

## 将 DOM 和 CSSOM 树组成渲染树

浏览器会从 DOM 树的根部开始看有没有相符的 CSS 规则，如果有的话就将节点和样式复制到渲染树上，没有的话就只将节点复制过来，然后继续向下遍历。

特别要注意的是，渲染树最重要的特性是**只捕获可见内容**，因此如果一个节点的属性标记为 `display: none`，表示这个节点不应该呈现，则这个节点和其子项都会直接跳过。

比如以下将 DOM 树和 CSSOM 树合并成渲染树的结果:

![渲染树](https://developers.google.com/web/fundamentals/performance/critical-rendering-path/images/render-tree-construction.png)

现在我们已经有了渲染树，接下来要做的是确定元素在页面上的位置。

## 布局与绘制

我们考虑以下的代码: 

```html
<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Critial Path: Hello world!</title>
  </head>
  <body>
    <div style="width: 50%">
      <div style="width: 50%">Hello world!</div>
    </div>
  </body>
</html>
```

浏览器在渲染时会将这里父 div 的宽度设置成 body 的 50%，将子 div 的宽度设成父 div 的 50%，那么这里 body 的宽度是如何确定的?

注意我们在 meta 标签中设置了一行代码:

```html
<meta name="viewport" content="width=device-width,initial-scale=1">
```

我们在实际进行自适应网页设计时都会加上这行代码表示布局视口的宽度等于设备的宽度，因此呈现出来就是这样:

![viewport](https://developers.google.com/web/fundamentals/performance/critical-rendering-path/images/layout-viewport.png)

最后一步就是将所有准备好的内容 **绘制** 到页面上。

> 任何时候我们想要更新渲染树时，可能都会重新进行布局和绘制这一过程，浏览器本身会采取各种智能的功能尝试重新绘制最低请求区域，但具体还是取决于我们向渲染树应用了哪种类型的更新。

## 如何优化

>在谈优化之前，我们先定义一下用来描述 CRP 的词汇:
>
>- 关键资源: 可能阻止网页首次渲染的资源。
>- 关键路径长度: 获取所有关键资源所需的往返次数或总时间。
>- 关键字节: 实现网页首次渲染所需的总字节数，等同于所有关键资源传送文件大小的总和。

结合我们谈过的步骤，我们着重会考虑的优化策略是在合成渲染树之前。

首先我们可以**优化DOM**，具体体现在以下几步:

- 删除不必要的代码和注释包括空格，尽量做到最小化文件。
- 可以利用 GZIP 压缩文件。
- 结合 HTTP 缓存文件。

然后是**优化CSSOM**，缩小 压缩以及缓存同样重要，对于 CSSOM 我们前面重点提过了**它会阻止页面呈现**，因此我们可以从这方面考虑去优化，让我们看下面的代码:

```css
body { font-size: 16px }
@media screen and (orientation: landscape) {
    .menu { float: right }
}
@media print {
    body { font-size: 12px }
}
```

当浏览器遇到 CSS 时，会阻止呈现页面直到 CSSOM 解析完毕，但是对于一些特定场合才会运用的 CSS (比如上面两个媒体查询)，浏览器会依旧请求，但不会阻塞渲染了，这也是为什么我们有时会将 CSS 文件拆分到不同的文件，上面的样式表声明可以优化成这样: 

```css
<link href="style.css"    rel="stylesheet">
<link href="landscape.css" rel="stylesheet" media="orientation:landscape">
<link href="print.css"    rel="stylesheet" media="print">
```

当我们用 PageSpeed Insights 检测我们的网站时，经常出现的一条就是 **建议减少关键 CSS 元素数量** 。

[Google 官方文档](https://developers.google.com/web/fundamentals/performance/critical-rendering-path/render-blocking-css)也建议: **当我们声明样式表时，请密切关注媒体查询的类型，它们极大地影响了 CRP 的性能** 。

接下来让我们考虑 `JavaScript` 外部依赖可以优化的地方，再看下面的代码:

```html
<p>
    Awesome page
    <script src="write.js"></script>
    is awesome
</p>
```

当浏览器遇到 script 标记时，会**阻止解析器继续操作，直到 CSSOM 构建完毕**，`JavaScript` 才会运行并继续完成 DOM 构建过程，对于 `JavaScript` 依赖的优化，我们最常用的一种方法是当网页加载完成，浏览器发出 onload 事件后再去执行脚本(或者直接放在底部)，但实际上还有更简单的策略:

- `async`: 当我们在 script 标记添加 `async` 属性以后，浏览器遇到这个 script 标记时会继续解析 DOM，同时脚本也不会被 CSSOM 阻止，即不会阻止 CRP。
- `defer`:  与 `async` 的区别在于，脚本需要等到文档解析后( `DOMContentLoaded` 事件前)执行，而 `async` 允许脚本在文档解析时位于后台运行。
- 当我们的脚本不会修改 DOM 或 CSSOM 时，推荐使用 `async` 。

这里给出一个参考图:

![render](https://jeremy-bucket.oss-cn-shenzhen.aliyuncs.com/%E5%9B%BE%E5%BA%8A/TIM%E5%9B%BE%E7%89%8720190107125407.jpg)

> 浏览器还有一个特殊的流程，叫做预加载扫描器，它会提前扫描文档并发现关键的 CSS 和 JS 资源来下载，这个过程不会阻塞渲染，想详细了解它的原理可以浏览这篇文章 [How the Browser Pre-loader Makes Pages Load Faster](https://andydavies.me/blog/2013/10/22/how-the-browser-pre-loader-makes-pages-load-faster/)

总结一下，为了首屏最快地渲染，我们通常会采取下列步骤:

- 分析并用 **关键资源数** **关键字节数** **关键路径长度** 来描述我们的 CRP 。
- 最小化关键资源数: 消除它们(内联) 推迟它们的下载或者使它们异步解析等等 。
- 优化关键字节数来减少下载时间 。
- 优化加载剩余关键资源的顺序: 让关键资源尽早下载以减少 CRP 长度 。

> 详细的优化建议可以阅读 [PageSpeed Rules and Recommendations](https://developers.google.com/web/fundamentals/performance/critical-rendering-path/page-speed-rules-and-recommendations)



## 参考

- [Google Developers 官方文档: Critical Rendering Path](https://developers.google.com/web/fundamentals/performance/critical-rendering-path/) 系列

