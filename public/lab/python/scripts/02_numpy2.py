# ═══ 单元 1 ═══
# NumPy 通用函数（ufuncs）
import numpy as np

# 创建数组
array = np.array([1, 2, 3, 4, 5])

# 数学函数
print("平方:", np.square(array))  # 每个元素平方
print("平方根:", np.sqrt(array))  # 每个元素的平方根
print("正弦:", np.sin(array))      # 每个元素的正弦值

# 逻辑函数
print("大于3的布尔数组:", np.greater(array, 3))  # 判断每个元素是否大于 3

# ═══ 单元 2 ═══
#  广播（Broadcasting）
# 创建数组
a = np.array([1, 2, 3])
b = np.array([[10], [20], [30]])

# 广播
result = a + b
print("广播结果:\n", result)

# ═══ 单元 3 ═══
#比较
# 创建数组
array1 = np.array([1, 2, 3, 4])
array2 = np.array([3, 2, 1, 0])

# 比较
print("相等比较:", array1 == array2)  # 元素相等
print("大于比较:", array1 > array2)    # 元素大于
print("小于等于比较:", array1 <= array2)  # 元素小于等于

# ═══ 单元 4 ═══
#掩码布尔逻辑
# 创建数组
array = np.array([1, 2, 3, 4, 5, 6])

# 创建布尔掩码
mask = array > 3

# 使用掩码选择元素
filtered_array = array[mask]
print("大于3的元素:", filtered_array)

# ═══ 单元 5 ═══
#花哨的索引（Fancy Indexing）
# 创建数组
array = np.array([10, 20, 30, 40, 50])

# 花哨的索引
indices = [0, 2, 4]
fancy_indexed_array = array[indices]
print("花哨的索引结果:", fancy_indexed_array)

# ═══ 单元 6 ═══
#排序
# 创建数组
array = np.array([3, 1, 2, 5, 4])

# 排序
sorted_array = np.sort(array)
print("排序结果:", sorted_array)

# 获取排序后的索引
sorted_indices = np.argsort(array)
print("排序索引:", sorted_indices)

# 按照索引重新排列数组
sorted_by_index = array[sorted_indices]
print("按索引排序:", sorted_by_index)

# ═══ 单元 7 ═══
#结构化数组
# 定义结构化数组的数据类型
dtype = np.dtype([('name', 'U10'), ('age', 'i4'), ('height', 'f4')])

# 创建结构化数组
structured_array = np.array([('Alice', 25, 5.5), ('Bob', 30, 6.0)], dtype=dtype)

# 访问结构化数组的字段
print("姓名:", structured_array['name'])
print("年龄:", structured_array['age'])
print("身高:", structured_array['height'])
