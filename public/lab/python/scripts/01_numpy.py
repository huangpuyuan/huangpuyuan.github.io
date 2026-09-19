# ═══ 单元 1 ═══
import numpy as np

# ═══ 单元 2 ═══
# 创建 NumPy 数组
# 创建一维数组
array_1d = np.array([1, 2, 3, 4, 5])
print("一维数组:", array_1d)

# 创建二维数组
array_2d = np.array([[1, 2, 3], [4, 5, 6]])
print("二维数组:\n", array_2d)

# 创建全零数组
zeros_array = np.zeros((2, 3))
print("全零数组:\n", zeros_array)

# 创建全一数组
ones_array = np.ones((2, 3))
print("全一数组:\n", ones_array)

# 创建等间隔数组
arange_array = np.arange(0, 10, 2)
print("等间隔数组:", arange_array)

# 创建线性空间数组
linspace_array = np.linspace(0, 1, 5)
print("线性空间数组:", linspace_array)

# ═══ 单元 3 ═══
## 数组索引与切片
# 一维数组索引
print("第一个元素:", array_1d[0])
print("最后一个元素:", array_1d[-1])

# 二维数组索引
print("第二行:", array_2d[1])
print("第一行第二列元素:", array_2d[0, 1])

# 数组切片
print("切片:", array_1d[1:4])  # 从索引 1 到 3

# ═══ 单元 4 ═══
## 数组运算
# 数组加法
array_sum = array_1d + 10
print("加法结果:", array_sum)

# 数组乘法
array_product = array_1d * 2
print("乘法结果:", array_product)

# 计算数组的和、均值和最大值
print("数组和:", np.sum(array_1d))
print("数组均值:", np.mean(array_1d))
print("数组最大值:", np.max(array_1d))
