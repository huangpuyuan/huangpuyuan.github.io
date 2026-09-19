---
title: Pandas：从读到清洗
order: 3
slug: pandas
description: 数据处理的标准动作——怎么把表格读进来，怎么挑出要的行列，怎么对付缺失值和重复值，怎么按维度汇总。
gist: 真实数据没有干净的，清洗往往比分析更花时间。
complexity: []
script: 03_pandas.py
minutes: 20
tag: Pandas
---

## 两个核心结构

```python
import pandas as pd

# Series：带索引的一维数组
data_series = pd.Series([1, 2, 3, 4, 5], index=['a', 'b', 'c', 'd', 'e'])
print("Series:\n", data_series)

# DataFrame：二维表格
data_frame = pd.DataFrame({
    'Name': ['Alice', 'Bob', 'Charlie'],
    'Age': [25, 30, 35],
    'City': ['New York', 'Los Angeles', 'Chicago']
})
```

```
Series:
 a    1
b    2
c    3
d    4
e    5
dtype: int64

DataFrame:
       Name  Age         City
0    Alice   25     New York
1      Bob   30  Los Angeles
2  Charlie   35      Chicago
```

**Series 就是 DataFrame 的一列。** 两者的关系是：

| | Series | DataFrame |
|---|---|---|
| 维度 | 一维 | 二维 |
| 类比 | 一列 | 一张表 |
| 索引 | 每个元素一个 | 每行一个，另外每列有列名 |

`pd.Series([1,2,3,4,5], index=['a',...])` 里的 `index` 参数就是自定义索引。
不指定的话默认是 `0, 1, 2...`（DataFrame 里看到的就是这个）。

DataFrame 从**字典**创建：字典的键变成列名，值变成列的内容。

## 一、读写数据

```python
df = pd.DataFrame(data)          # 假设 data 是上面那个字典
df.to_csv('data.csv', index=False)
```

```
data.csv 文件已创建！
```

`index=False` 是**别把行号也写进文件**。不写这个参数的话，CSV 里会多出一列没名字的数字：

```
,Name,Age,City          ← 多出来的那列
0,Alice,25,New York
```

读回来：

```python
df = pd.read_csv('data.csv')
print(df)
```

```
      Name  Age          City  Score
0    Alice   25      New York     85
1      Bob   30   Los Angeles     90
2  Charlie   35       Chicago     95
3    David   28       Houston     80
4      Eva   22       Phoenix     88
5    Frank   40  Philadelphia     75
6    Grace   30   San Antonio     92
7   Hannah   27        Dallas     78
8      Ivy   29     San Diego     85
9     Jack   32      San Jose     91
```

`read_csv` 会**自动推断每列的类型**——`Age` 和 `Score` 认成整数，`Name` 和 `City` 认成字符串。
这一步很方便，但也是坑的来源（比如身份证号会被当成数字，前面的 0 就没了）。

## 二、选择与过滤

```python
print("\n选择 Name 列:\n", data_frame['Name'])
print("\n选择 Name 和 Age 列:\n", data_frame[['Name', 'Age']])
print("\n年龄大于 28 的人:\n", data_frame[data_frame['Age'] > 28])
```

```
选择 Name 列:
 0      Alice
1        Bob
2    Charlie
Name: Name, dtype: str

选择 Name 和 Age 列:
       Name  Age
0    Alice   25
1      Bob   30
2  Charlie   35

年龄大于 28 的人:
       Name  Age         City
1      Bob   30  Los Angeles
2  Charlie   35      Chicago
```

**注意两处的方括号层数不一样**：

- `df['Name']` —— 一层，取**一列**，返回 Series
- `df[['Name', 'Age']]` —— **两层**（里面的列表是一层，外面的选择又是一层），取**多列**，返回 DataFrame

这个「双层括号」是 Pandas 最容易被绊的地方。记法：**传一个列表就得多一层括号**。

过滤那行也是同理：`data_frame['Age'] > 28` 先算出一个布尔 Series，
再拿它当索引去筛行——和 NumPy 的掩码是同一个思路。

## 三、数据清洗

这一节是这章最有实际价值的部分。**真实数据几乎总是脏的**，清洗往往比分析更花时间。

