---
title: "Python 基础与真实数据集"
description: "剩下七个脚本，从凯撒密码到 32561 行的真实人口数据。第一部分是语法练习（集合、随机数、条件判断、身份判断），第二部分是第一次面对「大表」——3.8MB 的 UCI Adult。"
order: 9
slug: basics-and-data
minutes: 22
tag: "Python 基础"
updated: "2026-09-19"
script: 19_adult.py
---

`pyhton3_data` 剩下的七个脚本，可以分成两拨：**六个语法练习**和一个**真数据集实验**。后者是我第一次处理 3.8MB 的表，也是这份笔记里唯一一次「数据量超出肉眼能看」的体验。

## 语法练习：六个小脚本

### 凯撒密码：用 `partial` 做参数绑定

`caesar_shift.py` 44 行，是这批脚本里写得最巧的一个：

```python
alpha = "abcdefghijklmnopqrstuvwxyz".upper()
punct = ",.?:;'\n "

from functools import partial

def shift(l, s=2):
    l = l.upper()
    return alpha[(alpha.index(l) + s) % 26]

def caesar_shift_encrypt(m, s=2):
    m = m.upper()
    return "".join(map(partial(shift, s=s), m))
```

核心就一行：`alpha[(alpha.index(l) + s) % 26]`——找到字母的位置，往后挪 `s` 位，`% 26` 保证绕回来（`z` 往后挪变成 `b`）。

妙的地方在 `partial(shift, s=s)`。`map` 每次只往函数里传**一个**参数（当前字符），但 `shift` 需要两个（字符 + 偏移量）。`partial` 的作用就是**预先绑定一个参数**，生成一个新的单参数函数。

不用 `partial` 的话得写 lambda：

```python
map(lambda c: shift(c, s=s), m)
```

两种都行，但 `partial` 更明确地表达了「我要固定这个参数」。

实跑输出：

```
Original Message: HIAB
Ciphertext: JKCD
```

H→J、I→K、A→C、B→D，各挪 2 位。

脚本后半段拿莎士比亚的 "To be, or not to be" 做了一遍完整加解密。它先**清洗标点**：

```python
m = "".join([l for l in m if not l in punct])
```

然后加密得到一长串大写字母，再解密回来。输出最后一行：

```
TOBEORNOTTOBETHATISTHEQUESTIONWHETHERTISNOBLERINTHEMINDTOSUFFER...
```

明文回来了。**加解密互逆**这件事在密码学里是最低要求，这个脚本用 40 行演示了完整的一轮。

### 随机数：`seed` 的作用

`random.py` 17 行，把所有随机数接口过了一遍：

```python
random.seed(1010)
print(random.randint(1, 100))              # 86
print(random.choice([1, 2.0, 4, 'word']))  # 2.0
print(random.sample(range(100), 5))        # [68, 10, 52, 55, 21]
print(random.sample([1, 2.0, 4, 'word'], 2))  # [2.0, 'word']
print(random.random())                     # 0.874252153402864
print(random.uniform(2, 5))                # 4.635962550438656
print(random.gauss(3, 5))                  # 9.338850437601199
```

**第一行的 `seed(1010)` 是关键**——设定随机种子之后，每次运行结果完全一样。上面那些数字我跑两遍都是同一串。

`random` 模块生成的是**伪随机数**：给同一个种子，算法输出同一个序列。这在调试时非常有用（复现 bug），但在做密码学时是灾难（可预测）。所以安全场景要用 `secrets` 模块，不是 `random`。

几个接口的区别：

| 方法 | 作用 |
|---|---|
| `randint(a, b)` | `[a, b]` 内的整数（**两端都含**） |
| `choice(seq)` | 从序列里随机取一个 |
| `sample(pop, k)` | 从总体里**不重复**地取 k 个 |
| `random()` | `[0, 1)` 之间的浮点数 |
| `uniform(a, b)` | `[a, b]` 之间的均匀分布浮点 |
| `gauss(mu, sigma)` | 正态分布，`mu` 均值 `sigma` 标准差 |

### 集合运算：差、并、交

`set.py` 11 行，四个集合操作：

```python
print(set.difference(set(['a', 2, '5']), set(['a', 7])))       # {'5', 2}
print(set.union(set(['a', 2, '5']), set(['a', 'a', 7])))       # {'5', 'a', 2, 7}
print(set.intersection(set(['a', 2, '5']), set(['a', 'a', 7]))) # {'a'}
x = set(['I', 'you', 'he', 'I', 'they'])
x.remove('I'); print(x, list(x))
```

注意到两个细节：

