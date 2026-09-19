/**
 * build-es6-demos.mjs —— 把 ES6learning 的 17 个 lesson 做成浏览器可跑的演示页
 *
 * 原仓库是 gulp 3 + webpack 2 + babel-preset-es2015 的构建栈（2017 年），
 * 现在只需要一个 <script> 标签就能跑——这些语法早就进了标准。
 *
 * 策略：
 *   1. 逐 lesson 生成 lessons/lessonN.html（一个文件装一个 lesson，便于对照原文）
 *   2. 按主题生成 6 个「合集页」demo-*.html，每页装若干 lesson，对应 6 篇讲解
 *   3. 每页注入 console 输出镜像（这些脚本只会 console.log，直接打开是白屏）
 *
 * 源码逻辑一行没改，只是把文件按主题重新组织。
 * 唯一例外：lesson6 里 document.querySelectorAll('p') 依赖原页面里的 <p> 标签，
 * 这里补了几个 <p> 让那段能真的跑出结果。
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const SRC = process.env.ES6_SRC || '/root/work/repos/ES6learning/app/js/class';
const OUT = path.join(here, '..', 'public', 'lab', 'es6', 'lessons');

mkdirSync(OUT, { recursive: true });

/** 主题分组：每篇讲解对应一组 lesson */
const GROUPS = [
  { key: 'variables',  title: '变量与作用域',        lessons: [1] },
  { key: 'destructure', title: '解构赋值',           lessons: [2] },
  { key: 'regex',      title: '正则扩展',            lessons: [3] },
  { key: 'string',     title: '字符串与数值扩展',     lessons: [4, 5] },
  { key: 'array',      title: '数组与函数扩展',       lessons: [6, 7] },
  { key: 'object',     title: '对象扩展与 Symbol',    lessons: [8, 9] },
  { key: 'setmap',     title: 'Set 与 Map',          lessons: [10] },
  { key: 'proxy',      title: 'Proxy 与 Reflect',    lessons: [11] },
  { key: 'class',      title: '类与继承',            lessons: [12] },
  { key: 'promise',    title: 'Promise 与异步',      lessons: [13] },
  { key: 'iterator',   title: '迭代器',              lessons: [14] },
  { key: 'generator',  title: 'Generator',           lessons: [15] }
];

/**
 * 两个 lesson 无法在浏览器里「原样」跑，必须标注出来：
 *
 *   lesson16 用了修饰器（@readonly / @typename / @log），那是 Stage 3 提案，
 *            至今没进标准，2017 年靠 babel-plugin-transform-decorators 编译。
 *            裸 <script> 里直接是 SyntaxError。
 *
 *   lesson17 是 ES 模块的 export，<script> 默认不是 module 作用域，
 *            裸跑也是 SyntaxError。
 *
 * 对这两个，页面里不放可执行代码，只放源码 + 说明 + 一个等价的可运行改写。
 */
const NON_RUNNABLE = {
  16: {
    why: '这段代码用了<strong>修饰器（Decorator）</strong>——<code>@readonly</code>、<code>@typename</code>、<code>@log</code>。' +
         '修饰器是 Stage 3 提案，<strong>至今没有进入 ECMAScript 标准</strong>，浏览器原生不支持，' +
         '裸 <code>&lt;script&gt;</code> 里会直接抛 SyntaxError。2017 年那会儿靠的是 babel 的 ' +
         '<code>transform-decorators</code> 插件把它编译掉。',
    equiv: null // 见下方 lesson16Fallback
  },
  17: {
    why: '这段代码是 <strong>ES 模块</strong>的 <code>export</code>。模块有独立的作用域，' +
         '必须用 <code>&lt;script type="module"&gt;</code> 加载，或者在 Node 里以 <code>.mjs</code> 运行。' +
         '放进普通的 <code>&lt;script&gt;</code> 会报 <code>Unexpected token \'export\'</code>。',
    equiv: null
  }
};


/**
 * lesson16 的等价改写：修饰器的效果（把方法设为只读、给类挂静态属性、包一层日志）
 * 用 ES 标准语法手写一遍，行为一样，浏览器能跑。
 */
