---
title: "字符串与数值扩展：那些用一次就回不去的方法"
description: "lesson4 和 lesson5 讲两批新 API。数值那边是 Math.trunc、Number.isInteger 这类小工具，字符串那边是 includes、模板字符串、标签模板——后者改变了写字符串的方式。"
order: 5
slug: string
minutes: 20
tag: "字符串 / 数值"
updated: "2026-09-19"
lessons: "4, 5"
demo: demo-string.html
---

这两课合起来 38 行，却是**日常写代码时用得最多的部分**。数值那批是些顺手的小工具，字符串那批里有几个直接改变了代码的写法。

## 数值：把小工具挪到正确的位置

lesson5 的 16 行输出：

```
B 503
o 503
is true
NaN false
1/0 false
NaN true
NaN false
25 true
25.0 true
25.1 false
25 false
9007199254740991 -9007199254740991
```

**二进制和八进制字面量**：

```js
console.log(0b111110111);   // 503
console.log(0o767);         // 503
```

`0b` 前缀二进制，`0o` 前缀八进制。都是 503——同一个数的两种写法。

**四个判断函数**：

```js
Number.isFinite(15)      // true
Number.isFinite(NaN)     // false
Number.isFinite('true'/0) // false —— 字符串除以 0 得到 NaN
Number.isNaN(NaN)        // true
Number.isNaN(0)          // false
```

这里值得注意 `Number.isFinite` 和全局 `isFinite` 的区别：全局的那个会**先做类型转换**，`isFinite('15')` 返回 `true`（字符串被转成数字）；`Number.isFinite('15')` 返回 `false`——**不转换，只认真正的数字**。这套新方法的设计原则是「不做隐式转换」，行为更可预测。

**整数判断**：

```js
Number.isInteger(25)     // true
Number.isInteger(25.0)   // true  ← 注意这个
Number.isInteger(25.1)   // false
Number.isInteger('25')   // false ← 不转字符串
```

`25.0` 是 `true` 值得留意——JS 里没有整数类型，`25.0` 和 `25` 底层是同一个数，所以它算整数。

**安全整数范围**：

```js
Number.MAX_SAFE_INTEGER   // 9007199254740991
Number.MIN_SAFE_INTEGER   // -9007199254740991
Number.isSafeInteger(10)  // true
Number.isSafeInteger('a') // false
```

这两个常量是 $(2^{53} - 1)$。超过这个范围，JS 的数字精度就不可靠了——经典例子是 `0.1 + 0.2 !== 0.3`。所以涉及大额金额或 ID 时，要用 `BigInt` 或者字符串。

**`Math.trunc`——截断小数**：

```js
Math.trunc(4.1)   // 4
Math.trunc(4.9)   // 4
```

和 `Math.floor` 的差别在**负数**：`Math.floor(-4.1)` 是 `-5`（向下取整），`Math.trunc(-4.1)` 是 `-4`（直接砍掉小数部分）。这个差别在处理负数坐标时很要命。

## 字符串：模板字符串是重头戏

lesson4 里最有价值的是模板字符串那几段。

**插值**：

```js
let name = 'list', info = 'hello world';
let m = `i am ${name},${info}`;
console.log(m);   // i am list,hello world
```

反引号 + `${}`。相比字符串拼接，它不用管引号嵌套和加号位置。而且**支持换行**——直接在模板里换行就行，不需要 `\n`。

**新增的三个判断方法**：

```js
let str = "string";
str.includes("r")    // true —— 包含
str.startsWith("str") // true —— 以...开头
str.endsWith("ing")   // true —— 以...结尾
```

以前判断开头得写 `str.indexOf('str') === 0`，判断结尾要算长度。现在语义直接。

**`repeat` 和 `padStart`/`padEnd`**：

```js
"abc".repeat(2)        // abcabc
'1'.padStart(2, '0')   // 01
'1'.padEnd(2, '0')     // 10
```

`padStart` 最常用的场景是**补零**——把 `1` 变成 `01`，做时间显示或者序号对齐。

## 标签模板：一个被低估的语法

这是 lesson4 里最不常见的一段：

```js
let user = { name: 'list', info: 'hello world' };
console.log(abc`i am ${user.name},${user.info}`);

function abc(s, v1, v2) {
    console.log(s, v1, v2);
    return s + v1 + v2;
}
```

输出：

```
["i am ", ",", ""] list hello world
i am list,hello world
```

**函数名紧贴模板字符串**，这种写法叫标签模板。它的规则是：

- 第一个参数 `s` 收到的是**所有静态字符串**拼成的数组（被 `${}` 切开的那些片段）
- 后续参数依次是**每个插值表达式的值**

注意 `s` 有 **3** 个元素：`"i am "`、`","`、`""`——比插值多一个（末尾空串），因为两个 `${}` 把模板切成了三段。

这个语法的威力在于**函数可以在拼装前检查甚至改写每个值**。React 的 `styled-components`、`graphql-tag` 都是这么实现的：

```js
styled.div`color: ${props => props.color};`
```

那个 `styled.div` 就是个标签函数，它拿到静态片段和动态值，生成最终 CSS。

## `String.raw`：不处理转义

```js
console.log(String.raw`Hi\n${1+2}`);   // Hi\n3
console.log(`Hi\n${1+2}`);             // Hi(换行)3
```

`String.raw` 是内置的标签函数，它把 `\n` 当**两个字面字符**而不是换行符。写正则或者 Windows 路径时有用。

---

**在浏览器里跑**：[`lesson4.html`](/lab/es6/lessons/lesson4.html) · [`lesson5.html`](/lab/es6/lessons/lesson5.html) · [`demo-string.html`](/lab/es6/lessons/demo-string.html)
