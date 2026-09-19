/**
 * verify-es6-project.mjs —— 在真实浏览器里跑 ES6 项目实战的三个页面
 *
 * 三个页面各有各的验法：
 *   demo/           可交互演示，要真的点按钮、读结果、抓控制台错误
 *   architecture.html  静态讲解，验章节数、代码块数、有没有渲染异常
 *   index.html      讲解正文，验 Astro 有没有正常生成（有站点导航）
 *
 * 用法: node verify-es6-project.mjs [baseUrl]     默认 http://localhost:8080
 */
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import { requireChrome, profileDir } from './chrome.mjs';

const BASE = process.argv[2] || 'http://localhost:8080';
const PORT = 9339;

const exe = requireChrome();
const chrome = spawn(
  exe,
  [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--hide-scrollbars',
    `--remote-debugging-port=${PORT}`,
    '--user-data-dir=' + profileDir('es6project'),
    'about:blank'
  ],
  { stdio: 'ignore' }
);

async function targetWs() {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      const j = await r.json();
      const t = j.find((x) => x.type === 'page');
      if (t?.webSocketDebuggerUrl) return t.webSocketDebuggerUrl;
    } catch {}
    await sleep(500);
  }
  throw new Error('Chrome 没起来');
}

let ws;
let id = 0;
const pending = new Map();
const consoleErrors = [];

async function connect() {
  ws = new WebSocket(await targetWs());
  await new Promise((r) => (ws.onopen = r));
  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) {
      pending.get(m.id)(m);
      pending.delete(m.id);
    }
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') {
      consoleErrors.push(m.params.args.map((a) => a.value ?? a.description ?? '').join(' '));
    }
    if (m.method === 'Runtime.exceptionThrown') {
      consoleErrors.push('exception: ' + (m.params.exceptionDetails.exception?.description ?? ''));
    }
  };
}

function send(method, params = {}) {
  const my = ++id;
  ws.send(JSON.stringify({ id: my, method, params }));
  return new Promise((res) => pending.set(my, res));
}

/** 导航 + 等一会儿 + 取表达式值 */
async function visit(url, waitMs = 1200) {
  consoleErrors.length = 0;
  await send('Page.navigate', { url });
  await sleep(waitMs);
}

async function evalJs(expression, awaitPromise = false) {
  const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise });
  if (r.result?.exceptionDetails) {
    return { error: r.result.exceptionDetails.exception?.description ?? 'eval failed' };
  }
  return r.result?.result?.value;
}

await connect();
await send('Page.enable');
await send('Runtime.enable');

const results = [];
function check(name, ok, detail = '') {
  results.push({ name, ok, detail });
  console.log(`${ok ? '✅' : '❌'} ${name}${detail ? '  —  ' + detail : ''}`);
}

/* ============ 1. 项目演示页：可交互 ============ */
await visit(`${BASE}/lab/es6/project/demo/`, 800);

// 1a. 组合运算：点「全选」→ 选 size=6 的规则 → 读结果区
//    注意这页的控件是 <span class="chip">，不是 <button>
const comboProbe = await evalJs(`(async () => {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  // 全选 11 个元素
  document.querySelector('[data-quick="all"]')?.click();
  await wait(80);

  // 规则：挑 name 或 key 里带「六 / r6」的那个
  const plays = [...document.querySelectorAll('#plays .chip')];
  const want = plays.find((el) => /六|r6/.test(el.textContent) || /r6/.test(el.dataset.k || ''));
  want?.click();
  await wait(120);

  const out = document.getElementById('out')?.textContent || '';
  return {
    chips: [...document.querySelectorAll('.chip')].map((c) => c.textContent.trim()),
    plays: plays.map((p) => p.textContent.trim()),
    picked: want?.textContent.trim() ?? null,
    ballsOn: document.querySelectorAll('#balls .ball.on').length,
    out
  };
})()`, true);

check('演示页可访问且脚本执行', !!comboProbe && !comboProbe.error,
  comboProbe?.error ?? `规则 ${JSON.stringify(comboProbe?.plays ?? [])}，选中 ${comboProbe?.ballsOn} 个元素`);

const comboOut = String(comboProbe?.out ?? '');
check('组合运算出现 C(11,6)=462', /462/.test(comboOut),
  comboOut.replace(/\s+/g, ' ').slice(0, 140));
check('未出现真实业务词（彩种/玩法/金额引导）',
  !/双色球|大乐透|11选5|竞彩|bet|投注|奖池/.test(document_guard(comboOut)), '');

function document_guard(s) {
  return s;
}

// 1b. 倒计时：应当出现时间文本
const timerProbe = await evalJs(`(() => {
  const t = document.body.innerText;
  const m = t.match(/\\d{1,2}\\s*[天时:：]\\s*\\d{1,2}\\s*[分:：]\\s*\\d{1,2}/);
  const cd = document.getElementById('countdown')?.textContent?.trim() ?? '';
  return { hit: m ? m[0] : null, countdown: cd, hasTimerWord: /倒计时|剩余/.test(t) };
})()`);
check('倒计时在跑', !!(timerProbe?.hit || timerProbe?.countdown),
  `#countdown = "${timerProbe?.countdown}"`);

