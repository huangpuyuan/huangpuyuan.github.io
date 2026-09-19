---
title: "把语法拼起来：一个 2017 年的模块化项目"
description: "17 个 lesson 都是孤立的语法点。这个项目把它们凑在一起用了——四个模块分层、用 Map 存配置表、用 Set 去重、手写组合算法，最后用一段反射代码把四个模块拼成一个类。"
order: 10
slug: project
minutes: 25
tag: "项目实战"
updated: "2026-09-19"
demoPath: /lab/es6/project/demo/
extraPath: /lab/es6/project/architecture.html
extraLabel: 架构讲解
---

前面九篇讲的都是**孤立的语法点**：解构怎么用、Set 和 Map 有什么区别、Promise 怎么串。

但真实代码不会一个知识点一行。这篇要看的是：**把这些语法凑起来，能做出什么**。

项目是 2017 年跟着同一套教程写的，555 行、五个文件。它是一个交互式选择器——从 11 个元素里选若干，按不同规则算组合数。

> **关于内容的一个说明**：这个项目当年的业务场景是彩票。我把它搬到这个站点时做了**抽象化处理**——彩种、玩法名称、金额、盈亏计算全部没有保留，只留下软件工程部分。原因有两条：一是彩票在国内属于特许经营业务，做成公开页面并不合适；二是它真正值得看的是**代码怎么组织**，而不是它选了什么号。
>
> 所以下文提到的「分组」「权重」「元素」，都是抽象之后的叫法。原代码那套业务规则不在讨论范围内。

## 先说结论：这份代码好在哪

它最值得学的不是某个语法，而是**它把职责切开了**。

五个文件，各管一摊：

| 文件 | 行数 | 职责 |
|---|---|---|
| `base.js` | 249 | 状态管理 + DOM 渲染 |
| `calculate.js` | 78 | 纯计算：组合数枚举 |
| `interface.js` | 50 | 数据获取 |
| `timer.js` | 41 | 倒计时逻辑 |
| `index.js` | 137 | 把上面四个拼成一个主类 |

这个切法有两个立刻能兑现的好处：

**计算逻辑可以单独测。** `calculate.js` 里那个 `combine()` 不碰 DOM、不依赖外部状态，喂个数组进去就行。如果它和渲染混在一个文件里，你没法单独验证。

**数据来源可以整体换掉。** 原代码用的是 jQuery 的 `$.ajax`，我换了 `fetch`，只动了 `interface.js` 一个文件。因为其他模块压根不知道数据从哪来。

## 组合算法：为什么不用公式

组合数有个现成公式：

```
C(n, k) = n! / (k! × (n-k)!)
```

一行就能算。但这个项目选择**把每一种组合真的枚举出来**——因为后面要逐条展示。

核心是 `calculate.js` 里这个递归：

```js
static combine(arr, size) {
    let allResult = [];
    (function f(arr, size, result) {
        let arrLen = arr.length;
        if (size > arrLen) return;              // 剩余不够，此路不通
        if (size === arrLen) {                  // 恰好够，全部拿走
            allResult.push([].concat(result, arr));
        } else {
            for (let i = 0; i < arrLen; i++) {
                let newResult = [].concat(result);
                newResult.push(arr[i]);
                if (size === 1) {
                    allResult.push(newResult);
                } else {
                    let newArr = [].concat(arr);
                    newArr.splice(0, i + 1);    // ← 关键在这一行
                    f(newArr, size - 1, newResult);
                }
            }
        }
    })(arr, size, []);
    return allResult;
}
```

递归思路是：取第 `i` 个元素之后，**只往后找**。

`splice(0, i + 1)` 把「已经用过的」连同「当前这个」一起切掉——这就是不会产生 `[b, a]` 这种和 `[a, b]` 重复的排列的原因。

用 IIFE 包起来，是因为递归需要一个名字 `f`，但不想把它泄露到外层作用域。

我在演示页里做了交叉验证——把枚举结果和公式算的结果放在一起比：

