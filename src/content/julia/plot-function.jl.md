---
title: 画出函数和它的导数
order: 5
slug: plot-function
summary: 用 Julia 画 G(x) = ½x² − 2x 和它的导数 g(x) = x − 2。图上能直接看出导数为什么叫"变化率"，以及为什么极值点就落在导数为零的地方。
gist: 导数为零的位置就是极值点——画出来比推出来直观得多。
complexity: []
chapter: 学习笔记 · 2019
script: plot-function.jl
---

## 问题

把函数 `G(x) = ½x² − 2x` 和它的导数 `g(x) = x − 2` 画在同一张图上，看看两者是什么关系。

这个问题讲的是**导数在图上的含义**。微积分课本上说「导数是变化率」，但这句话要画出来才真的看得见。

## 代码

```julia
using Plots
using LaTeXStrings

x_grid = range(-0.5, 4.5, length = 200)

G(x) = 1/2 * x^2 - 2x     # 原函数
g(x) = x - 2              # 它的导数
```

`range(-0.5, 4.5, length = 200)` 在 -0.5 到 4.5 之间取 200 个等距点，用来画曲线。这个范围是挑过的——**刚好能覆盖抛物线的谷底，也能看到两条线的两个交点**。

画图两步走，先把第一条曲线立起来：

```julia
p = plot(
    x_grid, G.(x_grid),
    label = L"G(x) = \frac{1}{2}x^2 - 2x",
    color = :blue,
    linewidth = 2
)
```

注意 `G.(x_grid)` 里那个**点号**。`G(x)` 只接受单个数字，而 `x_grid` 是 200 个数字的数组。点号是**广播（broadcasting）**标记，意思是「把这个函数挨个作用到数组的每一个元素上」。这是 Julia 里最常用的语法糖之一——没有它就得写 `[G(x) for x in x_grid]`。

`L"..."` 是 `LaTeXStrings` 包提供的东西，标记里面的内容按 LaTeX 渲染。图上 `\frac{1}{2}` 会显示成分数形式，比直接写 `0.5` 好看。

再用 `plot!` 加上第二条。**`plot!` 结尾的感叹号表示"就地修改"**——它把曲线加到已有的 `p` 上，而不是新建一张图。同样带感叹号的还有 `scatter!`、`title!`、`xlabel!`，这是 Julia 里通用的命名约定：**函数名带 `!` 说明它会改动传入的对象**。

## 跑出来的图

![G(x) 与它的导数 g(x)](/lab/julia/plot.svg)

蓝线是 `G(x) = ½x² − 2x`，红线是导数 `g(x) = x − 2`，橙点是两条线的交点。

## 图上能看出什么

### 一、导数为零处是极值点

抛物线的最低点在 x = 2。怎么找？让导数等于零：

```
g(x) = x - 2 = 0  →  x = 2
```

代回去：`G(2) = ½ × 4 − 4 = -2`，所以最低点是 **(2, -2)**。

图上这一点很直观：红线（导数）**穿过 x 轴的那一刻**，蓝线（抛物线）正好**到达谷底**。代码里用 `scatter!` 把这点标了出来。

这就是「极值点导数为零」的图像含义——不是背下来的规则，是能看见的。

### 二、导数就是那条切线的斜率

红色直线 `y = x - 2` 在每一点的**高度**，就等于蓝线在那一点**切线的斜率**。

- x < 2 时红线在 x 轴下方（导数为负）→ 抛物线在下降
- x > 2 时红线在 x 轴上方（导数为正）→ 抛物线在上升
- x = 2 时红线穿过 x 轴（导数为零）→ 到达谷底

**导数正负 ↔ 函数增减**，这条关系在图上是一眼可见的。

### 三、两条线的交点

`G(x) = g(x)`：

```
½x² − 2x = x − 2
x² − 4x = 2x − 4
x² − 6x + 4 = 0
x = 3 ± √5 ≈ 0.764, 5.236
```

