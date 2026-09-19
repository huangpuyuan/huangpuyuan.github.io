/**
 * base.js —— 基础模块
 *
 * 原项目是一个「选号 → 组合 → 结算」的交互应用。这里把业务语义全部抽象掉了：
 *
 *   原称呼        本文件里的称呼      说明
 *   ----------    ---------------    --------------------------------
 *   彩种 / 玩法   group（分组）      一组可选元素的集合
 *   号码          item（元素）       分组里的单个元素
 *   注数          combos（组合数）   从选中元素里取 k 个的组合数量
 *   奖金 / 赔率   weight（权重）     每个分组自带的一个数值参数
 *
 * 这样保留下来的就只是**代码结构**：
 *   - 用 Map 存「分组 → 配置」的映射表
 *   - 用 Set 存元素集合（天然去重）
 *   - 用 class 把状态和方法组织在一起
 *   - 用模板字符串拼 DOM 片段
 *
 * 至于原项目那套玩法规则、金额计算、盈亏提示——都与具体业务绑定，
 * 这里不做保留，也不应保留。
 *
 * ## 怎么读这个文件
 *
 * 这里是**原样保留的核心逻辑**，不是重写版——因为要看的正是「2017 年怎么写 ES6」。
 * 所以：
 *   - 仍然 `import $ from 'jquery'`，DOM 操作用 jQuery（当年的默认选择）
 *   - 仍然用 `$(e.currentTarget)`、`addClass()` 这套写法
 *   - 只有**业务语义**被换成了抽象占位符，结构一行没动
 *
 * 页面上的 /lab/es6/project/demo/ 演示是**同样的逻辑用原生 JS 重写**的，
 * 不含 jQuery，为的是能在这个站点上 0 依赖直接跑。两者对照着看，
 * 能看出「jQuery 做的事，现在原生 API 也能做」。
 */
import $ from 'jquery';

class Base {
    /**
     * 初始化分组表。
     *
     * 用 Map 而不是普通对象，好处是：
     *   1. 键可以是任意类型，不只是字符串
     *   2. 天然有序，遍历顺序就是插入顺序
     *   3. 有 .size / .has() / .get() 这些明确的方法
     *
     * 原代码在这里存的是「任二 / 任三 / 任四 …」这类玩法名和对应奖金，
     * 抽象之后变成一个纯粹的分组配置表：分组名 + 该组取几个元素 + 一个权重值。
     */
    initPlayList() {
        this.play_list
            .set('r2', { weight: 6, size: 2, name: '组合二' })
            .set('r3', { weight: 19, size: 3, name: '组合三' })
            .set('r4', { weight: 78, size: 4, name: '组合四' })
            .set('r5', { weight: 540, size: 5, name: '组合五' })
            .set('r6', { weight: 90, size: 6, name: '组合六' })
            .set('r7', { weight: 26, size: 7, name: '组合七' })
            .set('r8', { weight: 9, size: 8, name: '组合八' });
    }

    /**
     * 初始化元素集合：01 到 11，共 11 个元素。
     *
     * 两个细节：
     *   - 用 Set 存，重复添加会自动忽略
     *   - padStart(2, '0') 补零，让 "1" 变成 "01"，排序和显示都整齐
     *     （这是 ES2017 的方法，当年还属于「新语法」）
     */
    initNumber() {
        for (let i = 1; i < 12; i++) {
            this.number.add(('' + i).padStart(2, '0'));
        }
    }

    /**
     * 写入「遗漏值」数据。
     *
     * 这里演示的是 Map 的遍历写法：`for (let [k, v] of map)` 直接解构出键值对，
     * 比 `map.forEach` 更直观，也支持 break / continue。
     */
    setOmit(omit) {
        let self = this;
        self.omit.clear();
        for (let [index, item] of omit.entries()) {
            self.omit.set(index, item);
        }
        $(self.omit_el).each(function (index, item) {
            $(item).text(self, omit.get(index));
        });
    }

    /**
     * 写入一组「当前结果」元素。
     *
     * Set 的 clear() + add() 用来整体替换集合内容。
     * `updateOpenCode` 是一个可选钩子——子类如果定义了它就调用，
     * 没定义也不会报错，这是模板方法模式的简单用法。
     */
    setOpenCode(code) {
        let self = this;
        self.open_code.clear();
        for (let item of code.values()) {
            self.open_code.add(item);
        }
        self.updateOpenCode && self.updateOpenCode.call(self, code);
    }

    /**
     * 切换单个元素的选中状态。
     *
     * toggleClass 是 jQuery 的常用写法，等价于
     *   if (has) removeClass(); else addClass();
     */
    toggleCodeActive(e) {
        let self = this;
        let $cur = $(e.currentTarget);
        $cur.toggleClass('btn-boll-active');
        self.getCount();
    }

    /**
     * 切换分组。
     *
     * siblings() 取同级元素统一取消高亮，保证同一时刻只有一个分组处于选中态。
     */
    changePlayNav(e) {
        let self = this;
        let $cur = $(e.currentTarget);
        $cur.addClass('active').siblings().removeClass('active');
        self.cur_play = $cur.attr('desc').toLocaleLowerCase();
        $('#zx_sm span').html(self.play_list.get(self.cur_play).name);
        $('.boll-list .btn-boll').removeClass('btn-boll-active');
        self.getCount();
    }