```python
data_with_nan = pd.DataFrame({
    'Name': ['Alice', 'Bob', None],
    'Age': [25, None, 35]
})
print("\n缺失值:\n", data_with_nan.isnull())
```

```
缺失值:
     Name    Age
0  False  False
1  False   True
2   True  False
```

`isnull()` 打出**每格是不是空的**。这叫缺失值掩码，先看清哪里有洞，再决定怎么办。

### 处理缺失值：两种策略

**策略一：填一个值进去**

```python
data_with_nan_filled = data_with_nan.fillna({'Name': 'Unknown', 'Age': data_with_nan['Age'].mean()})
```

```
填充缺失值:
       Name   Age
0    Alice  25.0
1      Bob  30.0
2  Unknown  35.0
```

**按列分别指定填什么**：`Name` 那列填字符串 `'Unknown'`，`Age` 那列填**这列的平均值**。

注意 `Age` 变成了 `25.0 / 30.0 / 35.0`——`30.0` 是 `(25+35)/2` 算出来的。
**这动作有个隐患**：填平均值会让这列的数字「看起来更整齐」，但那是编出来的。
数据量大、缺失少的时候影响不大；缺失比例高的话，等于在往数据里注入假信息。

**策略二：直接删掉**

```python
data_without_nan = data_with_nan.dropna()
```

```
删除缺失值后的数据:
     Name   Age
0  Alice  25.0
```

**只剩一行了。** 因为 `dropna()` 默认是「**只要这行有任何一个空值就整行删掉**」。
原来三行，第 1 行 `Name` 空、第 2 行 `Age` 空，都被删了。

这是最容易踩的坑：**三行变一行，数据没了 2/3**。
想只删特定列的空值，得写 `dropna(subset=['Age'])`。

> **填还是删？** 看缺失比例。缺 1% 就删掉，缺 50% 就得认真考虑这列还能不能用。
> 行星数据集里 `mass` 那列缺了 50%+，当时就直接改用它做特征了——那是这个例子的软肋。

### 去重

```python
data_with_duplicates = pd.DataFrame({
    'Name': ['Alice', 'Bob', 'Alice'],
    'Age': [25, 30, 25]
})
data_without_duplicates = data_with_duplicates.drop_duplicates()
```

```
删除重复行后的数据:
     Name  Age
0  Alice   25
1    Bob   30
```

`drop_duplicates()` **默认比较整行**——所有列都一样才算重复。
想按某一列去重（比如「同一个人的记录只留一条」），得写 `subset=['Name']`。

## 四、分组聚合

```python
data_group = pd.DataFrame({
    'Name': ['Alice', 'Bob', 'Charlie', 'Alice', 'Bob'],
    'Age': [25, 30, 35, 28, 32],
    'Score': [85, 90, 95, 80, 88]
})

grouped_data = data_group.groupby('Name').agg({'Age': 'mean', 'Score': 'sum'})
```

```
按 Name 分组的平均年龄和总分:
           Age  Score
Name                
Alice    26.5    165
Bob      31.0    178
Charlie  35.0     95
```

这行是 **split-apply-combine**（拆分-应用-合并）三步的浓缩：

1. **拆**：按 `Name` 把行分成三组
2. **算**：Alice 组算年龄平均 `(25+28)/2 = 26.5`、分数求和 `85+80 = 165`
3. **合**：把三组结果拼回一张表

`agg` 后面的字典是「**哪一列用什么函数**」：

```python
.agg({'Age': 'mean', 'Score': 'sum'})
#     └─列名─┘ └函数┘
```

常用的函数名都是字符串：`'mean'`、`'sum'`、`'count'`、`'max'`、`'min'`。

**`Name` 跑到索引位置去了**（左边那一列，字体和别的不一样）。这在 Pandas 里是正常行为——
分组键会变成索引。想让它变回普通列，加 `.reset_index()`。

## 五、合并与连接

两种「拼表」方式，区别在方向：

```python
df_concat = pd.concat([df1, df2], ignore_index=True)   # 纵向：上下摞
df_merged = pd.merge(df1, df3, on='Name')              # 横向：左右拼
```

