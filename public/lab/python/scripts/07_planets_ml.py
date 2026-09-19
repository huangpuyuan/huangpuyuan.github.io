
# ── 执行环境准备（原 notebook 里没有这两行）──────────────────
# 1. 无头环境没有显示器，matplotlib 必须用 Agg 后端才能出图
# 2. 中文字体要显式指定，否则标题里的中文会画成方框
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
plt.rcParams["font.sans-serif"] = ["Noto Sans CJK SC", "DejaVu Sans"]
plt.rcParams["axes.unicode_minus"] = False

_SVG_DIR = r"/tmp/out/svg/planets_ML"
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
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error

# 1. 加载行星数据集
# planets = sns.load_dataset('planets') 网络加载
# 本地加载
file_path = 'planets.csv' 
planets = pd.read_csv(file_path)

# 2. 显示数据集的前几行 和 数据概览
print("行星数据集的前几行:\n", planets.head())
print("\n数据集信息:")
print(planets.info())

# ═══ 单元 2 ═══
# 2. 数据清洗：删除缺失值
planets_cleaned = planets.dropna()

# 3. 选择特征和目标变量
# 这里我们选择 'year' 作为特征，'mass' 作为目标变量
X = planets_cleaned[['year']]
y = planets_cleaned['mass']

# 4. 划分训练集和测试集
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 5. 创建线性回归模型
model = LinearRegression()
model.fit(X_train, y_train)

# 6. 预测
y_pred = model.predict(X_test)

# 7. 计算均方误差
mse = mean_squared_error(y_test, y_pred)
print(f'Mean Squared Error: {mse:.2f}')

# ═══ 单元 3 ═══
# 8. 可视化真实值与预测值的关系
plt.figure(figsize=(10, 6))
plt.scatter(y_test, y_pred, alpha=0.7)
plt.plot([y.min(), y.max()], [y.min(), y.max()], 'r--', lw=2)  # 45度线
plt.title('True Values vs Predicted Values')
plt.xlabel('True Values (Mass)')
plt.ylabel('Predicted Values (Mass)')
plt.grid()
plt.show()

# ═══ 单元 4 ═══
# 9. 绘制残差图
residuals = y_test - y_pred

plt.figure(figsize=(10, 6))
plt.scatter(y_pred, residuals, alpha=0.7)
plt.axhline(0, color='red', linestyle='--')
plt.title('Residuals vs Predicted Values')
plt.xlabel('Predicted Values (Mass)')
plt.ylabel('Residuals')
plt.grid()
plt.show()
