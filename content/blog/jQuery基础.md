---
title: jQuery基础
date: 2017-11-23 19:13:18
tags: javascript
---

# 基础核心

### 代码风格

**'$'**： **jQuery** 当中最重要并且独有的对象：jQuery对象
```
$(function() {});           //执行一个匿名函数
$('#box');                  //进行执行的ID元素选择
$('#box').css('color','red');  //执行功能函数

/*等同于*/
jQuery(function() {});
jQuery('#box');
```

执行功能函数时，先获取元素返回 **jQuery** 对象后再调用功能函数，同时返回的还是 **jQuery** 对象，所以可以连缀不停的调用功能函数

```
$('#box').css('color','red').css('font-size','50px');
```

### 加载模式

**jQuery** 等待加载：

```
$(document).ready(function () {});
```
它的执行时机只需等待网页中的DOM结构加载完毕就可以执行包裹的代码，并且可以执行多次不会覆盖

 **window.onload** 需要等待图片之类的大型元素加载完毕后才能执行JS代码，在网速慢的情况下，图片还在缓慢加载时，页面上任何的JS交互功能都会处在假死状态，同时只能执行一次，会给实际开发带来困难

### 对象互换

**jQuery** 对象是 **jQuery** 库独有的对象，通过JS封装而来，可以直接输出得到它的信息

只要使用代码包裹以后，最终返回的都是 **jQuery** 对象，好处就是可以连缀处理，如果需要返回原生的DOM对象的话，可以这么处理：

```
$('#box').get(0);    //ID元素的第一个原生DOM
```
从get(0)的索引看出， **jQuery** 可以批量处理DOM，在循环遍历上会更方便

### 多个库之间的冲突

同一个项目中引入多个第三方库时，由于没有命名空间的约束，不同库之间很容易发生冲突

对于同样使用'$'作为基准起始符的库(如 **Base** 库)，想和 **jQuery** 共存的话有两种办法：

1. 先引入 **jQuery** 库，这样'$'的所有权就归之后的库所有， **jQuery** 可以直接用jQuery对象调用，或者创建一个新符('$$')给它用：

```
var $$ = jQuery;
$(function () {
    $('#box').get(0);       // 都是Base的$
    $$('#box').width(0);    // jQuery的$$
});
```

2. 后引入 **jQuery** 库，'$'归 **jQuery** 库，**jQuery** 有一个方法可以放弃：

```
jQuery.noConflict();    // 将$符所有权剔除
var $$ = jQuery;
$(function () {
    ...                 // $属于Bae, $$属于jQuery
});
```

# 工具函数

### 字符串操作

```
var str = '   sad';
$.trim(str);         //去除字符串左右空格
```

### 数组和对象操作

```
/*$.each()遍历数组*/
var arr = ['张三','李四','王五'];
$.each(arr,function(index, value) {
    $('#box').html($('#box').html + index + '.' + value + '<br>');
});

/*遍历对象*/
$.each($.ajax(), function(name, fn) {
    $('#box').html($('#box').html() + name + '.' + '<br><br>');
})
```

```
/*$.grep()数据筛选*/
var arr = [5,3,5,7,45,98,23,10];
$.grep(arr, function(element, index) {
    return element < 6 && index < 5;
});
/*index从0开始计算*/
```

```
/*$.map()修改数据*/
var arr = [5,6,87,54,32,4,10];
$.map(arr, function(element, index) {
    if(element < 6 && index < 5) {
        return element + 1;
    }
});
```
► **$.merge()** 合并两个数组

► **$.unique()** 删除重复的DOM元素

► **.toArray()** 合并多个DOM元素组成数组

...

### 测试操作

![Markdown](http://i1.bvimg.com/1949/4e368b483728b084.png)

### URL操作

```
/*$.param()将对象键值对转换为URL字符串键值对*/
var obj = {
    name : 'Lee',
    age : '20'
};
$.param(obj);
```

### 其它操作
jQuery提供了一个预备绑定函数上下文的工具函数: $.proxy(),可以解决如外部事件触发调用对象方法时this的指向问题

```
/*$.proxy()调整this指向*/
var obj = {
    name : 'Lee',
    test: function() {
        alert(this.name);
    }
}

$('#box').click(obj.test);              //this指向为#box元素，undefined
$('#box').click($.proxy(obj,'test'));   //this指向为对象box，Lee

/*等效于*/
var obj = {
    name : 'Lee',
    test : function() {
        var _this = obj;
        alert(_this.name);
    }
}
```