// 1c. 数据层：三个按钮都点一遍，结果区应当有内容
const dataProbe = await evalJs(`(async () => {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const out = {};
  for (const [id, label] of [['loadstate'], ['loadomit'], ['loadopen']]) {
    document.getElementById(id)?.click();
    await wait(400);
    out[label] = document.getElementById('ioout')?.textContent?.trim().slice(0, 120) ?? '';
  }
  return out;
})()`, true);
check('数据层三个方法都有返回',
  !!dataProbe && Object.values(dataProbe).every((v) => v && v.length > 0),
  JSON.stringify(dataProbe).slice(0, 220));
// 光「有返回」不够——失败信息也是有返回。必须确认返回里没有「失败」字样
check('数据层三个方法都没有走 catch',
  !!dataProbe && Object.values(dataProbe).every((v) => v && !/失败|Unexpected token|<!DOCTYPE/.test(v)),
  Object.entries(dataProbe ?? {})
    .filter(([, v]) => /失败|Unexpected token|<!DOCTYPE/.test(String(v)))
    .map(([k, v]) => `${k}: ${String(v).slice(0, 80)}`)
    .join(' | ') || '三个都正常');

/** 额外的静态检查：演示页源码里不该有真实业务词 */
const srcText = await evalJs(`document.documentElement.outerHTML`);
check('演示页源码无真实业务词',
  !/双色球|大乐透|11选5|竞彩|投注|奖池|中奖金额/.test(String(srcText ?? '')), '');

check('演示页控制台无报错', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '));

/* ============ 2. 架构讲解页 ============ */
await visit(`${BASE}/lab/es6/project/architecture.html`, 1200);
const archProbe = await evalJs(`(() => {
  const t = document.body.innerText;
  return {
    h2: document.querySelectorAll('h2').length,
    codes: document.querySelectorAll('pre, code').length,
    textLen: t.length,
    hasMix: /mixin|Reflect\\.ownKeys/.test(t),
    hasFive: (t.match(/base\\.js|calculate\\.js|interface\\.js|timer\\.js|index\\.js/g) || []).length
  };
})()`);
check('架构页有章节与代码块', (archProbe?.h2 ?? 0) >= 3 && (archProbe?.codes ?? 0) >= 5,
  `h2=${archProbe?.h2} 代码节点=${archProbe?.codes} 字数=${archProbe?.textLen}`);
check('架构页覆盖五个源文件', (archProbe?.hasFive ?? 0) >= 5, `提及 ${archProbe?.hasFive} 次`);
check('架构页控制台无报错', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '));

/* ============ 3. 讲解正文（Astro 生成） ============ */
await visit(`${BASE}/lab/es6/project/`, 1000);
const guideProbe = await evalJs(`(() => {
  const links = [...document.querySelectorAll('a')].map((a) => a.getAttribute('href'));
  return {
    hasSiteNav: !!document.querySelector('header, nav'),
    acts: links.filter((h) => h && /project/.test(h)),
    title: document.title,
    tocCount: document.querySelectorAll('.guide__toc li').length
  };
})()`);
check('讲解页是 Astro 生成的（有站点导航）', !!guideProbe?.hasSiteNav, String(guideProbe?.title));
check('讲解页挂了演示与架构两个入口',
  (guideProbe?.acts ?? []).some((h) => /demo/.test(h)) && (guideProbe?.acts ?? []).some((h) => /architecture/.test(h)),
  JSON.stringify(guideProbe?.acts));
check('讲解页控制台无报错', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '));

/* ============ 4. 超链接真的能点开 ============ */
const linkStatus = await evalJs(`(async () => {
  const urls = [
    '/lab/es6/project/',
    '/lab/es6/project/demo/',
    '/lab/es6/project/architecture.html',
    '/lab/es6/project/src/base.js',
    '/lab/es6/project/data/state.json',
    '/lab/es6/project/src/calculate.js',
    '/lab/es6/project/src/timer.js',
    '/lab/es6/project/src/interface.js',
    '/lab/es6/project/src/index.js'
  ];
  const out = [];
  for (const u of urls) {
    const r = await fetch(u, { method: 'HEAD' });
    out.push({ u, code: r.status });
  }
  return out;
})()`, true);
check('九个资源全部 200',
  Array.isArray(linkStatus) && linkStatus.every((x) => x.code === 200),
  JSON.stringify(linkStatus));

await send('Browser.close').catch(() => {});
chrome.kill();

const bad = results.filter((r) => !r.ok);
console.log(`\n共 ${results.length} 项检查，${bad.length} 项失败。`);
process.exit(bad.length ? 1 : 0);
