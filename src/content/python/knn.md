---
title: "手写 KNN 与调库 KNN：两种学法"
description: "同一个算法写两遍。第一遍纯 NumPy，每一步都看得见；第二遍三行 sklearn 搞定。两遍合起来才是完整的理解——知道它怎么算，也知道什么时候别自己算。"
order: 5
slug: knn
minutes: 25
tag: "机器学习"
updated: "2026-09-19"
script: 05_numpy_knn.py
---

KNN（K-Nearest Neighbors，K 近邻）可能是最容易讲清楚，也最容易讲不明白的算法。

容易讲清楚是因为规则一句话：**新来的点，看它周围最近的 K 个老点是什么类，它就归哪类**。讲不明白是因为——「最近」怎么算？K 取多少？平票怎么办？手写一遍这些问题的答案就都浮出来了。

原笔记里有两个 notebook：`numpy_KNN.ipynb` 用纯 NumPy 手写，`Iris_KNN.ipynb` 直接调 sklearn。我一开始觉得重复，后来想通了：**这是两种完全不同的学法**，一个是拆开看内部，一个是学会用工具。所以合成一篇来写，对照着看。

## 第一遍：不调库，每个数字都自己算

### 六个点，一个待分类点

先把场景压到最小：

```python
import numpy as np

data   = np.array([[1, 2], [2, 3], [3, 1], [6, 5], [7, 8], [8, 7]])
labels = np.array([0, 0, 0, 1, 1, 1])
query_point = np.array([5, 5])
```

六个点，前三个标 0、后三个标 1，肉眼能看出是两堆。待分类的点 `(5, 5)` 在中间偏右。

### 距离：一行搞定六个点

```python
distances = np.linalg.norm(data - query_point, axis=1)
```

拆开看这一步在干什么。`data - query_point` 用到**广播**：`data` 是 6×2，`query_point` 是形状 (2,) 的一维数组。按广播规则从右往左对齐，`(2,)` 被虚拟扩展成 `1×2`，再扩到 `6×2`，于是六个点各自减掉查询点，得到六个差值向量。

`np.linalg.norm(..., axis=1)` 再对每一行求范数——也就是 $\sqrt{x^2+y^2}$，欧氏距离。`axis=1` 是「沿着列方向收缩」，6×2 变成 6 个标量。

如果不广播，就得写 `for` 循环一个个减。**广播把「六个点」当成一次运算**，这是 NumPy 思维的核心。

### 排序取前 K，然后投票

```python
sorted_indices = np.argsort(distances)
K = 3
nearest_indices = sorted_indices[:K]
nearest_labels  = labels[nearest_indices]

unique, counts = np.unique(nearest_labels, return_counts=True)
predicted_label = unique[np.argmax(counts)]
```

`argsort` 返回的是**下标**不是值——这个点在 `numpy.md` 里强调过。这里正好用上：拿到下标，才能去 `labels` 里把对应标签捞出来。

`np.unique(..., return_counts=True)` 做投票统计。`argmax(counts)` 找出现次数最多的那个类的**位置**，再用它去 `unique` 里取真实标签值。这两步「先取位置再取值」的写法绕，但它是通用模式，值得记。

输出：

```
预测的标签: 1
```

对。`(5, 5)` 最近的三个点是 `(6,5)`、`(7,8)`、`(8,7)`，全是类 1。

### 十行公式算出 10×10 的距离矩阵

上面算的是「一个点 vs 一堆点」。如果要算**所有点两两之间的距离**呢？双层循环写起来是 100 次运算，但这里有个漂亮的一行解法：

```python
dist_squared = (np.sum(data**2, axis=1).reshape(-1, 1)
                + np.sum(data**2, axis=1)
                - 2 * np.dot(data, data.T))
```

这是那个恒等式：$\|x_i - x_j\|^2 = \|x_i\|^2 + \|x_j\|^2 - 2 x_i \cdot x_j$。

三块分别是：

- `np.sum(data**2, axis=1).reshape(-1, 1)` → 形状 `(10, 1)`，每行是该点模长的平方
- `np.sum(data**2, axis=1)` → 形状 `(10,)`，会被广播成 `(1, 10)`
- `np.dot(data, data.T)` → `(10,10)` 矩阵，第 $i$ 行第 $j$ 列就是 $x_i \cdot x_j$

`(10,1)` 和 `(1,10)` 相加，广播直接铺成 `(10,10)`——**一维那侧被虚拟复制了 10 份**。三个 `(10,10)` 矩阵相加减，得到完整的平方距离矩阵，全程没有一行循环。

实跑结果（前 3×3）：

```
[[0.         0.03191478 0.02046653]
 [0.03191478 0.         0.04228309]
 [0.02046653 0.04228309 0.        ]]
```

对角线是 0（自己到自己），矩阵对称（$D_{ij}=D_{ji}$）。这两个特征就是检验公式写对没有的最好方式。

### `argsort` 整行排序 + `argpartition` 取 Top-K

