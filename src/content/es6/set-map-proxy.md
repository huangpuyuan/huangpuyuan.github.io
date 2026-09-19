---
title: "Set、Map 与 Proxy：三种新的数据组织方式"
description: "lesson10 是全部 17 课里最长的一课，180 行，用增删改查四个操作对比了 Map、Set、数组和对象。lesson11 的 Proxy 则让「拦截属性访问」成为语言能力。"
order: 8
slug: set-map-proxy
minutes: 26
tag: "集合 / 元编程"
updated: "2026-09-19"
lessons: "10, 11"
demo: demo-setmap.html
---

`lesson10` 是全套里最长的一课，180 行、45 行输出。它不是罗列 API，而是**拿四种结构做同一件事**（增删改查），比出各自的适用场景。这种写法我挺喜欢——比单纯记 API 有用。

## Set：只有值的集合

```js
let list = new Set();
list.add(5);
list.add(7);
console.log(list.size);   // 2
console.log(list);        // Set{5, 7}
```

**自动去重**是它最实用的特性：

```js
let arr = [1, 2, 3, 4, 1, 2, '2', 3];
let list2 = new Set(arr);
console.log(list2);   // Set{1, 2, 3, 4, "2"}
```

注意输出里 `"2"` **带着引号**——它和数字 `2` 是两个不同的元素，所以都留下了。最终 5 个元素：`1, 2, 3, 4, '2'`。

这个去重是**严格按 SameValueZero** 判断的（和 `includes` 一致），所以 `NaN` 在 Set 里也只会有一个。

> 实际项目里最常用的写法就是上面这行：**数组去重一行搞定**。要拿回数组用 `[...new Set(arr)]`。

**增删查**：

```js
list.has('add')      // true
list.delete('add')   // 删除并返回是否成功
list.clear()         // 清空
```

**遍历**：

```js
for (let key of list.keys())       // add, delete, clear, has
for (let value of list)            // 同 keys
for (let [k, v] of list.entries()) // [add,add], [delete,delete] ...
list.forEach(item => ...)
```

Set 的 `entries()` 让键和值都是元素本身——这是为了和 Map 的接口保持一致，方便同一个遍历函数处理两者。

## Map：键可以是任何东西

```js
let map = new Map();
let arr = ['123'];
map.set(arr, 456);
console.log(map.get(arr));   // 456
```

**这就是 Map 和 Object 的根本差别**：`map` 的键可以是**数组、对象、函数**——任何值。Object 的键只能是字符串（或 Symbol）。

上面这段如果换成对象，键会变成 `"[object Object]"` 这种字符串，根本取不回来。

初始化可以直接吃一个二维数组：

```js
let map = new Map([['a', 123], ['b', 456]]);
console.log(map.size);      // 2
map.delete('a');
map.clear();
```

## Promise 会用在 WeakSet / WeakMap

```js
let weakList = new WeakSet();
let arg = {1: 1};
weakList.add(arg);   // 只能放对象，不能放原始值

let weakMap = new WeakMap();
let o = {};
weakMap.set(o, 123);
```

「Weak」指的是**弱引用**——集合不会阻止它里面的对象被垃圾回收。一旦外面没有别的地方引用那个对象，它就从 WeakSet/WeakMap 里消失了。

代价是**不能遍历**（因为元素可能随时被回收），也没有 `size`。它适合挂「附属数据」——比如给 DOM 节点记状态，节点被移除时数据自动跟着消失，不用手动清理。

## 四种结构的增删改查对比

这是 lesson10 最有价值的部分。作者用同一套操作跑了一遍 **数组 vs 对象 vs Map vs Set**：

**Map / Set vs 数组**：

```
map-array Map{t => 1} [{t: 1}]
map-array true {t: 1}                  ← 查：map.has vs array.find
map-array-modify Map{t => 2} [{t: 2}]  ← 改
map-array-modify Map{} []              ← 删
```

对比很清楚：

| 操作 | Map | 数组 |
|---|---|---|
| 增 | `map.set('t', 1)` | `array.push({t: 1})` |
| 查 | `map.has('t')` → true | `array.find(item => item.t)` → 返回元素 |
| 改 | `map.set('t', 2)` | `array.forEach(...)` |
| 删 | `map.delete('t')` | `array.splice(index, 1)` |

**删这一项差别最大**：Map 一句 `delete` 就够；数组得先 `findIndex` 找到下标，再 `splice`——两步，而且 `splice` 是 $O(n)$ 的（要挪动后面的元素）。

**Map / Set / Object 三者对比**：

```
map-set-obj {t: 1} Map{t => 1} Set{{t: 1}}
{map_exist: true, set_exist: true, obj_exist: true}
```

