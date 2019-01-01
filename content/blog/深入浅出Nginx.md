---
title: 深入浅出Nginx
date: 2018-05-29 19:31:26
tags:
---

之前在自己的阿里云服务器上部署了Nginx服务主要用作node服务的代理，这里看到一篇不错的文章简记一下~

### 前言
Nginx是一款轻量级的Web服务器及反向代理服务器，因为内存中占用少、启动极快、高并发能力强的原因，在互联网项目中广泛应用
![](https://ws1.sinaimg.cn/large/e4336439gy1frsgjbi5aej20j40e2aax.jpg)
>当下流行的技术架构，nginx有点像入口网关

### 代理
#### 正向代理
- 平时我们使用梯子访问谷歌就是一个简单的正向代理的例子，正向代理“代理”的是客户端，客户端是知道目标的，但是目标不知道客户端是通过梯子访问的

#### 反向代理
- 我们在外网访问百度时会进行一个转发代理到内网既是反向代理，反向代理“代理”的是服务器端，这一个过程对于客户端是透明的

### Master-Worker模式
启动Nginx后，就是在80端口启动了Socket服务进行监听，Nginx涉及Mater进程和Worker进程
![](https://ws1.sinaimg.cn/large/e4336439gy1frsg790v3mj20m503uaad.jpg)
#### Mater进程作用
- 读取并验证配置文件nginx.conf，管理worker进程

#### Worker进程作用
- Worker进程作用：每一个Worker进程都维护一个线程（避免线程切换），处理连接和请求；注意Worker进程的个数由配置文件决定，一般和CPU个数有关（有利于进程切换）

#### 热部署
- 热部署：配置文件nginx.conf修改以后不需要stop nginx中断请求，就能让配置文件生效
结合worker进程负责处理具体的请求：
    + 方案一：修改nginx.conf后，主进程master负责推送给worker进程更新配置信息，worker进程收到信息后更新进程内部的线程信息
    + 方案二：修改nginx.conf后，重新生成新的worker进程，以新的配置进行处理请求，老的woker进程等它们的请求处理完毕后kill掉即可
nginx采用方案二实现热部署

#### 如何做到高并发下的高效处理
- 上文已经提及nginx的worker进程个数与CPU绑定、worker进程内部包含一个线程高效回环处理请求，的确有助于效率但是不够。同时处理那么多请求的问题在于，有的请求需要发生IO，可能需要很长时间，如果等着它们，就会拖慢worker的处理速度
    + nginx采用了Linux的epoll模型，这个模型基于事件驱动机制，它可以监控多个事件是否准备完毕，如果OK，那么放入epoll队列中，这个过程是异步的。所以worker只需要从epoll队列循环处理即可
- nginx挂了怎么办：nginx作为入口网关，如果出现单点问题显然是不可接受的
    + 解决方案：Keepalived + Nginx
    + keepalived 是一个高可用解决方案，主要用来防止服务器单点发生故障，可以通过和nginx配合来实现Web服务的高可用
    + 思路：
        * 请求不要直接打到nginx上，应该先通过Keepalived (虚拟IP)
        * Keepalived 应该能监控nginx的生命状态（提供一个用户自定义的脚本，定期检查nginx进程状态，进行权重变化，从而实现nginx故障切换）
        ![](https://ws1.sinaimg.cn/large/e4336439gy1frsgov5bh3j20jg07tdgl.jpg)

### 主战场：nginx.conf
nginx.conf是典型的分段配置文件
#### 虚拟主机
- ![](https://ws1.sinaimg.cn/large/e4336439gy1frsgrqy6tsj20ia080t8w.jpg)
- 把nginx作为web server来处理静态资源
    + location可以进行正则匹配，注意正则的几种形式以及优先级
    + nginx能提高速度的其中一个特性：动静分离，把静态资源放到nginx上，由nginx管理，动态请求转发给后端
    + 在nginx下将静态资源、日志文件归属到不同域名（目录）下，方便管理维护
    + nginx可以进行ip访问控制，如有些电商平台，在nginx这一层就做了处理，内置一个黑名单模块
#### 反向代理
- 在location这一段配置中的root替换成proxy_pass即可
    + root说明是静态资源，可以由nginx进行返回；而proxy_pass说明是动态请求，需要进行转发，如代理到Tomcat上
    + 反向代理过程是透明的，比如在request->nginx->Tomcat这里对于Tomcat而言请求的ip就是nginx的地址而不是真实的request地址。好在nginx不仅仅可以反向代理请求，也可以由用户自定义设置HTTP HEADER
#### 负载均衡
- 在反向代理中，通过proxy_pass来指定Tomcat的地址，这里只能指定一台Tomcat，如果想指定多台来达到负载均衡呢？
    +  通过 upstream 来定义一组Tomcat，并指定负载策略（IPHASH、加权论调、最少连接），健康检查策略（nginx监控这一组Tomcat的状态）等
    +  将proxy_pass换成upstream指定的值即可
- 带来的问题：用户状态的保存问题，如session信息不能保存到服务器上

### 缓存
- 在配置上开启，同时指定目录，让缓存可以存储到磁盘上


参考：
http://blog.51cto.com/zhangfengzhe/2064524
