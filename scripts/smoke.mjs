/**
 * smoke.mjs —— 交互冒烟测试
 * 用 CDP 真实点一遍搜索面板、分类筛选、主题切换，输出通过/失败
 *
 * 用法: node smoke.mjs [baseUrl]
 */
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const BASE = process.argv[2] || 'http://localhost:8080';
const PORT = 9335;

const exe = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
].find((p) => existsSync(p));

if (!exe) {
  console.error('没有找到 Chrome 或 Edge');
  process.exit(1);
}

const chrome = spawn(
  exe,
  [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--hide-scrollbars',
    `--remote-debugging-port=${PORT}`,
    '--user-data-dir=' + process.env.TEMP + '\\smoke-profile',
    'about:blank'
  ],
  { stdio: 'ignore' }
);

async function wsUrl() {
  for (let i = 0; i < 40; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      const j = await r.json();
      if (j.webSocketDebuggerUrl) return j.webSocketDebuggerUrl;
    } catch {}
    await sleep(300);
  }
  throw new Error('Chrome 没起来');
}

const ws = new WebSocket(await wsUrl());
let id = 0;
const pending = new Map();
await new Promise((r) => (ws.onopen = r));
ws.onmessage = (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) {
    pending.get(m.id)(m);
    pending.delete(m.id);
  }
};
const send = (method, params = {}, sessionId) => {
  const mid = ++id;
  return new Promise((res) => {
    pending.set(mid, res);
    ws.send(JSON.stringify({ id: mid, method, params, sessionId }));
  });
};

const { result: t } = await send('Target.createTarget', { url: 'about:blank' });
const { result: a } = await send('Target.attachToTarget', { targetId: t.targetId, flatten: true });
const sid = a.sessionId;
await send('Page.enable', {}, sid);
await send('Runtime.enable', {}, sid);
await send(
  'Emulation.setDeviceMetricsOverride',
  { width: 1400, height: 900, deviceScaleFactor: 1, mobile: false },
  sid
);

async function evaluate(expression) {
  const res = await send(
    'Runtime.evaluate',
    { expression, returnByValue: true, awaitPromise: true },
    sid
  );
  if (res?.result?.exceptionDetails) {
    throw new Error(res.result.exceptionDetails.text + ' | ' + expression.slice(0, 90));
  }
  return res?.result?.result?.value;
}

async function goto(path) {
  await send('Page.navigate', { url: BASE + path }, sid);
  await sleep(1500);
}

const results = [];
function check(name, ok, info = '') {
  results.push({ name, ok, info });
}

/* ---------------- 1. 搜索面板 ---------------- */
await goto('/');
await evaluate(`document.querySelector('[data-search-open]').click()`);
await sleep(400);

const opened = await evaluate(`!document.querySelector('[data-palette]').hidden`);
check('点击导航的搜索按钮能打开面板', !!opened);

await evaluate(`(() => {
  const i = document.querySelector('.palette__input');
  i.value = 'julia';
  i.dispatchEvent(new Event('input', { bubbles: true }));
})()`);
await sleep(900);

const hits = await evaluate(`document.querySelectorAll('.palette__item').length`);
check('输入 julia 能搜到结果', Number(hits) > 0, `${hits} 条`);

const firstHref = await evaluate(
  `document.querySelector('.palette__item')?.getAttribute('href') || ''`
);
check('搜索结果指向文章页', String(firstHref).startsWith('/blog/'), String(firstHref));

