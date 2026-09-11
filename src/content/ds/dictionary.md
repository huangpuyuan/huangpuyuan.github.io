---
title: 字典
order: 5
summary: 键值对结构，用名字而不是序号来找东西。集合只管键，字典连值一起管，是实现散列表和图的基础零件。
gist: 按名字取东西，不按序号。
complexity:
  - 添加 / 取值 O(1)
  - 删除 O(1)
  - 判断键存在 O(1)
chapter: 第 7 章 字典和散列表
demo: dictionary/UsingDictionary.html
source: dictionary/dictionary.js
---

## 它解决什么问题

数组靠下标取东西，`arr[3]` 拿到第四个。但很多时候想要的不是「第四个」，而是「叫这个名字的那个」。

`phoneBook['张三']` 这样的写法，比记住张三排在第几行靠谱得多。字典就是干这个的：把键和值绑在一起，用键直接取。

上一篇的集合只管键，不管值。字典是它的完整版本，键和值都要。

## 生活里长什么样

手机通讯录。要找谁，直接搜名字，不需要知道它在列表里的位置。

## 一步步写

### 第 1 步 还是用对象

```js
function Dictionary() {
    var items = {};
}
```

和集合一样，底子就是一个对象。区别在于存的时候要存两份信息：键和值。

### 第 2 步 判断键存在

```js
this.has = function (key) {
    return items.hasOwnProperty(key);
    // return key in items;
};
```

源码里把 `key in items` 那行注释掉了，留下的注释是在解释 `in` 操作符的用法。实际用的是 `hasOwnProperty`，理由和集合那一篇一样：不认原型链上的属性。

### 第 3 步 存和取

```js
this.set = function (key, value) {
    items[key] = value;
};

this.get = function (key) {
    return this.has(key) ? items[key] : undefined;
};
```

`get` 这里有一个细节值得留意。如果直接写 `return items[key]`，键不存在时会返回 `undefined`，而键存在但值本来就是 `undefined` 的时候，返回的也是 `undefined`。两种情况区分不开。

加上 `this.has(key)` 判断之后，语义就明确了：返回 `undefined` 一律表示「没有这个键」。

### 第 4 步 删除

```js
this.remove = function (key) {
    if (this.has(key)) {
        delete items[key];
        return true;
    }
    return false;
};
```

删完返回一个布尔值，让调用方知道到底删掉了没有。直接写 `delete items[key]` 是不报错的，哪怕这个键根本不存在，所以得自己判断。

### 第 5 步 把键和值分别列出来

```js
this.keys = function () {
    return Object.keys(items);
};

this.values = function () {
    var values = [];
    for (var k in items) {
        if (this.has(k)) {
            values.push(items[k]);
        }
    }
    return values;
};
```

`keys` 直接用 `Object.keys` 就行。`values` 得绕一圈，因为对象没有现成的方法可以只取值。

那个 `if (this.has(k))` 看着多余，其实是保险：`for...in` 会把原型链上可枚举的属性也遍历进来，加一层过滤才不会混进脏数据。

### 第 6 步 收尾

```js
this.getItems = function () {
    return items;
};

this.clear = function () {
    items = {};
};

this.size = function () {
    return Object.keys(items).length;
};
```

`getItems` 把内部对象整个交出去，外面就能直接交给别的结构用。图的实现里就是这么干的：邻接表本身就是一个字典，键是顶点，值是这个顶点连着的所有顶点。

## 复杂度

| 操作 | 复杂度 | 说明 |
|---|---|---|
| set / get / has / remove | O(1) | 按键直接定位 |
| keys / values | O(n) | 要遍历整个对象 |
| size | O(n) | `Object.keys` 本身要生成一份键的列表 |

这里的 O(1) 指的是**平均情况**。对象的键存在底层哈希表里，键一多就可能撞在一起，极端情况下会退化。日常量级下不用管，知道有这么回事就行。

## 什么时候会用到

- 通讯录、配置表这类按键取值的场景
- 计数器：词频统计、分类计数
- 图的邻接表
- 散列表的散列函数算完之后，也是存进字典结构里

## 容易踩的坑

- 用 `get` 返回 `undefined` 来判断「键不存在」。值本身可能就是 `undefined`，得用 `has` 判断
- 拿对象当字典用，然后遍历时被原型上的属性干扰。要么用 `hasOwnProperty` 过滤，要么用 `Object.create(null)` 建一个干净的对象
- 键会被强制转成字符串，`set(1, 'a')` 和 `set('1', 'b')` 是同一个键
