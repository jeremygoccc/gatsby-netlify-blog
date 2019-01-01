---
title: webpack配置介绍
date: 2018-10-28 14:53:22
tags: webpack
---

这篇文章主要介绍 jeem webpack(4.0)相关的配置，不会针对webpack作过多的详解，算是webpack最佳配置的一个总结，会不断更新~

### Webpack

Webpack 是一个现代 JavaScript 应用程序的静态模块打包器，它处理应用程序时会递归地构建一个依赖关系图，其中包含应用程序所需的各个模块，然后将所有这些模块打包成一个或多个bundle

### 概念

结合四个核心概念介绍目前所需的依赖：

- entry: 入口起点指示 webpack 应该使用哪个模块开始，默认:  `./src`
- output: 出口属性告诉 webpack 在哪里输出它所创建的bundles及如何命名这些文件，默认: `./dist`
- loader: 让 webpack 能够处理非 JavaScript 文件(将所有类型的文件转换为 webpack 能够处理的有效模块)
  - babel-loader:  ES6语法转化
    - 这里一并介绍下跟 babel 相关的技术生态: 
      - babel-preset-env: babel配置文件中使用, 包含 ES6+ 等版本的语法转化规则
      - babel-polyfill: ES6 内置方法和函数转化
      - babel-plugin-transform-runtime: 避免 polyfill 污染全局变量
    - babel-loader 负责的是语法转化，babel-polyfill 负责内置的方法和函数
  - style-loader: 从 js 字符串中生成 style 节点
  - css-loader: 将 css 转化成 commonJS 模块
  - less-loader: 将 less 编译成 css
  - url-loader: 图片处理
- plugins: 用于执行范围更广(从打包优化压缩到重新定义环境中的变量)的任务
  - html-webpack-plugin: 自动生成 html 文件并自动插入静态资源 js脚本
  - mini-css-extract-plugin: css提取压缩
  - clean-webpack-plugin: 重新打包时先清除 dist 目录下的文件

**mode设置：**webpack4 开始通过设置 mode 为 development 或 production 就可以启用相应模式下 webpack 内置的优化

### 实战配置

#### 公用配置

基于 jeem 推荐的语法，公用配置重点在针对 es6+ 和 less 的处理：

- es6+：babel7 转译 es6+ 的依赖是 @babel/polyfill

  - 为什么不用不会污染全局变量的 babel-plugin-transform-runtime？

    jeem 定位是一个框架，针对于提供最良好的使用体验，因此对于api的使用需求会比较高，而babel-plugin-tranform-runtime 不能够转码实例方法(如 repeat includes等)，因此选择支持更多特性的babel-polyfill

- less: less-loader + css-loader + style-loader

先看babel相关的配置：

```js
  "babel": {
    "presets": [
      "@babel/preset-env",
      "@babel/preset-react"
    ],
    "plugins": [
      [
        "import",
        {
          "libraryName": "antd",
          "libraryDirectory": "es",
          "style": true
        }
      ]
    ]
  },
```

接下来直接结合配置注释理解吧：

```js
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpackMerge = require('webpack-merge');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const modeConfig = env => require(`./build/webpack.${env}`)(env);

module.exports = ({ mode } = { mode: 'development', presets: [] }) => webpackMerge(
  {
    mode,
    entry: ['@babel/polyfill', './src/index.js'],
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'bundle.js',
    },
    resolve: {
      alias: {
        '@': path.join(__dirname, '.', 'src'),
      },
    },
    module: {
      rules: [
        {
          test: /\.(js)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
          },
        },
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: ['babel-loader', 'eslint-loader'],
        },
        {
          test: /\.(less)$/,
          exclude: /node_modules/,
          use: [{
            loader: mode === 'development' ? 'style-loader' : MiniCssExtractPlugin.loader, // creates style nodes from JS strings
          }, {
            loader: 'css-loader', // translates CSS into CommonJS
            options: {
              sourceMap: true,
              modules: true,
              localIdentName: '[name]__[local]__[hash:base64:5]',
            },
          }, {
            loader: 'less-loader', // compiles Less to CSS
            options: {
              javascriptEnabled: true,
            },
          }],
        },
        {
          test: /\.(less)$/,
          exclude: /src/,
          use: [{
            loader: mode === 'development' ? 'style-loader' : MiniCssExtractPlugin.loader, // creates style nodes from JS strings
          }, {
            loader: 'css-loader', // translates CSS into CommonJS
          }, {
            loader: 'less-loader', // compiles Less to CSS
            options: {
              javascriptEnabled: true,
            },
          }],
        },
        {
          test: /\.(jpe?g|png|gif)$/,
          use: [
            {
              loader: 'url-loader',
              options: {
                name: '[name]-[hash:5].min.[ext]',
                limit: 20000,
                publicPath: 'static/',
                outputPath: 'static/',
              },
            },
          ],
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './src/index.html',
      }),
      new webpack.ProgressPlugin(),
      new MiniCssExtractPlugin(),
    ],
  },
  modeConfig(mode),
);

```

#### 开发配置

开发配置主要需要的是热更新以及调试直接定位源码（结合webpack4 development模式内置优化）：

```js
// build/webpack.development.js
const webpack = require('webpack')

module.exports = () => ({
  devtool: 'source-map', //方便调试
  devServer: {
    hot: true,    // 结合下面的plugin开启热更新
    overlay: true // 报错网页遮罩提示
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ]
})
```

#### 生产配置

webpack4 production 模式已经内置了针对压缩打包方面的优化，这里目前解决的是多次重复打包dist目录下会出现冗余的文件：

```js
// build/webpack.production.js
const path = require('path')
const CleanWebpackPlugin = require('clean-webpack-plugin')

module.exports = () => ({
  output: {
    filename: 'bundle.js'
  },
  plugins: [
    new CleanWebpackPlugin(['dist'], {
      root: path.resolve(__dirname, '../'),　　// webpack根目录的绝对路径
      verbose: true // 写入日志调试
    })
  ]
})
```

以上就是 jeem 目前 webpack 相关的配置，后续 jeem 进一步开发需要支持的也会越多 (如 file image等处理)，届时会同步更新~





