---
title: "对象扩展与 Symbol：为什么需要第七种原始类型"
description: "lesson8 讲对象字面量的简写和 Object 新方法，lesson9 讲 Symbol。后者是为了解决一个具体问题：怎样造一个绝对不可能冲突的属性名。"
order: 7
slug: object-symbol
minutes: 18
tag: "对象 / Symbol"
updated: "2026-09-19"
lessons: "8, 9"
demo: demo-object.html
---

## 对象字面量：两种简写

**属性简写**——变量名和键名相同时省掉一半：

```js
let o = 1, k = 2;
let es5 = { o: o, k: k };
let es6 = { o, k };
console.log(es5);   // {o: 1, k: 2}
console.log(es6);   // {o: 1, k: 2}
```

**方法简写**——去掉 `function` 关键字：

```js
let es5_method = { hello: function () { console.log('hello'); } };
let es6_method = { hello() { console.log('hello'); } };
```

**属性表达式**——键名用变量算出来：

```js
let a = 'b';
let es5_obj = { a: 'c' };     // {a: "c"}  ← 键名就是字面的 a
let es6_obj = { [a]: 'c' };   // {b: "c"}  ← 键名是变量 a 的值
```

中方括号表示「这里的键名要**求值**」。不带方括号时 `a` 就是字符串 `"a"`，带了才是变量。

## `Object.is` 的用处

```js
Object.is('abc', 'abc')   // true    （和 === 一致）
Object.is([], [])         // false   （和 === 一致）
```

从这两行看不出它和 `===` 有任何区别。真正的区别在另外两个值上：

```js
Object.is(NaN, NaN)      // true     ← === 是 false
Object.is(0, -0)         // false    ← === 是 true
```

`Object.is` 修掉了 `===` 的两个反直觉行为。绝大多数时候你不关心这个差别，但做状态比较（比如 React 的 `useMemo` 依赖比较）时要用它。

## `Object.assign`：浅拷贝

```js
Object.assign({a: 'a'}, {b: 'b'})   // {a: "a", b: "b"}
```

第一个参数是**目标**，后面是**来源**，逐个把来源的可枚举属性复制到目标上。

关键在于原文注释：「拷贝，浅复制（不拷贝）」。如果属性值本身是**对象**，`assign` 复制的是**引用**而不是内容：

```js
const src = { nested: { n: 1 } };
const dst = Object.assign({}, src);
dst.nested.n = 2;
console.log(src.nested.n);   // 2 —— 原对象被改了
```

要深拷贝得用 `structuredClone()`（现代方案）或者递归。这是 `Object.assign` 最常见的误用。

## `Object.entries` 配合解构

```js
let test = {k: 123, o: 456};
for (let [key, value] of Object.entries(test)) {
    console.log([key, value]);
}
```

输出 `["k", 123]` 和 `["o", 456]`。

`Object.entries` 把对象转成 `[[键, 值], ...]` 的数组，配合 for-of 里的解构一次拿到键值。这组 API 是三个一伙的：

- `Object.keys(obj)` → `["k", "o"]`
- `Object.values(obj)` → `[123, 456]`
- `Object.entries(obj)` → `[["k",123], ["o",456]]`

## Symbol：不可重复的标识

lesson9 开头就点题了：

```js
let a1 = Symbol();
let a2 = Symbol();
console.log(a1 === a2);   // false —— 每次都是全新的

let a3 = Symbol.for('a3');
let a4 = Symbol.for('a3');
console.log(a3 === a4);   // true  —— 同一个登记名返回同一个
```

区别在于 `Symbol()` 每次创建**全新的**值，而 `Symbol.for(key)` 先去**全局登记表**里查，有就返回，没有才建。

## 实际用途：造一个不会冲突的属性名

```js
let a1 = Symbol.for('abc');
let obj = {
    [a1]: '123',
    'abc': 345,
    'c': 456
};
console.log(obj);   // {abc: 345, c: 456}
```

这里 `obj` 有两个看起来很像是重复的键：`[a1]`（Symbol 值）和 `'abc'`（字符串）。但**它们完全不冲突**，因为一个是 Symbol、一个是字符串。输出里甚至看不到 Symbol 那个键。

`for...of Object.entries(obj)` 也取不到它：

```
let of  abc 345
let of  c 456
```

**Symbol 属性默认被所有常规遍历跳过**——`Object.keys`、`Object.entries`、`for...in`、`JSON.stringify` 都看不见它。

这正是它的设计意图：**给对象挂「内部用的」属性，不用担心和用户的键撞名**。库作者最需要这个——比如给 DOM 元素挂一个内部状态，用 Symbol 就不会污染元素的可见属性。

## 想拿到 Symbol 属性，得专门去取

```js
Object.getOwnPropertySymbols(obj).forEach(item => {
    console.log(item);        // Symbol(abc)
    console.log(obj[item]);   // 123
});

Reflect.ownKeys(obj).forEach(item => {
    console.log(item);        // abc, c, Symbol(abc)
});
```

- `Object.getOwnPropertySymbols` 只拿 Symbol 键
- `Reflect.ownKeys` 拿**全部**键，包括 Symbol

后者的输出顺序是「先所有字符串键（按插入顺序），再所有 Symbol 键」——这个顺序是规范规定的。

> 顺带一提：`Symbol.iterator`、`Symbol.toPrimitive` 这些内置 Symbol 是**语言层面的协议钩子**。下一课讲的「让对象能 for-of 遍历」，靠的就是给它挂一个 `Symbol.iterator` 方法。

---

**在浏览器里跑**：[`lesson8.html`](/lab/es6/lessons/lesson8.html) · [`lesson9.html`](/lab/es6/lessons/lesson9.html) · [`demo-object.html`](/lab/es6/lessons/demo-object.html)
