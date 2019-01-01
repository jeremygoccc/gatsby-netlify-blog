---
title: 异步JavaScript请求
date: 2017-12-29 09:56:44
tags:
---

在Udacity上系统学了异步JavaScript请求的课程，这里结合之前自己的理解做一个总结~

### Ajax与XHR

在JavaSctipt中发出异步HTTP请求的步骤：
- 使用`XMLHttpRequest`构造函数创建XHR对象
- 使用`.open()`方法-设置HTTP方法和要获取的资源的URL
- 设置`.onload()`属性-将此属性设为成功获取数据后将运行的函数
- 设置`.onerror()`属性-将此属性设为出现错误后将运行的函数
- 使用`.send()`方法-发送请求

使用响应：
- 使用`.responseText`属性-存储异步请求响应的文本

`XMLHttpRequest`：简称XHR，它提供了向服务器发送请求和解析服务器响应流畅的接口，可以以异步方式从服务器获得更多的信息
IE6及以下不能直接通过XHR对象实例化`XMLHttpRequest`，兼容性实现如下：
```
function createXHR() {
    if(typeof XMLHttpRequest != 'undefined') {
        return new XMLHttpRequest();
    } else if(typeof ActiveXObject != 'undefined') {
        var versions = [
            'MSXML2.XMLHttp.6.0',
            'MSXML2.XMLHttp.3.0',
            'MSXML2.XMLHttp'
        ];
        for(var i = 0; i < versions.length; i++) {
            try{
                return new ActiveXObject(versions[i]);
            } catch(e) {
                // 跳过
            }
        }
    } else {
        throw new Error('你的浏览器不支持XHR对象！');
    }
}
```

`GET`与`POST`： Ajax使用时，`GET`的使用频率高于`POST`，了解一下HTTP头部信息，包含服务器返回的响应头信息和客户端发出去的请求头信息

`GET`请求： 最常用的请求类型，常用于向服务器查询某些信息，在`.open()`方法的第二个参数可以通过URL后的问号给服务器传递键值对数据，服务器接收到以后就会返回响应数据，用`encodeURIComponent()`进行编码处理解决特殊字符传参产生的问题
`POST`请求： 多用于表单提交时，通过`.send()`方法向服务器提交数据，同时一般`POST`请求还需要用XHR来模仿表单提交
`xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');`

性能上说POST请求比GET请求消耗更多，相同数据下，GET请求最多比POST快两倍

封装Ajax：
```

// 名值对编码
function params(data) {
    var arr = [];
    for(var i in data) {
        arr.push(encodeURIComponent(i) + '=' + encodeURIComponent(data[i]));
    }
    return arr.join('&');
}

function ajax(obj) {
    var xhr  = new createXHR();
    obj.url  = obj.url + '?rand=' + Math.random();
    obj.data = params(obj.data);
    if(obj.method === 'get') {
        obj.url = obj.url.indexOf('?') == -1 ? obj.url + '?' + obj.data : obj.url + '&' + obj.data;
    }
    if(obj.async === true) {
        xhr.onreadystatechange = function() {
            if(xhr.readyState == 4) callback();
        }
    }
    xhr.open(obj.method, obj.url, obj.async);

    if(obj.method === 'post') {
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.send(obj.data);
    } else {
        xhr.send();
    }

    if(obj.async === false) callback();

    function callback() {
        if(xhr.status == 200) {
            obj.success(xhr.responseText);
        } else {
            console.log('数据返回失败！状态代码：' + xhr.status + '，状态信息：' + xhr.statusText);
        }
    }
}
```