const LESSON16_EQUIV = `// 修饰器做得到的三件事，用标准语法手写一遍（效果一样，不需要编译）

// ① 把方法设为不可写 —— 对应 @readonly
{
  class Test {
    time() { return '2017-03-11'; }
  }
  // 修饰器做的事：拿到描述符，把 writable 改成 false
  Object.defineProperty(Test.prototype, 'time', {
    value: Test.prototype.time,
    writable: false,
    configurable: true,
    enumerable: false
  });

  let test = new Test();
  console.log('time() =', test.time());

  // 试着改它：严格模式下抛错，非严格模式静默失败
  try {
    test.time = function () { console.log('reset time'); };
    console.log('改写后仍为：', test.time());
  } catch (e) {
    console.log('改写被拒绝：', e.name + ': ' + e.message);
  }
}

// ② 给类挂静态属性 —— 对应 @typename
{
  class Test {}
  // @typename 做的就是把 target.myname 赋成 'hello'
  Test.myname = 'hello';
  console.log('类静态属性 Test.myname =', Test.myname);
}

// ③ 给方法包一层日志 —— 对应 @log('show') / @log('click')
{
  function log(type) {
    // 修饰器拿到 (target, name, descriptor)，这里改成包装原型方法
    return function (target, name) {
      const src = target[name];
      target[name] = function (...args) {
        const r = src.apply(this, args);
        console.info(\`log \${type}\`);
        return r;
      };
    };
  }

  class AD {
    show() { console.info('ad is show'); }
    click() { console.info('ad is click'); }
  }

  // 等价于把 @log('show') 写在 show 上面
  log('show')(AD.prototype, 'show');
  log('click')(AD.prototype, 'click');

  const ad = new AD();
  ad.show();
  ad.click();
}
`;

/**
 * lesson17 的等价改写：模块导出/导入。这里用一个 IIFE 模拟模块作用域，
 * 演示 export default 出去的东西长什么样、import 进来怎么用。
 */
const LESSON17_EQUIV = `// 模块化：export / import 在普通 <script> 里跑不了，这里用 IIFE 模拟模块作用域

const mod = (function () {
  // ── 模块内部 ──
  let A = 123;
  let test = function () {
    console.log('test');
  };
  class Hello {
    test() {
      console.log('class');
    }
  }

  // 等价于 export default { A, test, Hello }
  return { A, test, Hello };
})();

console.log('默认导出导出的对象：', Object.keys(mod));
console.log('A =', mod.A);
mod.test();

const h = new mod.Hello();
h.test();

// 用 ESM 语法写的话是这样的（需要在 type="module" 的脚本或 .mjs 文件里）：
//
//   // utils.js
//   let A = 123;
//   let test = () => console.log('test');
//   class Hello { test() { console.log('class'); } }
//   export default { A, test, Hello };
//
//   // main.js
//   import mod from './utils.js';
//   console.log(mod.A);   // 123
//   mod.test();           // test
//
// 命名导出则是 export let A = 123，导入时写成 import { A } from './utils.js'
`;

