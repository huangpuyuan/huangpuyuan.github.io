# lab/js-in-depth

JavaScript 进阶练习（2017-05），含原始笔记与练习代码。

对应笔记：[JavaScript 进阶：变量作用域、内存与调试](/blog/js-in-depth)。

## 目录

| 文件 | 说明 |
| --- | --- |
| `js进阶-变量作用域内存.md` | **原始笔记**：基本类型 vs 引用类型、堆栈内存 |
| `js进阶-控制台和断点调试.md` | **原始笔记**：Chrome DevTools 面板与断点调试 |
| `var.txt` | 定时器/闭包练习的观察记录 |
| `bin/index.html` | 练习总入口 |
| `bin/var.html` + `bin/js/script.js` | 基本类型赋值与栈表现 |
| `bin/function.html` + `bin/js/script1.js` / `script2.js` | 函数传参：值传递 vs 引用传递 |
| `bin/animation.html` + `bin/js/script3.js` | 定时器与闭包 |

## 运行方式

直接用浏览器打开 `bin/index.html` 即可，配合 DevTools 的 Sources / Console 面板观察。

推荐练习方式：
1. 打开 `bin/var.html`，按 `F12` 进 DevTools
2. 在 Sources 面板给 `script.js` 打断点
3. 用 `F10`（单步跳过）和 `F11`（进入函数）走一遍，观察 `Watch` 面板里变量的变化
