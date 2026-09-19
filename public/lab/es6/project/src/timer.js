/**
 * timer.js —— 倒计时
 *
 * 这个文件没有业务语义，原样保留了逻辑：给定一个结束时间戳，
 * 每秒刷新一次剩余时间，归零时触发回调。
 *
 * 值得看的三个点：
 *   1. **时间拆解用整除法**：先算天数，再把天数占的部分减掉算小时，
 *      一层层往下。用 1000/60/60/24 这些常量配合 Math.floor 就够了，
 *      不需要引入日期库。
 *   2. **闭包捕获 self**：setTimeout 里的回调如果直接用 this，
 *      指向会变；所以提前把 this 存进 self。这是 ES6 箭头函数出现之前
 *      的标准做法——本项目里两种写法都有，可以对照着看。
 *   3. **递归式轮询**：setTimeout 每秒调自己一次，而不是 setInterval。
 *      好处是每次都是「上一次执行完之后」再排下一次，不会被积压的任务挤爆。
 */

class Timer {
    /**
     * @param {number}   end     结束时间戳（毫秒）
     * @param {Function} update  每次刷新时调用，收到格式化后的字符串
     * @param {Function} handle  归零时调用
     */
    countdown(end, update, handle) {
        const now = new Date().getTime();
        const self = this;

        // 已经过点了，直接触发结束回调
        if (now - end > 0) {
            handle.call(self);
        } else {
            let last_time = end - now;
            const px_d = 1000 * 60 * 60 * 24;
            const px_h = 1000 * 60 * 60;
            const px_m = 1000 * 60;
            const px_s = 1000;

            let d = Math.floor(last_time / px_d);
            let h = Math.floor((last_time - d * px_d) / px_h);
            let m = Math.floor((last_time - d * px_d - h * px_h) / px_m);
            let s = Math.floor(
                (last_time - d * px_d - h * px_h - m * px_m) / px_s
            );

            // 从最大的单位开始拼，前面的为 0 就跳过不显示。
            // 比如剩余 3 分钟时，只显示「3分0秒」，不会显示「0天0时」。
            let r = [];
            if (d > 0) {
                r.push(`<em>${d}</em>天`);
            }
            if (r.length || h > 0) {
                r.push(`<em>${h}</em>时`);
            }
            if (r.length || m > 0) {
                r.push(`<em>${m}</em>分`);
            }
            if (r.length || s > 0) {
                r.push(`<em>${s}</em>秒`);
            }

            self.last_time = r.join('');
            update.call(self, r.join(''));

            setTimeout(function () {
                self.countdown(end, update, handle);
            }, 1000);
        }
    }
}

export default Timer;
