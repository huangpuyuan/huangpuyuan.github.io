---
title: "PHP SPL 标准库学习笔记"
date: 2016-12-16
category: "旧笔记考古"
summary: "2016 年学 PHP 进阶时跟着慕课网课程敲的 SPL 标准库笔记。自动加载、迭代器、数据结构（栈/队列/双向链表）、接口四大块，14 个示例脚本 + 6 张知识结构图，代码原样保留。"
---

> **归档说明**：整理于 2026-10，原文写于 2016 年 12 月，是当时学 PHP 进阶时跟着慕课网课程敲的笔记。代码为 PHP 5.x/7.x 语法，`__autoload` 在 PHP 8 中已移除，示例仅作学习存档。

SPL（Standard PHP Library，标准 PHP 库）是 PHP 5 之后内置的一套解决常见问题的接口和类集合。当年学到这里才算摸到"PHP 不只是一堆函数"的门槛——它提供了**数据结构、迭代器、自动加载**这几块进阶能力。

所有示例代码按原样托管在 `/lab/php/code/`，可以直接下载运行。

## 0 四大块，一张总图

![SPL 标准库常用数据结构](/lab/php/images/spl-data-structures.png)

SPL 的内容大致分四块：

| 板块 | 内容 | 示例文件 |
|---|---|---|
| 自动加载 | `spl_autoload_register`、`spl_autoload` | `Autoload01~03.php` |
| 数据结构 | 双向链表、栈、队列 | `Doublelinklist.php`、`SplStack.php`、`splqueue.php` |
| 迭代器 | ArrayIterator、AppendIterator、MultipleIterator、OuterIterator、FilesystemIterator | `SplarrayIterator.php` 等 |
| 接口 | Countable、迭代器接口族 | `Countable01~02.php` |

![SPL 标准库的接口](/lab/php/images/spl-interfaces.png)

## 1 自动加载：`spl_autoload_register`

PHP 里每次 `new` 一个类，如果找不到定义，就会触发自动加载机制。SPL 提供了替换默认 `__autoload` 的钩子。

### 1.1 最简用法

```php
<?php
spl_autoload_extensions('.class.php,.php');
// 设置autoload寻找php类文件的扩展名，多个用逗号分隔，前面的优先匹配

set_include_path(get_include_path() . PATH_SEPARATOR . "libs/");
// 设置autoload寻找类文件的目录，多个目录用 PATH_SEPARATOR 分隔

spl_autoload_register();
// 提示 PHP 使用 autoload 机制查找类定义

new Test();
```

这段代码做三件事：告诉 PHP 去哪找（`set_include_path`）、找什么后缀（`spl_autoload_extensions`）、启用机制（`spl_autoload_register`）。

![类载入的基本机制](/lab/php/images/class-loading.jpg)

### 1.2 自定义加载函数

老写法是定义 `__autoload` 函数：

```php
<?php
function __autoload($class_name) {
    echo "__autoload class: " . $class_name . "\n";
    require_once("libs/" . $class_name . '.php');
}

new Test();
```

但 `__autoload` 只能定义一次、不够灵活。SPL 的 `spl_autoload_register` 可以**注册多个加载器**：

```php
<?php
function classLoader($class_name) {
    echo "classLoader() load class: " . $class_name . "\n";
    require_once("libs/" . $class_name . '.php');
}

spl_autoload_register('classLoader');   // 传入自定义函数名，替换 __autoload
new Test();
```

### 1.3 手动调用 `spl_autoload`

当不想用 `require_once` 直接引入，而是走 `include_path` 查找时，需要显式调用：

```php
<?php
function classLoader($class_name) {
    echo "classLoader() load class: " . $class_name . "\n";
    set_include_path("libs/");
    spl_autoload($class_name);
    // 不用 require_once 引入时，必须显式调用 spl_autoload，
    // 参数是类名，用来重启类文件的自动查找
}

spl_autoload_register('classLoader');
new Test();
```

> ⚠️ **现代 PHP 注意**：`__autoload` 在 PHP 8.0 已被移除，实践中应该用 **Composer 的 PSR-4 自动加载**，它底层就是 `spl_autoload_register`。理解这里的机制，才能明白 Composer 帮你做了什么。

## 2 迭代器：理解 foreach 的内部机理

`foreach` 能遍历数组，是因为数组**内部实现了迭代器协议**。SPL 把这套协议暴露出来，让你自定义的对象也能被 `foreach` 遍历。

