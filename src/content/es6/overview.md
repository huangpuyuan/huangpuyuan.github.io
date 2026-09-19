---
title: "ES6 语法练习：从 gulp 到一行 script"
description: "2017 年跟着教程把 ES6 语法过了一遍，17 个 lesson。当时用 gulp 3 + webpack 2 + babel 才跑得起来，现在这些语法早就进了标准——一个 script 标签就够。"
order: 1
slug: overview
minutes: 10
tag: "概览"
updated: "2026-09-19"
---

2017 年 4 月，我跟着一套 ES6 教程把新语法过了一遍，从 `let`/`const` 一路写到 Generator，攒下 17 个 lesson。

当年的运行方式很折腾。仓库里有 `gulpfile.babel.js`，构建栈是 **gulp 3.9 + webpack 2 + babel-preset-es2015**——因为那年 Babel 的定位还是「把 ES6 编译成 ES5 让浏览器能懂」。写个 `let` 都要编译一遍才能看效果。

现在是 2026 年。`let`、解构、模板字符串、箭头函数、`class`、`Promise`、Generator——**这些全都进了标准，Chrome 原生就认**。整个构建栈可以删掉，只剩一个 `<script>` 标签。

所以这次重构做的事很直接：**把 17 个 lesson 变成 17 个能直接打开的 HTML 页面**，再按主题配 6 篇讲解。

## 一个必须先解决的问题

这些 lesson 的文件名是 `lesson1.js` 到 `lesson17.js`，但**除了逐行读，没有任何办法知道哪一课讲什么**。`lesson3.js` 是正则，`lesson10.js` 是 Set/Map，`lesson13.js` 是 Promise——编号和内容毫无关系。

而且这些脚本清一色只干一件事：`console.log`。直接打开就是一个**完全空白的页面**。

解决办法是给每页注入一段「输出镜像」——在 `<body>` 最前面插一个 `<pre>`，劫持 `console.log/info/warn/error`，日志既进控制台也画到页面上。这个思路和数据结构板块用的是同一套（那段代码也是同一个），只是这里多处理了 `Set` 和 `Map` 的打印格式。

于是每页打开就能看到：

```
size 2
size Set{5, 7}
size 5
Set{1, 2, 3, 4, 5}
unique Set{1, 2, 3, 4, "2"}
```

右侧是同一份源码，原样保留。

## 有两课跑不起来

重构过程中发现 17 个 lesson 里有 **2 个无法在浏览器里原生执行**：

| lesson | 用了什么 | 为什么跑不了 |
|---|---|---|
| 16 | 修饰器 `@readonly` / `@log` | Stage 3 提案，**至今没进标准**，裸 `<script>` 里是 SyntaxError |
| 17 | `export default` | ES 模块语法，普通 `<script>` 作用域不支持 |

当年 babel 把它们编译掉了，所以 2017 年能跑。现在 babel 不再是必需品，这两个语法反而**失去了编译这道拐杖**。

对这两课，我没有删掉，也没有硬凑一个能跑的版本——而是在页面上**明确标出「不能原生执行」**，附上原因，再给一份**行为等价的、不用编译的改写**。比如 lesson16 的 `@readonly` 是这么模拟的：

```js
Object.defineProperty(Test.prototype, 'time', {
  value: Test.prototype.time,
  writable: false,
  configurable: true,
  enumerable: false
});
```

改完之后它跑起来了，而且顺便验证了一件事——把 `writable` 设成 `false` 之后，`test.time = xxx` 这行**不会报错，也不会生效**（非严格模式下静默失败）。这比原注释里那句「会引发错误」更准确。

## 板块里有什么

17 个 lesson 按主题合成 6 篇讲解：

| 篇目 | 覆盖 lesson |
|---|---|
| 变量与作用域 | 1（`let`/`const`、块级作用域） |
| 解构赋值 | 2 |
| 正则扩展 | 3（`u`/`y` 修饰符） |
| 字符串与数值扩展 | 4、5 |
| 数组与函数扩展 | 6、7 |
| 对象扩展与 Symbol | 8、9 |
| Set 与 Map | 10 |
| Proxy 与 Reflect | 11 |
| 类与继承 | 12 |
| Promise 与异步 | 13 |
| 迭代器与 Generator | 14、15 |

实际是 11 组，页面都在同一个目录下，可以逐课看，也可以按主题看。**29 个页面全部在无头 Chrome 里真跑过一遍**，确认每页都有输出、没有抛异常。

## 关于原仓库

原始的 `ES6learning` 里还有两样东西我没搬过来：

**一是彩票项目。** `app/js/lottery/` 下有一套抽奖交互，依赖 `server/` 和后端接口。它是「用 ES6 写了个真东西」的尝试，但和语法练习的主线关系不大，且跑起来需要起服务。只在 lesson15 里保留了那个用 Generator 控制抽奖次数的片段。

**二是构建栈。** `gulpfile.babel.js`、`webpack.config.js`、`package.json` 里那一堆 2017 年的依赖——全部过时了，现在装都装不上。这是这篇概览开头讲的那件事：**技术栈会过期，语法知识不会**。

---

**去看演示页**：[`lessons/`](/lab/es6/lessons/lesson1.html) —— 从 lesson1 开始，或者随意挑一课