图上那两个橙点就是它们。定义域取到 6 就是为了让右边的交点也进画面——**范围选窄了会把答案切掉**。

## 修正一处原版的错

原脚本里交点标注写的是 `(0, 0)` 和 `(3, 3)`，但这两个点根本不满足 `G(x) = g(x)`：

```julia
G(0)  = 0      g(0)  = -2     # 不相等
G(3)  = -1.5   g(3)  = 1      # 也不相等
```

而且它上面的注释推的是 `½x² − 3x + 2 = 0`——那是把 `½x² − 2x = x − 2` 错误地整理成 `½x² − 3x + 2 = 0`（左边减了 x，右边却忘了加 2 的符号）得到的结果。

**注释和代码一起错，这种情况最难发现**，因为两边互相"印证"。核对的办法只有一个：**把解代回原方程验算**。

重写时改成了正确的 `x = 3 ± √5`。

## 一个跨平台的坑：中文画不出来

第一次跑，终端刷了一屏这个：

```
GKS: glyph missing from current font: 25968
GKS: glyph missing from current font: 20026
...
```

`25968` 是「数」的码点，`38646` 是「零」…… 所有中文标签都掉了。原因是 **GR 后端默认字体不含 CJK 字形**。

指定字体名也没用，因为 **GR 找的是「字体文件」而不是 fontconfig 的族名**。系统里装的中文字体通常是这样：

```
/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc
```

`.ttc` 是 **TrueType Collection**——一个文件里塞了日文、韩文、简中、繁中好几个变体，GR 认不出来。解决办法是**把简体那一份抽成独立的 `.ttf`**：

```python
from fontTools.ttLib import TTCollection
c = TTCollection('/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc')
c.fonts[2].save('/usr/share/fonts/truetype/noto-cjk/NotoSansCJKsc-Regular.ttf')
```

索引 `2` 对应 `Noto Sans CJK SC`（其他索引是 JP / KR / TC / HK）。再 `fc-cache -f` 刷新字体缓存，中文就画得出来了。

脚本里用 `default(fontfamily = ...)` 一次性设好标题、坐标轴、图例的字体：

```julia
default(
    fontfamily = CJK,
    titlefontfamily = CJK,
    guidefontfamily = CJK,
    legendfontfamily = CJK
)
```

## 输出 SVG

```julia
savefig(p, joinpath(@__DIR__, "..", "plot.svg"))
```

输出成 **SVG 矢量图**而不是 PNG。矢量图放大不糊，而且本质是文本，能直接嵌进网页、体积也小（这张图 22KB）。上面那张就是这么来的。

`@__DIR__` 是 Julia 内置宏，展开成**当前脚本所在目录**——用它拼路径，脚本从哪个目录启动都能正确输出。

## 重写时改了什么

| 原版 | 问题 | 现在 |
|---|---|---|
| `using PyPlot` | 需要 Python + matplotlib 环境，装起来麻烦 | `using Plots`（纯 Julia，后端可选） |
| `L"..."` | Julia 0.6 时代的 `LaTeXString` 字面量，1.0 之后已删除 | 装 `LaTeXStrings` 包，用 `L"..."`（同名但含义不同） |
| 交点标成 `(0,0)` / `(3,3)` | 注释和代码一起错 | 改成 `x = 3 ± √5` |
| 没指定中文字体 | 中文全渲染成空白 | `default(fontfamily = "Noto Sans CJK SC")` |

装依赖：

```bash
julia -e 'using Pkg; Pkg.add(["Plots", "LaTeXStrings"])'
```

---

**这一篇是整个 Julia 笔记里唯一需要装额外依赖的**。前面三个脚本只用标准库（`Random`、`Statistics`、`Printf`），`using` 一下就能跑。绘图就不行了——Julia 的绘图生态是「一个抽象层 + 多个后端」，`Plots.jl` 是抽象层，真正画图的是 GR、Plotly 这些后端，默认会装 GR。
