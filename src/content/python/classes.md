---
title: "一个被覆盖三次的类"
description: "同一份文件里 class Dog 写了三遍。代码能跑，输出还不少，但前两遍写的类早就被顶掉了——而且后出现的那个还悄悄毁掉了继承。改它的过程，比原代码本身更像教材。"
order: 7
slug: classes
minutes: 16
tag: "Python 基础"
updated: "2026-09-19"
script: 08_class.py
---

这份笔记里有个文件，我第一眼看过去没觉得有问题——`Class/class.py`，90 行，讲类、继承、类属性、私有属性，输出也挺丰富，打印了九行结果。跑起来不报错。

但读第二遍的时候，我数了一下 `class Dog` 出现了几次。

**三次。**

## 覆盖是静默发生的

Python 里，`class` 语句就是把一个类对象绑定到一个名字上。名字重复，后一个覆盖前一个，没有任何警告：

```python
class Dog:
    species = "Canis familiaris"
    def __init__(self, name, age): ...
    def bark(self): ...

class Dog:                     # ← 第一个 Dog 从此消失
    species = "Canis familiaris"
    @classmethod
    def get_species(cls): ...

class Dog:                     # ← 第二个 Dog 也消失
    def __init__(self, name, age):
        self.__name = name
```

文件执行到最后，名叫 `Dog` 的只剩下**第三个**。前两段写的类在那一刻起就不存在了。

## 真正的伤害在继承那行

如果只是孤立的覆盖，最多算浪费代码。但它连着一行继承：

```python
class Puppy(Dog):              # 出现在第 2 段和第 3 段的 Dog 之间
    def __init__(self, name, age, training_level):
        super().__init__(name, age)
        self.training_level = training_level

    def bark(self):
        return f"{self.name} says woof! (Training level: {self.training_level})"
```

这行执行的时候，`Dog` 还是第 2 段那个 —— **有 `species`，没有单参数以外的 `__init__`**。所以：

- `super().__init__(name, age)` 调的是 `object.__init__`，两个参数直接报 `TypeError`
- 就算绕过去，`Puppy` 也拿不到 `species`
- 第 1 段辛苦演示的「修改类属性对所有实例可见」，`Puppy` 完全享受不到

原文能跑出九行，是因为 `Puppy` 那段用的 `bark()` 是它自己重写的，没走父类的 `__init__`。**它是碰巧没炸，不是设计的**。

## 怎么改

我试过几种方案：

| 方案 | 效果 |
|---|---|
| 把三个合成一个类 | 不行。三段讲的是**不同的概念**（基础属性 / 类方法静态方法 / 私有属性），硬塞一个类里结构就乱了 |
| 三个类按序改名 | 破坏原文的递进叙事，读者会以为是三个无关的例子 |
| **三个不同类名，各司其职** | ✅ 采用 |

改完之后的名字：

- `Dog` —— 第一段，基础类属性和实例属性
- `TrainedDog` —— 第二段，`@classmethod` 与 `@staticmethod`
- `Puppy(Dog)` —— 继承，**这时候继承的是真的 `Dog`**
- `PrivateDog` —— 第四段，私有属性 `__name`

`Puppy` 那段顺带补了一行验证：

```python
print(my_puppy.species)   # Canis lupus familiaris —— 继承来的类属性
```

这一行在原文里没有，但它恰好证明了修复有效：`Puppy` 继承的 `Dog` 是**第一段那个被改过 `species` 的**，所以输出是 `Canis lupus familiaris` 而不是 `Canis familiaris`。**覆盖 bug 修没修好，这一行就能看出来。**

## 私有属性那里再补一个实验

原文讲 `__name` 私有属性时，注释里写了一句：

```python
# print(my_dog.__name)  # 会引发 AttributeError
```

这行被注释掉了，所以「私有到底私有多彻底」是没法亲眼看到的。我加了一个更直接的观察手段：

```python
print(private_dog.__dict__)
# {'_PrivateDog__name': 'Buddy', 'age': 3}
```

`__dict__` 把对象内部存储摊开——`__name` 实际存成了 `_PrivateDog__name`。

这就是 Python 私有属性的真相：**它不是真的私有，是名称改写（name mangling）**。双下划线开头的属性在类定义时被机械地加上 `_类名` 前缀，于是从外部用 `obj.__name` 找不到（因为实际名字是 `_PrivateDog__name`），但用 `obj._PrivateDog__name` 照样能访问。

所以 Python 的私有是**约定 + 轻微摩擦**，不是强制访问控制。真正想表达「别碰」一般用单下划线 `_name`（纯约定，无任何机制），而 `__name` 用来**避免子类意外覆盖父类的属性名**——这才是它的主要用途。

## 修 bug 之外

`Class/` 目录里还躺着一个 `test.py`，是快速排序：

```python
def quick_sort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[0]
    less_than_pivot  = [i for i in arr[1:] if i <= pivot]
    great_than_pivot = [i for i in arr[1:] if i > pivot]
    return quick_sort(less_than_pivot) + [pivot] + quick_sort(great_than_pivot)
```

实跑输出 `[1, 2, 3, 5, 7, 9]`，正确。

它写得挺干净，用列表推导做分区，可读性比原地交换的版本好得多。代价是**空间复杂度 $O(n \log n)$**（每层递归都建新列表），而经典快排是原地 $O(\log n)$。变量名里还有个笔误 `great_than_pivot` 应该是 `greater_than_pivot`——不影响运行，顺手记一下。

我把它一并收进 `public/lab/python/scripts/09_quicksort.py`，因为它是这份笔记里少数几个「算法」片段之一，跟前面那堆数据处理脚本正好互补。

---

**在浏览器里跑**：[`class.py`（已修复）](/lab/python/scripts/08_class.py) · [`quicksort.py`](/lab/python/scripts/09_quicksort.py)
