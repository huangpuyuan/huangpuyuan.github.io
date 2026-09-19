---
title: "Pandas 实战：1035 颗行星的完整分析"
description: "拿一份真实的数据集从头走一遍：分组、聚合、合并、清洗，然后画图。前面学的每个操作在这里都会用到，而且会发现几个教科书不会告诉你的坑。"
order: 4
slug: pandas-planets
minutes: 22
tag: "Pandas"
updated: "2026-09-19"
script: 04_pandas_planets.py
---

前面 `pandas.md` 那篇讲的是操作本身：怎么分组、怎么合并、怎么清洗。这一篇不一样——**用一份真实数据集从头到尾走一遍**，看这些操作在一条完整的分析链里是怎么接起来的。

数据集是 Seaborn 内置的 `planets`，记录系外行星的发现信息，1035 行 6 列。原 notebook 里是 `sns.load_dataset('planets')` 联网抓的，我把它导出成 `planets.csv` 放在本地，这样脚本不依赖网络也能跑。

## 先看清楚手里是什么

第一步永远是看数据，不是急着算。

```python
import pandas as pd
import seaborn as sns

planets = pd.read_csv('planets.csv')
print(planets.head())
print(planets.info())
```

`head()` 输出：

```
             method  number  orbital_period   mass  distance  year
0  Radial Velocity       1         269.300   7.10     77.40  2006
1  Radial Velocity       1         874.774   2.21     56.95  2008
2  Radial Velocity       1         763.000   2.60     19.84  2011
3  Radial Velocity       1         326.030  19.40    110.62  2007
4  Radial Velocity       1         516.220  10.50    119.47  2009
```

六列的含义：`method` 发现手段、`number` 该次观测确认的行星数、`orbital_period` 轨道周期（天）、`mass` 质量（木星质量为单位）、`distance` 距地球距离（秒差距）、`year` 发现年份。

`info()` 才是关键，它把**缺失情况**摊在桌面上：

```
 #   Column          Non-Null Count  Dtype  
---  ------          --------------  -----  
 0   method          1035 non-null   str    
 1   number          1035 non-null   int64  
 2   orbital_period  992 non-null    float64
 3   mass            513 non-null    float64
 4   distance        808 non-null    float64
 5   year            1035 non-null   int64  
```

1035 行里，`mass` 只有 513 个有值——**一半是空的**。这个数字很重要，它会直接决定后面建模能用的样本量。

> 顺带一提：`Dtype` 那列显示 `str` 而不是老版本的 `object`。这是 Pandas 2.x 之后的字符串类型改进。如果你的输出是 `object`，说明版本较早，逻辑上没区别。

## 分组 + 聚合：两个问题拆开问

「每种发现方法发现了多少颗行星？」——按 `method` 分组，数行数：

```python
grouped_by_method = planets.groupby('method').size().reset_index(name='count')
```

「每种发现方法的行星平均质量是多少？」——同样的分组，换个聚合函数：

```python
average_mass = planets.groupby('method')['mass'].mean().reset_index(name='average_mass')
```

实跑结果（挑选关键行）：

| method | count | average_mass |
|---|---|---|
| Radial Velocity | 553 | 2.630699 |
| Transit | 397 | 1.470000 |
| Imaging | 38 | NaN |
| Microlensing | 23 | NaN |
| Eclipse Timing Variations | 9 | 5.125000 |
| Astrometry | 2 | NaN |
| Pulsar Timing | 5 | NaN |

两个结果各回答一半问题，而 `count` 那半回答得特别干脆：**Radial Velocity 553 + Transit 397 占了 950 颗，剩下 8 种方法加起来才 85 颗**。行星探测高度集中在两种手段上——这不是数据缺陷，是观测能力的真实分布。

至于 `average_mass` 那列的 `NaN`——先记住，下面解释。

## 合并：为什么不是 concat

这里有个容易走错的路口。前面讲过 `concat`（上下摞）和 `merge`（按列拼），本例要的是后者：

```python
merged_group = pd.merge(grouped_by_method, average_mass, on='method')
```

两个表都有一列 `method`，按它做**键**拼起来——`count` 和 `average_mass` 落到同一行，一行就是「一种方法，数量多少，平均质量多少」。`concat` 做不到这件事，它只会把行数变成 20。

为什么要拼？因为要画图。`barplot` 要一个 DataFrame，x 轴 `method`、y 轴 `count`，如果还想同时标注平均质量，两列必须在同一个表里。

## 那些 NaN 是怎么回事

合并结果里，7 种方法的 `average_mass` 是 `NaN`。这不是合并出错，是**数据本身的分布**：

