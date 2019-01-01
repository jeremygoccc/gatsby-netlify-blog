---
title: WebSocket实践
date: 2018-02-02 19:04:49
tags: WebSocket
---

做小程序项目的时候有实时通信的需求，这里就整理一下WebSocket的知识

### 关于WebSocket
- 前言：Web应用的信息交互过程一般是客户端通过浏览器发出一个请求，服务器端接收完请求后进行处理并且返回结果给客户端，然后客户端浏览器解析信息，这样的机制对于实时要求比较高的应用来说就有很大的受限了，因此需要有一种高效节能的双向通信机制来保证数据的实时传输，WebSocket应运而生
- 概念：
  - MDN: WebSocket是一个可以创建和服务器间进行双向会话的高级技术，通过这个API你可以向服务器发送消息并接受基于事件驱动的响应，这样就不用向服务器轮询获取数据了
  - WebSocket有web TCP之称，顾名思义是用来通信的，作为HTML5中新增的一种通信协议，由TCP协议与编程API组成，可以在浏览器与服务器之间建立双向连接，以基于事件的方式，赋予浏览器原生的实时通信能力，从而扩展我们的web应用，提升应用性能与用户体验
- 为什么使用：
  在WebSocket出现之前有一些其它的实时通讯方案，比如轮询、长轮询、服务器发送事件
  - 轮询(Polling)：客户端以一定的时间间隔向服务器发送请求，通过频繁请求的方式来保持客户端和服务器端的数据同步。通常采取`setInterval`或者`setTimeout`实现。问题：客户端以固定频率向服务器端发送请求时，服务器端的数据可能并没有更新，这样很多请求就是没有必要的，浪费带宽，低效率
  - 长轮询(Long Polling)：对定时轮询的改进和提高，当服务器端没有数据更新的时候，连接会保持一段时间周期直到数据或状态改变或者时间过期，以此减少无效的客户端与服务器间的交互。问题：如果服务端的数据变更非常频繁的话，与定时轮询比较起来没有本质上性能的提高
  - 服务器发送事件(Server-Sent Event)：是HTML5规范的一个组成部分，可以实现服务器到客户端的单向数据通信，通过SSE，客户端可以自动获取数据更新，而不用重复发送HTTP请求。问题：只支持到服务器到客户端单向的事件推送，而且所有版本的IE都不支持SSE
  - WebSocket：在流量与负载量增大的情况下，相比于传统的Ajax轮询方案有极大的性能优势，在开发方面也不算复杂，只需要实例化WebSocket创建连接，成功后就可以发送相应消息了

### Node实现
这里采用Node的ws库来实现简单的WebSocket服务器
- 服务器：
```
var WebSocketServer = require("ws").Server;
var wss = new WebSocketServer({
    port: 3001
});

wss.on("connection", function(ws) {
    ws.on("message", function(msg) {
        console.log(msg);
        ws.send("Nice to meet you!");
    });
    ws.on("close", function() {
        console.log("Stop client");
    });
});
```
- 小程序客户端：
```
wx.connectSocket({
    url: '服务器的链接:3001',
    data: {},
    header: {
        'content-type': 'application/json'
    },
    method: 'GET',
    success: function() {
        console.log("客户端连接成功");
    }
}),
wx.onSocketOpen(function() {
    console.log("WebSocket连接已打开");
    wx.sendSocketMessage({
        data: 'Hello!'
    });
}),
wx.onSocketMessage(function(msg) {
    console.log("接收到："+ msg);
});
```
这里特别提一下`wx.onSocketMessage()`，因为它只接收字符串和二进制类型的数据，因此如果需要发送json格式的数据就需要转换一下，只要是支持WebSocket肯定支持原生window.JSON，所以可以直接使用JSON.parse()和JSON.stringify()来转换

这样一个双向通信的实例基本就完成了