**一是并集里的 `7` 留下了**——`['a','a',7]` 去重后是 `{'a', 7}`，和 `{'a',2,'5'}` 做并集，`7` 是最左边那个集合没有的，所以在新集合里。

**二是 `set(['I','you','he','I','they'])`** ——列表里的两个 `'I'` 被去重成一个。这和 ES6 的 `Set` 是一模一样的语义（集合天然不重复）。

输出：

```
{'5', 2}
{'5', 'a', 2, 7}
{'a'}
{'you', 'he', 'they'} ['you', 'he', 'they']
```

**注意每次运行集合的打印顺序可能不同**——集合在 CPython 里是无序的（严格说是按哈希排列）。不能依赖顺序，要排序就 `sorted(x)`。

### 条件判断与 `eval` 的隐患

`ifelse.py` 16 行，结构很简单——三个分支：

```python
x = eval(input('Enter a number'))
if x < 0:
    x = x**2;  w = 'x is negative and change to'
elif x == 0:
    x = x + 1; w = 'x=0 and change to'
else:
    x = x**3;  w = 'x>0 and change to'
print(w, x)
```

我喂了三个值：

```
-5   →  x is negative and change to 25
0    →  x=0 and change to 1
3    →  x>0 and change to 27
```

逻辑没问题：负数平方、零加一、正数立方。

**但 `eval(input(...))` 是这段代码最大的问题。**

`eval` 会把输入**当成 Python 表达式执行**。用户输入 `3` 会变成整数 3（这是作者想要的），但用户输入 `__import__('os').system('rm -rf /')` 就会**真的执行**。

> 这是经典的代码注入漏洞。正确做法是用 `int(input(...))` 或者 `ast.literal_eval(input(...))`——后者只解析字面量，不执行函数调用。

原笔记里有**三个脚本**都用了 `eval(input(...))`。2018 年学条件判断时这么写很常见，但这是个必须记住的反面教材——我把它留在文章里说清楚，比悄悄改掉更有价值。

### 身份判断：`id()` 与 `is`

`xy.py` 12 行，是这批里最"技术"的一个——它在探究 **Python 里两个变量什么时候指向同一个对象**：

```python
x = 99; y = x; print(x, y, id(x) == id(y))          # 99 99 True
y = 10; print(x, y, id(x) == id(y))                 # 99 10 False

x = [1,2,3]; y = x; y[0] = 10; print(x, y, id(x) == id(y))   # [10,2,3] [10,2,3] True
x = [1,2]; y = x[:]
print(x, y, id(x) == id(y), id(x[0]) == id(y[0]), id(x[1]) == id(y[1]))
# [1,2] [1,2] False True True
```

实跑输出确认了这几点：

**`id(x) == id(y)` 判断的是「是不是同一个对象」**，不是「值相不相等」。

- `y = x` 是**引用赋值**，两个名字指向同一块内存 → `id` 相同
- `y = x[:]` 是**切片复制**，造了个新列表 → `id` 不同
- 但复制之后，两个列表**里面的元素**仍然指向同一个对象（对小整数来说）→ `id(x[0]) == id(y[0])` 是 `True`

这就是**浅复制**：外层容器是新的，内层元素还是原来那些。

最后那行打印各自的 id：

```
139932936659520 139932936471232 94508112377128 94508112377128 94508112377160 94508112377160
```

两组的差别很明显：**列表对象** `id` 不同（前两个），**元素对象** `id` 相同（后四个）。因为小整数 `1` 和 `2` 在 Python 里是**驻留（interned）**的，全程序只有一份。

> Python 会缓存 `-5` 到 `256` 的整数字面量，所以 `id(1)` 到处都一样。这是实现细节，不该依赖——但它解释了上面这段输出。

## 真数据集：32561 行人口数据

`adult.py` 56 行，用的是 **UCI Adult 数据集**——1994 年美国人口普查的抽样，32561 行 15 列，3.8MB。它预测的是「年收入是否超过 50K」。

**这是这份笔记里第一次面对「大表」**。前面几个脚本的数据都是手写的几行，这个是 3.8MB 的 CSV。

```python
import pandas as pd
import numpy as np
import scipy.stats as stats

adult = pd.read_csv("adult.csv", header=None)
names = ["age","workclass","fnlwgt","education","education_nnum","maritral_status",
         "occupation","relationship","race","sex","capital_gain","capital_loss",
         "hours_per_week","native_location","income"]
adult.columns = names
```

**原 CSV 没有表头**，所以 `header=None`，然后手工补列名。这一步当年可能折腾了一会儿——15 个列名得对着文档一个个抄。

