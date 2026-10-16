# lab/zerg

RESTful API 设计练习项目（2017-04），基于 ThinkPHP 5.0。

对应笔记：[RESTful API 设计落地：错误码体系与异常分层](/posts/restful-api-design)。

## 目录

本目录只保留**自己写的源码**（框架本体 `thinkphp/` 未包含）。

```
application/
├── route.php                             # 三段式路由定义
├── api/
│   ├── controller/v1/Banner.php          # 控制器（薄控制器）
│   ├── model/Banner.php                  # 模型
│   └── validate/
│       ├── BaseValidate.php              # 校验器基类（统一抛 ParameterException）
│       └── IDMustBePositiveInt.php       # ID 必须为正整数
└── lib/
    └── exception/
        ├── BaseException.php             # 业务异常基类（code / msg / errorCode）
        ├── ExceptionHandler.php          # 全局异常处理（统一 JSON 出口）
        ├── ParameterException.php        # 参数异常
        └── BannerMissException.php       # Banner 不存在
error.code.md                             # 错误码规范（一位大类 + 五位具体码）
```

## 核心设计

1. **错误码分段**：一位数区分大类（1 通用 / 2 商品 / 4 Banner...），五位数定位具体场景。
2. **异常三层链**：`BaseException`（基类）→ 具体异常类（只覆盖属性）→ `ExceptionHandler`（全局收口）。
3. **系统异常对用户隐身**：`ExceptionHandler` 用 `instanceof BaseException` 区分业务/系统异常，系统异常只返回 `999` 并记日志，绝不暴露堆栈。

## 运行方式

还原为完整 ThinkPHP 5 项目：

```bash
composer create-project topthink/think zerg
# 用本目录的 application/ 覆盖对应部分
php think run
curl http://localhost:8000/api/v1/banner/1
```
