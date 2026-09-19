---
title: "正则的 u 和 y：两个修饰符解决什么问题"
description: "lesson3 用 emoji 和不连续匹配演示了两个新修饰符。u 让正则认识四字节字符，y 让匹配必须从上一次结束的地方紧接着开始。"
order: 4
slug: regex
minutes: 16
tag: "正则"
updated: "2026-09-19"
lessons: "3"
demo: demo-regex.html
---

`lesson3.js` 讲正则，55 行。文件名看不出内容，但它是**整个 ES6 语法里最容易踩坑的一块**——因为涉及 Unicode，一个字符到底「占几个字节」这件事，在 JS 里很反直觉。

## 先看构造函数的变化

```js
let regex  = new RegExp('xyz', 'i');
let regex2 = new RegExp(/xyz/i);
console.log(regex.test('xyz123'), regex.test('xyz123'));   // true true

let regex3 = new RegExp(/xyz/ig, 'i');
console.log(regex3.flags);   // i
```

第三行是个新行为：ES6 之前，给 `RegExp` 传的第二个参数会被**忽略**（如果第一个参数已经是正则字面量）；ES6 起，第二个参数会**覆盖**原来的修饰符。所以 `regex3` 的 `flags` 是 `i`，`g` 被覆盖掉了。

`flags` 属性本身也是 ES6 新增的。

## `u` 修饰符：字符和字节不是一回事

这段是全篇的核心：

```js
console.log('u-1', /^\uD83D/.test('\uD83D\uDC2A'));    // true
console.log('u-2', /^\uD83D/u.test('\uD83D\uDC2A'));   // false
```

`\uD83D\uDC2A` 是一对**代理对（surrogate pair）**，合起来是单个 emoji（🐪）。

- **没有 `u`**：正则把 `\uD83D` 当成一个独立的「半截字符」，所以能匹配上 → `true`
- **有 `u`**：正则知道 `\uD83D\uDC2A` 是一个**完整字符**，`\uD83D` 只是它的一部分，不能单独匹配 → `false`

这就是 `u` 修饰符的全部意义：**让正则按「字符」而不是按「码元」来理解字符串**。

同一个道理的几个例子：

```js
console.log(/\u{61}/.test('a'));     // false —— 没有 u，{} 语法不被识别
console.log(/\u{61}/u.test('a'));    // true  —— 有 u，\u{61} 就是 'a'

let s = '𠮷';
console.log(/^.$/.test(s));          // false —— 没有 u，'.' 只匹配一个码元
console.log(/^.$/u.test(s));         // true  —— 有 u，'.' 匹配一个完整字符

console.log(/𠮷{2}/.test('𠮷𠮷'));    // false —— 没有 u，{2} 的计数错乱
console.log(/𠮷{2}/u.test('𠮷𠮷'));   // true
```

`'𠮷'.length` 是 **2**，但它肉眼看着只有**一个**字。这就是「码元 vs 字符」的差别——`.length` 数的是码元，`u` 修饰符让正则数的是字符。

> 要拿「字符数」得用 `[...s].length`（展开运算符也会按字符切分）或者 `Array.from(s).length`。

## `y` 修饰符：粘连匹配

```js
let s = "bbb_bb_b";
let a1 = /b+/g;
let a2 = /b+/y;

console.log('one', a1.exec(s), a2.exec(s));
// one ["bbb"] ["bbb"]
console.log('two', a1.exec(s), a2.exec(s));
// two ["bb"] null
console.log(a1.sticky, a2.sticky);   // false true
```

关键在第二次 `exec`：

- **`g`**：从上次匹配结束的位置**往后找**，中间允许跳过不匹配的字符，所以跳过了 `_` 找到了第 4 位的 `bb`
- **`y`**：必须**紧接**着上次结束的位置开始匹配。上次停在 index 3，那里是 `_`，不是 `b` → 直接返回 `null`

一句话：**`g` 是「继续找」，`y` 是「必须接着来」**。`y` 适合做词法分析器——从当前位置严格解析一个 token，解析不了就说明当前位置不合法。

`sticky` 属性用来读一个正则有没有 `y` 修饰符。

## 顺带一个字符串陷阱

lesson4 里有个相关输出值得放在这里一起看：

```
length 2
0 �
1 �
```

`'𠮷'.charAt(0)` 拿到的是半个字符——**显示成一个乱码方块**。`charAt` 按码元取，取到的是代理对的前半截。要按字符取，得用 `codePointAt` 或者 `[...s][0]`。

这就是为什么 `u` 修饰符不是「锦上添花」——**不做这个处理，字符串操作在中文生僻字和 emoji 上就是错的**。

---

**在浏览器里跑**：[`lesson3.html`](/lab/es6/lessons/lesson3.html) · [`demo-regex.html`](/lab/es6/lessons/demo-regex.html)
