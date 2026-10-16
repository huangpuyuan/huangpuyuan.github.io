# lab/angular2

Angular 2 练习代码（2017-03 ~ 2017-04），来自三个项目：`DI-Angular`、`router-Angular`、`Angular2Action`。

对应笔记：[Angular 2 核心三件套：依赖注入、路由与组件通讯](/posts/angular2-core)。

## 目录

### `di/` —— 依赖注入（来自 DI-Angular）

| 文件 | 说明 |
| --- | --- |
| `app.module.ts` | `@NgModule` 配置，含 `useFactory` / `useValue` 示例 |
| `logger.service.ts` | 日志服务（可注入依赖） |
| `product.service.ts` | 商品服务 |
| `another-product.service.ts` | 商品的另一种实现（用于 useClass 演示） |
| `price-quote.component.ts` | 价格实时跳动组件（`@Output` + `EventEmitter` + `ngOnDestroy`） |
| `multiple.pipe.ts` | 自定义管道 |
| `equal-validator.directive.ts` | 自定义校验指令 |

### `router/` —— 路由与守卫（来自 router-Angular）

| 文件 | 说明 |
| --- | --- |
| `app-routing.module.ts` | 路由表：重定向、辅助出口、子路由、通配 404 |
| `login.guard.ts` | `CanActivate` 登录守卫 |
| `unsave.guard.ts` | `CanDeactivate` 未保存拦截 |
| `product.resolve.ts` | `Resolve` 路由预取数据 |

### `action/` —— 完整 demo（来自 Angular2Action）

| 文件 | 说明 |
| --- | --- |
| `product.service.ts` | 商品服务（作为跨组件通讯总线） |
| `filter.pipe.ts` | 过滤管道 |

## 运行方式

这三个是完整的 Angular CLI 项目，本目录只保留了**自己写的核心源码**（省去了 `node_modules` / `dist` / 大量样板）。要跑起来需要还原成完整项目结构：

```bash
ng new my-app
# 把 src/app/ 下的对应文件拷贝进去
ng serve
```

当年使用的 Angular 版本是 2.x（`@angular/core@^2.0.0`）+ `@angular-cli`（后更名为 `@angular/cli`）。现代 Angular（v17+）已改用 standalone component，`@NgModule` 不再是必需的，但 DI / 路由守卫 / 组件通讯的思想完全一致。