拿到距离矩阵后，对**每一行**排序，得到每个点自己的近邻顺序：

```python
sorted_indices = np.argsort(dist_squared, axis=1)
```

`axis=1` 表示「每行内部排」，输出和输入同形状 `(10,10)`，每行是 0~9 的排列。实跑第 4 行：

```
[3 6 0 2 9 1 8 5 4 7]
```

理解：点 3 的最近邻是点 6，其次是点 0，然后是点 2……最后一个才是点 7。

> 为什么用 `argsort` 而不是 `sort`？因为要的是**「谁最近」这个身份信息**，不是距离数值本身。画图要连线的，得知道连到哪个点。

接着原笔记用 `argpartition` 找 K 个最近邻：

```python
nearest_indices = np.argpartition(dist_squared[i], K + 1)[:K + 1]
nearest_indices = nearest_indices[nearest_indices != i]
```

`argpartition` 和 `argsort` 的区别值得记：它**只保证第 K 位左右两侧的元素整体有序，两边内部不排序**，所以复杂度是 $O(n)$ 而不是 $O(n \log n)$。只关心「前 K 个是谁」的时候，这是更快的选择。

`K + 1` 再 `!= i` 排除自己，是因为查询点自己距离为 0，一定排在第一位。

## 第二遍：sklearn 三行

同样的算法，换成工业库：

```python
from sklearn.neighbors import KNeighborsClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

iris = datasets.load_iris()
X, y = iris.data, iris.target
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

knn = KNeighborsClassifier(n_neighbors=3)
knn.fit(X_train, y_train)
y_pred = knn.predict(X_test)
```

鸢尾花数据集：150 个样本，4 个特征（花萼长/宽、花瓣长/宽），3 个类别。`train_test_split` 按 8:2 切，`random_state=42` 固定随机种子保证可复现。

实跑结果：

```
模型准确率: 1.0
```

混淆矩阵：

```
[[10  0  0]
 [ 0  9  0]
 [ 0  0 11]]
```

对角线全满、非对角全零——**30 个测试样本全部分对**。分类报告里三类的 precision、recall、f1 都是 1.00。

### 准确率 1.0 别急着高兴

这个结果需要泼一盆冷水。鸢尾花数据集本身就**非常容易分**：Setosa 类和另外两类在特征空间中完全分离，一个平面就能切开。剩下 Versicolor 和 Virginica 稍难，但也有大量重叠以外的可分区域。

样本只有 150 个、测试集只有 30 个——**测试集这么小，1.0 的精度波动区间很大**。换一个 `random_state`，可能就掉到 0.97。这不是算法不行，是评估样本太少，单次结果说明不了什么。

正规做法是交叉验证（`cross_val_score`）取多次平均，或者换一份更有挑战的数据集。原笔记里没做，这里补一句提醒。

## 两种写法对照

| | 手写 NumPy | sklearn |
|---|---|---|
| 代码量 | 30+ 行，距离公式还得自己推 | 3 行 |
| 能看清什么 | 距离怎么算、K 怎么选、投票怎么投 | 只有输入输出 |
| 参数调节 | 全部手动 | `n_neighbors` / `metric` / `weights` |
| 大数据集 | 慢，内存爆 | 有 KD-Tree / Ball-Tree 加速 |
| 该用在什么时候 | 学原理、改算法、验证公式 | 任何真实项目 |

我原来以为这两遍是重复劳动，写完才明白不是：**第一遍建立的手感，第二遍才用得上**。

举个例子——sklearn 的 `KNeighborsClassifier` 默认 `metric='minkowski'`、`p=2`（也就是欧氏距离）。如果没手写过距离计算，这个参数就是个黑箱；手写过之后知道 p=1 是曼哈顿距离、p=2 是欧氏、p 更大就更偏向切比雪夫距离，调参时心里有数。

再比如 `weights` 参数：默认 `'uniform'`（K 个邻居投票权重一样），可以改成 `'distance'`（越近权重越大）。手写过投票那段 `np.unique` + `argmax` 之后，你会立刻想到：**平票怎么办？** sklearn 的答案是按距离加权打破平票，手写版就没处理这个情况。

## 图里能看到什么

三张图（都在原脚本里）：

**① 六个点的分类示意** —— 两类点用不同颜色，查询点画黑色 ✗，三个最近邻圈红框。一眼看清「最近邻」这个概念的几何含义。

**② 十个随机点两两近邻连线** —— 每个点连出 3 条灰色虚线到最近的邻居。能看出近邻关系是非对称的（A 的近邻有 B，B 的近邻不一定有 A）。

**③ 鸢尾花分类结果** —— 用前两个特征做二维投影，训练点按类别上色，测试点用红 ✗ 标出。注意这只是**两个维度的投影**，模型实际用了全部 4 个特征；投影图只能看个大概，别拿它当分类边界。

---

**在浏览器里跑**：[`numpy_KNN`](/lab/python/scripts/05_numpy_knn.py) · [`Iris_KNN`](/lab/python/scripts/06_iris_knn.py)
