---
title: Flex-Grid布局
date: 2018-03-27 18:07:42
tags:
---

关于Flex&Grid布局的语法实例

#### Flex：更简洁制作智能布局的现代语法
- w3c于09年提出的一个新的布局方案，可以方便地实现各种页面布局
- 移动端开发的主流：H5页面、微信小程序

对比：实现子元素在父元素水平垂直居中的效果
![](https://ws1.sinaimg.cn/large/e4336439gy1fprjjpytkgj208y06ydfp.jpg)
传统定位方案：
```
.dad {
    position: relative;
}
.son {
    position: absolute;
    margin: auto;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
}
```
```
.par {
    background-color: red;
    width: 300px;
    height: 500px;
    position: relative;
}
.child {
    background-color: blue;
    width: 200px;
    height: 200px;
    position: relative;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}
```
上面两种方案都需要同时对父元素与子元素设置定位

弹性盒：
```
.par {
    background-color: red;
    width: 300px;
    height: 500px;
    display: flex;
    justify-content: center;
    align-items: center;
}
.child {
    background-color: blue;
    width: 200px;
    height: 200px;
}
```

语法详解：
![](https://ws1.sinaimg.cn/large/e4336439gy1fprjpsv61zj208j07cq35.jpg)
初始概念：主轴/纵轴(flex-direction)：默认为row：从左到右、水平排列
                                        column：从上到下、竖直排列
开始：Flex容器：父元素显式设置：display: flex
     Flex项目：Flex容器内的子元素
![](https://ws1.sinaimg.cn/large/e4336439gy1fprjtm573xj20fe07ftam.jpg)
![](https://ws1.sinaimg.cn/large/e4336439gy1fprjtywr0pj20fe07ddhl.jpg)
实例---简易导航系统的实现：
```
// css部分参考
html, body {
    margin: 0;
    padding: 0;
    list-style: none;
}
nav {
    height: 80px;
    background-color: #646262;
    display: flex;
    align-items: center;
}
ul {
    display: flex;
    flex-grow: 1
}
ul li {
    width: 100px;
    margin: 10px;
    text-align: center;
    color: white;
}
ul li:nth-child(1) {
    margin-left: auto;
}
ul button {
    margin-right: auto;
    margin-left: 5%;
    width: 70px;
    color: white;
    font-size: 1em;
    background-color: #50cd50;
    cursor: pointer;
}
ul button:hover {
    background-color: green;
    transition: all .5s ease;
}
img {
    width: 20%;
    margin-left: 5%;
}
```

实例二---自适应的导航栏
关键：搜索框自动填满导航栏剩余的位置
实现：.search的属性设为flex: 1(flex-grow、flex-shrink、flex-basis的缩写)
扩展：媒体查询：
```
@media all and (max-width: 600px) {
    .container {
        flex-wrap: wrap;
    }
    .container > li {
        flex: 1 1 50%;
    }
    .search-input {
        text-align: center;
    }
}
@media all and (max-width: 400px) {
    .container > li {
        flex: 1 1 100%;
    }
    .search-input {
        text-align: center;
    }
    .search {
        order: 1;
    }
}
```

#### Grid： CSS布局的未来
- 二维布局
- 基本概念：
    + 网格线：分界线构成了网格的结构
    + 网格轨道：两个相邻网格线之间的空间
    + 网格单元格：两个相邻行与相邻列之间的网格线空间
    + 网格区域：由任意数量的网格单元格组成
- 网格容器属性：
    + grid-template-columns/row：利用空格分隔的值定义网格的列与行
    + grid-template-areas：定义网格区域名称，从而定义网格模板
    + grid-(column/row)-gap：指定网格线的大小，即行列之间的宽度
    + justify/align-content/items：沿列/行轴对齐网格项的内容/网格
- 网格项属性：
    + grid-column/row：使用特定的网格线确定网格项在网格中的位置
    + grid-area：对应网格模板给网格项命名
    + justify/align-self：沿列/行轴对应网格项中的内容
- 实例：自适应的首页布局：
```
.container {
    height: 100%;
    display: grid;
    grid-template-columns: 1fr 5fr;
    grid-template-rows: 100px auto 100px;
}
.header {
    grid-column: 1 / -1;
}
.menu {
    grid-row: 2 / 3;
}
.content {
    grid-column: 2 / -1;
}
.footer {
    grid-column: 1 / -1;
}
```

参考：
http://www.ruanyifeng.com/blog/2015/07/flex-grammar.html
https://www.w3cplus.com/css3/understanding-flexbox-everything-you-need-to-know.html
https://www.w3cplus.com/css3/a-complete-guide-css-grid-layout.html