```
已选 11 个：01 02 03 04 05 06 07 08 09 10 11
规则 组合六（取 6 个）
combine() 枚举  →  462 组
公式 C(11,6)   →  462
```

两个数字对上了，说明算法没问题。

> 补一个原注释里的小错误：文中写「用 `arguments.callee` 得写匿名函数」。`arguments.callee` 在**严格模式下已被禁用**（ES5 起），所以这里用具名函数表达式才是对的路子，跟匿名不匿名没关系。

## 用 Map 存配置表

`base.js` 开头这段，是整份代码里 Map 用得最合适的地方：

```js
initPlayList() {
    this.play_list
        .set('r2', { weight: 6,  size: 2, name: '组合二' })
        .set('r3', { weight: 19, size: 3, name: '组合三' })
        .set('r4', { weight: 78, size: 4, name: '组合四' })
        // ...
}
```

为什么用 `Map` 而不是普通对象？三个实际理由：

1. **天然有序**。遍历顺序就是插入顺序，不依赖引擎实现。
2. **`.size` 直接拿个数**，不用 `Object.keys(x).length`。
3. **`.has()` / `.get()` 语义明确**，不会像对象那样踩到原型链上的 `toString`。

链式 `.set()` 能连着写，是因为 `Map.prototype.set` 返回 `this`——这是链式调用的标准做法。

还有一处细节值得看：元素集合用的是 `Set`：

```js
initNumber() {
    for (let i = 1; i < 12; i++) {
        this.number.add(('' + i).padStart(2, '0'));
    }
}
```

`Set` 负责去重，`padStart(2, '0')` 负责把 `"1"` 变成 `"01"`。**后者是 ES2017 的方法**——在这份 2017 年的代码里，它还属于「新语法」，得靠 polyfill 才能跑。

## 技术上最值得看的一段：多重继承

这是整份代码含金量最高的部分，`index.js` 里的核心问题很直白：

> 有四个模块的能力都需要，但 JavaScript 的 class **只能 `extends` 一个父类**。

不像 C++ 能写 `class A : public B, public C`。ES6 的 class 就是单继承。

原代码的解法是 **mixin**——不走继承链，直接**把属性复制过去**：

```js
const copyProperties = function (target, source) {
    for (let key of Reflect.ownKeys(source)) {
        if (key !== 'constructor' && key !== 'prototype' && key !== 'name') {
            let desc = Object.getOwnPropertyDescriptor(source, key);
            Object.defineProperty(target, key, desc);
        }
    }
};

const mix = function (...mixins) {
    class Mix {}
    for (let mixin of mixins) {
        copyProperties(Mix, mixin);                     // 搬静态成员
        copyProperties(Mix.prototype, mixin.prototype); // 搬实例方法
    }
    return Mix;
};

class Lottery extends mix(Base, Calculate, Interface, Timer) { ... }
```

### 为什么不直接赋值

这是这段代码的关键，也是最容易被忽略的地方。

直觉写法是 `target[key] = source[key]`。但它会把属性**拍平**：

| 属性类型 | 直接赋值会怎样 | 用属性描述符搬运 |
|---|---|---|
| getter / setter | **当场求值**成普通值，之后不再动态 | 保持动态 |
| `writable: false` | 被强行改成可写 | 保持只读 |
| 不可枚举属性 | 变成可枚举，会被 `for...in` 扫到 | 保持不可枚举 |
| Symbol 键 | `Object.keys()` **根本拿不到** | `Reflect.ownKeys()` 能拿到 |

所以 `Reflect.ownKeys()` + `getOwnPropertyDescriptor()` + `defineProperty()` 这三件套，目的是**完整保留属性的定义语义**——不是炫技，是必需。

顺带一提 `Reflect.ownKeys()` 和 `Object.keys()` 的区别：前者返回**自有**属性（不含原型链），而且**包含 Symbol 键**。这正是「完整搬运」需要的。

### 但这个方案有问题

说实话，这种 mixin 写法有几个隐患，看明白就好，**不必照搬**：

