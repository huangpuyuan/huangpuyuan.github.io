---
title: "Angular 2 核心三件套：依赖注入、路由与组件通讯"
date: 2017-04-16
category: "旧笔记考古"
summary: "把当年三个 Angular 2 练习项目（DI-Angular / router-Angular / Angular2Action）合并成一篇。覆盖依赖注入的 provide/useFactory/useValue、路由的守卫与 resolve、组件间的 @Input/@Output 通讯。"
draft: false
---

> **归档说明**：整理于 2026-10，原文分散在 2017 年 3–4 月的三个 Angular 2 练手项目里：`DI-Angular`（依赖注入）、`router-Angular`（路由与守卫）、`Angular2Action`（一个完整的小型电商 demo）。
> 三个项目其实是一条线：先用 DI 把服务解耦 → 再用路由把页面串起来 → 最后用一个真实 demo 把全部概念跑通。这里按这条逻辑合并成一篇，代码托管在 [lab/angular2](https://github.com/huangpuyuan/huangpuyuan.github.io/tree/master/public/lab/angular2)。

## 背景

2017 年初，Angular 刚发布 2.x 重写版，把 1.x 的 `$scope` / digest cycle 那套换成了 **组件 + 模块 + 依赖注入** 的新骨架。我之前写过 AngularJS（见[另一篇 Digest Cycle 笔记](/posts/angularjs-digest-cycle)），所以学 Angular 2 的过程更像"同一个框架换了副身体"。

那时候 `@angular/cli` 还在 `@angular-cli` 的早期版本，`ng new` 出来的项目结构就是 `src/app/` 下一堆组件。下面三部分都是那段时间的实战记录。

---

## 一、依赖注入（DI-Angular）

Angular 2 的 DI 比 1.x 强得多，核心是**注入令牌（token）+ Provider**。在 `@NgModule.providers` 里注册服务，组件构造函数里声明类型即可自动注入。

### 最简形式：直接给类

```typescript
@NgModule({
  providers: [LoggerService]
})
export class AppModule {}
```

```typescript
@Injectable()
export class LoggerService {
  log(msg: string) { console.log(msg); }
}

export class ProductService {
  constructor(private logger: LoggerService) {} // 自动注入
}
```

### `provide`：用接口/字符串当令牌

当你想"面向抽象编程"（注入依赖某个接口而非具体类），就要显式写 `provide`：

```typescript
providers: [
  { provide: ProductService, useClass: AnotherProductService }
]
```

这样组件里 `constructor(private p: ProductService)` 拿到的其实是 `AnotherProductService` 的实例——**类型声明只用于编译期，运行时靠 token 解析**。这是 Angular 2 DI 和传统 IoC 容器思路一致的地方。

### `useFactory`：运行时才决定给谁

真正的杀手锏是**工厂函数**。当年练的是一个经典场景：**开发环境和生产环境注入不同的服务实现**。

```typescript
export function myFactory(logger: LoggerService, appConfig) {
  if (appConfig.isDev) {
    return new ProductService(logger);
  } else {
    return new AnotherProductService(logger);
  }
}

@NgModule({
  providers: [
    {
      provide: ProductService,
      useFactory: myFactory,
      deps: [LoggerService, "APP_CONFIG"]
    },
    LoggerService,
    { provide: "APP_CONFIG", useValue: { isDev: false } }
  ]
})
export class AppModule {}
```

三个要点：

1. **`useFactory`** 指定工厂函数，返回什么就注入什么。
2. **`deps`** 声明工厂函数自身依赖哪些 token——注意是**数组**，Angular 按顺序传入。工厂函数没写 `@Injectable`，编译器拿不到参数元数据，所以必须显式声明。
3. **`useValue`** 注入一个普通对象，配合字符串 token `"APP_CONFIG"` 使用。这招在注入环境配置时特别常用。

### `useExisting` / `useClass` / `useValue` / `useFactory`

一张表记住四个：

| 方式 | 含义 | 典型用途 |
| --- | --- | --- |
| `useClass` | 用另一个类替换 | 面向接口编程、Mock 替换 |
| `useValue` | 注入现成对象 | 常量配置、第三方实例 |
| `useFactory` | 工厂函数动态生产 | 依环境/配置决定实现 |
| `useExisting` | 指向已存在的实例 | 给同一个实例起别名 |

`useFactory` 是当年最费脑子的一个——因为它是**唯一能在运行时读配置再决定返回什么**的方式，其余三种都在编译期就定死了。

### 顺带：自定义指令与管道

同一个项目里还练了两个小东西。

**校验指令**（`equal-validator.directive.ts`）——密码确认那类场景：

```typescript
@Directive({ selector: '[equalValidator]' })
export class EqualValidatorDirective implements Validator {
  // 比较两个字段是否相等，返回校验结果
}
```

**管道**（`multiple.pipe.ts`）——格式化输出，本质就是 Angular 1.x 的 filter 换了名字：

```typescript
@Pipe({ name: 'multiple' })
export class MultiplePipe implements PipeTransform {
  transform(value: number, args?: any): any { /* ... */ }
}
```

## 二、路由与守卫（router-Angular）

Angular 2 的路由是一个独立 `@NgModule`，配置写成 `Routes` 数组。

### 基础路由表

```typescript
const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'chat', component: ChatComponent, outlet: 'aux' }, // 辅助路由
  { path: 'home', component: HomeComponent },
  {
    path: 'product/:id',
    component: ProductComponent,
    children: [                                  // 子路由
      { path: '', component: ProductDescComponent },
      { path: 'seller/:id', component: SellerInfoComponent }
    ],
    resolve: { product: ProductResolve }         // 路由预取
  },
  { path: '**', component: Code404Component }    // 通配 = 404
];
```

几个容易忽略的点：

- **`pathMatch: 'full'`**：空路径重定向必须加，否则会匹配到所有路由（前缀匹配的锅）。
- **`outlet: 'aux'`**：辅助路由（named outlet），可以让一个页面同时渲染两个路由出口——当年用它做"常驻聊天窗口"。
- **`children`**：子路由组件会渲染在父组件模板的 `<router-outlet>` 里。
- **`**`**：通配路由放最后，当 404 兜底。

### 三种守卫

Angular 2 的守卫是**接口**（1.x 里是事件 + `$locationChangeStart` 那套回调，2.x 干净很多）：

```typescript
// 能不能进入——登录拦截
export class LoginGuard implements CanActivate {
  canActivate() {
    let loggedIn: boolean = Math.random() < 0.5;
    if (!loggedIn) console.log("用户未登录");
    return loggedIn;
  }
}

// 能不能离开——未保存提醒
export class UnsavedGuard implements CanDeactivate<ProductComponent> {
  canDeactivate(component: ProductComponent) {
    return window.confirm("你还没有保存，确定要离开么？");
  }
}
```

| 守卫接口 | 时机 | 典型用途 |
| --- | --- | --- |
| `CanActivate` | 进入路由前 | 登录校验 |
| `CanDeactivate` | 离开路由前 | 表单未保存拦截 |
| `Resolve` | 进入前预取数据 | 详情页数据加载 |
| `CanActivateChild` | 子路由进入前 | 模块级权限 |
| `CanLoad` | 懒加载模块加载前 | 权限 + 代码分割 |

### Resolve：进页面前先把数据拿到

这是当年觉得设计得最优雅的一处——**避免"页面闪一下才出数据"**：

```typescript
@Injectable()
export class ProductResolve implements Resolve<Product> {
  constructor(private router: Router) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    let productId: number = route.params["id"];
    if (productId == 1) {
      return new Product(1, "iPhone7");
    } else {
      this.router.navigate(['/home']); // 数据不存在直接踢走
      return undefined;
    }
  }
}
```

`resolve` 返回 Promise / Observable / 值都行，Angular 会**等它 resolve 完再激活路由**，然后通过 `route.data['product']` 拿结果。这样组件里就不用写 loading 状态了——数据没准备好，路由根本不进。

## 三、组件通讯（Angular2Action）

第三个项目 `Angular2Action` 是个完整的小电商 demo（导航栏、搜索、商品列表、商品详情、轮播、星级评分），真正把前面的概念用起来了。这里重点记**组件间通讯**——Angular 2 里最需要理解的两条路。

### `@Input`：父传子

```typescript
// 子组件
export class StarsComponent {
  @Input() rating: number = 0;
}
```

```html
<!-- 父组件模板 -->
<app-stars [rating]="product.rating"></app-stars>
```

`[rating]` 的方括号表示**属性绑定**，值从父作用域的表达式求出来。

### `@Output` + `EventEmitter`：子传父

这个在价格实时跳动组件（`price-quote.component.ts`）里用得最典型——子组件每秒 emit 一次新价格，父组件监听：

```typescript
export class PriceQuoteComponent implements OnInit, OnDestroy {
  stockCode: string = "IBM";
  price: number;

  @Output('priceChange')
  lastPrice: EventEmitter<PriceQuote> = new EventEmitter();

  @Output('buyIt')
  buy: EventEmitter<PriceQuote> = new EventEmitter();

  private myInterval;

  start() {
    this.myInterval = setInterval(() => {
      let priceQuote = new PriceQuote(this.stockCode, 100 * Math.random());
      this.price = priceQuote.lastPrice;
      this.lastPrice.emit(priceQuote); // 主动往上抛
    }, 1000);
  }

  constructor() { this.start(); }

  ngOnDestroy() {
    clearInterval(this.myInterval); // 销毁时必须清定时器
  }
}
```

三个细节值得记住：

1. **`@Output('priceChange')`** 里的字符串是**对外事件名**，父模板里写 `(priceChange)="..."`。
2. **`ngOnDestroy` 清定时器**——这是当年踩过的坑。组件销毁了但 `setInterval` 还在跑，会内存泄漏 + 报错。
3. `PriceQuote` 是个纯数据类，`constructor(public stockCode, public lastPrice)` 用 TS 的**参数属性**简写，一行搞定字段声明 + 赋值。

### 服务当"全局通讯总线"

组件层级深了以后，`@Input`/`@Output` 一层层传太累，就用**共享服务 + RxJS Subject**当事件总线。项目里的 `ProductService` 就是这么干的：维护商品列表，搜索组件调用它的方法，商品列表组件订阅它的结果。

## 回头看

这三个项目合起来，其实就是 Angular 2 的**最小完备知识集**：

- **DI** 解决"对象怎么来"——尤其是 `useFactory` 让实现能在运行时切换；
- **路由**解决"页面怎么切"——`CanActivate` / `Resolve` 把权限和数据预取做在路由层，组件保持干净；
- **组件通讯**解决"数据怎么流"——`@Input` 下行、`@Output` 上行、服务做跨层级。

2017 年写这些的时候，Angular 2 还是"新框架"，一套 `@NgModule` 写法让从 AngularJS 过来的人很不适应。现在 Angular 已经到 v17+，standalone component 把 `@NgModule` 都省了，Signal 又在替代 `@Input`/`@Output`。但这三层的**设计思想**没变——依赖注入、路由守卫、数据单向流，换个 API 还会继续存在。

原始代码：
- [lab/angular2/di](https://github.com/huangpuyuan/huangpuyuan.github.io/tree/master/public/lab/angular2/di)
- [lab/angular2/router](https://github.com/huangpuyuan/huangpuyuan.github.io/tree/master/public/lab/angular2/router)
- [lab/angular2/action](https://github.com/huangpuyuan/huangpuyuan.github.io/tree/master/public/lab/angular2/action)