    /**
     * 快捷选择：全选 / 大 / 小 / 奇 / 偶。
     *
     * 这段是纯粹的数组筛选演示——根据 index 判断用哪种规则，
     * 然后遍历所有元素，符合规则的加上选中样式。
     */
    assistHandle(e) {
        e.preventDefault();
        let self = this;
        let $cur = $(e.currentTarget);
        let index = $cur.index();
        $('.boll-list .btn-boll').removeClass('btn-boll-active');
        if (index === 0) {
            $('.boll-list .btn-boll').addClass('btn-boll-active');
        }
        if (index === 1) {
            $('.boll-list .btn-boll').each(function (i, t) {
                if (t.textContent - 5 > 0) $(t).addClass('btn-boll-active');
            });
        }
        if (index === 2) {
            $('.boll-list .btn-boll').each(function (i, t) {
                if (t.textContent - 6 < 0) $(t).addClass('btn-boll-active');
            });
        }
        if (index === 3) {
            $('.boll-list .btn-boll').each(function (i, t) {
                if (t.textContent % 2 == 1) $(t).addClass('btn-boll-active');
            });
        }
        if (index === 4) {
            $('.boll-list .btn-boll').each(function (i, t) {
                if (t.textContent % 2 == 0) $(t).addClass('btn-boll-active');
            });
        }
        self.getCount();
    }

    getName() {
        return this.name();
    }

    /**
     * 把当前选中的元素加进列表。
     *
     * `/\\d{2}/g` 从文本里抠出所有两位数——因为显示的是 "01 02 03" 这种格式。
     */
    addCode() {
        let self = this;
        let $active = $('.boll-list .btn-boll-active').text().match(/\d{2}/g);
        let active = $active ? $active.length : 0;
        let count = self.computeCount(active, self.cur_play);
        if (count) {
            self.addCodeItem(
                $active.join(' '),
                self.cur_play,
                self.play_list.get(self.cur_play).name,
                count
            );
        }
    }

    /**
     * 渲染单条记录——这里用模板字符串拼 HTML 片段。
     *
     * 注意 `${count > 1 ? '复式' : '单式'}` 这种写法：模板字符串里可以直接写表达式，
     * 比字符串拼接可读得多。
     */
    addCodeItem(code, type, typeName, count) {
        let self = this;
        const tpl = `
        <li codes="${type}|${code}" count="${count}">
         <div class="code">
             <b>${typeName}${count > 1 ? '（多组）' : '（单组）'}</b>
             <b class="em">${code}</b>
             [共 <em class="code-list-money">${count}</em> 种组合]
         </div>
        </li>
        `;
        $(self.cart_el).append(tpl);
        self.getTotal();
    }

    /**
     * 更新选中提示。
     *
     * 抽象之后这里只报告「选了 n 个元素，能组成 m 种组合」，
     * 不再做任何金额或盈亏推算。
     */
    getCount() {
        let self = this;
        let active = $('.boll-list .btn-boll-active').length;
        let count = self.computeCount(active, self.cur_play);
        let tpl =
            count === 0
                ? `已选 <b class="red">0</b> 个元素，还不足以组成组合`
                : `选中 <b class="red">${active}</b> 个元素，` +
                  `按「${self.play_list.get(self.cur_play).name}」可组成 ` +
                  `<b class="red">${count}</b> 种组合`;
        $('.sel_info').html(tpl);
    }

    /**
     * 汇总列表里的组合总数。
     *
     * `attr('count') * 1` 是把字符串转成数字的老写法，
     * 现在更常用 Number() 或 parseInt()。
     */
    getTotal() {
        let count = 0;
        $('.codelist li').each(function (index, item) {
            count += $(item).attr('count') * 1;
        });
        $('#count').text(count);
    }

    /**
     * 从元素集合里随机取 num 个不重复的元素。
     *
     * 算法是「洗牌式抽样」：每次随机取一个下标，取走并 splice 掉。
     * 因为 splice 会缩短数组，所以下次随机范围自然变小，不会重复取到同一个。
     *
     * Array.from(this.number) 把 Set 转成数组——这是 Set 转数组最直接的写法。
     */
    getRandom(num) {
        let arr = [], index;
        let number = Array.from(this.number);
        while (num--) {
            index = Number.parseInt(Math.random() * number.length);
            arr.push(number[index]);
            number.splice(index, 1);
        }
        return arr.join(' ');
    }

    /**
     * 批量生成随机组合。
     *
     * `count="0"` 表示清空列表，是原代码里一个约定俗成的写法。
     */
    getRandomCode(e) {
        e.preventDefault();
        let num = e.currentTarget.getAttribute('count');
        let play = this.cur_play.match(/\d+/g)[0];
        let self = this;
        if (num === '0') {
            $(self.cart_el).html('');
        } else {
            for (let i = 0; i < num; i++) {
                self.addCodeItem(
                    self.getRandom(play),
                    self.cur_play,
                    self.play_list.get(self.cur_play).name,
                    1
                );
            }
        }
    }
}

export default Base;
