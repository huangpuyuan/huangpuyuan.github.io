---
title: "二分法：猜数字与解方程"
description: "2018 年秋天写的一批小脚本，看起来零散——猜数字、猜年龄、解方程。但其中三个用的是同一个方法：折半。这是整份早期笔记里唯一一以贯之的东西。"
order: 8
slug: bisection
minutes: 18
tag: "Python 基础"
updated: "2026-09-19"
script: 13_solf.py
---

`pyhton3_data` 是 2018 年秋天写的，10 个脚本，散在 4 个目录里——密码学、入门程序、系统操作、统计。看起来八竿子打不着。

但把它们逐个跑一遍之后，我发现**三个脚本在用同一个方法**：折半。

## 猜年龄：用提问逼出答案

`age.py` 只有 22 行，干的事很有意思——**它不问你年龄，它猜**：

```python
def Age():
    x1 = 120.
    x0 = 0
    x = x1 / 2
    for i in range(6):
        y = input("Is your age greater than %s? Input 'Y' or 'N':" % x)
        if y == 'Y' or y == 'y':
            x0 = x
            x = x0 + (x1 - x0) / 2
        else:
            x1 = x
            x = x0 + (x1 - x0) / 2
    print('Your age is about {} year old'.format(x))
```

初始区间 `[0, 120]`，取中点 60 问一次，根据回答把区间砍一半，问 6 次。我喂了一串 `Y Y N Y N Y`，输出：

```
Is your age greater than 60.0? ...
Is your age greater than 90.0? ...
Is your age greater than 105.0? ...
Is your age greater than 97.5? ...
Is your age greater than 101.25? ...
Is your age greater than 99.375? ...
Your age is about 100.3125 year old
```

**6 次提问把范围从 120 缩到 1.875**（`120 / 2⁶ = 1.875`）。每问一次精度翻倍，这就是二分法的威力。

## 解方程：同一个循环，换个判断条件

`solf.py` 23 行，解的是：

$$f(x) = 2x^3 - 4x^2 + 5x - 20 = 0$$

```python
def f(x): return 2*x**3 - 4*x**2 + 5*x - 20

def solf(f=f):
    x1 = 3.
    x0 = 2.
    x = x1 / 2.
    e = 10**(-18)
    while abs(f(x)) > e:
        if f(x) < 0:
            x0 = x
            x = x0 + (x1 - x0) / 2
        else:
            x1 = x
            x = x0 + (x1 - x0) / 2
    return x

print(solf(f))
```

实跑结果：

```
2.554110056116822
```

结构跟猜年龄**一模一样**——维护 `x0`、`x1` 两个端点，取中点，根据判断收窄一半。区别只有一个：

| | 猜年龄 | 解方程 |
|---|---|---|
| 判断依据 | 用户的 `Y`/`N` | `f(x)` 的**符号** |
| 停止条件 | 固定问 6 次 | `abs(f(x)) < 10⁻¹⁸` |
| 前提 | 答案在 `[0,120]` 内 | **函数在这个区间内单调** |

那个「前提」很关键。二分法能用的条件是**区间两端函数值异号**——`f(2) = 16 - 16 + 10 - 20 = -10`（负），`f(3) = 54 - 36 + 15 - 20 = 13`（正）。一负一正，中间必有一个零点（介值定理）。

如果区间取错了，比如 `f(x)` 在里面拐了两次，二分法会收敛到某个零点，但**不保证是你要的那个**。

## 精度为什么设这么高

`e = 10**(-18)` 是个很激进的精度。这个循环最多跑 60 次左右就能收敛（因为 $(3-2)/2^{60} \approx 8.7 \times 10^{-19}$）。

不过这有个隐患：**浮点数在 `10⁻¹⁸` 这个量级已经接近精度极限了**。双精度浮点的机器精度约 $2.2 \times 10^{-16}$，要求 `abs(f(x)) < 10⁻¹⁸` 在某些函数形状下可能**永远满足不了**，变成死循环。

这个例子里恰好能收敛（因为 `f` 在零点附近斜率够大），但换成斜率很小的函数就不行了。稳妥的写法是**同时限制迭代次数**：

```python
for _ in range(100):
    if abs(f(x)) < e: break
    ...
```

## 猜数字：第三处折半？

`numberguess.py` 32 行，看起来也是猜，但它**不是二分法**：

```python
smaller = int(input("Enter the smaller number: "))
larger  = int(input("Enter the larger number: "))
myNumber = random.randint(smaller, larger)
count = 0
while True:
    count += 1
    userNumber = int(input("Enter your guess: "))
    if userNumber < myNumber:
        print("Too small")
    elif userNumber > myNumber:
        print("Too larger")
    else:
        print("You've got it in", count, "tries!")
        break
```

电脑随机出题，**人来猜**。程序给出「太大」「太小」的提示——但**怎么猜是人的事**。

我喂了 `1 / 100 / 50 / 25` 四个数，输出：

```
Enter the smaller number: Enter the larger number: Enter your guess: Too larger
Enter your guess: Too small
Enter your guess: Traceback ...
EOFError: EOF when reading a line
```

猜了两次没中，第四次输入用完了就 EOF 了。**这个脚本的价值恰恰在这里**——它把「二分法」交给用户去做。

如果玩家每次都取中点，100 以内的数 **7 次以内必中**（$2^7 = 128 > 100$）。但脚本本身**不强制**、也不检查你用的是不是二分策略。它和 `age.py` 是同一件事的两面：一个把策略写进了代码，一个把策略留给了人。

## 顺便说个原稿的笔误

`numberguess.py` 里那句 `print("Too larger")` —— 应该是 `Too large`。`larger` 是「更大」的比较级，这里要的是「太大」。

另外它的 `main()` 函数里 `'''...'''` 注释写着 `Input the bounds of the range of numberss`——`numberss` 多了一个 s。这些小笔误都在原文件里保留着，没改。

## 这三个脚本连起来看

它们教的是同一件事：**当一个问题的答案藏在一个连续区间里，而你能判断「偏左还是偏右」，二分法就是最优解**。

- 猜年龄：判断依据是人的回答
- 解方程：判断依据是函数符号
- 猜数字：判断依据也是人，但代码没帮你做

三次实践、一个方法。这比我后来学到的「二分查找是 $O(\log n)$」那句定义要有用得多——**先知道它能干什么，再记复杂度**。

---

**在浏览器里跑**：[`age.py`](/lab/python/scripts/12_age.py) · [`solf.py`](/lab/python/scripts/13_solf.py) · [`numberguess.py`](/lab/python/scripts/11_numberguess.py)