### 描述统计

```python
x = adult.age
print(x.mean(), x.var(), x.std(), stats.skew(x), stats.kurtosis(x))
print(stats.describe(x))
```

实跑输出：

```
38.58164675532078  186.0614002488016  13.640432553581341  0.558717629239857  -0.16628621434407487
DescribeResult(nobs=32561, minmax=(17, 90), mean=38.58, variance=186.06,
               skewness=0.5587, kurtosis=-0.1663)
```

几个数值得看懂：

- **均值 38.58，标准差 13.64** ——平均年龄不到 39 岁
- **偏度 0.559** ——正偏，说明**右侧拖尾**：有一批年龄偏大的人，把分布往右拉了
- **峰度 -0.166** ——负峰度表示比正态分布**更平**（正态分布的峰度是 0）
- **`minmax=(17, 90)`** ——最小值 17、最大值 90

`stats.describe` 一次给全所有统计量，比分开算省事。

### 分组与交叉表

```python
workclass = adult.groupby("workclass")
print(len(workclass))       # 9

pd.crosstab(adult.income, adult.race)
```

`len(groupby)` 是 **9**——`workclass` 列有 9 种不同的取值（私营、政府、自雇……）。这行没打印分组内容，只打印了组数，是个快速的「有多少类」检查。

`pd.crosstab` 生成**交叉表**：行是收入档（`<=50K` / `>50K`），列是人种，交叉处是计数。然后：

```python
ct = np.array(pd.crosstab(adult.race, adult.maritral_status))
# ct.shape = (5, 7)
```

5 种人种 × 7 种婚姻状态。这个矩阵接下来要画成两张饼图。

> 顺带一提：列名里的 `maritral_status` 是**拼错的**，正确的应该是 `marital_status`（婚姻）。这个名字是作者自己起的，写错了一直没发现。原文里还有 `education_nnum`（大概是 `education_num`）也是拼错的。这两个错名**在脚本内部是一致的**，所以不影响运行——但对外交流时就是坑。

### 两张图

```python
fig = plt.figure(figsize=(10, 4.5))

plt.subplot(1, 2, 1)
plt.pie(ct.sum(0), labels=mname, autopct='%1.2f%%')
plt.title('maritral status')

plt.subplot(1, 2, 2)
plt.pie(ct.sum(1), labels=rname, autopct='%1.1f%%')
plt.title('race')
```

`ct.sum(0)` 是**按列求和**（婚姻状态的分布），`ct.sum(1)` 是按行求和（人种分布）。`subplot(1, 2, 1)` 和 `(1, 2, 2)` 把两张图并排放。

第三张图是**年龄直方图叠加核密度估计曲线**：

```python
plt.hist(adult.age, normed=True)
density = stats.gaussian_kde(adult.age)
x = np.sort(adult.age)
plt.plot(x, density(x), 'k-')
```

这里有个**必须修的兼容问题**：`normed=True` 这个参数在新版 matplotlib 里**已经被移除了**，跑起来直接报错。等价写法是 `density=True`。

我改了这一处，因为不改根本跑不了。这也算是「2018 年的代码在 2026 年跑」的真实代价——**API 会消失**，而消失的往往是你最想不到的那些参数。

## 一些当年留下的痕迹

清点这批脚本时，除了拼写和 `eval`，还有两样东西：

**一是 `.pyc` 文件入库。** `first_program/__pycache__/numberguess.cpython-36.pyc` —— Python 3.6 的编译缓存被提交进了 git。这个目录应该写进 `.gitignore`，它是自动生成的，换台机器就失效。

**二是仓库名拼错。** 仓库叫 `pyhton3_data`，正确拼写是 `python3_data`——`pyhton` 把 `tho` 写成了 `hto`。这个错拼在 GitHub 上一直没改（改名会让旧链接失效）。

加上 `caesar_shift.py` 里那两个错字（`numberss`、`Too larger`）——**这是一份很真实的学习笔记**：能跑、有效果、有思考，同时到处都是小疏漏。我不会去修它们，因为修掉之后它就不再是「2018 年那个状态的我」了。

---

**在浏览器里跑**：[`caesar_shift.py`](/lab/python/scripts/10_caesar_shift.py) · [`random.py`](/lab/python/scripts/15_random.py) · [`set.py`](/lab/python/scripts/16_set.py) · [`ifelse.py`](/lab/python/scripts/14_ifelse.py) · [`xy.py`](/lab/python/scripts/18_identity.py) · [`adult.py`](/lab/python/scripts/19_adult.py)
