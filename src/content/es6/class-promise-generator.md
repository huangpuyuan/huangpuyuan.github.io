---
title: "类、Promise 与 Generator：从语法糖到异步控制"
description: "剩下六课合一篇。lesson12 是 class 的完整用法，lesson13 用执行顺序讲清楚 Promise，lesson14-17 是迭代器、Generator、修饰器和模块——其中两个至今无法原生运行。"
order: 9
slug: class-promise-generator
minutes: 30
tag: "class / 异步"
updated: "2026-09-19"
lessons: "12, 13, 14, 15, 16, 17"
demo: demo-class.html
---

最后一篇收尾，把剩下六课讲完。这里有整套笔记里**最重要的一个主题**（异步），也有两个**至今跑不起来**的语法。

## class：语法糖，但不算薄的糖

lesson12 的七行输出把 `class` 的主要特性都过了一遍：

```
构造函数和实例 {name: v}
继承 {name: mukewang}
继承传参 {name: hello, type: child}
getter mkmukewang
setter mkhello
静态方法 tell
静态属性 test
```

**默认参数 + 构造**：

```js
class Parent {
    constructor(name = 'mukewang') { this.name = name; }
}
new Parent('v');   // {name: "v"}
new Parent();      // {name: "mukewang"}
```

**继承**：

```js
class Child extends Parent {}
console.log(new Child());   // {name: "mukewang"} —— 父类构造函数被自动调用
```

如果子类要传自己的参数，得显式调 `super`：

```js
class Child extends Parent {
    constructor(name = 'child') {
        super(name);          // 必须先调 super，才能用 this
        this.type = 'child';
    }
}
new Child('hello');   // {name: "hello", type: "child"}
```

> `super()` 必须在 `this` 之前调用——不调就报 `Must call super constructor`。这是 class 语法故意设的限制，因为子类的 `this` 是由父类构造函数创建的。

**getter / setter**：

```js
class Parent {
    constructor(name = 'mukewang') { this.name = name; }
    get longName()  { return 'mk' + this.name; }
    set longName(value) { this.name = value; }
}

let v = new Parent();
v.longName;           // "mkmukewang" —— 读触发 get
v.longName = 'hello'; // 写触发 set
v.longName;           // "mkhello"
```

**读 `longName` 时执行的是 getter，写的时候是 setter**——用起来像属性，实际是函数。

**静态成员**：

```js
class Parent {
    static tell() { console.log('静态方法 tell'); }
}
Parent.tell();        // 通过类调用，不能通过实例调用

Parent.type = 'test'; // 静态属性（2017 年只能这样挂）
```

> 静态属性后来有了正式语法：`static type = 'test'` 写在类体里，不用在外面赋值。原笔记是 2017 年写的，那时还不支持。

`class` 到底是不是语法糖？**基本是，但不完全是**：ES5 用函数模拟的「类」有几个 class 修不掉的问题——必须用 `new` 调用、内部方法不可枚举、不能叫 `call` 之外的名字。class 把这些默认行为调整成了更符合直觉的样子。

## Promise：执行顺序才是重点

lesson13 讲的异步，**这七行输出比代码本身重要**：

```
执行
执行2
执行3
执行4
执行4
log 6
catch Error: 出错了
timeout1
promise timeout2
timeout3
```

看这个顺序：前七行**同步**就打完了，最后三行在定时器到期后才出现。这揭示了 Promise 最关键的一点：

> **Promise 的执行器（executor）函数是同步执行的。**

看这段：

```js
let ajax = function (num) {
    console.log('执行4');
    return new Promise(function (resolve, reject) {
        if (num > 5) { resolve(); }
        else { throw new Error('出错了'); }
    });
};

ajax(6).then(() => console.log('log', 6)).catch(err => console.log('catch', err));
ajax(3).then(() => console.log('log', 6)).catch(err => console.log('catch', err));
```

两个 `ajax` 的 `console.log('执行4')` **马上**输出（所以有两行「执行4」）。`ajax(3)` 里的 `throw` 也是**同步**抛出的，被 Promise 捕获后转成 rejected 状态，于是 `.catch` 立刻触发，打出 `catch Error: 出错了`。

而 `.then` 里的回调**不会同步执行**——它被排进微任务队列，等当前同步代码跑完才轮到。

**链式调用**：

```js
ajax()
    .then(() => new Promise((resolve) => setTimeout(resolve, 2000)))
    .then(() => console.log('timeout3'));
```

第二个 `.then` 等第一个返回的 Promise 完成才执行。这就是链式调用的意义——**用扁平的结构表达串行的异步流程**，不用层层嵌套回调。

**`Promise.all` 和 `Promise.race`**：

```js
Promise.all([loadImg(a), loadImg(b), loadImg(c)]).then(showImgs);
Promise.race([loadImg(a), loadImg(b), loadImg(c)]).then(showImgs);
```

- `all`：**全部**加载完才触发（一荣俱荣，一损俱损）
- `race`：**任何一个**完成就触发（谁快谁赢）

原文件里这两个例子依赖外网图片（`buimg.com` 那些），早就挂了。所以页面里跑起来会看到一堆 `err is not defined`——因为 `img.onerror` 里写的 `reject(err)` 拼错了变量名（应该是 `e` 或 `error`）。这是原代码的一个 bug，我没动它。

## 迭代器：让 for-of 认你的对象

```js
let arr = ['hello', 'world'];
let map = arr[Symbol.iterator]();
console.log(map.next());   // {value: "hello", done: false}
console.log(map.next());   // {value: "world", done: false}
console.log(map.next());   // {value: undefined, done: true}
```

`Symbol.iterator` 是一个方法，调用它返回一个**迭代器对象**，这个对象有 `next()` 方法，每次返回 `{value, done}`。

