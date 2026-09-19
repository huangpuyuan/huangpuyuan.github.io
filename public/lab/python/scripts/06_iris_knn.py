
# ── 执行环境准备（原 notebook 里没有这两行）──────────────────
# 1. 无头环境没有显示器，matplotlib 必须用 Agg 后端才能出图
# 2. 中文字体要显式指定，否则标题里的中文会画成方框
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
plt.rcParams["font.sans-serif"] = ["Noto Sans CJK SC", "DejaVu Sans"]
plt.rcParams["axes.unicode_minus"] = False

_SVG_DIR = r"/tmp/out/svg/Iris_KNN"
_SVG_N = [0]

# 把 plt.show() 换成存 SVG：无头环境下 show() 什么都不做，
# 改成 savefig 才能把图留下来。图的形状、颜色、标注全都一样。
def _show_to_svg(*a, **kw):
    _SVG_N[0] += 1
    plt.savefig(f"_SVG_DIR/fig{_SVG_N[0]}.svg".replace("_SVG_DIR", _SVG_DIR),
                bbox_inches="tight", format="svg")
    plt.close()

plt.show = _show_to_svg
# ────────────────────────────────────────────────────────────

# ═══ 单元 1 ═══
# KNN 算法案例：鸢尾花分类
# 1. 数据集介绍
# 特征：

# 花萼长度（sepal length）
# 花萼宽度（sepal width）
# 花瓣长度（petal length）
# 花瓣宽度（petal width）
# 类别：

# Setosa
# Versicolor
# Virginica
# 2. 实现步骤
# 导入必要的库。
# 加载鸢尾花数据集。
# 划分训练集和测试集。
# 创建 KNN 模型并进行训练。
# 进行预测并评估模型性能。
# 可视化结果。

import numpy as np
import matplotlib.pyplot as plt
from sklearn import datasets
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

# 1. 加载鸢尾花数据集
iris = datasets.load_iris()
X = iris.data  # 特征
y = iris.target  # 标签

# 2. 划分训练集和测试集
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 3. 创建 KNN 模型并进行训练
k = 3  # 选择 K 值
knn = KNeighborsClassifier(n_neighbors=k)
knn.fit(X_train, y_train)

# 4. 进行预测
y_pred = knn.predict(X_test)

# 5. 评估模型性能
accuracy = accuracy_score(y_test, y_pred)
print("模型准确率:", accuracy)
print("\n分类报告:\n", classification_report(y_test, y_pred))
print("混淆矩阵:\n", confusion_matrix(y_test, y_pred))

# 6. 可视化结果
# 选择前两个特征进行可视化
plt.figure(figsize=(10, 6))
plt.scatter(X[:, 0], X[:, 1], c=y, cmap='viridis', edgecolor='k', s=100, label='Data Points')
plt.title('Iris Dataset - KNN Classification')
plt.xlabel('Sepal Length')
plt.ylabel('Sepal Width')

# 绘制测试点
plt.scatter(X_test[:, 0], X_test[:, 1], color='red', marker='x', s=200, label='Test Points')

# 添加图例
plt.legend()
plt.grid()
plt.show()
