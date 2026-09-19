/**
 * interface.js —— 数据接口层
 *
 * 这一层的作用是**把「取数据」这件事单独隔离出来**：
 * Base 只管状态和渲染，Timer 只管倒计时，谁来喂数据是 Interface 的事。
 *
 * 三个方法长得几乎一样，都是「包一层 Promise」。所以重点看这个模式：
 *
 *   getXxx(arg) {
 *       return new Promise((resolve, reject) => {
 *           异步请求(...)
 *             .成功 → resolve(结果)
 *             .失败 → reject(错误)
 *       });
 *   }
 *
 * 这就是所谓的 **Promise 化**（promisify）——把回调式 API 包成 Promise，
 * 调用方就能用 .then() 串起来，或者用 async/await 写同步风格的代码。
 *
 * 原项目这里用的是 jQuery 的 $.ajax（成功回调 / 失败回调）。
 * 抽象之后换成 fetch()，并用一个本地的静态数据源代替真实接口——
 * 因为原项目调的是业务后端，这里既没有也不应该有。
 *
 * 顺带提一个原代码里的细节：
 *   success: function (res) { resolve.call(self, res); }
 * 这里的 .call(self, ...) 其实是多余的——resolve 不依赖 this 指向。
 * 属于「防御性写法写过头」的例子，留个印象就行。
 */

class Interface {
    /**
     * 取得一组「统计值」。
     *
     * @param {string} issue 时间标识（原为「期号」，这里抽象成字符串 ID）
     * @return {Promise<Map>}
     */
    getOmit(issue) {
        let self = this;
        return new Promise((resolve, reject) => {
            fetch('/lab/es6/project/data/omit.json')
                .then((res) => res.json())
                .then((res) => {
                    self.setOmit(res.data);
                    resolve(res);
                })
                .catch((err) => reject(err));
        });
    }

    /**
     * 取得一组「当前结果」元素。
     *
     * fetch + Promise 的另一种写法：把回调链写平，不用嵌套。
     * 对比 getState 里的写法可以看到，同样的事有好几种组织方式。
     *
     * @param {string} issue
     * @return {Promise<Object>}
     */
    getOpenCode(issue) {
        let self = this;
        return new Promise((resolve, reject) => {
            fetch('/lab/es6/project/data/opencode.json')
                .then((res) => res.json())
                .then((res) => {
                    self.setOpenCode(res.data);
                    resolve(res);
                })
                .catch((err) => reject(err));
        });
    }

    /**
     * 取得当前状态：时间标识、结束时间、状态字。
     *
     * 这里用 async 函数 + try/catch，是比 .then().catch() 更接近同步写法的方式。
     * 一个项目里混用几种风格很正常，关键是小范围内保持一致。
     *
     * @param {string} issue
     * @return {Promise<Object>}
     */
    getState(issue) {
        let self = this;
        return new Promise((resolve, reject) => {
            fetch('/lab/es6/project/data/state.json')
                .then((res) => res.json())
                .then((res) => resolve(res))
                .catch((err) => reject(err));
        });
    }
}

export default Interface;
