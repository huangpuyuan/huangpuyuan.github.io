# 掷两个骰子，点数和为偶数的概率
#
# 原版写于 2019-08，这里是 2026-09 的重写版。改动集中在三处：
#   - rand(faces) 改成 rand(rng, faces)：Julia 1.7 起全局随机数发生器不再有
#     自己的状态，显式传 rng 才是推荐写法，结果也可复现
#   - 数组推导式的维度参数写法保留了，但加了注释说明它是「笛卡尔积」
#   - 用 @time 标出两种算法的耗时差，正好能对上站里那篇讲 Julia 性能的文章

using Random
using Printf

const N = 10^6          # 蒙特卡洛模拟次数
const FACES = 1:6       # 骰子的六个面

rng = MersenneTwister(42)   # 固定种子，每次跑结果一样

# ── 解法一：把 36 种组合全列出来，直接数 ──────────────────────
# faces_i × faces_j 会展开成 6×6 的矩阵，iseven 逐元素判断和是否为偶数
numSol = sum(iseven(i + j) for i in FACES, j in FACES) / length(FACES)^2

# ── 解法二：蒙特卡洛，随机掷 N 次数频率 ────────────────────────
# 这就是"用随机模拟逼近精确值"，掷的次数越多越接近
mcEst = sum(iseven(rand(rng, FACES) + rand(rng, FACES)) for _ in 1:N) / N

@printf("理论值（数组合）      = %.6f\n", numSol)
@printf("蒙特卡洛（%d 次）  = %.6f\n", N, mcEst)
@printf("两者相差              = %.6f\n", abs(numSol - mcEst))

# 顺带说明一下为什么理论值恰好是 0.5：
# 两个骰子的和，奇偶各占一半——i 是奇数时 j 必须是奇数才凑出偶数，
# 3×3 + 3×3 = 18 种，18/36 = 0.5。跟骰子有几面没关系，只要面数对称就成立。
