---
title: "TypeScript 入门：字符串、参数与析构表达式"
date: 2017-03-30
category: "旧笔记考古"
summary: "2017 年学 TypeScript 时的入门笔记，顺带记下推荐书单（Refactoring / 代码整洁之道 / 重构与模式）。覆盖字符串新特性、参数新特性、Rest/Spread、generator 函数与析构表达式。"
draft: false
---

> **归档说明**：整理于 2026-10，原文写于 2017 年 3 月，是我系统学 TypeScript 时的第一批笔记。
> 当时 TypeScript 还在 2.x 阶段，很多今天习以为常的语法（可选参数、析构、Rest/Spread）在当年是需要专门记笔记的"新特性"。原文代码托管在 [lab/typescript](https://github.com/huangpuyuan/huangpuyuan.github.io/tree/master/public/lab/typescript)，这里保留完整语境，不做删改。

## 起因：从 ES6 到 TypeScript

2017 年那会儿，TypeScript 的定位很清晰——**JavaScript / ES6 的超集**。它把 ES6 里散落在 Babel 插件里、浏览器还不完全支持的特性（析构、generator、模板字符串）统一到一套带类型系统的编译器里，还能提前报错。

当时我的学习路径是：先跟着 ES6 语法走一遍，再看 TS 在这些语法上做了哪些"类型增强"。这份笔记就是那条路径的产物。

### 环境搭建

```bash
npm install -g typescript
# 也可以直接用 TypeScript 官方 playground 在线编译
```

最朴素的用法就是 `tsc hello.ts`，把 `.ts` 编译成 `.js`。当年没有 Vite、没有 `tsx`，就是这么一把梭。

## 字符串新特性

三类：**多行字符串**、**字符串模板**、**自动拆分字符串**。

前两个今天已经烂大街了，第三个"自动拆分字符串"（Tagged Template Literals）倒是很多人没见过。它把模板字面量的静态片段和动态插值分开传给函数：

```typescript
function test(template, name, age) {
  console.log(template); // ["hello my name is  ", ",I'm ", ""]
  console.log(name);     // "kaitai"
  console.log(age);      // 18
}

var myname = "kaitai";
var getAge = function () { return 18; };

// 注意：不加括号，直接用模板字面量调用
test`hello my name is  ${myname},I'm ${getAge()}`;
```

`template` 参数拿到的是**按插值位置切开的字符串数组**，其余参数是各个插值表达式的值。这个机制后来被 styled-components、lit-html 这些库用到了极致——它们就是靠 Tagged Template 在运行时拼 CSS / DOM 模板的。当年记下这个知识点的时候还没意识到它这么有用。

## 参数新特性

三件套，TS 在函数签名上做的类型约束：

| 特性 | 写法 | 说明 |
| --- | --- | --- |
| 参数类型 | `a: string` | 冒号后接类型，编译期检查 |
| 默认参数 | `c: string = 'jojo'` | 等号给默认值 |
| 可选参数 | `b?: string` | 问号表示可省略 |

```typescript
function test1(a: string, b?: string, c: string = 'jojo') {
  console.log(a);
  // 可选参数和默认参数不能声明在必选参数之前
  console.log(b);
  console.log(c);
}

test1("xxx", "yyy", 'zzz'); // xxx yyy zzz
test1("xxx", "yyy");        // xxx yyy jojo
test1("xxx");               // xxx undefined jojo
```

**关键约束**：可选参数和默认参数必须排在必选参数后面。这不是 TS 的发明，而是 JS 的语言限制——实参是按位置绑定的，你没法"跳过"中间那个。当年特意把这行注释写在了代码里，因为踩过坑。

## 函数新特性

### Rest / Spread 操作符

`...` 在 TS 里一符两用，取决于位置：

```typescript
// Rest：把不定数量的实参收进一个数组
function func1(...args) {
  args.forEach(arg => console.log(arg));
}

// Spread：把数组展开成逐个实参
function func2(a, b, c) {
  console.log(a, b, c);
}

var args = [1, 2];
func2(...args); // 1 2 undefined
```

注意笔记末尾那处笔误——`func2(...args)` 在原文重复了一次，其实应该是 `func2(...args2)`（`args2 = [7,8,9,10,11]`）。当年写太快了，保留下来当作一个"手写代码会翻车"的现场证据。

### generator 函数

手动暂停 / 恢复代码执行的控制流，ES6 规范引入。当年觉得这玩意儿很魔法：

```javascript
function* doSomething() {
  console.log("start");
  yield;
  console.log("finish");
}

var func1 = doSomething();
func1.next(); // start
func1.next(); // finish
```

更实用的例子是"无限价格流 + 阈值买入"：

```javascript
function* getStockPrice(stock) {
  while (true) {
    yield Math.random() * 100;
  }
}

var priceGenerator = getStockPrice("IBM");
var limitPrice = 15;
var price = 100;

while (price > limitPrice) {
  price = priceGenerator.next().value;
  console.log(`the generator return ${price}`);
}
console.log(`buying at ${price}`);
```

`while(true)` 里 yield 一个无限序列，调用方按需拉取——这其实就是**惰性求值**的雏形，也是后来 `async/await` 的底层实现基础（Babel 编译 async 函数时会先降级成 generator + 状态机）。当年只是会写，真正理解这层关系是很多年后的事了。

## 析构表达式

TS 的亮点之一。对象、数组、函数参数都能析构。

```typescript
function getStock() {
  return {
    code: 'IBM',
    price: { price1: 200, price2: 400 },
    aaa: 'xixi',
    bbb: 'haha'
  };
}

// 传统写法
// var stock = getStock();
// var code = stock.code;

// TS 析构：codex 是 code 的别名，price2 是嵌套对象里的属性
var { code: codex, price: { price2 } } = getStock();
console.log(codex);  // "IBM"
console.log(price2); // 400
```

**嵌套析构 + 别名**两个能力同时上场：`code: codex` 是把 `code` 取出来改名成 `codex`（避免和外部变量重名），`price: { price2 }` 是直接穿透到二层对象里取字段。当年写惯 `stock.code` 的链式访问，看到这个语法第一反应是"这也能行？"

数组析构支持**留空跳过**和 **rest 收尾**：

```typescript
var array1 = [1, 2, 3, 4];

var [number1, , , number4] = array1; // 中间两个空位跳过
console.log(number1); // 1
console.log(number4); // 4

var [n1, n2, ...others] = array1; // others = [3, 4]
```

还能直接当函数参数用：

```typescript
function doSomething([number1, number2, ...others]) {
  console.log(number1, number2, others);
}
doSomething(array1); // 1 2 [3, 4]
```

这个写法在后来 React 的 `useState` 返回元组、各种 hooks 里成了日常——`const [state, setState] = useState()` 就是这个语法的直接产物。

## 顺带记一份书单

原文里还夹着一条书单记录，也一并归档（这些书当年是真的在啃）：

- 《Refactoring》— Martin Fowler
- 《代码整洁之道》— Robert C. Martin
- 《重构与模式》— Joshua Kerievsky

## 回头看

这笔记最值钱的地方不是语法本身（今天随便查文档都有），而是**它记录了 2017 年一个前端的学习顺序**：字符串 → 参数 → 函数 → 析构，一步一个台阶。TypeScript 当年是"锦上添花的类型工具"，现在已经是前端工程的默认底座。同一条语法，语境完全不同了。

原始代码见 [lab/typescript/hello.ts](https://github.com/huangpuyuan/huangpuyuan.github.io/tree/master/public/lab/typescript)（编译前）与 [readme.md](https://github.com/huangpuyuan/huangpuyuan.github.io/tree/master/public/lab/typescript)。
