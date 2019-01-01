---
title: Hexo + Github Pages搭建你的博客
date: 2017-11-23 17:24:47
tags: hexo
---

一开始自己用hexo搭博客的时候踩了比较多坑，在这里想总结一下做一个简单的搭建教程，后续使用再慢慢完善

# 初始配置环境
- [node](https://nodejs.org/en/) 作用：生成静态页面
- [Git](https://git-scm.com/) 作用：将本地的hexo内容提交到github上
- [申请Github](https://github.com/) 作用：作为博客的远程仓库和服务器

# Hexo的安装及初始化
环境配置好后，创建一个文件夹，进入后执行以下命令：
- `npm install hexo-cli -g` 安装hexo
- `hexo init` 初始化
- `npm install`
- `hexo generate` 生成静态页面
- `hexo server` 启动本地服务
之后浏览器输入[localhost:4000](http://localhost:4000) 就可以看到一个默认的hexo博客啦

# Github上的配置
进入Github新建一个仓库，这里特别要强调的是仓库名的格式必须为yourusername.github.io，yourusername就是你的Github用户名，这里错误的话，之后直接访问就会404（我就是这样o(╥﹏╥)o）,建好以后就clone一下HTTPS形式的url（这里先不用SSH）

# 本地Hexo文件的修改
进入Hexo文件根目录下的_config.yml，打开以后拉到最下面的deploy那里，改成如下形式：
```
deploy:
  type: git
  repo: https://github.com/fxbabys/fxbabys.github.io.git
  branch: master
```
这里也特别要强调的是冒号后面一定要加空格

然后执行命令安装: `npm install hexo-deployer-git --save`
再执行配置命令: `hexo deploy`
这样本地文件就上传到Github远程库上了，访问[https://fxbabys.github.io/](https://fxbabys.github.io/)就行了

之后每次部署发布文章可以按下面的步骤进行：
- `hexo new "文章名称"` 这样会在source/_posts下生成一个md文档
- `hexo server(hexo s)` 上传前本地先预览一下效果
- `hexo generate(hexo g)`
- `hexo deploy(hexo d)`

到这里搭建一个hexo博客和发布新文章就完成啦！
更个性化的设置可以自己去[Hexo](https://hexo.io/)官方文档上查看，介绍的都很详细，也可以去网上找教程再多折腾一些自己的喜好（(*^▽^*)）

