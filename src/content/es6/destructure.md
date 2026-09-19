---
title: "解构赋值：十一个片段的输出对照"
description: "lesson2 是 88 行挤在一个文件里的十一个独立代码块，每块演示解构的一个用法。实跑一遍，把输入和输出对起来看。"
order: 3
slug: destructure
minutes: 18
tag: "解构赋值"
updated: "2026-09-19"
lessons: "2"
demo: demo-destructure.html
---

`lesson2.js` 有 88 行，塞了**十一个独立的 `{}` 代码块**，每块演示解构赋值的一个变体。原作者在每个 `console.log` 后面用注释写了预期输出,正好可以拿来对照实跑结果。

先说清楚一件事：解构的本质是**「按位置或按名字，把右边的结构拆开，把值分给左边的变量」**。左边写的是「形状模板」，不是变量清单。

## 数组解构：按位置

```js
let a, b, rest;
[a, b, ...rest] = [1, 2, 3, 4, 5, 6];
console.log(a, b, rest);
```

实跑：

```
1 2 [3, 4, 5, 6]
```

`...rest` 是**剩余元素**收集器，把「多出来的一律打包成数组」。它必须放在最后。

**可以跳过中间的元素**——这是逗号最实用的地方：

```js
function f() { return [1, 2, 3, 4, 5]; }

let a, b, c;
[a, , , b] = f();      // 中间两个逗号 = 跳过第 2、3 个
console.log(a, b);     // 1 4

[a, , ...b] = f();     // 跳过 1 个，剩下的全给 b
console.log(a, b);     // 1 [3, 4, 5]
```

**取函数返回值的指定位置**，不用先接住整个数组再索引——这是这个语法最日常的用途。

**默认值**：

```js
let a, b, c, rest;
[a, b, c = 3] = [1, 2];
console.log(a, b, c);   // 1 2 3
```

`c` 在右边没对应位置，用了默认值 3。注意默认值只在**对应位置是 `undefined`** 时生效——如果是 `null`，那 `null` 会被当真值接住，不触发默认值。

**变量交换**：

```js
let a = 1, b = 2;
[a, b] = [b, a];
console.log(a, b);   // 2 1
```

不用中间变量了。原理是右边先整体求值成 `[2, 1]`，再往左边分。

## 对象解构：按名字

数组看位置，对象看**键名**：

```js
let o = { p: 42, q: true };
let { p, q } = o;
console.log(p, q);   // 42 true
```

`{ p, q }` 其实是 `{ p: p, q: q }` 的简写——从 `o` 里取出 `p` 键，赋给变量 `p`。

**变量名和键名不一致时**要写全：

```js
let { title: esTitle, test: [{ title: cnTitle }] } = metaData;
console.log(esTitle, cnTitle);   // abc test
```

这行是全篇最陡的一段，拆开看：

- 从 `metaData` 取 `title` 键 → 赋给**新变量** `esTitle`
- 从 `metaData` 取 `test` 键，它是个数组 → 解构它的**第 0 个元素**（一个对象）→ 从那个对象取 `title` → 赋给 `cnTitle`

左边那串 `test: [{ title: cnTitle }]` 的形状，和右边真实数据的嵌套形状**必须严丝合缝**。这就是「左边是形状模板」的意思。

**对象解构的默认值**同样生效：

```js
let { a = 10, b = 5 } = { a: 3 };
console.log(a, b);   // 3 5
```

`a` 取到了 3，`b` 没有对应键所以用默认值 5。

## 一个必须记住的语法坑

对象解构如果**不以声明开头**，整行会被解析成块语句，必须用括号包起来：

```js
let a, b;
({ a, b } = { a: 1, b: 2 });    // ← 这对括号不能省
```

直接写 `{ a, b } = ...` 会报错，因为 js 看到行首的 `{` 会当成一个代码块。数组解构没这个问题（`[` 不会被误解）。

---

**在浏览器里跑**：[`lesson2.html`](/lab/es6/lessons/lesson2.html) · [`demo-destructure.html`](/lab/es6/lessons/demo-destructure.html)
