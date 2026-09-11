---
title: 集合
order: 4
summary: 只关心「在不在」，不关心「第几个」。用对象的键来存值，天然去重，还顺手带上了交并差几种运算。
gist: 一堆不重复的值，天生去重。
complexity:
  - 添加 O(1)
  - 删除 O(1)
  - 判断存在 O(1)
  - 并集/交集/差集 O(n)
chapter: 第 6 章 集合
demo: set/UsingSet.html
source: set/set.js
---

## 它解决什么问题

很多场合只需要回答一个问题：这个值在不在里面。

某篇文章用过的分类标签有哪些、今天访问过的 IP 有哪些、选中的复选框是哪几个。这些都不关心顺序，也不允许重复。用数组也能凑合，但每次都得自己写去重逻辑，还容易写出 O(n²) 的代码。

集合把这两件事直接写进结构里：**不允许重复，判断存在是常数时间**。

## 生活里长什么样

篮球场上的球员号码。同一个号码不可能出现两次，问「8 号在场上吗」只需要扫一眼名单，不关心他是第几个来的。

## 一步步写

### 第 1 步 用对象当底子

```js
function Set() {
    var items = {};
}
```

为什么不用数组？因为对象有个天然优势：判断某个键存不存在是常数时间。数组得挨个找，对象不用。

### 第 2 步 判断存在

```js
this.has = function (value) {
    return items.hasOwnProperty(value);
};
```

`hasOwnProperty` 只认自己的属性，不会顺着原型链往上找。用它比 `value in items` 稳一些，`in` 会把 `toString` 这种原型上的方法也算进去，容易误判。

### 第 3 步 添加，顺便去重

```js
this.add = function (value) {
    if (!this.has(value)) {
        items[value] = value;
        return true;
    }
    return false;
};
```

注意 `items[value] = value`，键和值存的都是这个值本身。键负责去重，值负责取出来用。返回值告诉调用方到底加进去了没有，这个信息在统计时会用到。

### 第 4 步 删除

```js
this.remove = function (value) {
    if (this.has(value)) {
        delete items[value];
        return true;
    }
    return false;
};
```

### 第 5 步 把值取出来

操作对象总是需要遍历的，所以得有个出口。

```js
this.size = function () {
    return Object.keys(items).length;
};

this.values = function () {
    return Object.keys(items);
};
```

`Object.keys` 是现代写法，一行搞定。源码里还留了一份 `sizeLegacy` / `valuesLegacy`，那是给不支持 ES5 的老浏览器用的，现在不用管。

### 第 6 步 并集

把两个集合的值全倒进一个新集合。重复的会自动被 `add` 挡掉，所以三条语句就够了。

```js
this.union = function (otherSet) {
    var unionSet = new Set();
    var values = this.values();
    for (var i = 0; i < values.length; i++) {
        unionSet.add(values[i]);
    }

    values = otherSet.values();
    for (var i = 0; i < values.length; i++) {
        unionSet.add(values[i]);
    }

    return unionSet;
};
```

### 第 7 步 交集

遍历自己的每个值，问问对方有没有。

```js
this.intersection = function (otherSet) {
    var intersectionSet = new Set();
    var values = this.values();
    for (var i = 0; i < values.length; i++) {
        if (otherSet.has(values[i])) {
            intersectionSet.add(values[i]);
        }
    }
    return intersectionSet;
};
```

判断条件反过来写也行，取谁当遍历对象不影响结果，只影响循环次数。想快一点，就拿小的那个去遍历。

### 第 8 步 差集

和交集只差一个感叹号：对方**没有**的才留下。

```js
this.difference = function (otherSet) {
    var differenceSet = new Set();
    var values = this.values();
    for (var i = 0; i < values.length; i++) {
        if (!otherSet.has(values[i])) {
            differenceSet.add(values[i]);
        }
    }
    return differenceSet;
};
```

### 第 9 步 子集判断

`this` 是不是 `otherSet` 的子集。

```js
this.subset = function (otherSet) {
    if (this.size() > otherSet.size()) {
        return false;
    } else {
        var values = this.values();
        for (var i = 0; i < values.length; i++) {
            if (!otherSet.has(values[i])) {
                return false;
            }
        }
        return true;
    }
};
```

开头那行 `this.size() > otherSet.size()` 是个提前放行。自己的元素比对方还多，那肯定不是子集，不用往下比了。这种「先用便宜的判断排除掉大部分情况」的写法，在算法题里很常见。

## 复杂度

| 操作 | 复杂度 | 说明 |
|---|---|---|
| add / remove / has | O(1) | 对象按键直接定位 |
| size / values | O(n) | 要把键全列出来 |
| 并集 | O(n) | 两边各走一遍 |
| 交集 / 差集 | O(n) | 一边走一遍，每次判断 O(1) |
| 子集 | O(n) | 同上 |

## 什么时候会用到

- 数组去重。把数组倒进集合再取出来，一行搞定
- 记录访问过的节点，比如图遍历里的「已访问」标记
- 标签、分类、权限这类不支持重复的名单
- 判断两组数据的重合程度

## 容易踩的坑

- 用 `value in items` 判断存在，结果 `has('toString')` 返回 `true`
- 把对象直接当集合用，忘了它还会带上原型上的属性
- 集合存的是键的字符串形式，`add(1)` 和 `add('1')` 会当成同一个值。存对象的话更是会全部变成 `[object Object]`，这种场景得换 `Map` 或 `WeakMap`