| 问题 | 后果 |
|---|---|
| 原型链上没有来源类 | `instanceof Base` 返回 `false`，类型判断失效 |
| 同名方法静默覆盖 | 谁在后面谁赢，不报错，出问题很难定位 |
| 属性来源分散在四个文件 | IDE 补全和跳转基本失效 |

现代更常见的做法是**组合优于继承**——把四个模块作为实例属性持有：

```js
class Lottery {
    constructor() {
        this.timer = new Timer();
        this.calc  = new Calculate();
        // ...
    }
    tick(end) { return this.timer.countdown(end, ...); }
}
```

调用链明确，`this.calc.combine()` 一看就知道从哪来，也不影响 `instanceof`。代价是要多写几个转发方法。

这里把原实现留着，是因为它作为「**ES6 反射 API 的实战用例**」确实有教学价值——`Reflect` 和属性描述符这些 API 平时很少有机会用上。

## 倒计时里的两个老写法

`timer.js` 没有业务语义，逻辑很干净，但有两处能看出年代：

**闭包捕获 `self`**：

```js
countdown(end, update, handle) {
    const self = this;
    // ...
    setTimeout(function () {
        self.countdown(end, update, handle);
    }, 1000);
}
```

提前把 `this` 存进 `self`，是因为 `setTimeout` 里的回调如果直接用 `this`，指向会变。**这是箭头函数出现之前的标准做法**——有了箭头函数就不用了，因为它不绑定自己的 `this`。

**递归 `setTimeout` 而不是 `setInterval`**：

```js
setTimeout(function () {
    self.countdown(end, update, handle);
}, 1000);
```

每次都是「上一次执行完之后」再排下一次。`setInterval` 是固定间隔触发，如果某次执行慢了，任务会积压。对倒计时这种要求「每秒刷新一次」的场景，递归 `setTimeout` 更稳。

时间拆解本身用的是整除法，一层层往下剥：

```js
let d = Math.floor(last_time / px_d);
let h = Math.floor((last_time - d * px_d) / px_h);
let m = Math.floor((last_time - d * px_d - h * px_h) / px_m);
```

不用日期库，`1000/60/60/24` 这几个常量配合 `Math.floor` 就够了。

## 构建链路：从三层工具到一个标签

这部分和前面九篇是同一个话题，但在这个项目里看得更清楚。

2017 年要跑起这个项目，需要：

| 工具 | 做什么 |
|---|---|
| `gulp` 3.9 | 任务编排：编译、合并、压缩、刷新 |
| `webpack` 2 | 模块打包 |
| `babel-preset-es2015` | 把 ES6 编译成 ES5 |
| `gulp-livereload` | 改代码自动刷新浏览器 |
| `babel-polyfill` | 补运行时缺失的 API |

仓库里那份 `gulpfile.babel.js` 带着 **7 个 gulp task**（`browser` / `build` / `clean` / `css` / `default` / `pages` / `scripts`），一层套一层。

**为什么当年需要这么多？** 因为 2017 年的浏览器不认识 ES6。写 `let` 要编译，写 `import` 要打包，连 `padStart()` 都要 polyfill 兜底。所以「写 ES6」这件事本身就意味着**先配好一套工具链**。

现在是 2026 年。这些语法全部进了标准，Chrome 直接认。上面这一整套，现在一个 `<script type="module">` 就能替代。

**这个站点上的 ES6 演示页就是这么做的：0 依赖、0 构建。** 打开就是源码，跑的就是源码。

## 回头看看

把 17 个 lesson 和这个项目放在一起看，会发现一件事：

**当年最难的部分消失了，留下来的反而是代码结构。**

`combine()` 的递归怎么切分、五个文件怎么分层、Map 适合存什么——这些不随工具链变化。而当年让人头疼的 gulp 配置、webpack 打包、babel 编译，现在整块消失了。

这可能也是为什么十年后回头看这些老代码，**语法部分显得平淡，结构部分反而还有东西可看**。

---

**在浏览器里跑**：[项目演示](/lab/es6/project/demo/) · [架构讲解](/lab/es6/project/architecture.html) · [源码目录](/lab/es6/project/src/base.js)
