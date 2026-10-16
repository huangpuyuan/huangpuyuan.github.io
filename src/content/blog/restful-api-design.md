---
title: "RESTful API 设计落地：错误码体系与异常分层"
date: 2026-10-16
category: "旧笔记考古"
summary: "从 2017 年一个 ThinkPHP 5 的 API 练习项目（zerg）反推：一套能长期维护的 RESTful API 怎么组织错误码、怎么做异常分层、怎么让 controller 保持干净。"
draft: false
---

> **归档说明**：整理于 2026-10，素材来自 2017 年一个用 ThinkPHP 5 写的 API 练习项目 `zerg`（时间戳：2017-04-25 左右）。
> 那是第一次系统地按"正规 API"的思路搭项目——不是能跑就行，而是**错误码要有体系、异常要分层、controller 要薄**。这里把当年的设计意图和代码一并归档。代码托管在 [lab/zerg](https://github.com/huangpuyuan/huangpuyuan.github.io/tree/master/public/lab/zerg)。

## 背景

2017 年的时候，写 API 的普遍状态是"返回 `{"status": 0/1, "msg": "..."}`"——简单粗暴，但项目一大就失控：错误信息各写各的、敏感信息直接抛给前端、出问题只能翻日志。

`zerg` 这个项目（ThinkPHP 5 骨架 + 自己的 `application/api/` 模块）尝试了一套更正经的做法。核心三件事：

1. **错误码分段**——用数字区间区分错误大类；
2. **异常分层**——自定义 `BaseException` + 统一 `ExceptionHandler`；
3. **路由与控制器约定**——URL 三段式，控制器保持极薄。

下面一件件说。

---

## 一、错误码体系

先立规矩，再写代码。原文 `error.code.md` 就是这份规矩：

#### 一位数：错误大类

| 错误码 | 含义 |
| --- | --- |
| 999 | 未知错误，或不想让用户知道的错误 |
| 1 | 通用（开头第一位） |
| 2 | 商品类 |
| 3 | 主题类 |
| 4 | Banner 类 |
| 5 | 类目类 |
| 6 | 用户类 |
| 7 | 订单类 |

#### 五位数：具体错误

| 错误码 | 含义 |
| --- | --- |
| 10000 | 通用参数错误 |
| 10001 | 资源未找到 |
| 10002 | 未授权（令牌不合法） |
| 10003 | 尝试非法操作（用自己的令牌操作他人数据） |
| 10004 | 授权失败（第三方应用账号登录失败） |
| 10005 | 授权失败（服务器缓存异常） |
| 20000 | 请求商品不存在 |
| 30000 | 请求主题不存在 |
| 40000 | Banner 不存在 |
| 50000 | 类目不存在 |
| 60000 | 用户不存在 |
| 60001 | 用户地址不存在 |
| 80000 | 订单不存在 |
| 80001 | 订单中的商品不存在，可能已被删除 |
| 80002 | 订单还未支付 |
| 80003 | 订单已支付 |

**设计意图**：`10002` 这种五位数，看首位就知道是哪一类（1 = 通用，2 = 商品...），后四位是具体场景。前端拿到错误码就能定位到具体业务分支，不需要解析 message 文本。`999` 特意留作"兜底"——所有不该暴露给用户的异常都归到它。

这套编号方式（大类 + 场景段位）后来在很多公司的 API 规范里都能见到，是个很通用的思路。

## 二、异常分层

ThinkPHP 5 允许自定义异常处理类。项目里建了一条**三层异常链**：

### 第 1 层：`BaseException`——所有业务异常的基类

```php
namespace app\lib\exception;

use think\Exception;

class BaseException extends Exception
{
    // HTTP 状态码，如 404 200
    public $code = 400;

    // 错误具体信息
    public $msg = '参数错误';

    // 自定义的错误码
    public $errorCode = 10000;

    public function __construct($params = [])
    {
        if (!is_array($params)) {
            return;
        }
        if (array_key_exists('code', $params)) {
            $this->code = $params['code'];
        }
        if (array_key_exists('msg', $params)) {
            $this->msg = $params['msg'];
        }
        if (array_key_exists('errorCode', $params)) {
            $this->errorCode = $params['errorCode'];
        }
    }
}
```

它有三个属性，对应三件不同的事——**这个区分是整套设计的核心**：

| 属性 | 是什么 | 谁看 |
| --- | --- | --- |
| `$code` | **HTTP 状态码**（400/404/200） | HTTP 协议层，浏览器/网关 |
| `$msg` | 给用户看的**人类可读信息** | 最终用户 / 前端提示 |
| `$errorCode` | **业务错误码**（10000 等） | 前端做逻辑分支 |

还有一个可**自定义**的构造函数：允许 `new BaseException(['code' => 404, 'msg' => '...', 'errorCode' => 40000])` 这样按需覆盖任意字段，未传的用默认值。这比给每个错误建一个类要轻得多。

### 第 2 层：具体异常类

```php
// 参数异常
class ParameterException extends BaseException
{
    public $code = 400;
    public $msg = '参数错误';
    public $errorCode = 10000;
}

// Banner 不存在
class BannerMissException extends BaseException
{
    public $code = 404;
    public $msg = '请求的Banner不存在';
    public $errorCode = 40000;
}
```

每个具体异常只需要**覆盖默认属性**，逻辑一行不写。新增错误类型 = 新增一个 5 行的类，改起来很轻。

### 第 3 层：`ExceptionHandler`——统一出口

这是最关键的**全局异常处理**，接管所有没被 try/catch 的异常：

```php
namespace app\lib\exception;

use think\exception\Handle;
use think\Log;
use think\Request;

class ExceptionHandler extends Handle
{
    private $code;
    private $msg;
    private $errorCode;

    public function render(\Exception $e)
    {
        if ($e instanceof BaseException) {
            // 自定义异常：直接把信息给用户
            $this->code      = $e->code;
            $this->msg       = $e->msg;
            $this->errorCode = $e->errorCode;
        } else {
            // 非自定义异常（系统异常）
            if (config('app_debug')) {
                // 调试模式：抛默认错误页，方便开发定位
                return parent::render($e);
            } else {
                // 生产模式：藏起来，只记日志
                $this->code      = 500;
                $this->msg       = '服务器内置错误，不想告诉你哦';
                $this->errorCode = 999;
                $this->recordErrorLog($e);
            }
        }

        $request = Request::instance();

        $result = [
            'msg'         => $this->msg,
            'error_code'  => $this->errorCode,
            'request_url' => $request->url()
        ];

        return json($result, $this->code);
    }

    private function recordErrorLog(\Exception $e)
    {
        Log::init([
            'type'  => 'file',
            'path'  => LOG_PATH,
            'level' => ['error']
        ]);
        Log::record($e->getMessage(), 'error');
    }
}
```

这个 `render()` 里有几个非常值得学的设计：

1. **区分"业务异常"和"系统异常"**——用 `instanceof BaseException` 判断。业务异常（参数错、资源不存在）可以放心告诉用户；系统异常（空指针、数据库连不上）**绝对不能把堆栈暴露给前端**，那是安全漏洞（会泄露表结构、文件路径）。

2. **按 `app_debug` 分环境**——调试模式给完整错误页（开发爽），生产模式只回 `999 + "服务器内置错误"`（安全）。

3. **统一响应格式**——所有异常最终都返回同一套 JSON：

```json
{
  "msg": "服务器内置错误，不想告诉你哦",
  "error_code": 999,
  "request_url": "/api/v1/banner/5"
}
```

`request_url` 是特意加的——出问题时用户截个图，凭这个字段就能在日志里定位到具体请求。

4. **`recordErrorLog` 分层落盘**——系统异常虽然对用户隐身，但必须记日志，不然线上出问题就是两眼一抹黑。

这套东西其实就是后来微服务里 **AOP 异常切面 / 全局异常处理器**的雏形。2017 年在 ThinkPHP 里手写一遍，才真正理解"为什么要有统一异常出口"。

## 三、路由与控制器约定

### 三段式 URL

`application/route.php` 里只有一行，但定下了规矩：

```php
use think\Route;

// 三段式 URL：
// 第一段 = 模块名 api
// 第二段 = 控制器名（控制器子目录下的类名用点连接）
// 第三段 = 操作方法名
Route::get('api/v1/banner/:id', 'api/v1.Banner/getBanner');
```

拆开看就是 `api / v1 / banner / :id`：

- `api` —— 模块
- `v1` —— 版本号（**URL 版本化**，是 RESTful 的经典做法，方便日后 v2 并存）
- `banner` —— 资源名
- `:id` —— 路径参数

对应的控制器方法：

```php
namespace app\api\controller\v1;

class Banner
{
    public function getBanner($id)
    {
        // 薄控制器：校验 → 调 Model → 返回
    }
}
```

### 校验器独立成类

参数校验没有塞在控制器里，而是抽成 `validate` 目录下的类：

```php
// application/api/validate/IDMustBePositiveInt.php
// 只做一件事：验证 ID 是正整数

// application/api/validate/BaseValidate.php
// 所有校验器的基类，统一处理校验失败 → 抛 ParameterException
```

`BaseValidate` 校验失败时会**主动 throw** `ParameterException`，然后被上面的 `ExceptionHandler` 接住，统一变成规范 JSON 返回。**控制器里看不到任何错误处理代码**——这就是"薄控制器"的好处：只写业务主干，异常交给全局处理。

## 四、这套设计解决了什么

回头看，`zerg` 虽然只是个小练习，但这几件事的收益是实打实的：

| 问题 | 传统写法 | zerg 的做法 |
| --- | --- | --- |
| 错误信息不统一 | 各接口各写 | 统一 JSON + 全局异常出口 |
| 敏感信息泄露 | 直接 `echo $e` | 系统异常对用户隐身，只记日志 |
| 前端难做分支 | 解析 message 字符串 | 数字错误码 + 分段规则 |
| 控制器臃肿 | 校验、错误处理混在一起 | 校验器独立 + 异常兜底 |
| 接口没法演进 | URL 不带版本 | `api/v1/...` |

## 回头看

这个项目之后，我再写任何后端接口，脑子里都会先过一遍这三件事：**错误码怎么分段、异常在哪一层收口、控制器够不够薄**。技术栈会换（ThinkPHP → Spring → FastAPI → 各种 Node 框架），但这套"分层 + 收口"的思想是语言无关的。

`zerg` 这个名字来自星际争霸的虫族——当年起名比较随意。但它确实是那段时间里**工程意识觉醒**的一个节点：从"能跑就行"到"想想怎么维护"。

原始代码见 [lab/zerg](https://github.com/huangpuyuan/huangpuyuan.github.io/tree/master/public/lab/zerg)，其中 `application/api/`、`application/lib/exception/`、`application/route.php` 是自己写的部分，`thinkphp/` 是框架本体。
