/**
 * build-es6-project.mjs —— 为 ES6learning 的「组合选择器」项目生成演示页
 *
 * ## 背景与合规说明
 *
 * 原项目是一个 2017 年跟着教程写的交互应用，业务内容是彩票选号。**本项目只保留它的
 * 软件工程部分**，业务语义已全部抽象化，理由有两条：
 *
 *   1. 合规：彩票在中国境内属于特许经营业务，把选号、注数、奖金、盈亏计算做成
 *      可公开访问的页面是不合适的。原代码里的玩法名称和奖金数值全部不保留。
 *   2. 教学：这个项目真正的价值在于「555 行代码如何分层组织」，而不在于它选了
 *      什么号。抽象之后，技术点反而看得更清楚。
 *
 * 抽象映射见 public/lab/es6/project/src/base.js 顶部注释。
 *
 * ## 产出
 *
 *   /lab/es6/project/demo/             可交互演示（组合运算 + 倒计时 + 数据层）
 *   /lab/es6/project/architecture.html 架构讲解：四个模块怎么分层、mix() 多重继承怎么工作
 *
 * 数据源用静态 JSON 模拟（public/lab/es6/project/data/*.json），不连接任何真实接口。
 */
import { writeFileSync, mkdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));

/**
 * 输出分成三块：
 *   src/pages/lab/es6/project/demo.html       可交互演示页（在路由目录里，绕开冲突）
 *   public/lab/es6/project/architecture.html  架构讲解（纯静态，不与路由同名）
 *   public/lab/es6/project/{src,data}/        源码与模拟数据
 *
 * 注意别往 public/lab/es6/project/index.html 写：讲解篇目的路由
 * /lab/es6/project/ 也落在 dist/lab/es6/project/index.html，两者会互相覆盖。
 * 同理架构页用 .html 后缀而不是目录形式，就不会撞上任何路由。
 */
const ROUTE = path.join(here, '..', 'src', 'pages', 'lab', 'es6', 'project');
const PUB = path.join(here, '..', 'public', 'lab', 'es6', 'project');

mkdirSync(ROUTE, { recursive: true });
mkdirSync(PUB, { recursive: true });
mkdirSync(path.join(PUB, 'data'), { recursive: true });

/* 清掉旧的、会与路由冲突的产物 */
for (const stale of [path.join(PUB, 'index.html')]) {
  try {
    rmSync(stale);
    console.log('已清理与路由冲突的旧产物 ' + path.relative(here, stale));
  } catch {}
}

/* ---------------------------------------------------------------- 模拟数据 */

// 时间标识与状态：用固定的演示值，不代表任何真实业务
const state = {
  issue: 'DEMO-0001',
  end_time: Date.now() + 1000 * 60 * 12,
  state: 'ready'
};

// 「遗漏值」：每个元素一个统计数字，仅用于演示 Map 的遍历与渲染
const omit = {
  data: [
    ['01', 3], ['02', 7], ['03', 1], ['04', 12], ['05', 5], ['06', 8],
    ['07', 2], ['08', 9], ['09', 4], ['10', 6], ['11', 11]
  ]
};

// 当前结果元素：一组供展示的示例值
const opencode = {
  data: ['02', '05', '07', '09', '11']
};

writeFileSync(path.join(PUB, 'data', 'state.json'), JSON.stringify(state, null, 2));
writeFileSync(path.join(PUB, 'data', 'omit.json'), JSON.stringify(omit, null, 2));
writeFileSync(path.join(PUB, 'data', 'opencode.json'), JSON.stringify(opencode, null, 2));

/**
 * 给每个 <table> 外面套一层 <div class="tablewrap">。
 * 这样窄屏下横滚只发生在表格内部，整页不会溢出——
 * 这正是 layout-audit 在 320px 抓到的问题。
 */
function wrapTables(html) {
  return html.replace(/<table\b[^>]*>[\s\S]*?<\/table>/g, (t) => '<div class="tablewrap">' + t + '</div>');
}

