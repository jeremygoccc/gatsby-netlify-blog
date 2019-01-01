---
title: HTML5&CSS3关键点
date: 2018-03-13 20:40:27
tags:
---

工作室第七期培训第二课主讲了关于前端三大基础的知识，重点落在HTML5与CSS3上，这里做一个记录，类似的知识以后不断更新~

HTML:
 -  DOM树：浏览器解析HTML文本的形式，树上的所有节点都可以通过js访问
 -  元素类型： 块级元素与行内元素的区别
     +  区别一：块级：块级元素会独占一行，默认情况下宽度自动填满其父元素宽度行内：行内元素不会独占一行，相邻的行内元素会排在同一行。其宽度随内容的变化而变化。
        区别二：块级：块级元素可以设置宽高行内：行内元素不可以设置宽高
        区别三：块级：块级元素可以设置margin，padding行内：行内元素水平方向的margin-left; margin-right; padding-left; padding-right;可以生效。但是竖直方向的margin-bottom; margin-top; padding-top; padding-bottom;却不能生效。
        区别四：块级：display:block;行内：display:inline;可以通过修改display属性来切换块级元素和行内元素
 -  语义化：用正确的标签做正确的事情，不仅仅让浏览器易于理解与搜索引擎解析，也要让人易于阅读

CSS：
 -  盒模型： box-sizing设置盒模型宽度的计算规则，一般设置成border-box（IE传统盒模型）
 -  浮动： 脱离文档流，浮动后横向排列，浮动元素总是保证自己的顶部和上一个元素（标准流中的）的底部对齐；clear只能影响使用清除的元素本身
 -  扩展：BFC（块级格式化上下文）
     +  浮动与清除浮动只会应用于同一个BFC内的元素
     +  计算BFC的高度时，浮动元素也会参与计算（浮动元素的父元素高度塌陷问题）
 -  定位：absolute: 根据最近设置定位的祖先元素排列
 -  怎样居中一个div：
    
    ```
    // 传统方案：position + transform
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
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }

    // 弹性盒（考虑兼容性）：flex
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
