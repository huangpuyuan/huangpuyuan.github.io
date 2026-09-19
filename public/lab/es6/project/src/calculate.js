/**
 * calculate.js —— 组合运算
 *
 * 这个文件是全项目技术含量最高的部分：**手写组合数生成**。
 *
 * 给定一个数组和数量 k，枚举出所有「取 k 个」的组合。比如
 *   combine([a, b, c], 2)  →  [[a,b], [a,c], [b,c]]
 *
 * 数学上组合数可以用公式算：
 *   C(n, k) = n! / (k! × (n - k)!)
 * 但原代码选择**真的把每种组合列出来**，因为它们后面要逐条展示。
 *
 * 业务语义已经剥离干净——这个文件只做排列组合，不认识任何具体场景。
 */

class Calculate {
    /**
     * 计算组合数量。
     *
     * 先把选中个数 active 变成一个长度 active 的占位数组，
     * 再对这个数组求「取 size 个」的组合——因为我们只关心**数量**，
     * 不关心元素本身是什么，用占位符就够了。
     *
     * 这是原代码的一个巧思：原本需要知道「选了哪几个号」，
     * 但组合数只取决于「选了几个」，所以用一个填充数组就能算。
     *
     * @param {number} active     选中元素个数
     * @param {string} play_name  分组标识，如 'r5'
     * @return {number}           组合数
     */
    computeCount(active, play_name) {
        let count = 0;
        // 用 Map 判断分组是否存在。这里原注释写的是「Set」，
        // 但 this.play_list 是 Map——Map 和 Set 都有 .has()，容易看混。
        const exist = this.play_list.has(play_name);
        // new Array(n).fill(v)：ES6 快速构造定长数组的写法。
        // 老写法是 Array(n).join() 或循环 push，都啰嗦。
        const arr = new Array(active).fill('0');
        if (exist && play_name.at(0) === 'r') {
            count = Calculate.combine(arr, play_name.split('')[1]).length;
        }
        return count;
    }

    /**
     * 计算权重范围。
     *
     * 业务含义已经完全剥离，这里只剩**组合数 × 权重**这一步数值计算。
     *
     * 原代码这段逻辑很长（几十行 if/else 嵌套），推的是「命中数最少/最多的情形」。
     * 那部分是具体的玩法规则，不适合保留——所以这里只保留
     * 「算出最少组合数和最多组合数，各自乘以权重」这个骨架。
     *
     * @param {number} active     选中元素个数
     * @param {string} play_name  分组标识
     * @return {number[]}         [最小权重和, 最大权重和]
     */
    computeBonus(active, play_name) {
        const play = play_name.split('');
        const self = this;

        // size 是该分组要求取几个元素
        const size = play[1] * 1;

        // 最少组合数：选中个数刚好够取 size 个时，只有 1 种
        // 最多组合数：从全部可选元素里取，是理论上限
        let min = active >= size ? 1 : 0;
        let max = Calculate.combine(new Array(active).fill(0), Math.min(size, active)).length;

        return [min, max].map((item) => item * self.play_list.get(play_name).weight);
    }

    /**
     * 生成所有组合 —— 类的静态方法。
     *
     * 静态方法（static）的特点是**不依赖实例状态**，可以直接用类名调用：
     *   Calculate.combine(arr, 2)
     *
     * 这个算法值得逐行看。它是一个递归下降的过程：
     *
     *   要在 [1,2,3,4] 里取 2 个：
     *     取第 0 个 1，剩下 [2,3,4] 里取 1 个 → [1,2] [1,3] [1,4]
     *     取第 1 个 2，剩下 [3,4]   里取 1 个 → [2,3] [2,4]
     *     取第 2 个 3，剩下 [4]     里取 1 个 → [3,4]
     *     取第 3 个 4，剩下 []      里取 1 个 → 不够，返回
     *
     * 关键在 `newArr.splice(0, i + 1)`：把「已经用过的」和「当前这个」
     * 一起切掉，保证后面不会回头取——这样就不会产生 [2,1] 这种重复排列。
     *
     * 用 IIFE（立即执行函数）包起来调用，是因为递归函数需要个名字 `f`，
     * 但又不想把它暴露到外层作用域。原注释提到「如果是用 arguments.callee
     * 就得用匿名函数」——arguments.callee 在严格模式下已禁用（ES5 起），
     * 所以这种具名函数表达式的写法才是对的。
     *
     * @param {Array} arr    参与组合的数据
     * @param {number} size  每组取几个
     * @return {Array[]}     所有组合
     */
    static combine(arr, size) {
        let allResult = [];
        (function f(arr, size, result) {
            let arrLen = arr.length;
            // 剩余元素不够取了，这条路走不通
            if (size > arrLen) {
                return;
            }
            // 恰好够：把剩余全部拿走，这就是一个完整组合
            if (size === arrLen) {
                allResult.push([].concat(result, arr));
            } else {
                for (let i = 0; i < arrLen; i++) {
                    let newResult = [].concat(result);
                    newResult.push(arr[i]);
                    if (size === 1) {
                        // 只要 1 个，当前这个就是一个组合
                        allResult.push(newResult);
                    } else {
                        // 还要更多，往后找——splice(0, i+1) 是关键
                        let newArr = [].concat(arr);
                        newArr.splice(0, i + 1);
                        f(newArr, size - 1, newResult);
                    }
                }
            }
        })(arr, size, []);
        return allResult;
    }
}

export default Calculate;