```
纵向合并后的 DataFrame:
       Name  Age
0    Alice   25
1      Bob   30
2  Charlie   35
3    David   40

横向合并后的 DataFrame:
     Name  Age  Score
0  Alice   25     85
1    Bob   30     90
```

| | `concat` | `merge` |
|---|---|---|
| 方向 | 上下摞 | 左右拼 |
| 依据 | 位置（按行首尾相接） | **某个共同的列** |
| 类比 | `list1 + list2` | SQL 的 `JOIN` |

`merge` 的 `on='Name'` 就是「用 `Name` 列对齐」。两张表里 `Name` 相同的行拼到一起。
这相当于 SQL 的 `JOIN ... ON t1.Name = t2.Name`。

`concat` 那个 `ignore_index=True` 是**重排行号**。不加的话两边的行号会带着原来的：
`0, 1, 0, 1`。加了就重排成 `0, 1, 2, 3`。

## 六、排序

```python
sorted_data = data_frame.sort_values(by='Age', ascending=False)
```

```
按年龄降序排序:
       Name  Age         City
2  Charlie   35      Chicago
1      Bob   30  Los Angeles
0    Alice   25     New York
```

`ascending=False` 是降序（从大到小），默认是升序。
注意左边的**行号还是原来的**（2、1、0）——排序不会重排行号，因为它保留着「这行原来在哪」。

想要新行号同样加 `.reset_index(drop=True)`。

## 七、数据透视表

```python
data_pivot = pd.DataFrame({
    'Name': ['Alice', 'Bob', 'Charlie', 'Alice', 'Bob'],
    'Subject': ['Math', 'Math', 'Math', 'English', 'English'],
    'Score': [85, 90, 95, 80, 88]
})

pivot_table = data_pivot.pivot_table(values='Score', index='Name', columns='Subject', aggfunc='mean')
```

```
数据透视表:
 Subject  English  Math
Name                  
Alice       80.0  85.0
Bob         88.0  90.0
Charlie      NaN  95.0
```

**把「长表」掰成「宽表」**。原来一个 `Name`-`Subject`-`Score` 三列的竖排列表，
变成了以 `Name` 为行、`Subject` 为列的交叉表。

三个参数正好对应三个问题：

| 参数 | 回答 |
|---|---|
| `values='Score'` | 格子里填什么 |
| `index='Name'` | 行是什么 |
| `columns='Subject'` | 列是什么 |
| `aggfunc='mean'` | 如果一个格子有多个值（Alice 有多条 Math 记录），怎么合并 |

Charlie 那行的 `English` 是 `NaN`——他没有英语成绩。透视表**不会因此少一行或多一列**,
而是把所有出现过的行列都铺出来，空的填 `NaN`。这点和 Excel 的透视表一致。

## 小结

按「实际用得多少」排个序：

| 操作 | 代码 | 用得多不多 |
|---|---|---|
| 读文件 | `pd.read_csv()` | 每份分析都要 |
| 选列 | `df['col']` / `df[['a','b']]` | 每份分析都要 |
| 过滤行 | `df[df['col'] > x]` | 每份分析都要 |
| 看缺失 | `df.isnull().sum()` | 拿到新数据第一件事 |
| 分组汇总 | `df.groupby('k').agg({...})` | 很常用 |
| 排序 | `df.sort_values(by=...)` | 常用 |
| 透视 | `df.pivot_table(...)` | 做报表时才用 |
| 合并 | `pd.merge(a, b, on=...)` | 数据分散在多个表时 |

**最容易踩的三个坑**：

1. **双层方括号**——`df['a']` 是一列，`df[['a']]` 也是「一列」但返回 DataFrame
2. **`dropna()` 删太狠**——默认删掉任何含空值的行，可能把数据删到只剩一点
3. **分组键跑进索引**——`groupby` 之后想当普通列用，记得 `reset_index()`

---

> **一个版本差异**
>
> 原 notebook 是在 Pandas 1.x 上跑的，那里字符串列的类型显示成 `object`。
> 现在 Pandas 3.0 会显示成 `str`。输出里 `dtype: str` 就是新版的行为，
> 计算逻辑没有任何变化。