/**
 * 导航：两个页面在 URL 上不在同一层
 *   /lab/es6/project/demo/               （演示页，来自 src/pages/lab/es6/project/demo.html）
 *   /lab/es6/project/architecture.html   （架构页，来自 public/...）
 * 所以这里的链接一律用站点根绝对路径，别用 ./ 或 ../——那会因为「页面实际层级」
 * 和「源文件所在目录」不一致而走错。
 */
const NAV = `<nav class="nav"><a href="/lab/es6/project/demo/">项目演示</a><a href="/lab/es6/project/architecture.html">架构讲解</a><a href="/lab/es6/project/">讲解正文</a></nav>`;

function shell({ title, eyebrow, body, extraStyle = '', extraScript = '' }) {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
<style>
  html, body { margin: 0; }
  body {
    font: 15px/1.7 ui-sans-serif, -apple-system, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
    color: #0b0f14; background: #fff;
  }
  header { padding: 16px 20px; border-bottom: 1px solid #e2e6eb; }
  header h1 { font-size: 15px; margin: 0; }
  header .eb {
    font: 600 11px/1 ui-monospace, Consolas, monospace; letter-spacing: .14em;
    text-transform: uppercase; color: #9aa2ab; display: block; margin-bottom: 8px;
  }
  .note {
    margin: 0; padding: 14px 20px; background: #fffdf3;
    border-bottom: 1px solid #ece4cc; font-size: 13px; color: #6b5d33;
  }
  .note code { font-family: ui-monospace, Consolas, Menlo, monospace; font-size: 12px;
    background: #f5efdc; padding: 1px 4px; border-radius: 3px; }
  .note strong { color: #8a6d1f; }
  .wrap { padding: 20px; max-width: 900px; }
  h2 { font-size: 14px; margin: 28px 0 12px; letter-spacing: .02em; }
  h2:first-child { margin-top: 0; }
  p { color: #3a4149; font-size: 14px; }
  .src {
    margin: 0; padding: 16px 18px; background: #fbfcfd; border: 1px solid #e2e6eb;
    border-radius: 6px;
    font: 12.5px/1.8 ui-monospace, SFMono-Regular, Consolas, Menlo, monospace;
    white-space: pre-wrap; word-break: break-word; color: #3a4149;
  }
  .src-label {
    margin: 18px 0 6px; font: 600 11px/1 ui-monospace, Consolas, monospace;
    letter-spacing: .12em; text-transform: uppercase; color: #8a929c;
  }
  .demo { border: 1px solid #e2e6eb; border-radius: 8px; padding: 18px; background: #fcfdfe; }
  .row { display: flex; flex-wrap: wrap; gap: 8px; margin: 10px 0; align-items: center; }
  .row .lbl { font-size: 12px; color: #8a929c; min-width: 68px; }
  .ball {
    display: inline-flex; align-items: center; justify-content: center;
    width: 36px; height: 36px; border-radius: 50%;
    border: 1.5px solid #d5dae1; background: #fff; cursor: pointer;
    font: 13px/1 ui-monospace, Consolas, monospace; color: #3a4149;
    transition: .12s; user-select: none;
  }
  .ball:hover { border-color: #9aa2ab; }
  .ball.on { background: #2f6fed; border-color: #2f6fed; color: #fff; font-weight: 600; }
  .chip {
    display: inline-block; padding: 5px 11px; border: 1px solid #d5dae1; border-radius: 999px;
    background: #fff; cursor: pointer; font-size: 12.5px; color: #3a4149; transition: .12s;
  }
  .chip:hover { border-color: #9aa2ab; }
  .chip.on { background: #0b0f14; border-color: #0b0f14; color: #fff; }
  .out {
    margin-top: 14px; padding: 13px 15px; background: #0b0f14; border-radius: 6px;
    font: 12.5px/1.85 ui-monospace, Consolas, Menlo, monospace; color: #d7dde5;
    white-space: pre-wrap; min-height: 24px;
  }
  .out b { color: #6fd08c; font-weight: 600; }
  .out .dim { color: #7c8794; }
  /* 表格：窄屏下不能把页面撑宽。
     width:100% 只保证「不超过容器」，单元格里的长内容（尤其是不换行的长标识符）
     仍会顶出最小宽度，所以这里补 table-layout:fixed + overflow-wrap，
     再包一层可横向滚动的容器，把溢出限制在表格内部而不是整页。 */
  table { border-collapse: collapse; width: 100%; font-size: 13px; margin: 12px 0; table-layout: fixed; }
  th, td {
    border: 1px solid #e2e6eb; padding: 7px 10px; text-align: left;
    overflow-wrap: anywhere; word-break: break-word; hyphens: auto;
  }
  th { background: #f6f8fa; font-weight: 600; font-size: 12.5px; }
  td code {
    font-family: ui-monospace, Consolas, monospace; font-size: 12px; color: #b13a3a;
    overflow-wrap: anywhere;
  }
  /* 表格外壳：只有表格自己能横滚，页面本身不滚 */
  .tablewrap { max-width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; }
  .tablewrap table { margin: 0; }
  @media (max-width: 560px) {
    /* 极窄屏下三个字一组的表头挤在一起很丑，缩小字号和内边距 */
    table { font-size: 12px; }
    th, td { padding: 5px 6px; }
  }
  .nav { padding: 12px 20px; border-bottom: 1px solid #e2e6eb; font-size: 13px; }
  .nav a { color: #2f6fed; text-decoration: none; margin-right: 16px; }
  .nav a:hover { text-decoration: underline; }
  .timer { font: 600 20px/1.4 ui-monospace, Consolas, monospace; color: #0b0f14; }
  .timer em { font-style: normal; color: #2f6fed; }
  ${extraStyle}
</style>
</head>
<body>
<header>
  <span class="eb">${eyebrow}</span>
  <h1>${title}</h1>
</header>
${NAV}
${wrapTables(body)}
${extraScript}
</body>
</html>
`;
}

/* --------------------------------------------------------------- 总览页 */

const indexBody = `
<div class="note">
  <strong>关于这个演示</strong>：原项目是一份 2017 年的学习代码，业务内容是彩票选号。
  这里<strong>只保留其中的软件工程部分</strong>——业务语义（彩种、玩法、金额、盈亏）
  全部做了抽象化处理，不保留、也不应保留。下面演示的是<strong>组合运算</strong>和
  <strong>倒计时</strong>这两个纯技术组件。
</div>

<div class="wrap">

  <h2>这个项目在做什么</h2>
  <p>
    从 11 个元素里选若干，按不同「分组规则」计算出能组成多少种组合，并实时显示结果。
    整个应用由四个模块拼起来：
  </p>

  <table>
    <thead>
      <tr><th>模块</th><th>职责</th><th>用到的 ES6+ 特性</th></tr>
    </thead>
    <tbody>
      <tr><td><code>base.js</code></td><td>状态管理与 DOM 渲染</td><td>Map / Set / 模板字符串 / padStart / 参数默认值</td></tr>
      <tr><td><code>calculate.js</code></td><td>组合数枚举</td><td>静态方法 / 递归 / Array.fill / Array.at</td></tr>
      <tr><td><code>interface.js</code></td><td>数据获取</td><td>Promise / 箭头函数 / fetch</td></tr>
      <tr><td><code>timer.js</code></td><td>倒计时</td><td>闭包 / 递归 setTimeout / 解构</td></tr>
      <tr><td><code>index.js</code></td><td>把四个模块合成一个主类</td><td>Rest 参数 / 展开 / Reflect / 属性描述符</td></tr>
    </tbody>
  </table>

  <h2>① 组合运算演示</h2>
  <p>
    下面这段是真的在跑 <code>Calculate.combine()</code>——就是从选中元素里枚举出所有
    「取 k 个」的组合。点元素选号，切换分组规则，看组合数怎么变。
  </p>

  <div class="demo" id="combo">
    <div class="row">
      <span class="lbl">元素</span>
      <span id="balls"></span>
    </div>
    <div class="row">
      <span class="lbl">组合规则</span>
      <span id="plays"></span>
    </div>
    <div class="row">
      <span class="lbl">快捷</span>
      <span class="chip" data-quick="all">全选</span>
      <span class="chip" data-quick="none">清空</span>
      <span class="chip" data-quick="big">大数</span>
      <span class="chip" data-quick="small">小数</span>
      <span class="chip" data-quick="odd">奇数</span>
      <span class="chip" data-quick="even">偶数</span>
    </div>
    <div class="out" id="out"></div>
    <p style="font-size:12.5px;color:#8a929c;margin:10px 0 0">
      组合数是一个纯数学结果：从 n 个里取 k 个，就是 C(n, k)。
      上面显示的是 <strong>真的枚举出来的组合个数</strong>，不是用公式算的。
    </p>
  </div>

  <h2>② 倒计时演示</h2>
  <p>
    直接跑 <code>Timer.countdown()</code>。它的时间拆解用整除法一层层往下算，
    刷新用递归 <code>setTimeout</code> 而不是 <code>setInterval</code>。
  </p>

  <div class="demo">
    <div class="row">
      <span class="lbl">剩余</span>
      <span class="timer" id="countdown">—</span>
    </div>
    <div class="row">
      <span class="chip" id="restart">重置为 30 秒后再跑一次</span>
    </div>
    <p style="font-size:12.5px;color:#8a929c;margin:10px 0 0">
      剩余时间不足某个单位时，那个单位会自动省略——所以你会看到「12分3秒」而不是「0天0时12分3秒」。
    </p>
  </div>

  <h2>③ 数据层演示</h2>
  <p>
    <code>Interface</code> 把「取数据」单独隔离出来，三个方法都是同一个模式：
    用 Promise 包一层异步请求。这里读的是本地静态 JSON，不连接任何服务。
  </p>
  <div class="demo">
    <div class="row">
      <span class="chip" id="loadstate">getState()</span>
      <span class="chip" id="loadomit">getOmit()</span>
      <span class="chip" id="loadopen">getOpenCode()</span>
    </div>
    <div class="out" id="ioout">点上面的按钮，看 Promise 返回什么。</div>
  </div>

</div>
`;

const indexScript = `
<script>
// ===== 组合运算演示：直接复刻 calculate.js 的 combine 算法 =====
function combine(arr, size) {
  let allResult = [];
  (function f(arr, size, result) {
    let arrLen = arr.length;
    if (size > arrLen) return;
    if (size === arrLen) {
      allResult.push([].concat(result, arr));
    } else {
      for (let i = 0; i < arrLen; i++) {
        let newResult = [].concat(result);
        newResult.push(arr[i]);
        if (size === 1) {
          allResult.push(newResult);
        } else {
          let newArr = [].concat(arr);
          newArr.splice(0, i + 1);
          f(newArr, size - 1, newResult);
        }
      }
    }
  })(arr, size, []);
  return allResult;
}

const ITEMS = Array.from({ length: 11 }, (_, i) => ('' + (i + 1)).padStart(2, '0'));
const PLAYS = [
  { key: 'r2', size: 2, name: '组合二' },
  { key: 'r3', size: 3, name: '组合三' },
  { key: 'r4', size: 4, name: '组合四' },
  { key: 'r5', size: 5, name: '组合五' },
  { key: 'r6', size: 6, name: '组合六' },
  { key: 'r7', size: 7, name: '组合七' },
  { key: 'r8', size: 8, name: '组合八' }
];

let selected = new Set(['01', '02', '03', '04', '05']);
let curPlay = 'r5';

const ballsEl = document.getElementById('balls');
const playsEl = document.getElementById('plays');
const outEl = document.getElementById('out');

function renderBalls() {
  ballsEl.innerHTML = ITEMS.map((n) =>
    '<span class="ball' + (selected.has(n) ? ' on' : '') + '" data-n="' + n + '">' + n + '</span>'
  ).join('');
  ballsEl.querySelectorAll('.ball').forEach((el) => {
    el.addEventListener('click', () => {
      const n = el.dataset.n;
      if (selected.has(n)) selected.delete(n); else selected.add(n);
      renderBalls(); renderOut();
    });
  });
}

function renderPlays() {
  playsEl.innerHTML = PLAYS.map((p) =>
    '<span class="chip' + (p.key === curPlay ? ' on' : '') + '" data-k="' + p.key + '">' +
    p.name + ' · 取 ' + p.size + '</span>'
  ).join('');
  playsEl.querySelectorAll('.chip').forEach((el) => {
    el.addEventListener('click', () => { curPlay = el.dataset.k; renderPlays(); renderOut(); });
  });
}

function renderOut() {
  const play = PLAYS.find((p) => p.key === curPlay);
  const arr = Array.from(selected);
  const n = arr.length;

  if (n < play.size) {
    outEl.innerHTML =
      '<span class="dim">已选 ' + n + ' 个元素，但「' + play.name + '」需要取 ' + play.size + ' 个</span>\\n' +
      'combine(selected, ' + play.size + ')  →  <b>[]</b>  （剩余元素不够，递归直接返回）';
    return;
  }

  const combos = combine(arr, play.size);
  // 只展示前几组，避免刷屏
  const preview = combos.slice(0, 3).map((c) => '[' + c.join(', ') + ']').join(' ');
  const more = combos.length > 3 ? '  …还有 ' + (combos.length - 3) + ' 组' : '';

  // 用公式 C(n,k) 交叉验证——枚举结果应当和公式一致
  const fact = (x) => (x <= 1 ? 1 : x * fact(x - 1));
  const byFormula = fact(n) / (fact(play.size) * fact(n - play.size));

  outEl.innerHTML =
    '已选 ' + n + ' 个：' + arr.join(' ') + '\\n' +
    '规则 ' + play.name + '（取 ' + play.size + ' 个）\\n' +
    'combine() 枚举  →  <b>' + combos.length + '</b> 组\\n' +
    '公式 C(' + n + ',' + play.size + ')  →  <b>' + byFormula + '</b>\\n' +
    '<span class="dim">' + preview + more + '</span>';
}

document.querySelectorAll('[data-quick]').forEach((el) => {
  el.addEventListener('click', () => {
    const q = el.dataset.quick;
    if (q === 'all') selected = new Set(ITEMS);
    else if (q === 'none') selected = new Set();
    else if (q === 'big') selected = new Set(ITEMS.filter((n) => +n > 6));
    else if (q === 'small') selected = new Set(ITEMS.filter((n) => +n <= 6));
    else if (q === 'odd') selected = new Set(ITEMS.filter((n) => +n % 2 === 1));
    else if (q === 'even') selected = new Set(ITEMS.filter((n) => +n % 2 === 0));
    document.querySelectorAll('[data-quick]').forEach((x) => x.classList.remove('on'));
    el.classList.add('on');
    renderBalls(); renderOut();
  });
});

renderBalls(); renderPlays(); renderOut();

// ===== 倒计时：复刻 timer.js 的 countdown =====
const cdEl = document.getElementById('countdown');
let timerOn = true;

function countdown(end, update, handle) {
  if (!timerOn) return;
  const now = Date.now();
  if (now - end > 0) { handle(); return; }

  const last = end - now;
  const px_d = 86400000, px_h = 3600000, px_m = 60000, px_s = 1000;
  const d = Math.floor(last / px_d);
  const h = Math.floor((last - d * px_d) / px_h);
  const m = Math.floor((last - d * px_d - h * px_h) / px_m);
  const s = Math.floor((last - d * px_d - h * px_h - m * px_m) / px_s);

  const r = [];
  if (d > 0) r.push('<em>' + d + '</em>天');
  if (r.length || h > 0) r.push('<em>' + h + '</em>时');
  if (r.length || m > 0) r.push('<em>' + m + '</em>分');
  if (r.length || s > 0) r.push('<em>' + s + '</em>秒');
  update(r.join(''));

  setTimeout(() => countdown(end, update, handle), 1000);
}

function startTimer(seconds) {
  timerOn = false;
  setTimeout(() => {
    timerOn = true;
    countdown(Date.now() + seconds * 1000,
      (t) => { cdEl.innerHTML = t; },
      () => { cdEl.innerHTML = '<em>0</em>秒 · 已归零，触发 handle 回调'; });
  }, 30);
}
startTimer(12 * 60 + 3);

document.getElementById('restart').addEventListener('click', () => startTimer(30));

// ===== 数据层：复刻 interface.js 的 Promise 包装 =====
const ioEl = document.getElementById('ioout');
function load(url, label, fn) {
  ioEl.textContent = label + ' → 请求中…';
  fetch(url)
    .then((r) => r.json())
    .then((res) => { ioEl.textContent = label + ' 返回：\\n' + JSON.stringify(fn(res), null, 2); })
    .catch((e) => { ioEl.textContent = label + ' 失败：' + e.message; });
}
document.getElementById('loadstate').addEventListener('click', () =>
  load('/lab/es6/project/data/state.json', 'getState()', (r) => ({ issue: r.issue, state: r.state, end_time: new Date(r.end_time).toLocaleTimeString('zh-CN') })));
document.getElementById('loadomit').addEventListener('click', () =>
  load('/lab/es6/project/data/omit.json', 'getOmit()', (r) => ({ 元素个数: r.data.length, 前三个: r.data.slice(0, 3) })));
document.getElementById('loadopen').addEventListener('click', () =>
  load('/lab/es6/project/data/opencode.json', 'getOpenCode()', (r) => ({ 结果元素: r.data })));
</script>
`;

/* ------------------------------------------------------------- 架构页 */

const archBody = `
<div class="note">
  这一页讲代码怎么组织。原项目的四个模块 + 一个入口，共 555 行。
  业务内容已抽象化，但<strong>代码结构原样保留</strong>——因为结构才是值得学的东西。
</div>

<div class="wrap">

  <h2>分层：四个模块各管一摊</h2>
  <p>
    这份代码最值得学的不是某个语法点，而是<strong>它把职责切开了</strong>。
    四个模块互不干扰，任何一个都能单独替换：
  </p>

  <pre class="src">base.js        状态 + 渲染      持有选中的元素、把自己画到页面上
calculate.js   纯计算            输入数组和数量，输出所有组合
interface.js   数据获取          包成 Promise，谁调谁负责后续
timer.js       纯逻辑            输入结束时间，每秒回调一次
     ↓
index.js       组装            把上面四份能力合成一个主类</pre>

  <p>
    这个切法有两个实际好处：<strong>计算逻辑可以单独测</strong>（<code>combine()</code>
    不碰 DOM，喂数组就行），<strong>数据来源可以整体替换</strong>
    （把 jQuery 的 <code>$.ajax</code> 换成 <code>fetch</code>，只动一个文件）。
  </p>

  <h2>技术上最值得看的一段：mix() 多重继承</h2>

  <p>
    问题很清楚：<code>Base</code>、<code>Calculate</code>、<code>Interface</code>、
    <code>Timer</code> 四份能力都需要，但 JavaScript 的 class 只能
    <code>extends</code> 一个父类。
  </p>

  <p class="src-label">index.js · 属性搬运</p>
  <pre class="src">const copyProperties = function (target, source) {
    for (let key of Reflect.ownKeys(source)) {
        if (key !== 'constructor' && key !== 'prototype' && key !== 'name') {
            let desc = Object.getOwnPropertyDescriptor(source, key);
            Object.defineProperty(target, key, desc);
        }
    }
};</pre>

  <p>
    <strong>为什么不直接赋值？</strong>这是这段代码的关键。
    <code>target[key] = source[key]</code> 会把属性<strong>拍平</strong>：
  </p>

  <table>
    <thead><tr><th>属性类型</th><th>直接赋值的结果</th><th>用属性描述符搬运</th></tr></thead>
    <tbody>
      <tr><td>getter / setter</td><td>当场求值成普通值，之后不再动态</td><td>保持动态</td></tr>
      <tr><td><code>writable: false</code></td><td>被强行改成可写</td><td>保持只读</td></tr>
      <tr><td>不可枚举属性</td><td>变成可枚举（会被 for...in 扫到）</td><td>保持不可枚举</td></tr>
      <tr><td>Symbol 键</td><td><code>Object.keys()</code> 根本拿不到</td><td><code>Reflect.ownKeys()</code> 能拿到</td></tr>
    </tbody>
  </table>

  <p>
    所以这里的 <code>Reflect.ownKeys()</code> + <code>getOwnPropertyDescriptor()</code>
    + <code>defineProperty()</code> 三件套，是为了<strong>完整保留属性的定义语义</strong>。
    这是 ES6 反射 API 的一个正经用途，不是炫技。
  </p>

  <p class="src-label">index.js · 混入与继承</p>
  <pre class="src">const mix = function (...mixins) {
    class Mix {}
    for (let mixin of mixins) {
        copyProperties(Mix, mixin);                     // 搬静态成员
        copyProperties(Mix.prototype, mixin.prototype); // 搬实例方法
    }
    return Mix;
};

class Lottery extends mix(Base, Calculate, Interface, Timer) { ... }</pre>

  <p>
    注意<strong>静态成员和原型方法要分别搬</strong>。漏掉任何一份，就会出现
    「有的方法能调、有的报 undefined」这类很难查的问题。
  </p>

  <h2>但这个方案有问题</h2>

  <p>说实话，这种 mixin 写法有几个隐患，看明白就好，不必照搬：</p>

  <table>
    <thead><tr><th>问题</th><th>后果</th></tr></thead>
    <tbody>
      <tr><td>原型链上没有来源类</td><td><code>instanceof Base</code> 返回 <code>false</code>，类型判断失效</td></tr>
      <tr><td>同名方法静默覆盖</td><td>谁在后面谁赢，不报错，出问题很难定位</td></tr>
      <tr><td>属性来源分散在四个文件</td><td>IDE 补全和跳转基本失效</td></tr>
    </tbody>
  </table>

  <p>
    现代更常见的做法是<strong>组合优于继承</strong>——把四个模块作为实例属性持有：
  </p>

  <pre class="src">class Lottery {
    constructor() {
        this.timer = new Timer();
        this.calc  = new Calculate();
        // ...
    }
    tick(end) { return this.timer.countdown(end, ...); }
}</pre>

  <p>
    调用链明确，<code>this.calc.combine()</code> 一看就知道从哪来，
    也不影响 <code>instanceof</code>。代价是要多写几个转发方法。
    这里保留原实现，是因为它作为「反射 API 的实战用例」确实有教学价值。
  </p>

  <h2>组合算法：为什么不用公式</h2>

  <p>
    组合数有现成公式 <code>C(n, k) = n! / (k! × (n-k)!)</code>，一行就能算。
    但这个项目选择<strong>把每一种组合真的枚举出来</strong>：
  </p>

  <pre class="src">static combine(arr, size) {
    let allResult = [];
    (function f(arr, size, result) {
        let arrLen = arr.length;
        if (size > arrLen) return;              // 剩余不够，此路不通
        if (size === arrLen) {                  // 恰好够，全部拿走
            allResult.push([].concat(result, arr));
        } else {
            for (let i = 0; i < arrLen; i++) {
                let newResult = [].concat(result);
                newResult.push(arr[i]);
                if (size === 1) {
                    allResult.push(newResult);
                } else {
                    let newArr = [].concat(arr);
                    newArr.splice(0, i + 1);    // ← 关键
                    f(newArr, size - 1, newResult);
                }
            }
        }
    })(arr, size, []);
    return allResult;
}</pre>

  <p>
    递归思路：取第 <code>i</code> 个元素之后，<strong>往后</strong>找剩下的——
    <code>splice(0, i + 1)</code> 把已用过的连同当前这个一起切掉。
    这样就不会产生 <code>[b, a]</code> 这种和 <code>[a, b]</code> 重复的排列。
  </p>

  <p>
    用 IIFE 包起来是因为递归需要一个名字 <code>f</code>，但又不想把它
    泄露到外层作用域。原注释提到「用 <code>arguments.callee</code> 得写匿名函数」——
    那个东西在严格模式下早就禁用了，所以这种具名函数表达式才是对的路子。
  </p>

  <h2>构建链路：从三层工具到一个工具</h2>

  <p>这是 2017 年的构建配置，原样保留在仓库里：</p>

  <table>
    <thead><tr><th>当年用的</th><th>做什么</th><th>现在</th></tr></thead>
    <tbody>
      <tr><td><code>gulp</code> 3.9</td><td>任务编排：编译、合并、压缩、刷新</td><td>Vite 内置</td></tr>
      <tr><td><code>webpack</code> 2</td><td>模块打包</td><td>Vite（开发用原生 ESM，构建用 Rollup）</td></tr>
      <tr><td><code>babel-preset-es2015</code></td><td>把 ES6 编译成 ES5</td><td>基本不需要——浏览器原生支持</td></tr>
      <tr><td><code>gulp-livereload</code></td><td>改代码自动刷新浏览器</td><td>Vite HMR（热更新，不用刷新）</td></tr>
      <tr><td><code>babel-polyfill</code></td><td>补运行时缺失的 API</td><td>原生支持，或按需 <code>core-js</code></td></tr>
    </tbody>
  </table>

  <p>
    当年为什么需要这三层？因为 <strong>2017 年的浏览器不认识 ES6</strong>。
    写 <code>let</code> 要编译，写 <code>import</code> 要打包，
    连 <code>padStart()</code> 这种新方法都要 polyfill 兜底。
    所以「写 ES6」这件事本身就意味着先配好一套工具链。
  </p>

  <p>
    现在这些语法全部进了标准，Chrome 直接认。当年那份
    <code>gulpfile.babel.js</code> + 7 个 gulp task + webpack 配置，
    现在一个 <code>&lt;script type="module"&gt;</code> 就能替代——
    这个站点上的 ES6 演示页就是这么做的：<strong>0 依赖、0 构建</strong>。
  </p>

  <p>
    这个变化挺有意思：<strong>当年最难的部分消失了，留下来的是代码结构本身</strong>。
    分层怎么切、算法怎么写、命名怎么取——这些不随工具链变化。
  </p>

</div>
`;

/* ----------------------------------------------------------------- 写出 */

writeFileSync(
  path.join(ROUTE, 'demo.html'),
  shell({
    title: '组合选择器 · 项目演示',
    eyebrow: 'ES6 项目 · 演示',
    body: indexBody,
    extraScript: indexScript
  })
);

writeFileSync(
  path.join(PUB, 'architecture.html'),
  shell({
    title: '组合选择器 · 架构讲解',
    eyebrow: 'ES6 项目 · 架构',
    body: archBody
  })
);

console.log('已生成 src/pages/lab/es6/project/demo.html  →  路由 /lab/es6/project/demo/');
console.log('已生成 public/lab/es6/project/architecture.html');
console.log('（本项目只保留软件工程部分，业务语义已抽象化）');
