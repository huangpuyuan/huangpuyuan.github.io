---
title: "数组与函数扩展：13 个新方法逐个看"
description: "lesson6 塞了 6 个数组新方法，lesson7 讲默认参数、rest 参数、扩展运算符和箭头函数。合起来 40 行输出，是目前为止信息密度最高的一组。"
order: 6
slug: array-function
minutes: 22
tag: "数组 / 函数"
updated: "2026-09-19"
lessons: "6, 7"
demo: demo-array.html
---

这两课合起来 99 行，覆盖 13 个语法点。因为数量多，我按「解决了什么问题」分组来讲，而不是按 lesson 顺序。

## 数组：造数组的两种方式

**`Array.of`**——把一串参数变成数组：

```js
Array.of(3, 4, 7, 9, 11)   // [3, 4, 7, 9, 11]
Array.of()                  // []
```

它解决的是 `new Array(3)` 的坑——那个 `3` 会被理解成**长度**，得到 `[empty × 3]`。`Array.of(3)` 老老实实得到 `[3]`。

**`Array.from`**——把「类数组」转成真数组：

```js
let p = document.querySelectorAll('p');
let pArr = Array.from(p);
pArr.forEach(item => console.log(item.textContent));
```

`querySelectorAll` 返回的 NodeList **不是数组**——它有 `length` 和索引，但没有 `forEach`、`map` 这些方法。`Array.from` 一转换就齐全了。

它还能兼做 map（**第二个参数是映射函数**）：

```js
Array.from([1, 3, 5], item => item * 2)   // [2, 6, 10]
```

文档里那句「相当于 map」就是这个意思——省一次遍历。

## 数组：修改与查找

**`fill`——整块填满**：

```js
[1, 'a', undefined].fill(7)         // [7, 7, 7]
['a', 'b', 'c'].fill(7, 2, 3)       // ["a", "b", 7]
```

第二个和第三个参数是起止下标（左闭右开）。常用于初始化棋盘或者占位数组。

**`copyWithin`——在自己内部搬移**：

```js
[1,2,3,4,5].copyWithin(0, 3, 4)    // [4, 2, 3, 4, 5]
```

三个参数是「目标位置、起点、终点」：把下标 `[3, 4)` 的内容搬到下标 `0` 开始的位置，**就地修改**。输出 `[4, 2, 3, 4, 5]`——原来的 `1` 被 `4` 覆盖了。

**`find` 和 `findIndex`——按条件找**：

```js
[1,2,3,4,5,6].find(item => item > 3)       // 4   ← 返回元素
[1,2,3,4,5,6].findIndex(item => item > 3)  // 3   ← 返回下标
```

与 `filter` 的区别是**找到第一个就停**，不继续遍历。

**`includes`——判断存在**：

```js
[1,2,NaN].includes(1)     // true
[1,2,NaN].includes(NaN)   // true  ← 这个是关键
```

`includes` 和 `indexOf` 的差别就在 `NaN` 这一行：**`indexOf` 用的是严格相等（`===`），而 `NaN === NaN` 是 `false`**，所以 `[1,2,NaN].indexOf(NaN)` 返回 `-1`。`includes` 用的是 SameValueZero 算法，能正确找到 `NaN`。

## 数组：三个遍历方式

```js
for (let index of ['1','c','ks'].keys())    // 0 1 2
for (let value of ['1','c','ks'].values())  // 1 c ks
for (let [i, v] of ['1','c','ks'].entries()) // [0,'1'] [1,'c'] [2,'ks']
```

实跑输出确认：

```
keys 0 / keys 1 / keys 2
value 1 / value c / value ks
key:value 0:1 / key:value 1:c / key:value 2:ks
```

> 原文件里对 `.values()` 标了句「兼容性问题」——那是 2017 年的情况。现在所有主流浏览器都支持了。

## 函数：默认参数的两个陷阱

**陷阱一：默认值只在 `undefined` 时生效**：

```js
function test(x, y = 'world') { console.log(x, y); }
test('hello');              // hello world
test('hello', 'kaitai');    // hello kaitai
```

**陷阱二：默认值的求值时机和作用域**：

```js
let x = 'test';
function test2(x, y = x) { console.log('作用域', x, y); }
test2('kill');    // 作用域 kill kill
test2();          // 作用域 undefined undefined
```

`y = x` 里的 `x` 指的是**参数 x**（同作用域），不是外面那个全局 `x`。所以 `test2('kill')` 时 `y` 拿到 `kill`；`test2()` 时参数 `x` 是 `undefined`，`y` 也是 `undefined`。

但换成另一个函数名就不同了：

```js
function test22(c, y = x) { console.log('作用域', c, y); }
test22('kill');   // 作用域 kill test   ← y 拿到外面全局的 x
test22();         // 作用域 undefined test
```

这里 `y = x` 中的 `x` **不在参数列表里**，于是往上找，找到了全局的 `'test'`。

**参数默认值的作用域是「参数列表本身」**，找不到才往外层找。这个规则很容易看漏。

## rest 参数和扩展运算符

**rest——收集成数组**：

```js
function test3(...arg) {
    for (let v of arg) console.log('rest', v);
}
test3(1, 2, 3, 4, 'a');   // rest 1 ... rest a
```

`...arg` 把不定数量的实参收集成**真数组**。相比老的 `arguments` 对象，它有几个好处：真是数组（能用 `map`/`filter`）、能命名、必须是最后一个参数。

**扩展运算符——把数组拆开**：

```js
console.log(...[1, 2, 4]);        // 1 2 4
console.log('a', ...[1, 2, 4]);   // a 1 2 4
```

注意这两行的输出**看起来一样**（都是 `1 2 4`），但含义不同：第一行是把数组拆成三个参数传给 `log`；第二行是 `'a'` 加上三个拆开的数。如果写成 `console.log([1,2,4])` 就会打印整个数组。

rest 和扩展运算符是**同一个语法的两个方向**：一个在收集（形参位置），一个在展开（实参位置）。

## 箭头函数

```js
let arrow  = v => v * 2;
let arrow2 = () => 5;
console.log(arrow(3));    // 6
console.log(arrow2());    // 5
```

单参数可以省括号，单表达式可以省 `return` 和大括号。

lesson7 的注释里写「箭头函数 和 this 绑定的问题」——这是箭头函数**最重要**的特性，但代码里没演示。补一句：**箭头函数不绑定自己的 `this`，它用定义时外层作用域的 `this`**。这正是它当年被大量使用的原因（回调里不用 `var self = this` 了），也是它不能当构造函数用的原因。

## 尾调用

```js
function tail(x) { console.log('tail', x); }
function fx(x) { return tail(x); }
fx(123);   // tail 123
```

`fx` 的最后一步就是调用 `tail`，这叫**尾调用**。理论上引擎可以优化掉 `fx` 的栈帧（尾调用优化，TCO），但**目前只有 Safari 实现了**。所以这段代码展示的是概念，实际跑起来该有的栈还是会有。

---

**在浏览器里跑**：[`lesson6.html`](/lab/es6/lessons/lesson6.html) · [`lesson7.html`](/lab/es6/lessons/lesson7.html) · [`demo-array.html`](/lab/es6/lessons/demo-array.html)