// 结果项是 JS 拼出来的，样式一旦被 Astro 作用域化就会静默失效，
// 表现是标题、分类、摘要黏成一团。这里把排版本身也断言住。
const paletteLayout = JSON.parse(
  String(
    await evaluate(`(() => {
      const item = document.querySelector('.palette__item');
      if (!item) return '{"ok":false}';
      const row = item.querySelector('.palette__row');
      const title = item.querySelector('.palette__title');
      const meta = item.querySelector('.palette__meta');
      const a = title ? title.getBoundingClientRect() : null;
      const b = meta ? meta.getBoundingClientRect() : null;
      return JSON.stringify({
        itemDisplay: getComputedStyle(item).display,
        rowDisplay: row ? getComputedStyle(row).display : 'missing',
        tops: a && b ? [Math.round(a.top), Math.round(b.top)] : null,
        overlap: a && b ? Math.round(Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top)) : -99
      });
    })()`)
  )
);
check(
  '搜索结果的标题与分类排在同一行',
  paletteLayout.itemDisplay === 'block' && paletteLayout.rowDisplay === 'flex' && paletteLayout.overlap > 4,
  `item:${paletteLayout.itemDisplay} row:${paletteLayout.rowDisplay} tops:${paletteLayout.tops} 重叠:${paletteLayout.overlap}px`
);

await evaluate(`(() => {
  const i = document.querySelector('.palette__input');
  i.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
})()`);
await sleep(1600);
const afterEnter = await evaluate(`location.pathname`);
check('按回车能跳进文章', String(afterEnter).startsWith('/blog/'), String(afterEnter));

/* ---------------- 2. 快捷键 ---------------- */
await goto('/');
await evaluate(`document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true }))`);
await sleep(400);
const viaHotkey = await evaluate(`!document.querySelector('[data-palette]').hidden`);
check('⌘K / Ctrl+K 能打开面板', !!viaHotkey);

await evaluate(`document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))`);
await sleep(300);
const closed = await evaluate(`document.querySelector('[data-palette]').hidden`);
check('ESC 能关闭面板', !!closed);

/* ---------------- 3. 分类筛选 ---------------- */
await goto('/blog/');
const totalRows = await evaluate(`document.querySelectorAll('.rows li[data-cat]').length`);
check('笔记列表渲染出全部条目', Number(totalRows) === 17, `${totalRows} 条`);

await evaluate(`document.querySelectorAll('.chip')[1].click()`);
await sleep(400);
const afterFilter = await evaluate(`(() => {
  const all = [...document.querySelectorAll('.rows li[data-cat]')];
  const shown = all.filter(li => !li.hidden).length;
  const label = document.querySelectorAll('.chip')[1].textContent.trim();
  return JSON.stringify({ shown, all: all.length, label,
    allSameCat: all.filter(li => !li.hidden).every(li => li.dataset.cat === all.find(x => !x.hidden).dataset.cat) });
})()`);
const f = JSON.parse(String(afterFilter));
check('点分类标签能筛选', f.shown > 0 && f.shown < f.all, `${f.label} 显示 ${f.shown}/${f.all} 条`);
check('筛选结果都是同一分类', f.allSameCat);

await evaluate(`document.querySelectorAll('.chip')[0].click()`);
await sleep(300);
const restored = await evaluate(
  `[...document.querySelectorAll('.rows li[data-cat]')].filter(li => !li.hidden).length`
);
check('点回全部能恢复', Number(restored) === 17, `${restored} 条`);

/* ---------------- 4. 主题切换 ---------------- */
await goto('/');
const before = await evaluate(`document.documentElement.getAttribute('data-theme') || 'auto'`);
await evaluate(`document.querySelector('[data-theme-toggle]').click()`);
await sleep(400);
const after = await evaluate(`document.documentElement.getAttribute('data-theme')`);
const stored = await evaluate(`localStorage.getItem('theme')`);
check('主题按钮能切换', before !== after, `${before} -> ${after}`);
check('主题写入 localStorage', !!stored, String(stored));

