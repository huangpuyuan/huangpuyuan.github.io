# 中心极限定理 + Julia 性能对比
#
# 从均匀分布里取 500 个数算平均，重复 100 万次，看这 100 万个均值落在哪。
# 中心极限定理说：不管原始分布长什么样，样本均值的分布会趋近正态。
# 所以 1% 和 99% 分位数之间应该正好盖住 98% 的均值。
#
# 两种写法做同一件事，第二版快几十倍：
#   慢：先建空数组，再 push! 往里塞
#   快：直接用数组推导式一次性生成
#
# 这是站里《Julia 的性能实测》那篇文章的实证代码。

using Random
using Statistics
using Printf

const REPEATS = 10^6      # 重复多少次
const SAMPLE = 5 * 10^2   # 每次取多少个样本

rng = MersenneTwister(42)

@printf("重复 %d 次，每次取 %d 个均匀随机数求均值\n\n", REPEATS, SAMPLE)

# ── 写法一：预分配 + push! ─────────────────────────────────────
# 这是从 Python 带过来的习惯写法，在 Julia 里会慢很多，
# 因为 push! 要不断检查容量、必要时重新分配内存。
print("慢写法（push!）：")
@time begin
    data = Float64[]
    for _ in 1:REPEATS
        group = Float64[]
        for _ in 1:SAMPLE
            push!(group, rand(rng))
        end
        push!(data, mean(group))
    end
    lo, hi = quantile(data, 0.01), quantile(data, 0.99)
    @printf("98%% 的均值落在 (%.4f, %.4f)，宽度 %.4f\n", lo, hi, hi - lo)
end

# ── 写法二：数组推导式 ─────────────────────────────────────────
# 一行搞定，Julia 能把它编译成高效的循环，
# 中间不产生临时数组，也不做容量检查。
print("快写法（推导式）：")
@time begin
    data = [mean(rand(rng, SAMPLE)) for _ in 1:REPEATS]
    lo, hi = quantile(data, 0.01), quantile(data, 0.99)
    @printf("98%% 的均值落在 (%.4f, %.4f)，宽度 %.4f\n", lo, hi, hi - lo)
end

# 理论值：均匀分布的方差是 1/12 ≈ 0.0833，
# 500 个样本均值的标准差 = sqrt(1/12/500) ≈ 0.0129。
# 正态分布 1%~99% 区间对应 ±2.326 个标准差，半宽约 0.030，
# 全宽约 0.060。跑出来的数字应该和这个量级一致。
@printf("\n理论宽度 ≈ 2 × 2.326 × sqrt(1/12/%d) = %.4f\n",
        SAMPLE, 2 * 2.326 * sqrt(1/12/SAMPLE))
