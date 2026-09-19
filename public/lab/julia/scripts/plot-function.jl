# 用 Julia 画函数图像：G(x) = ½x² − 2x 和它的导数 g(x) = x − 2
#
# 原版写于 2019-08，重写时改了三处：
#   1. PyPlot → Plots.jl。PyPlot 需要 Python 环境，装起来麻烦，早就不推荐了
#   2. 原版标题用了 L"..." 这种 LaTeXString 写法，那是 Julia 0.6 时代的语法，
#      1.0 之后已经删掉了（现在 L"..." 来自 LaTeXStrings 包，含义不同）
#   3. 交点的标注原来写成了 (0,0) 和 (3,3)，和注释里推的方程对不上。
#      注释推的是 ½x² - 3x + 2 = 0，那是 G(x) = g(x) 两边同时乘 2 之后
#      再移项写错的结果。正确的交点是 x ≈ 0.764 和 x ≈ 5.236，这里改成后者
#
# 运行前先装依赖：
#   julia -e 'using Pkg; Pkg.add(["Plots", "LaTeXStrings"])'

using Plots
using Printf
using LaTeXStrings

# 图上的中文要指定字体，否则 GR 后端会因为找不到字形而画成空白框。
#
# 注意 GR 找的是「字体文件」而不是 fontconfig 的族名，而系统里装的中文字体
# 往往是 .ttc（TrueType Collection，一个文件里塞多个字重/地区变体），
# GR 认不出来。所以要是报 "could not find font"，把 ttc 里的简体那一份拆出来：
#
#   python3 -c "
#   from fontTools.ttLib import TTCollection
#   c = TTCollection('/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc')
#   c.fonts[2].save('/usr/share/fonts/truetype/noto-cjk/NotoSansCJKsc-Regular.ttf')
#   "
#   fc-cache -f
#
# 索引 2 是 Noto Sans CJK SC，其他索引对应日文/韩文/繁体。
const CJK = "Noto Sans CJK SC"

default(
    fontfamily = CJK,
    titlefontfamily = CJK,
    guidefontfamily = CJK,
    legendfontfamily = CJK
)

# 定义域取 -0.5 到 6，够覆盖抛物线的最低点、两个交点，以及交点在原点附近那一个
x_grid = range(-0.5, 6.0, length = 300)

G(x) = 1/2 * x^2 - 2x     # 原函数
g(x) = x - 2              # 它的导数

p = plot(
    x_grid, G.(x_grid),
    label = L"G(x) = \frac{1}{2}x^2 - 2x",
    color = :blue,
    linewidth = 2,
    legend = :topright,
    xlims = (-0.5, 6.0),
    ylims = (-3.5, 8),
    size = (820, 500),
    dpi = 150,
    titlefontfamily = CJK,
    guidefontfamily = CJK,
    legendfontfamily = CJK
)

plot!(
    p,
    x_grid, g.(x_grid),
    label = L"g(x) = x - 2",
    color = :red,
    linewidth = 2
)

# 标出最低点。G'(x) = x - 2 = 0 解得 x = 2，
# 代回去 G(2) = 2 - 4 = -2 —— 导数为零的位置就是极值点
scatter!(p, [2], [-2], label = "最低点 (2, -2)", color = :black, markersize = 6)

annotate!(p, 2.35, -2.75, text("导数为零处取到极小", 9, :gray, CJK))

# 两条曲线的交点：G(x) = g(x)
#   ½x² - 2x = x - 2  →  x² - 6x + 4 = 0  →  x = 3 ± √5 ≈ 0.764, 5.236
xs = [3 - sqrt(5), 3 + sqrt(5)]
scatter!(p, xs, G.(xs), label = "交点", color = :orange, markersize = 6)

title!(p, "G(x) 与它的导数 g(x)", titlefontfamily = CJK)
xlabel!(p, "x")
ylabel!(p, "y")

# 输出成 SVG，矢量图放大不糊，也方便直接嵌进网页。
# 存到 public/lab/julia/ 下面，这样站点的讲解页可以直接引用。
out = joinpath(@__DIR__, "..", "plot.svg")
savefig(p, out)

println("已保存 ", out)
println("最低点：(2, -2) —— G(2) = ", G(2))
@printf("交点：  x = 3 ± √5 ≈ %.3f 和 %.3f\n", xs[1], xs[2])
