---
title: "AngularJS 单页应用实战笔记"
date: 2017-03-21
category: "旧笔记考古"
summary: "2017 年用 AngularJS 搭建职位招聘单页应用的完整笔记。Gulp/Bower/Less 工具链、指令 directive 详解、$scope 与控制器、服务与 factory、$broadcast/$emit 事件广播、ui.router 路由。"
---

> **归档说明**：整理于 2026-10，原文写于 2017 年 3-4 月，是当时做"职位招聘单页应用"时整理的 AngularJS 笔记。AngularJS（1.x）已停止维护，本文仅作学习存档，其中的**作用域、依赖注入、事件广播**等概念在 Angular 2+ 中依然相通。

那时候想搞懂"单页应用到底怎么运作"，就拿 AngularJS 写了个招聘 App。这篇是边写边整理的笔记——从工具链到指令、作用域、服务、路由，基本覆盖了 AngularJS 的核心。

## 0 什么是单页应用

- **定义**：页面跳转不刷新
- **方法**：利用路由控制"页面"跳转——**监控 URL 的哈希值**变化来切换视图
- **优点**：页面切换流畅、前后端完全分离

> 本质：浏览器地址栏的 `#` 后面变化时，页面不重新请求，由前端 JS 决定渲染哪块 HTML。

## 1 开发环境：Gulp + Bower + Less

### 1.1 构建工具 Gulp

**优点**：基于流、任务化。

常用 API：

| API | 作用 |
|---|---|
| `src` | 读取文件和文件夹 |
| `dest` | 生成文件和写文件 |
| `watch` | 监控文件变化 |
| `task` | 定制任务 |
| `pipe` | 以流的方式处理文件 |

安装常用插件：

```bash
npm i -g gulp gulp-clean gulp-concat gulp-connect gulp-cssmin \
         gulp-imagemin gulp-less gulp-load-plugins gulp-uglify open
```

### 1.2 包管理 Bower

```bash
bower init        # 初始化，生成配置文件
bower install     # 安装依赖
bower uninstall   # 卸载
```

配置文件两个：`.bowerrc`（指定安装目录）和 `bower.json`（依赖清单）。

### 1.3 预编译 Less

常用语法：定义变量、后代选择器、文件引用、函数。

### 1.4 调试插件 Batarang

Chrome 插件，能直接查看 Angular 的 `$scope`、输出调试信息、做性能监控——**调试 AngularJS 必装**。

## 2 AngularJS 核心概念

官方的常用概念一大堆：module、directive、表达式、service、injector、依赖注入、模型、filter、数据绑定、`$scope`、controller、view。

用当年笔记里的比喻记：

> - **module**：魔法书（模块）
> - **directive**：召唤魔法（指令）
> - **controller**：辅助魔法（控制器）
> - **service**：攻击魔法（服务）

### 2.1 应用结构

```
根模块 root module
 └── 组件 components
      ├── 服务 service
      ├── 指令 directive
      ├── 过滤器 filter
      └── 控制器 controller
 └── 路由模块 router module  ←── 监听 URL 哈希值，加载不同 HTML 视图
 └── 视图 view（MVVM 机制） ←→ controller 双向数据绑定
```

**核心是 `$scope` 对象**，视图和控制器都通过它读写数据。

### 2.2 目录结构规划

```
src/
├── data/          假数据（json 模拟后端，上线后去掉）
├── image/         图片
├── script/        JS（构建后压缩成一个文件）
│   ├── config
│   ├── controller
│   ├── directive
│   ├── filter
│   ├── service
│   └── app.js     启动文件
├── style/         样式（less）
├── view/          视图模板
│   └── template/
├── 404.html
└── index.html
build/             调试开发用
dist/              压缩发布用
```

## 3 指令 directive 详解

> **定义**：通过 HTML 标签、属性、样式、注释，使 Angular 编译器为指定的 DOM 元素绑定特定行为，甚至改变 DOM 元素及其子元素。

### 3.1 内置指令

| 指令 | 作用 |
|---|---|
| `ng-model` | 变量与元素 value 双向绑定 |
| `ng-bind` | 变量绑定到 innerText |
| `ng-click` / `ng-mouse*` | 事件指令 |
| `ng-class` | 动态改变 class |
| `ng-if` | 条件为真才创建 |
| `ng-show` / `ng-hide` | 显示/隐藏 |
| `ng-repeat` | 循环生成元素，`item in data`，可用 `$index`/`$first`/`$last` |

### 3.2 自定义指令

```javascript
angular.module('app').directive('myDirective', function() {
    return {
        restrict: 'A',        // 见下表
        replace: true,
        scope: {              // 隔离作用域
            aa: '@',          // 接收字符串
            bb: '=',          // 接收变量（双向）
            cc: '&'           // 接收回调函数
        },
        template: '<div></div>',
        templateUrl: 'xxx.html',
        link: function(scope, element, attr) {
            // 提供事件交互
        },
        transclude: true      // 内嵌 HTML 模板
    };
});
```

**`restrict` 四种方式**：

| 值 | 含义 | 用法 |
|---|---|---|
| `E` | 元素 | `<my-directive></my-directive>` |
| `A` | 属性（**默认、最常用**） | `<div my-directive></div>` |
| `M` | 注释 | `<!-- directive: my-directive -->` |
| `C` | 样式类 | `<div class="my-directive"></div>` |

**`scope` 三种绑定符号**（这是自定义指令最容易搞混的地方）：

- `@` —— 接收**字符串**（本质是给指令暴露一组接口）
- `=` —— 传入**变量**（双向绑定）
- `&` —— 传入**回调函数**（注意传参方式）