`Imaging` 有 38 颗行星，但 `mass` 列全是空的——直接成像法测的是行星亮度与位置，出不了质量。`Microlensing`（微引力透镜）23 颗也测不到。`Astrometry` 只有 2 颗，样本太小。

所以 `groupby().mean()` 给出 `NaN`，语义是**「这组没有可算的观测值」**，而不是「质量是零」。这两者差别很大，画图时能不能正确传递这个差别，就是下面那张图要说的事。

## 清洗：`dropna()` 删掉的是多少

原 notebook 在分析中途写了这么一段：

```python
print(planets.isnull().sum())
planets_cleaned = planets.dropna()
```

`isnull().sum()` 的输出：

```
method               0
number               0
orbital_period      43
mass               522
distance           227
year                 0
dtype: int64
```

`mass` 缺 522 个，`distance` 缺 227 个，`orbital_period` 缺 43 个。

然后是 `dropna()`——**它默认删掉任何一列有空值的行**，不是只删某列。1035 行的表，同时满足 `mass`、`distance`、`orbital_period` 都有值的行，还剩多少？大概 400 出头。

这是新手最常踩的坑：**清洗之后样本量掉一半以上，而且掉的方式不随机**。质量大的行星（比如径向速度法测到的大质量行星）更可能被留下，距离远的更难测到质量——被删掉的那批不是随机样本，是**有系统性偏差的**那批。

这在这个例子里勉强能用，因为后面建模只是演示流程。但如果是要拿结论去做研究，这里就该停下来想一想：与其整行删掉，不如对 `mass` 用中位数填充、`distance` 用分组填充，保住更多样本。

我把这段放在文章里说清楚，而不是在脚本里「修好」它——因为**这个坑本身是笔记的一部分**，值得原样保留。

## 五个视角看同一份数据

清洗后接着画图。原 notebook 连画五张，每张问一个不同的问题：

**① 各方法发现了多少颗**——复现上面的 `count`，柱状图比表格直观：`Radial Velocity` 和 `Transit` 两根柱子高得让其余八种几乎贴地。

**② 各方法的平均质量**——注意这张图里那七个 `NaN` 变成了**空缺**（柱子没画出来）。这正是我想说的：`NaN` 在图上「消失」，读者如果不看原始统计，会以为那些方法不存在。

**③ 质量与发现年份**——`scatterplot`，x 是 `mass`、y 是 `year`、颜色按 `method` 区分。能看到一条清晰的时间线：早期发现的多是大质量行星，越往后小质量行星越多。原因是观测精度逐年提升，能测到越来越轻的目标。

**④ 各方法的行星质量分布**——换成小提琴图。柱状图看的是「平均」，小提琴图看的是「分布形状」。`Radial Velocity` 的分布拖了一条长尾（少数超大质量行星把均值拉高到 2.63），`Transit` 的分布集中得多。

**⑤ 相关性矩阵**——`corr()` + `heatmap`。数值列两两算相关系数，`method` 列因为不是数字被 `select_dtypes` 排除掉。可以看到 `mass` 与 `distance` 的相关性偏弱，说明它们不是简单的线性关系。

## 最后一问：同时按两个维度分组

原 notebook 的收尾在一个更复杂的分组上：

```python
grouped_by_year_method = planets_cleaned.groupby(['year', 'method']).agg({'mass': 'mean'}).reset_index()
```

`groupby` 收一个**列表**就是多重分组——先按年份切，年份内再按方法切，然后对每块算 `mass` 均值。`agg({'mass': 'mean'})` 这个写法是字典形式，键是列名、值是聚合函数，如果要对不同列用不同函数就写成 `{'mass': 'mean', 'distance': 'max'}`。

图里用 `hue='method'` 把每种方法画成一条线，`radial velocity` 和 `transit` 两条线覆盖了大部分年份，其余方法只是零星的几个点。

## 这一篇真正想说的

整个流程走下来是标准的五步：**看数据 → 分组聚合 → 合并 → 清洗 → 可视化**。没有一步是新鲜的，全是前面几篇讲过的操作。

真正难的不是语法，是**每一步的判断**：

- `info()` 里 `mass` 只有 513 个非空值——要不要在分组前就处理，还是分组后再说？
- 合并的 `NaN` 是「没数据」还是「数据是零」——图上要不要标出来？
- `dropna()` 删掉一半样本——删掉的这批人是不是有系统性特征？
- 相关系数弱——是没关系，还是关系是非线性的？

原始 notebook 把代码写对了，但没有问这些问题。这些问号是我重跑一遍之后补上的，也是这篇讲解相对原笔记多出来的部分。

---

**在浏览器里跑**：[`pandas_planets`](/lab/python/scripts/04_pandas_planets.py) · **原始数据**：[`planets.csv`](/lab/python/data/planets.csv)