/* ---------------- 5. 视图过渡后脚本是否还活着 ---------------- */
await goto('/blog/');
await evaluate(`document.querySelector('.nav__links a[href="/about/"]').click()`);
await sleep(1800);
const afterNav = JSON.parse(
  String(
    await evaluate(`(() => JSON.stringify({
      path: location.pathname,
      h1: document.querySelector('h1')?.textContent?.trim() || '',
      err: !!document.querySelector('.err__code')
    }))()`)
  )
);
check('客户端路由跳转正常', afterNav.path.startsWith('/about'), afterNav.path);
// 光看 pathname 会被假通过：跳到 404 页时地址栏照样是对的
check('跳转后渲染的是目标页而不是 404', !!afterNav.h1 && !afterNav.err, `h1:${afterNav.h1}`);

const themeAlive = await evaluate(`(() => {
  const btn = document.querySelector('[data-theme-toggle]');
  if (!btn) return 'no-button';
  btn.click();
  return document.documentElement.getAttribute('data-theme');
})()`);
check('跳转后主题按钮仍然可用', !!themeAlive && themeAlive !== 'no-button', String(themeAlive));

/* ---------------- 6. 实验室：任务清单的排版 ---------------- */
await goto('/lab/todo/');
const taskLayout = JSON.parse(
  String(
    await evaluate(`(() => {
      const form = document.querySelector('[data-adder]');
      form.querySelector('input[name=content]').value = '排版自检';
      form.querySelector('button[type=submit]').click();
      const li = document.querySelector('.task');
      if (!li) return '{"ok":false}';
      const box = li.querySelector('.task__check');
      const body = li.querySelector('.task__body');
      if (!box || !body) return '{"ok":false}';
      return JSON.stringify({
        display: getComputedStyle(li).display,
        checkLeft: box.getBoundingClientRect().left < body.getBoundingClientRect().left,
        sameRow: Math.abs(box.getBoundingClientRect().top - body.getBoundingClientRect().top) < 26
      });
    })()`)
  )
);
check(
  '任务清单的列表项是横向排布',
  taskLayout.display === 'flex' && taskLayout.checkLeft && taskLayout.sameRow,
  `display:${taskLayout.display}`
);

/* ---------------- 7. 文章详情能不能点开 ---------------- */
// 列表页和首页的文章链接一度少了结尾斜杠，点下去落到 404，这里整条链路盯住
await goto('/blog/');
const rowHref = String(await evaluate(`document.querySelector('.rows a.row')?.getAttribute('href') || ''`));
check('笔记列表的文章链接带结尾斜杠', rowHref.endsWith('/'), rowHref);

await evaluate(`document.querySelector('.rows a.row').click()`);
await sleep(1800);
const fromList = JSON.parse(
  String(
    await evaluate(`(() => JSON.stringify({
      path: location.pathname,
      title: document.querySelector('article[data-article] h1')?.textContent?.trim() || '',
      paras: document.querySelectorAll('article .post__body p').length,
      err: !!document.querySelector('.err__code')
    }))()`)
  )
);
check('从列表点进文章能看到正文', !!fromList.title && fromList.paras > 0 && !fromList.err,
  `${fromList.path} · ${fromList.paras} 段`);

await goto('/');
await evaluate(`document.querySelector('.post-card').click()`);
await sleep(1800);
const fromHome = JSON.parse(
  String(
    await evaluate(`(() => JSON.stringify({
      title: document.querySelector('article[data-article] h1')?.textContent?.trim() || '',
      err: !!document.querySelector('.err__code')
    }))()`)
  )
);
check('从首页卡片点进文章能看到正文', !!fromHome.title && !fromHome.err, fromHome.title);

/* ---------------- 输出 ---------------- */
console.log('\n交互冒烟测试  ' + BASE);
console.log('='.repeat(66));
let failed = 0;
for (const r of results) {
  if (!r.ok) failed++;
  console.log(`${r.ok ? ' 通过 ' : ' 失败 '} ${r.name}${r.info ? '   (' + r.info + ')' : ''}`);
}
console.log('='.repeat(66));
console.log(`${results.length - failed} / ${results.length} 通过\n`);

ws.close();
chrome.kill();
process.exit(failed ? 1 : 0);