查这一项：
- Map：`map.has('t')`
- Set：`set.has(item)` —— **注意要传对象引用本身**
- Object：`'t' in obj`

删这一项：
- Map：`map.delete('t')`
- Set：`set.delete(item)`
- Object：`delete obj['t']`

原文件末尾有句总结挺到位：

> 作增删改查的时候优先使用 map，保证唯一性使用 set，放弃传统的数组和 object

**不过这句要打个折扣。** Map 的键查找严格说是 $O(1)$ 均摊，确实比数组的 $O(n)$ 快，但 Object 在现代引擎里也是哈希结构，日常数据量下差别可以忽略。真正该选 Map 的理由是**键的类型不受限**和**有稳定的顺序保证**，不是「快」。

## Proxy：拦截属性访问

lesson11 的 40 行代码做了件挺酷的事——**给一个普通对象套一层「代理」，拦下所有读写**：

```js
let monitor = new Proxy(obj, {
    get(target, key) {
        return target[key].replace('2017', '2018');   // 读的时候偷换内容
    },
    set(target, key, value) {
        if (key === 'name') return target[key] = value;   // 只允许改 name
        return target[key];
    },
    has(target, key) {                                    // 拦 'in'
        return key === 'name' ? target[key] : false;
    },
    deleteProperty(target, key) {                         // 拦 delete
        if (key.indexOf('_') > -1) { delete target[key]; return true; }
        return target[key];
    },
    ownKeys(target) {                                     // 拦 Object.keys
        return Object.keys(target).filter(item => item !== 'time');
    }
});
```

实跑结果：

```
get 2018-03-11          ← 原值是 2017-03-11，被 get 改写了
set 2018-03-11          ← 想改 time，但 set 里没放行，所以没变
set mukewang            ← 想改 name，放行了
has true false          ← 'name' in monitor 是 true，'time' in monitor 是 false
ownkeys ["name", "_r"]  ← Object.keys 看不见 time 了
```

这一段把「拦截」演示得很到位：**同一个对象，外界的每一次访问都被中间的层改写了结果**。删除被限制（只有带下划线的键能删）、枚举被过滤、连 `in` 判断都能造假。

## Reflect：Proxy 的搭档

```js
Reflect.get(obj, 'time')     // 2017-03-11
Reflect.set(obj, 'name', 'mukewang');
Reflect.has(obj, 'name')     // true
```

`Reflect` 把 Object 上那些零散的、行为不一致的操作**统一成了一组函数**。它的方法名和 Proxy 的拦截器一一对应（`get`/`set`/`has`/`deleteProperty`/`ownKeys`），所以在 Proxy 里通常这么写：

```js
set(target, key, value) {
    if (checkOK(key, value)) {
        return Reflect.set(target, key, value);   // 交回默认行为
    }
    throw new Error('不合法');
}
```

**用 `Reflect` 而不是直接 `target[key] = value`**，是为了保留 `receiver` 语义和返回值语义——这是个容易被忽略的细节。

## 最有价值的一个例子：用 Proxy 做数据校验

lesson11 最后那段把 Proxy 用在了真实场景上：

```js
const personValidations = {
    name(val) { return typeof val === 'string'; },
    age(val)  { return typeof val === 'number' && val > 18; }
};

function validator(target, validator) {
    return new Proxy(target, {
        _validator: validator,
        set(target, key, value, proxy) {
            if (target.hasOwnProperty(key)) {
                if (!!this._validator[key](value)) {
                    return Reflect.set(target, key, value, proxy);
                } else {
                    throw Error(`不能设置${key}到${value}`);
                }
            }
            throw Error(`${key} 不存在`);
        }
    });
}
```

然后挂到类的构造函数上：

```js
class Person {
    constructor(name, age) {
        this.name = name;
        this.age = age;
        return validator(this, personValidations);   // ← 返回 Proxy 而不是 this
    }
}
```

实跑结果：

```
{name: lilei, age: 30}      ← person 实际是个 Proxy
{name: Hanmeimei, age: 30}  ← 改 name 成功（是字符串）
```

这个设计的巧妙之处在于**校验规则和业务逻辑彻底分开了**——`Person` 类完全不知道校验规则长什么样，`personValidations` 是一个纯粹的数据配置。想加字段就加一条规则，不用改类。

这是 Proxy 最典型的用法：**给对象加一层「守卫」，把横切关注点（校验、日志、权限）从业务代码里抽出来**。

---

**在浏览器里跑**：[`lesson10.html`](/lab/es6/lessons/lesson10.html) · [`lesson11.html`](/lab/es6/lessons/lesson11.html) · [`demo-setmap.html`](/lab/es6/lessons/demo-setmap.html) · [`demo-proxy.html`](/lab/es6/lessons/demo-proxy.html)
