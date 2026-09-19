
# ── 执行环境准备（原 notebook 里没有这两行）──────────────────
# 1. 无头环境没有显示器，matplotlib 必须用 Agg 后端才能出图
# 2. 中文字体要显式指定，否则标题里的中文会画成方框
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
plt.rcParams["font.sans-serif"] = ["Noto Sans CJK SC", "DejaVu Sans"]
plt.rcParams["axes.unicode_minus"] = False

_SVG_DIR = r"/tmp/out/svg/pandas_planets"
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
## 行星数据集
# Seaborn 提供了一个名为 "planets" 的数据集，包含有关行星的各种信息。我们将使用这个数据集来演示 Pandas 的分组和累计操作。
# 我们将使用 Seaborn 加载行星数据集，并将其转换为 Pandas DataFrame 进行分析。
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt

# 1. 加载行星数据集
planets = sns.load_dataset('planets')

# 显示数据集的前几行
print("行星数据集的前几行:\n", planets.head())

# 2. 数据概览
print("\n数据集信息:")
print(planets.info())

# ═══ 单元 2 ═══
# 3. 分组操作
# 按 'method' 列分组，并计算每种方法的行星数量
grouped_by_method = planets.groupby('method').size().reset_index(name='count')
print("\n按方法分组的行星数量:\n", grouped_by_method)

# ═══ 单元 3 ═══
# 4. 计算每种方法的行星平均质量
average_mass = planets.groupby('method')['mass'].mean().reset_index(name='average_mass')
print("\n按方法分组的平均质量:\n", average_mass)

# ═══ 单元 4 ═══
# 5. 计算每种方法的行星数量和平均质量的合并结果
merged_group = pd.merge(grouped_by_method, average_mass, on='method')
print("\n合并后的结果:\n", merged_group)

# ═══ 单元 5 ═══
# 7. 可视化
plt.figure(figsize=(10, 6))
sns.barplot(data=merged_group, x='method', y='count', palette='viridis', hue='method', legend=False)
plt.title('Number of Planets by Method')
plt.xlabel('Method')
plt.ylabel('Number of Planets')
plt.xticks(rotation=45)
plt.show()

# ═══ 单元 6 ═══
# 8. 可视化平均质量
plt.figure(figsize=(10, 6))
sns.barplot(data=merged_group, x='method', y='average_mass', palette='plasma', hue='method', legend=False)
plt.title('Average Mass of Planets by Method')
plt.xlabel('Method')
plt.ylabel('Average Mass (Jupiter Masses)')
plt.xticks(rotation=45)
plt.show()

# ═══ 单元 7 ═══
# 1. 数据清洗与预处理
# 检查缺失值
print(planets.isnull().sum())

# 删除缺失值（如果需要）
planets_cleaned = planets.dropna()

# ═══ 单元 8 ═══
# 2. 数据探索性分析（EDA）

# 2.1. 行星质量与距离的关系
# 可以使用散点图来探索行星质量与距离之间的关系。
plt.figure(figsize=(10, 6))
sns.scatterplot(data=planets_cleaned, x='mass', y='year', hue='method', alpha=0.7)
plt.title('Planet Mass vs Discovery Year')
plt.xlabel('Mass (Jupiter Masses)')
plt.ylabel('Year of Discovery')
plt.legend(title='Discovery Method')
plt.show()

# ═══ 单元 9 ═══
# 2.2. 不同发现方法的行星质量分布
# 使用小提琴图展示不同发现方法的行星质量分布。

plt.figure(figsize=(12, 6))
sns.violinplot(data=planets_cleaned, x='method', y='mass', palette='muted', hue='method', legend=False)
plt.title('Distribution of Planet Mass by Discovery Method')
plt.xlabel('Discovery Method')
plt.ylabel('Mass (Jupiter Masses)')
plt.xticks(rotation=45)
plt.show()

# ═══ 单元 10 ═══
# 3. 时间序列分析
# 分析行星发现的时间趋势。
# 按年份统计行星发现数量
discovery_trend = planets_cleaned['year'].value_counts().sort_index()

plt.figure(figsize=(12, 6))
discovery_trend.plot(kind='line', marker='o')
plt.title('Trend of Planet Discoveries Over Years')
plt.xlabel('Year')
plt.ylabel('Number of Discoveries')
plt.grid()
plt.show()

# ═══ 单元 11 ═══
# 4.相关性分析   数据清洗：检查缺失值 删除缺失值（如果需要）

print("\n缺失值统计:\n", planets.isnull().sum())
planets_cleaned = planets.dropna()

# 4. 相关性分析
# 只选择数值列进行相关性分析
numeric_cols = planets_cleaned.select_dtypes(include=['float64', 'int64']).columns
correlation_matrix = planets_cleaned[numeric_cols].corr()

plt.figure(figsize=(10, 8))
sns.heatmap(correlation_matrix, annot=True, cmap='coolwarm', fmt='.2f')
plt.title('Correlation Matrix of Planet Features')
plt.show()

# ═══ 单元 12 ═══
## 5. 高级分组与聚合 可以对数据进行更复杂的分组和聚合操作，例如按发现年份和方法分组，计算每组的平均质量。

# 按年份和方法分组，计算平均质量
grouped_by_year_method = planets_cleaned.groupby(['year', 'method']).agg({'mass': 'mean'}).reset_index()

plt.figure(figsize=(12, 6))
sns.lineplot(data=grouped_by_year_method, x='year', y='mass', hue='method', marker='o')
plt.title('Average Planet Mass by Year and Method')
plt.xlabel('Year')
plt.ylabel('Average Mass (Jupiter Masses)')
plt.legend(title='Discovery Method')
plt.grid()
plt.show()
