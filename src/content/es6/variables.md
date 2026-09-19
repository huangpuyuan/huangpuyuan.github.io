---
title: "变量与作用域：let 到底改变了什么"
description: "lesson1 只有 22 行，主体部分还被注释掉了。留下的那半截恰好是最容易误解的：const 定义的常量，为什么里面的属性还能改？"
order: 2
slug: variables
minutes: 12
tag: "变量"
updated: "2026-09-19"
lessons: "1"
demo: demo-variables.html
---

`lesson1.js` 是 17 课里最短的，22 行。而且**主体部分被作者自己注释掉了**：

```js
function test() {
    // for (let i=1;i<3;i++){
    //     console.log(i);
    // }
    // console.log(i);
}
```

一个空函数。原作者当年显然是想演示「`let` 的块级作用域」——`for` 循环里声明的 `i`，在循环外面访问不到，会抛 `ReferenceError`。但这段被注释掉了，所以页面上只剩下一行输出。

留下来的部分是 `const` 那一段：

```js
function last() {
    const PI = 3.1415926;
    const k = { a: 1 };
    k.b = 3;
    console.log(PI, k);
}
```

输出：

```
3.1415926 {a: 1, b: 3}
```

## 为什么 `const` 的对象能改

这里有个非常经典的困惑点：**`const` 声明的对象，属性居然能改。**

答案在 `const` 真正约束的东西上——**它锁的是「绑定」，不是「值」**。

`const k = { a: 1 }` 的意思是：名字 `k` 从此只能指向这一个对象。你不能写 `k = {}`（会抛错），因为那是在重新绑定。

但 `k.b = 3` 不涉及重新绑定——它顺着 `k` 找到那个对象，往里加了个属性。对象本身还是原来那个，`k` 指向的东西没变，所以合法。

用一句话概括：

> **`const` 保证「`k` 永远是同一个对象」，不保证「这个对象永远不变」。**

真正冻住一个对象要用 `Object.freeze(k)`。不过它也是浅冻结——嵌套的对象仍然能改。

## `let` 和 `var` 的真实差别

那段注释掉的代码想说的三个差别，值得补全：

**一、块级作用域。** `let` 的作用域是最近的一对 `{}`，`var` 是最近的函数。所以：

```js
for (var i = 0; i < 3; i++) {}
console.log(i);   // 3 —— var 泄漏到外面了

for (let j = 0; j < 3; j++) {}
console.log(j);   // ReferenceError —— j 只在循环里存在
```

**二、不存在变量提升的「半吊子」行为。** `var` 声明的变量会被提升到函数顶部，赋值前访问得到 `undefined`。`let` 也提升，但在初始化前访问会抛 `ReferenceError`——这中间的区间叫**暂时性死区（TDZ）**。

**三、循环里的闭包行为不同。** 这是最实际的一个：

```js
var fns = [];
for (var i = 0; i < 3; i++) fns.push(() => i);
fns.map(f => f());   // [3, 3, 3] —— 三个闭包共享同一个 i

var fns2 = [];
for (let j = 0; j < 3; j++) fns2.push(() => j);
fns2.map(f => f());  // [0, 1, 2] —— 每次迭代都有独立的 j
```

`let` 在循环里会**为每一次迭代创建一个新的绑定**，所以闭包捕获到的是各自那一份。这个差别当年坑了无数人，用 `var` 时代得靠 IIFE 包一层才能绕过去。

---

**在浏览器里跑**：[`lesson1.html`](/lab/es6/lessons/lesson1.html) · [`demo-variables.html`](/lab/es6/lessons/demo-variables.html)