## 4 控制器与作用域

关系：**controller 是视图对应的业务逻辑，$scope 是两者共享的数据载体**。

### 4.1 $scope 常用属性

| 属性 | 说明 |
|---|---|
| `$id` | 唯一标识，与 scope 对象一一对应 |
| `$parent` | 父作用域（控制器嵌套或使用指令时产生父子关系） |
| `$root` | 根作用域（`$id` 为 1） |

### 4.2 $scope 常用方法

**`$watch` —— 监听属性变化**：

```javascript
$scope.$watch('com', function(newVal, oldVal, scope) {
    if (newVal) $scope.showPositionList(0);
});
```

**`$broadcast` —— 向下广播给子集**：

```javascript
// 父作用域中广播
$http.get('data/company.json?id=' + $state.params.id).then(function(resp) {
    $scope.company = resp.data;
    $scope.$broadcast('abc', {id: 1});
});
```

```javascript
// 子指令中接收
$scope.$on('abc', function(event, data) {
    console.log(event, data);
});
```

> ⚠️ **踩过的坑**：广播是无状态的——**如果子集还没初始化完成，父作用域已经广播完了，子集就永远收不到**。所以要在子集的 `link` 或 `$onInit` 之后再做广播。

**`$emit` —— 向上冒泡给父集**：

```javascript
// 子集中冒泡
$scope.$emit('cba', {name: 2});

// 父集中接收
$scope.$on('cba', function(event, data) {
    console.log(event, data);
});
```

**`$digest` —— 双向绑定失效时手动触发**。

## 5 服务 service 与 factory

### 5.1 服务的特性

- **单例**：整个应用只创建一个实例
- **懒加载**：用到才创建
- **公用函数**：适合放跨模块共享的逻辑

### 5.2 常用内置服务

| 服务 | 作用 |
|---|---|
| `$http` | 发 AJAX 请求 |
| `$q` | 处理异步、按顺序处理并发请求（Promise 机制） |
| `$timeout` | 延迟执行 |
| `$interval` | 循环执行 |
| `$rootScope` | 所有 scope 的祖先 |

`$http` 用法：

```javascript
$http.get('/someUrl', config).then(successCallback, errorCallback);
$http.post('/someUrl', data, config).then(successCallback, errorCallback);

// 完整写法
$http({
    url: '',
    method: '',
    params: {},
    data: {}
}).then(function successCallback(response) {
    // 成功
}, function errorCallback(response) {
    // 失败
});
```

> ⚠️ **版本坑**：AngularJS 1.5 起，`$http` 的 `success` 和 `error` 方法已废弃，改用 `then`。

### 5.3 自定义服务

用 `service` 声明——通过 `this` 挂载方法：

```javascript
angular.module('app', ['ui.router', 'ngCookies']);

angular.module('app').service('cache', ['$cookies', function($cookies) {
    this.put = function(key, value) {
        $cookies.put(key, value);
    };
    this.get = function(key) {
        return $cookies.get(key);
    };
    this.remove = function(key) {
        $cookies.remove(key);
    };
}]);
```

用 `factory` 声明——返回一个对象：

```javascript
angular.module('app').factory('cache', ['$cookies', function($cookies) {
    return {
        put: function(key, value) { $cookies.put(key, value); },
        get: function(key) { return $cookies.get(key); },
        remove: function(key) { $cookies.remove(key); }
    };
}]);
```

在控制器中注入使用：

```javascript
angular.module('app').controller('positionCtrl',
    ['$q', '$http', '$state', '$scope', 'cache',
     function($q, $http, $state, $scope, cache) {
         cache.put('to', 'day');
         console.log(cache.get('to'));
     }]);
```

## 6 路由：ui.router

社区方案 `ui.router` 比官方 `ngRoute` 强大，支持嵌套视图。

### 6.1 状态定义

```javascript
$stateProvider.state('home', {
    url: '/home',
    templateUrl: 'view/home.html',
    controller: 'homeCtrl'
});
```

### 6.2 URL 匹配规则

| 写法 | 匹配 |
|---|---|
| `'/home'` | 只匹配 `/home` |
| `'/user/:id'` 或 `'/user/{id}'` | 匹配 `/user/1234` |
| `'/messages?before&after'` | 非 REST 风格的 query 传参 |

### 6.3 跳转与取参

```html
<a ui-sref="main({id: 1234})">跳转</a>
```

```javascript
// JS 方式跳转
$state.go('main', {id: contact.id}, {location: 'replace'});

// 取参数
$state.params.id;      // 或
$stateParams.id;
```

重要指令和服务：`ui-sref`、`$state`。

## 7 数据绑定

两种方式：

- JS 代码里用 `$scope`
- HTML 标签里用 `{{ xxxx }}`

---

## 8 代码与资源

**项目源码**：当年写在 `app_angularJS` 仓库，含 `src/`（源码）、`build/`（调试）、`dist/`（发布）三套产物。

**相关笔记**：
- [AngularJS 核心机制：Digest Cycle 与数据绑定](/blog/angularjs-digest-cycle/) —— 理解双向绑定的底层原理
- [Angular 2 核心概念：依赖注入、路由与组件通讯](/blog/angular2-core-concepts/) —— 从 1.x 到 2+ 的演进

---

> 这篇笔记写于 2017 年 3-4 月。AngularJS 1.x 如今已停止维护，但**作用域的父子关系、事件广播、依赖注入、指令的作用域隔离**这些设计思想，是后来所有前端框架的共同遗产。带 `$` 前缀的 API 现在看不到了，但"数据驱动视图"的思路一直延续到今天。
