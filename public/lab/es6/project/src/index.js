/**
 * index.js —— 入口，也是整份代码技术上最值得看的地方
 *
 * ## 它在解决什么问题
 *
 * 前面四个模块各管一摊：
 *   Base       状态 + 渲染
 *   Calculate  组合运算
 *   Interface  取数据
 *   Timer      倒计时
 *
 * 现在需要一个主类把这四份能力**全部装上**。可是 JavaScript 的 class
 * 只有单继承（`extends` 只能写一个父类）——这是 ES6 class 的硬限制，
 * 不像 C++ 可以 `class A : public B, public C`。
 *
 * ## 原代码的解法：mix() 多重继承
 *
 * 思路是「**不通过继承链，而是把属性直接复制过去**」：
 *
 *   1. 造一个空的 Mix 类
 *   2. 遍历每个待混入的类
 *   3. 把它们**静态成员**和**原型方法**的「属性描述符」逐条抄到 Mix 上
 *   4. 让子类 extends 这个 Mix —— 于是四份能力就都有了
 *
 * ## 为什么要用 getOwnPropertyDescriptor 而不是直接赋值
 *
 * 直接 `target[key] = source[key]` 会把属性**拍平**：
 *   - getter / setter 会当场求值成普通值，之后再也不动态了
 *   - 不可写（writable: false）的属性会被强行改成可写
 *   - 不可枚举属性会变成可枚举
 *
 * 而 `Object.getOwnPropertyDescriptor` 拿到的是「属性本身怎么定义的」这一份
 * 完整说明（值、可写性、可枚举性、get/set），配合 `Object.defineProperty`
 * 原样搬过去，语义才不丢。
 *
 * 配合 `Reflect.ownKeys()` 使用——它比 `Object.keys()` 多返回 Symbol 键，
 * 而且是「自有属性」，不含原型链上的。这正是「完整搬运」需要的。
 *
 * ## 这个方案的问题
 *
 * 说实话，这种 mixin 写法有几个隐患，了解就好，不必照搬：
 *   - `instanceof` 对四个来源类都会返回 false，因为原型链上根本没有它们
 *   - 同名方法会静默覆盖，谁在后面谁赢，不报错
 *   - 属性来源分散在四个文件里，IDE 补全和跳转基本失效
 *
 * 现代替代方案是**组合优于继承**——把四个模块作为实例属性持有：
 *   this.timer = new Timer();  this.calc = new Calculate();
 * 需要什么调什么，调用链明确得多。这里保留原实现，是因为它作为
 * 「ES6 反射 API 的实战用例」很有教学价值。
 */

import Base from './base.js';
import Timer from './timer.js';
import Calculate from './calculate.js';
import Interface from './interface.js';

/**
 * 属性搬运：把 source 上的自有属性（含 Symbol 键）逐个复制到 target。
 *
 * @param {Object} target 目标
 * @param {Object} source 来源
 */
const copyProperties = function (target, source) {
    for (let key of Reflect.ownKeys(source)) {
        // 这三个是 class 自带的元属性，搬过去会乱套
        //   'prototype' / 'name' 是 Function 的标准属性
        //   'constructor' 指向构造函数本身
        if (key !== 'constructor' && key !== 'prototype' && key !== 'name') {
            let desc = Object.getOwnPropertyDescriptor(source, key);
            Object.defineProperty(target, key, desc);
        }
    }
};

/**
 * 多重继承：把若干类混成一个。
 *
 * 注意静态成员和原型方法要**分别搬运**：
 *   copyProperties(Mix, mixin)            → 搬静态成员
 *   copyProperties(Mix.prototype, mixin.prototype) → 搬实例方法
 *
 * 漏掉任何一份都会出现「有的方法能调、有的报 undefined」这种难查的问题。
 *
 * @param {...Function} mixins 要混入的类
 * @return {Function} 混合后的类
 */
const mix = function (...mixins) {
    class Mix {}
    for (let mixin of mixins) {
        copyProperties(Mix, mixin);
        copyProperties(Mix.prototype, mixin.prototype);
    }
    return Mix;
};

/**
 * 主类：把四份能力混进来。
 *
 * 构造函数里的默认值是 2017 年的写法，现在如果参数多了，
 * 更常见的是传一个配置对象（`constructor(options = {})`）。
 */
class Lottery extends mix(Base, Calculate, Interface, Timer) {
    constructor(name = 'demo', cname = '组合演示', issue = '**', state = '**') {
        super();
        this.name = name;
        this.cname = cname;
        this.issue = issue;
        this.el = '';

        // 用 Map 存「键 → 配置」，用 Set 存元素，都是 ES6 新增结构
        this.omit = new Map();
        this.open_code = new Set();
        this.open_code_list = new Set();
        this.play_list = new Map();
        this.number = new Set();

        // DOM 选择器集中放在这里，方便统一改
        this.issue_el = '#curr_issue';
        this.countdown_el = '#countdown';
        this.state_el = '.state_el';
        this.cart_el = '.codelist';
        this.omit_el = '';
        this.cur_play = 'r5';

        // 初始化：配分组表 → 填元素 → 拉状态 → 绑事件
        this.initPlayList();
        this.initNumber();
        this.updateState();
        this.initEvent();
    }

    /**
     * 拉状态并启动倒计时。
     *
     * 流程：取状态 → 写入页面 → 开倒计时 → 倒计时归零后
     * 延迟 500ms 重来一遍（那 500ms 是留给服务端换数据的缓冲）。
     */
    updateState() {
        let self = this;
        this.getState().then(function (res) {
            self.issue = res.issue;
            self.end_time = res.end_time;
            self.state = res.state;
            $(self.issue_el).text(res.issue);

            self.countdown(
                res.end_time,
                function (time) {
                    $(self.countdown_el).html(time);
                },
                function () {
                    setTimeout(function () {
                        self.updateState();
                        self.getOmit(self.issue).then(function () {});
                        self.getOpenCode(self.issue).then(function () {});
                    }, 500);
                }
            );
        });
    }

    /**
     * 事件绑定集中在一处。
     *
     * `bind(self)` 是 ES5 时代处理 this 指向的标准做法——
     * 不 bind 的话，事件回调里的 this 会指向触发事件的 DOM 元素。
     * 换成箭头函数 `(e) => self.fn(e)` 效果一样，写法更短。
     *
     * 注意这里用的是**事件委托**：绑在容器上而不是每个子元素上，
     * 所以后添加的元素也能自动响应，不用重新绑定。
     */
    initEvent() {
        let self = this;
        $('#plays').on('click', 'li', self.changePlayNav.bind(self));
        $('.boll-list').on('click', '.btn-boll', self.toggleCodeActive.bind(self));
        $('#confirm_sel_code').on('click', self.addCode.bind(self));
        $('.dxjo').on('click', 'li', self.assistHandle.bind(self));
        $('.qkmethod').on('click', '.btn-middle', self.getRandomCode.bind(self));
    }
}

export default Lottery;
