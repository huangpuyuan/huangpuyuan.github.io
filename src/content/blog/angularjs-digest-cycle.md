---
title: "AngularJS 核心机制：Digest Cycle 与数据绑定"
date: 2017-02-27
category: "旧笔记考古"
summary: "2017 年学 Coursera 前端课程时的 AngularJS 笔记。重点搞懂了双向绑定背后的 Digest Cycle（脏检查）机制：为什么 $apply 必须调用、$digest 什么时候触发、2-way/1-way/1-time 三种绑定的区别。"
---

> **归档说明**：整理于 2026-10，原文写于 2017 年 2 月，是学 Coursera 前端课程（AngularJS 部分）时整理的笔记。AngularJS 1.x 已停止维护，本文仅作学习存档——但**脏检查机制是理解所有"响应式框架"的钥匙**。

用 AngularJS 最神奇的地方是：改一个变量，页面上所有用到它的地方自动更新。当时不理解就只会用，直到学了 Digest Cycle 才明白——**这不是魔法，是一套"轮流检查"的笨办法**。

## 1 Digest Cycle 是什么

**Digest Cycle（摘要循环）= 反复跑检查循环，直到所有 watcher 都报告"没有变化"为止。**

具体流程：

1. 遍历所有 watcher
2. 逐个比较"上次的值"和"当前值"
3. 如果有任何变化 → 再次遍历
4. 直到一轮下来所有 watcher 都没变化 → 结束

这个比较过程叫 **Dirty Checking（脏检查）**——不是"智能监听"，而是"反复对比"。

> 为什么叫"脏"？因为只要值变了就标记为"脏"，需要更新视图。

## 2 Watcher 是怎么建立的

有三种方式：

| 方式 | 说明 |
|---|---|
| `$scope.$watch` | **不要在 controller 里用**（仅供学习） |
| `{{ someProp }}` | 模板里的插值表达式，自动建立 watcher |
| `<input ng-model="someProp">` | ng-model 自动建立 watcher |

也就是说：**你在模板里每写一个 `{{ }}` 或 `ng-model`，就多了一个 watcher**。这就是为什么 AngularJS 有性能问题——watcher 太多，每轮 digest 都要全部检查一遍。

## 3 什么时候会触发 Digest

**核心规则：只有在 Angular 的"上下文"里做的事，才会触发 digest cycle。**

Angular 内置的指令（`ng-click`、`ng-model` 等）会自动触发；但**你自己写的原生事件回调不会**。

### 3.1 问题场景

```javascript
// 原生事件，Angular 不知道
element.addEventListener('click', function() {
    $scope.count++;          // 数据改了
    // 但视图不会更新！
});
```

### 3.2 三种解决方案

**方案一：手动调用 `$digest`**

```javascript
$scope.count++;
$scope.$digest();
```

**方案二：用 `$apply` 包起来（推荐）**

```javascript
$scope.$apply(function() {
    $scope.count++;
});
```

**方案三：用 Angular 自己的服务替代**

比如把 `setTimeout` 换成 `$timeout`、`setInterval` 换成 `$interval`——它们内部会自动处理 digest。

```javascript
// 不要
setTimeout(function() { $scope.count++; }, 1000);

// 要
$timeout(function() { $scope.count++; }, 1000);
```

> **`$apply` vs `$digest`**：`$apply` 会在执行完表达式后调用 `$rootScope.$digest()`（影响全应用），`$digest` 只影响当前作用域及其子作用域。日常用 `$apply`，性能敏感时用 `$digest`。

## 4 三种数据绑定

这是当时最容易搞混的部分，一张表说清：

| 绑定方式 | 写法 | 行为 |
|---|---|---|
| **2-Way（双向）** | `ng-model="prop"` | input 变化 → 自动更新 `$scope.prop`；`$scope.prop` 变化 → 自动更新 UI |
| **1-Way（单向）** | `{{ prop }}` | `$scope.prop` 变化 → 自动更新 UI（反过来不行） |
| **1-time（一次性）** | `{{ ::prop }}` | **只绑定初始值**，之后 watcher 被移除，UI 永不再更新 |

### 4.1 1-time 绑定的意义

```
{{ ::prop }}
```

加两个冒号就是"一次性绑定"——初始化时渲染一次，然后**注销对应的 watcher**。

这解决了大列表的性能问题：一个 100 行的列表，用普通绑定就多 100 个 watcher，每轮 digest 都要检查；用 `::` 就只在第一次渲染时检查，之后完全不管。

> **实战建议**：静态数据（比如页面标题、不变化的配置）一律用 `::`，能省下大量 watcher。

## 5 自定义过滤器

### 5.1 创建步骤

1. 定义 filter 工厂函数
2. 用 module 注册这个工厂函数

### 5.2 三种使用方式

**在 JavaScript 中使用**——需要把 filter 注入到 controller：

```javascript
angular.module('app').controller('myCtrl',
    ['$scope', 'registeredNameFilter', function($scope, registeredNameFilter) {
        $scope.result = registeredNameFilter($scope.data, arg1, arg2);
    }]);
```

**在 HTML 中使用**——不需要注入：

```html
{{ expression | registeredName : arg1 : arg2 }}
```

**链式调用**——多个 filter 串联：

```html
{{ expression | filterOne | filterTwo }}
```

## 6 ng-repeat 与内置 filter

### 6.1 ng-repeat 基础

```html
<!-- 简单循环 -->
<li ng-repeat="item in shoppingList1">{{ item }}</li>

<!-- 访问对象属性 -->
<li ng-repeat="item in shoppingList2">
    Buy {{ item.quantity }} of {{ item.name }}(s)
</li>

<!-- 用 $index 显示序号 -->
<li ng-repeat="item in shoppingList2">
    {{ $index + 1 }}. Buy {{ item.quantity }} of {{ item.name }}(s)
</li>
```

`ng-repeat` 类似 `for-each`，并暴露特殊变量：`$index`（当前索引）、`$first`、`$last`。

### 6.2 filter 配合 ng-repeat

```html
<li ng-repeat="item in collection | filter : searchString">
```

把一个字符串作为 `filter` 的参数，它会**过滤数组，匹配包含该字符串的项**——这是实现搜索框最省事的写法。

> 另外，`filter` 也是数组的原生方法（`array.filter`），别搞混了：Angular 的 `filter` 是模板里的管道，JS 里的是数组方法。

---

> 这篇笔记写于 2017 年 2 月，来自 Coursera 的 "Front-End JavaScript Frameworks: AngularJS" 课程。
>
> 现在回看，Digest Cycle 这套"轮询 + 脏检查"在性能上确实落后，Vue/React 的响应式（依赖收集）确实更聪明。**但它用最笨的办法解决了最核心的问题**：让开发者不用手动操作 DOM。理解了它，再看 Vue 的响应式原理会轻松很多。