**`for...of` 的本质就是不断调 `next()` 直到 `done` 为 true**。

所以只要给对象挂上这个接口，它就能被 `for...of` 遍历：

```js
let obj = {
    start: [1, 3, 2],
    end: [7, 9, 8],
    [Symbol.iterator]() {
        let arr = this.start.concat(this.end);
        let index = 0;
        return {
            next() {
                if (index < arr.length) return { value: arr[index++], done: false };
                return { value: arr[index++], done: true };
            }
        };
    }
};

for (let key of obj) console.log(key);   // 1 3 2 7 9 8
```

一个普通对象，**因为实现了 `Symbol.iterator`，就能用 `for-of` 了**。这就是「可迭代协议」——一种让自定义结构融入语言内置语法的机制。

## Generator：状态可以暂停的函数

```js
let tell = function*() {
    yield 'a';
    yield 'b';
    return 'c';
};

let k = tell();
console.log(k.next());   // {value: "a", done: false}
console.log(k.next());   // {value: "b", done: false}
console.log(k.next());   // {value: "c", done: true}  ← 注意 return 的值
console.log(k.next());   // {value: undefined, done: true}
```

`function*` 定义生成器函数，`yield` 是暂停点。**函数执行到 `yield` 就停住，把控制权交回调用方**，下次 `next()` 从暂停的地方继续。

> `return` 的值会以 `done: true` 返回一次，之后的 `next()` 永远是 `{undefined, true}`。这是 `return` 和 `yield` 的差别——`return` 结束迭代。

**生成器天生就是迭代器**，所以能直接挂到 `Symbol.iterator` 上：

```js
let obj = {};
obj[Symbol.iterator] = function*() { yield 1; yield 2; yield 3; };
for (let value of obj) console.log(value);   // 1 2 3
```

比上面手写 `next()` 版本简洁太多——**生成器把「维护迭代状态」这件事自动化了**。

**无限状态机**：

```js
let state = function*() {
    while (1) {
        yield 'A'; yield 'B'; yield 'C';
    }
};

let status = state();
status.next();   // A
status.next();   // B
status.next();   // C
status.next();   // A  ← 转回来了
status.next();   // B
```

`while(1)` 是**无限循环**，但因为它每次 `yield` 就暂停，所以不会卡死。实跑输出确认了 `A B C A B` 的循环。这是生成器独有的能力——**惰性求值的无限序列**。

**控制抽奖次数**：

```js
let residue = function*(count) {
    while (count > 0) {
        count--;
        yield draw(count);
    }
};

let star = residue(5);
// 点一次按钮 star.next() 一次，抽完 5 次自动停
```

这段是「用生成器管理外部交互节奏」的例子——每次点击消耗一次额度，逻辑读起来和同步代码一样顺。

## 两个至今跑不起来的语法

这是这次重构最意外的发现：**17 课里有 2 课无法在浏览器里原生执行**。

**lesson16 用了修饰器**：

```js
class Test {
    @readonly
    time() { return '2017-03-11'; }
}
```

修饰器（Decorator）**至今仍是 Stage 3 提案**，没有进入 ECMAScript 标准。2017 年靠 babel 的 `transform-decorators` 插件编译，现在裸 `<script>` 里直接抛 SyntaxError。

页面上我给了一份**行为等价的改写**——用 `Object.defineProperty` 把 `writable` 设成 `false`，效果和 `@readonly` 一样。实跑结果：

```
time() = 2017-03-11
改写后仍为： 2017-03-11
类静态属性 Test.myname = hello
```

注意第二行：**试着改写 `test.time` 既没报错也没生效**（非严格模式下静默失败）。原注释写的是「会引发错误」，实际不是——`writable: false` 的属性在非严格模式下赋值就是**静默忽略**。要真的抛错得加 `'use strict'`。这个细节比原注释准确。

**lesson17 是 ES 模块**：

```js
export default { A, test, Hello }
```

`export` 只能在模块作用域里用（`<script type="module">` 或 `.mjs` 文件）。放进普通 `<script>` 会报 `Unexpected token 'export'`。

我同样给了等价改写（用 IIFE 模拟模块作用域），实跑输出：

```
默认导出导出的对象： ["A", "test", "Hello"]
A = 123
test
class
```

## 回头看一下这 17 课

把它们连起来看，有一条清晰的脉络：**前 11 课在扩充「怎么描述数据」，后 6 课在解决「怎么组织流程」**。

数据那边——解构、扩展运算符、Map/Set、Proxy，都是让「表达一个数据结构」更省事、更安全。

流程那边——class 管对象的创建、Promise 管异步的串行、生成器管状态的暂停。它们都在回答同一个问题：**怎么把一个复杂的执行过程写得读起来顺**。

而这套笔记最诚实的价值在于：它是 2017 年的东西，**带着那个年代的工具痕迹**（babel、gulp、webpack），也带着那个年代的局限（两课必须编译才能跑）。九年后再看，语法留下来了，工具栈整体换掉了——**该过期的东西会过期，该沉淀的东西会沉淀**。

---

**在浏览器里跑**：[`lesson12.html`](/lab/es6/lessons/lesson12.html) · [`lesson13.html`](/lab/es6/lessons/lesson13.html) · [`lesson14.html`](/lab/es6/lessons/lesson14.html) · [`lesson15.html`](/lab/es6/lessons/lesson15.html) · [`lesson16.html`](/lab/es6/lessons/lesson16.html) · [`lesson17.html`](/lab/es6/lessons/lesson17.html) · [`demo-class.html`](/lab/es6/lessons/demo-class.html) · [`demo-promise.html`](/lab/es6/lessons/demo-promise.html) · [`demo-generator.html`](/lab/es6/lessons/demo-generator.html)