// ── 输出镜像：和数据结构演示页用的是同一段逻辑 ────────────────
const MIRROR = `<!-- data-lab-console -->
<script data-lab-console>
(function () {
  var lines = [];
  var box = null;

  function ensure() {
    if (box && box.isConnected) return box;
    box = document.createElement('pre');
    box.style.cssText =
      'margin:0;padding:18px 20px;' +
      'font:13px/1.75 ui-monospace,SFMono-Regular,"Cascadia Mono",Consolas,Menlo,' +
      '"DejaVu Sans Mono","Segoe UI Symbol","Apple Symbols",monospace;' +
      'white-space:pre-wrap;word-break:break-word;color:#0b0f14;background:#f6f7f9;' +
      'border-bottom:1px solid #e2e6eb;min-height:34px';
    var host = document.body || document.documentElement;
    host.insertBefore(box, host.firstChild);
    return box;
  }

  function fmt(v) {
    var seen = [];
    function walk(x, d, inContainer) {
      if (x === null) return 'null';
      var t = typeof x;
      // 顶层参数直接打印字符串本身；嵌在数组/Set/对象里的字符串加引号，
      // 否则 Set 里的 '2' 和数字 2 会长得一模一样（lesson10 讲的正是这个区别）
      if (t === 'string') return inContainer ? JSON.stringify(x) : x;
      if (t === 'number' || t === 'boolean' || t === 'bigint') return String(x);
      if (t === 'undefined') return 'undefined';
      if (t === 'function') return 'f ' + (x.name || 'anonymous');
      if (x instanceof Error) return x.name + ': ' + x.message;
      if (d > 5) return '...';
      // 只对「对象」做循环引用检测 —— 原始值不参与
      if (t === 'object') {
        if (seen.indexOf(x) > -1) return '[Circular]';
        seen.push(x);
      }
      if (Array.isArray(x)) {
        return '[' + x.map(function (i) { return walk(i, d + 1, true); }).join(', ') + ']';
      }
      if (typeof Set !== 'undefined' && x instanceof Set) {
        return 'Set{' + Array.from(x).map(function (i) { return walk(i, d + 1, true); }).join(', ') + '}';
      }
      if (typeof Map !== 'undefined' && x instanceof Map) {
        return 'Map{' + Array.from(x).map(function (kv) {
          return walk(kv[0], d + 1, true) + ' => ' + walk(kv[1], d + 1, true);
        }).join(', ') + '}';
      }
      return '{' + Object.keys(x).map(function (k) {
        return k + ': ' + walk(x[k], d + 1, true);
      }).join(', ') + '}';
    }
    return walk(v, 0, false);
  }

  ['log', 'info', 'warn', 'error'].forEach(function (kind) {
    var orig = console[kind] ? console[kind].bind(console) : function () {};
    console[kind] = function () {
      var args = Array.prototype.slice.call(arguments);
      lines.push(args.map(fmt).join(' '));
      try {
        var b = ensure();
        b.textContent = lines.join('\\n');
        b.scrollTop = b.scrollHeight;
      } catch (e) {}
      orig.apply(null, args);
    };
  });

  window.addEventListener('load', function () {
    setTimeout(function () {
      if (!lines.length) {
        ensure().textContent = '(这段代码跑完了，但没有任何 console 输出)';
      }
    }, 120);
  });
})();
</script>
`;