![SPL 迭代器](/lab/php/images/spl-iterators.png)

### 2.1 ArrayIterator：把数组当对象遍历

```php
<?php
$fruits = array(
    "apple"  => 'apple value',
    "orange" => "orange value",
    "grape"  => "grape value",
    "plum"   => "plum value"
);

// 直接用数组遍历
foreach ($fruits as $key => $value) {
    echo $key . ":" . $value . "\n";
}

// 用迭代器遍历
$obj = new ArrayObject($fruits);
$it  = $obj->getIterator();
foreach ($it as $key => $value) {
    echo $key . ":" . $value . "\n";
}
```

两者输出完全一样。**用迭代器的好处是可以在遍历过程中操作指针**：

```php
// 手动控制遍历
$it->rewind();
while ($it->valid()) {
    echo $it->key() . "=>" . $it->current() . "\n";
    $it->next();
}

// seek 跳转到指定位置
$it->rewind();
if ($it->valid()) {
    $it->seek(1);   // 定位到 position=1 或 key=1
    while ($it->valid()) {
        echo $it->key() . ":" . $it->current() . "\n";
        $it->next();
    }
}

// 排序
$it->ksort();   // 按 key 排序
$it->asort();   // 按 value 排序
```

迭代器的核心方法就 4 个：`rewind()`（回到开头）、`valid()`（当前是否有效）、`current()`（取当前值）、`next()`（后移）。

### 2.2 AppendIterator：拼接多个迭代器

```php
<?php
$array_a = new ArrayIterator(array('a', 'b', 'c'));
$array_b = new ArrayIterator(array('d', 'e', 'f'));

$it = new AppendIterator();
$it->append($array_a);
$it->append($array_b);   // 通过 append 方法把迭代器加入进来

foreach ($it as $key => $value) {
    echo $value . "\n";   // 输出 a b c d e f
}
```

### 2.3 MultipleIterator：并行遍历多个数组

这个最实用——同时遍历多个数组，像 SQL 的 join：

```php
<?php
$idIter   = new ArrayIterator(array('01', '02', '03'));
$nameIter = new ArrayIterator(array('kobe', 'james', 'jordan'));
$ageIter  = new ArrayIterator(array('22', '12', '32'));

$mit = new MultipleIterator(MultipleIterator::MIT_KEYS_ASSOC);
// MIT_KEYS_ASSOC 表示以 key 作为关联
$mit->attachIterator($idIter,   'ID');
$mit->attachIterator($nameIter, 'NAME');
$mit->attachIterator($ageIter,  'AGE');

foreach ($mit as $value) {
    print_r($value);
}
```

输出就是三条完整记录：

```
Array
(
    [ID] => 01
    [NAME] => kobe
    [AGE] => 22
)
Array
(
    [ID] => 02
    [NAME] => james
    [AGE] => 12
)
...
```

### 2.4 OuterIterator / IteratorIterator：包装迭代器

继承 `IteratorIterator` 可以**改写迭代过程中的行为**，比如给每个值加上后缀：

```php
<?php
class OuterImpl extends IteratorIterator {
    public function current() {
        return parent::current() . "_tail";
    }
    public function key() {
        return "Pre_" . parent::key();
    }
}

$array = array('value1', 'value2', 'value3', 'value4');
$outerObj = new OuterImpl(new ArrayIterator($array));

foreach ($outerObj as $key => $value) {
    echo "++" . $key . "-" . $value . "\n";
    // ++Pre_0-value1_tail
    // ++Pre_1-value2_tail ...
}
```

这是**装饰器模式**在迭代器上的应用——不改原始数据，只改遍历时看到的样子。

### 2.5 FilesystemIterator：遍历目录

拿它替代 `opendir`/`readdir`，代码干净很多：

```php
<?php
$it = new FileSystemIterator('.');
foreach ($it as $finfo) {
    printf("%s\t%s\t%8s\t%s\n",
        date("Y/m/d H:i", $finfo->getMTime()),
        $finfo->isDir() ? "<DIR>" : "",
        number_format($finfo->getSize()),
        $finfo->getFilename()
    );
}
```

输出效果类似 Linux 的 `ls -la`。

## 3 数据结构：栈、队列、双向链表

SPL 直接把常用数据结构做成了内置类，不用自己用数组模拟。

![双链表](/lab/php/images/double-linked-list.jpg)

### 3.1 双向链表 `SplDoublyLinkedList`

