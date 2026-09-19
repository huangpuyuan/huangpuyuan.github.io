# ═══ 单元 1 ═══
# Pandas 是一个强大的数据处理和分析库，广泛用于数据科学和机器学习领域。它提供了灵活的数据结构和丰富的数据操作功能，使得数据清洗、处理和分析变得简单高效。

# Pandas 概述
# Pandas 主要有两个核心数据结构：

# Series：一维数组，类似于 Python 的列表或 NumPy 的一维数组，具有索引。
# DataFrame：二维表格，类似于电子表格或 SQL 表，包含行和列，支持多种数据类型。

import pandas as pd

# 创建一个 Series
data_series = pd.Series([1, 2, 3, 4, 5], index=['a', 'b', 'c', 'd', 'e'])
print("Series:\n", data_series)

# 创建一个 DataFrame
data_dict = {
    'Name': ['Alice', 'Bob', 'Charlie'],
    'Age': [25, 30, 35],
    'City': ['New York', 'Los Angeles', 'Chicago']
}
data_frame = pd.DataFrame(data_dict)
print("\nDataFrame:\n", data_frame)

# ═══ 单元 2 ═══
#  读取和写入数据
# Pandas 支持多种数据格式的读取和写入，包括 CSV、Excel、SQL 等
# 从 CSV 文件读取数据

# 创建 data.csv 文件
# 第一步 创建一个 DataFrame
data = {
    'Name': ['Alice', 'Bob', 'Charlie', 'David', 'Eva', 'Frank', 'Grace', 'Hannah', 'Ivy', 'Jack'],
    'Age': [25, 30, 35, 28, 22, 40, 30, 27, 29, 32],
    'City': ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 
             'Philadelphia', 'San Antonio', 'Dallas', 'San Diego', 'San Jose'],
    'Score': [85, 90, 95, 80, 88, 75, 92, 78, 85, 91]
}

df = pd.DataFrame(data)

# 将 DataFrame 写入 CSV 文件
df.to_csv('data.csv', index=False)

print("data.csv 文件已创建！")

# ═══ 单元 3 ═══
# 读取 CSV 文件
df = pd.read_csv('data.csv')

# 显示数据
print(df)

# ═══ 单元 4 ═══
#  数据选择与过滤

# 选择列
print("\n选择 Name 列:\n", data_frame['Name'])

# 选择多列
print("\n选择 Name 和 Age 列:\n", data_frame[['Name', 'Age']])

# 过滤数据
print("\n年龄大于 28 的人:\n", data_frame[data_frame['Age'] > 28])

# ═══ 单元 5 ═══
# 数据清洗
# 处理缺失值和重复值是数据清洗的重要步骤。

# 创建一个包含缺失值的 DataFrame
data_with_nan = pd.DataFrame({
    'Name': ['Alice', 'Bob', None],
    'Age': [25, None, 35]
})

# 查看缺失值
print("\n缺失值:\n", data_with_nan.isnull())

# 填充缺失值
data_with_nan_filled = data_with_nan.fillna({'Name': 'Unknown', 'Age': data_with_nan['Age'].mean()})
print("\n填充缺失值:\n", data_with_nan_filled)

# 删除包含缺失值的行
data_without_nan = data_with_nan.dropna()
print("\n删除缺失值后的数据:\n", data_without_nan)

# 删除重复行
data_with_duplicates = pd.DataFrame({
    'Name': ['Alice', 'Bob', 'Alice'],
    'Age': [25, 30, 25]
})
data_without_duplicates = data_with_duplicates.drop_duplicates()
print("\n删除重复行后的数据:\n", data_without_duplicates)

# ═══ 单元 6 ═══
 # 数据分组与聚合
# 创建一个 DataFrame
data_group = pd.DataFrame({
    'Name': ['Alice', 'Bob', 'Charlie', 'Alice', 'Bob'],
    'Age': [25, 30, 35, 28, 32],
    'Score': [85, 90, 95, 80, 88]
})

# 按 Name 分组并计算平均年龄和总分
grouped_data = data_group.groupby('Name').agg({'Age': 'mean', 'Score': 'sum'})
print("\n按 Name 分组的平均年龄和总分:\n", grouped_data)

# ═══ 单元 7 ═══
# 数据合并与连接
# 创建两个 DataFrame
df1 = pd.DataFrame({
    'Name': ['Alice', 'Bob'],
    'Age': [25, 30]
})

df2 = pd.DataFrame({
    'Name': ['Charlie', 'David'],
    'Age': [35, 40]
})

# 纵向合并
df_concat = pd.concat([df1, df2], ignore_index=True)
print("\n纵向合并后的 DataFrame:\n", df_concat)

# 横向合并
df3 = pd.DataFrame({
    'Name': ['Alice', 'Bob'],
    'Score': [85, 90]
})

df_merged = pd.merge(df1, df3, on='Name')
print("\n横向合并后的 DataFrame:\n", df_merged)

# ═══ 单元 8 ═══
# 数据排序
# 按年龄排序
sorted_data = data_frame.sort_values(by='Age', ascending=False)
print("\n按年龄降序排序:\n", sorted_data)

# ═══ 单元 9 ═══
# 数据透视表
# 创建一个 DataFrame
data_pivot = pd.DataFrame({
    'Name': ['Alice', 'Bob', 'Charlie', 'Alice', 'Bob'],
    'Subject': ['Math', 'Math', 'Math', 'English', 'English'],
    'Score': [85, 90, 95, 80, 88]
})

# 创建数据透视表
pivot_table = data_pivot.pivot_table(values='Score', index='Name', columns='Subject', aggfunc='mean')
print("\n数据透视表:\n", pivot_table)
