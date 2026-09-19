# 随机密码撞上真实密码的概率
#
# 问题：如果攻击者只能看"有几位猜对了"，猜 1000 万次能蒙中多少？
#
# 原版写于 2019-08，重写改动：
#   - Random.seed!() 无参调用已经废弃，换成带种子的 MersenneTwister
#   - 字符集用字符串拼接更直观，原版的 ['a':'z'; 'A':'Z'; '0':'9'] 也能跑，
#     但拼接后的类型是 Vector{Char}，这里显式写出来避免歧义
#   - 用 @time 报出耗时，1000 万次循环在 Julia 里是秒级的事

using Random
using Printf

const PASS_LENGTH = 8          # 密码长度
const CHARS = collect('a':'z') ∪ collect('A':'Z') ∪ collect('0':'9')
const CORRECT = "3xyZu4vN"     # 被猜的那个真实密码

rng = MersenneTwister(42)

# 数一下候选密码和真实密码有几位相同
num_match(candidate) = sum(candidate[i] == CORRECT[i] for i in 1:PASS_LENGTH)

# 只猜中 1 位就记为"泄露"
matches_needed = 1

# ── 理论值：至少猜中 1 位的概率 ────────────────────────────────
# 单位猜不中的概率是 (1 - 1/62)，8 位全猜不中是它的 8 次方，
# 用 1 减掉就是"至少中一位"。
theoretical = 1 - (1 - 1/length(CHARS))^PASS_LENGTH

# ── 蒙特卡洛：真掷 N 次 ────────────────────────────────────────
const N = 10^7

# 注意：这里把整个循环包成一个函数，而不是写在顶层。
# 顶层 for 里给 hits 赋值会踩中 Julia 的软作用域警告
# （"Assignment to hits in soft scope is ambiguous"），
# 包成函数后函数体是硬作用域，hits 就是普通的局部变量，语义明确。
# 顺带的好处：函数里的循环对编译器更友好，跑得更快。
function hit_count(rng, n, needed)
    hits = 0
    for _ in 1:n
        candidate = String(rand(rng, CHARS, PASS_LENGTH))
        if num_match(candidate) >= needed
            hits += 1
        end
    end
    return hits
end

# 先跑一次小的热身，把编译时间排除在计时之外
hit_count(rng, 10, matches_needed)
elapsed = @elapsed hits = hit_count(rng, N, matches_needed)

@printf("字符集大小            = %d\n", length(CHARS))
@printf("密码空间              = %d^%d ≈ %.2e\n", length(CHARS), PASS_LENGTH, Float64(length(CHARS))^PASS_LENGTH)
@printf("至少猜中 1 位的理论值 = %.6f\n", theoretical)
@printf("蒙特卡洛 %d 次        = %.6f  （命中 %d 次）\n", N, hits/N, hits)
@printf("耗时                  = %.2f 秒\n", elapsed)

# 结论：直觉上"密码空间大得吓人"，但只要猜的次数够多，
# 撞上哪怕一位的概率并不低。62^8 ≈ 2.18e14 看起来安全，
# 可 1000 万次尝试就能有约 12% 的命中率。
# 这也是为什么真实系统要限制尝试次数，而不是只靠密码长度。