```php
<?php
$obj = new SplDoublyLinkedList();
$obj->push(1);      // 尾部插入
$obj->push(2);
$obj->unshift(10);  // 头部插入
print_r($obj);

$obj->rewind();
echo 'current: ' . $obj->current() . "\n";
$obj->next();
echo 'next:' . $obj->current() . "\n";
$obj->next();
echo 'next:' . $obj->current() . "\n";
$obj->next();

if ($obj->current()) {
    echo "current node valid\n";
} else {
    echo "Current node invalid\n";
}
if ($obj->valid()) {
    echo "valid list\n";
} else {
    echo "invalid list\n";
}
```

### 3.2 栈 `SplStack`

栈是**后进先出**（LIFO）。有个容易踩的点：`SplStack` 的 `rewind` 指向 **Top**，而不是 Bottom：

```php
<?php
$stack = new SplStack();
$stack->push("a");
$stack->push("b");
$stack->push("c");
print_r($stack);

echo "Bottom:" . $stack->bottom() . "\n";   // a
echo "top:" . $stack->top() . "\n";          // c

$stack->offsetSet(0, 'C');
// 堆栈的 offset=0 是 Top 所在位置，top 位置节点靠近 bottom 位置的相邻节点，以此类推

$stack->rewind();
// 双向链表的 rewind 和堆栈 rewind 相反：
// 堆栈的 rewind 使当前指针指向 Top，双向链表调用后指向 bottom
echo "Current:" . $stack->current() . "\n";

$stack->next();
// 堆栈的 next 是指针靠近 bottom 的下一个节点

// 遍历
$stack->rewind();
while ($stack->valid()) {
    echo $stack->key() . "=>" . $stack->current() . "\n";
    $stack->next();
}

// 出栈
$popObj = $stack->pop();
echo "Poped object: " . $popObj . "\n";
print_r($stack);
```

### 3.3 队列 `SplQueue`

队列是**先进先出**（FIFO），用 `enqueue` / `dequeue`：

```php
<?php
$obj = new SplQueue();
$obj->enqueue('a');
$obj->enqueue('b');
$obj->enqueue('c');
print_r($obj);

echo "Bottom:" . $obj->bottom() . "\n";
echo "Top:" . $obj->top() . "\n";

$obj->rewind();
echo "Current:" . $obj->current() . "\n";

// 遍历
while ($obj->valid()) {
    echo $obj->key() . "=>" . $obj->current() . "\n";
    $obj->next();
}

echo "dequeue:" . $obj->dequeue() . "\n";   // 出队：a
print_r($obj);
```

## 4 接口：Countable

`Countable` 让对象能被 `count()` 函数直接统计：

```php
<?php
class CountMe implements Countable {
    protected $_myCount = 3;
    public function count() {
        return $this->_myCount;
    }
}

$obj = new CountMe();
echo count($obj);   // 3
```

实现这个接口后，`count($obj)` 就会调用你定义的 `count()` 方法，而不是报错。

## 5 标准函数族

SPL 还提供了一批操作数组和对象的函数（`spl_object_hash`、`spl_object_id`、`iterator_to_array` 等）：

![SPL 标准函数](/lab/php/images/spl-functions.png)

## 6 代码与资源

**完整示例代码（14 个 PHP 文件，原样保留）**：[`/lab/php/code/`](/lab/php/code/)

| 文件 | 内容 |
|---|---|
| `Autoload01~03.php` | 自动加载三种写法 |
| `SplarrayIterator.php` | ArrayIterator 全用法（含 seek/ksort/asort） |
| `AppendIterator.php` | 拼接迭代器 |
| `MultipleIterator.php` | 并行遍历多数组 |
| `OuterIterator.php` | 包装迭代器（装饰器模式） |
| `Filesystemiterator.php` | 遍历目录 |
| `Doublelinklist.php` | 双向链表 |
| `SplStack.php` | 栈 |
| `splqueue.php` | 队列 |
| `Countable01~02.php` | Countable 接口 |
| `splfile.php` | SplFileInfo 文件信息 |

**知识结构图 6 张**：[`/lab/php/images/`](/lab/php/images/)

---

> 这批笔记写于 2016 年 12 月，是当时跟着慕课网付费课程敲下来的。现在回看，SPL 这部分知识最有价值的是**迭代器**——它是理解 `foreach`、`Generator`、Laravel 集合（Collection）的基础。PHP 开发者绕不开它。