function page({ title, eyebrow, body, extra }) {
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
  .note {
    margin: 0; padding: 14px 20px; background: #fffdf3;
    border-bottom: 1px solid #ece4cc; font-size: 13px; color: #6b5d33;
  }
  .note code { font-family: ui-monospace, Consolas, Menlo, monospace; font-size: 12px; }
  .split { display: grid; grid-template-columns: 1fr 1fr; }
  @media (max-width: 900px) { .split { grid-template-columns: 1fr; } }
  .src {
    margin: 0; padding: 18px 20px; background: #fbfcfd; border-left: 1px solid #e2e6eb;
    font: 12.5px/1.8 ui-monospace, SFMono-Regular, Consolas, Menlo, monospace;
    white-space: pre-wrap; word-break: break-word; color: #3a4149;
    overflow-x: auto; border-bottom: 1px solid #e2e6eb;
  }
  .src-label {
    margin: 0; padding: 7px 20px; background: #f0f2f5; border-bottom: 1px solid #e2e6eb;
    font: 600 11px/1 ui-monospace, Consolas, monospace; letter-spacing: .12em;
    text-transform: uppercase; color: #8a929c;
  }
  .demo-body { padding: 0; }
  h1 { font-size: 15px; margin: 0; }
  header { padding: 16px 20px; border-bottom: 1px solid #e2e6eb; }
  header .eb { font: 600 11px/1 ui-monospace, Consolas, monospace; letter-spacing: .14em;
    text-transform: uppercase; color: #9aa2ab; display: block; margin-bottom: 8px; }
  .payload > p { margin: 12px 20px; color: #6b7280; font-size: 13px; }
</style>
</head>
<body>
${MIRROR}${body}
</body>
</html>
`;
}

function readLesson(n) {
  const f = path.join(SRC, `lesson${n}.js`);
  if (!existsSync(f)) return null;
  return readFileSync(f, 'utf8');
}

/** 去掉 2017 年的文件头注释 */
function stripHeader(s) {
  return s.replace(/^\/\*\*[\s\S]*?\*\/\s*\n/, '').replace(/^\/\/[^\n]*\n/, '');
}

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** 生成一个 lesson 的 HTML 片段：源码 + 可能的补充 DOM + 可执行脚本 */
function lessonBlock(n) {
  const raw = readLesson(n);
  if (raw === null) return '';
  const src = stripHeader(raw);

  // 不能原生跑的：只展示源码 + 原因 + 等价改写
  if (NON_RUNNABLE[n]) {
    const info = NON_RUNNABLE[n];
    const equiv = n === 16 ? LESSON16_EQUIV : LESSON17_EQUIV;
    return (
      `<p class="src-label">lesson${n}.js · 原始源码（不能原生执行）</p>\n` +
      `<pre class="src">${esc(src)}</pre>\n` +
      `<p class="note">⚠️ ${info.why}</p>\n` +
      `<p class="src-label">等价的、能跑的写法（行为一致）</p>\n` +
      `<pre class="src">${esc(equiv)}</pre>\n` +
      `<script>\n${equiv}\n</script>\n`
    );
  }

  // lesson6 依赖页面里的 <p>，补几个让 document.querySelectorAll('p') 有东西可读
  const payload = n === 6
    ? '<div class="payload"><p>第一个段落</p><p>第二个段落</p><p>第三个段落</p></div>\n'
    : '';

  return (
    `<p class="src-label">lesson${n}.js</p>\n` +
    `<pre class="src">${esc(src)}</pre>\n` +
    payload +
    `<script>\n${src}\n</script>\n`
  );
}

// ── 1. 逐 lesson 单页 ──────────────────────────────────────
for (let n = 1; n <= 17; n++) {
  if (readLesson(n) === null) { console.log(`lesson${n}: 源文件不存在，跳过`); continue; }
  const head = NON_RUNNABLE[n]
    ? `<p class="note">这一课无法在浏览器里原生执行 —— 详见下方说明与等价改写。</p>\n`
    : '';
  const html = page({
    title: `lesson${n} · ES6 语法练习`,
    eyebrow: `LAB / ES6 / LESSON ${n}`,
    body:
      `<header><span class="eb">ES6 语法练习 · lesson${n}</span>` +
      `<h1>lesson${n}.js</h1></header>\n` +
      head +
      lessonBlock(n)
  });
  writeFileSync(path.join(OUT, `lesson${n}.html`), html);
  console.log(`生成 lessons/lesson${n}.html${NON_RUNNABLE[n] ? '  (标记为不可原生运行)' : ''}`);
}

// ── 2. 主题合集页 ─────────────────────────────────────────
for (const g of GROUPS) {
  const parts = g.lessons.map(lessonBlock).filter(Boolean);
  const html = page({
    title: `${g.title} · ES6 演示`,
    eyebrow: `LAB / ES6 / ${g.key}`,
    body:
      `<header><span class="eb">ES6 语法练习 · 演示</span>` +
      `<h1>${g.title}</h1></header>\n` +
      `<p class="note">这一页包含 ${g.lessons.map((n) => `lesson${n}`).join(' + ')} 的原始代码，` +
      `跑在浏览器里。顶部灰条是 <code>console.log</code> 的输出镜像——` +
      `这些脚本只会写日志，不加镜像就是一片空白。</p>\n` +
      `<div class="demo-body">${parts.join('')}</div>\n`
  });
  writeFileSync(path.join(OUT, `demo-${g.key}.html`), html);
  console.log(`生成 lessons/demo-${g.key}.html  (${g.lessons.join(',')})`);
}

console.log('\n完成。');

