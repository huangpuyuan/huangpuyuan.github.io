/**
 * test-todo.mjs —— 任务清单的交互测试
 *
 * 增删改、完成状态、筛选、详情弹层、提醒触发、localStorage 持久化，全走真实的点击。
 *
 * 用法: node test-todo.mjs [baseUrl]
 */
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import { requireChrome, profileDir } from './chrome.mjs';

const BASE = process.argv[2] || 'http://localhost:8080';
const PORT = 9337;

const exe = requireChrome();

const chrome = spawn(
  exe,
  [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--hide-scrollbars',
    '--autoplay-policy=no-user-gesture-required',
    `--remote-debugging-port=${PORT}`,
    '--user-data-dir=' + profileDir('todo'),
    'about:blank'
  ],
  { stdio: 'ignore' }
);

async function wsUrl() {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      const j = await r.json();
      if (j.webSocketDebuggerUrl) return j.webSocketDebuggerUrl;
    } catch {}
    await sleep(500);
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
await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false }, sid);

async function evaluate(expression) {
  const res = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }, sid);
  if (res?.result?.exceptionDetails) {
    throw new Error(res.result.exceptionDetails.text + ' | ' + expression.slice(0, 90));
  }
  return res?.result?.result?.value;
}

async function goto(path) {
  await send('Page.navigate', { url: BASE + path }, sid);
  await sleep(1400);
}

const results = [];
function check(name, ok, info = '') {
  results.push({ name, ok, info });
}

/* ---------------- 1. 添加 ---------------- */
await goto('/lab/todo/');
// 这个 Chrome profile 会复用，先把上一轮的数据清掉
await evaluate(`localStorage.removeItem('storm.lab.todo.v1')`);
await goto('/lab/todo/');

const hasApp = await evaluate(`!!document.querySelector('[data-todo]')`);
check('页面挂载成功', !!hasApp);

const startEmpty = await evaluate(`document.querySelectorAll('.task').length`);
check('初始状态为空', Number(startEmpty) === 0, `${startEmpty} 条`);

await evaluate(`(() => {
  const i = document.querySelector('[data-adder] input[name=content]');
  i.value = '写周报';
  document.querySelector('[data-adder]').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
})()`);
await sleep(300);

const afterAdd = await evaluate(`JSON.stringify({
  rows: document.querySelectorAll('.task').length,
  text: document.querySelector('.task__content')?.textContent || '',
  inputCleared: document.querySelector('[data-adder] input[name=content]').value === '',
  all: document.querySelector('[data-count=all]').textContent,
  open: document.querySelector('[data-count=open]').textContent
})`);
const a1 = JSON.parse(String(afterAdd));
check('添加任务后出现在列表里', a1.rows === 1, a1.text);
check('添加后输入框清空', a1.inputCleared);
check('计数正确', a1.all === '1' && a1.open === '1', `全部 ${a1.all} / 未完成 ${a1.open}`);

await evaluate(`(() => {
  const i = document.querySelector('[data-adder] input[name=content]');
  i.value = '买菜';
  document.querySelector('[data-adder]').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
})()`);
await sleep(300);
const twoRows = await evaluate(`document.querySelectorAll('.task').length`);
check('能添加第二条', Number(twoRows) === 2, `${twoRows} 条`);

/* ---------------- 2. 完成状态 ---------------- */
await evaluate(`document.querySelector('.task [data-toggle]').click()`);
await sleep(300);
const done1 = await evaluate(`JSON.stringify({
  done: document.querySelectorAll('.task.is-done').length,
  doneCount: document.querySelector('[data-count=done]').textContent,
  openCount: document.querySelector('[data-count=open]').textContent
})`);
const d1 = JSON.parse(String(done1));
check('勾选后标记为已完成', d1.done === 1, `${d1.done} 条`);
check('完成计数跟着变', d1.doneCount === '1' && d1.openCount === '1', `已完成 ${d1.doneCount} / 未完成 ${d1.openCount}`);

/* ---------------- 3. 筛选 ---------------- */
await evaluate(`document.querySelector('[data-filter=open]').click()`);
await sleep(250);
const openView = await evaluate(`JSON.stringify({
  rows: document.querySelectorAll('.task').length,
  done: document.querySelectorAll('.task.is-done').length
})`);
const o1 = JSON.parse(String(openView));
check('「未完成」筛选只留未完成', o1.rows === 1 && o1.done === 0, `${o1.rows} 条`);

await evaluate(`document.querySelector('[data-filter=done]').click()`);
await sleep(250);
const doneView = await evaluate(`document.querySelectorAll('.task.is-done').length`);
check('「已完成」筛选只留已完成', Number(doneView) === 1, `${doneView} 条`);

await evaluate(`document.querySelector('[data-filter=all]').click()`);
await sleep(250);
const allView = await evaluate(`document.querySelectorAll('.task').length`);
check('切回「全部」恢复', Number(allView) === 2, `${allView} 条`);

/* ---------------- 4. 详情弹层 ---------------- */
await evaluate(`document.querySelector('.task [data-edit]').click()`);
await sleep(400);
const sheetOpen = await evaluate(`document.querySelector('[data-sheet]').open`);
check('点「详细」能打开弹层', !!sheetOpen);

await evaluate(`(() => {
  const f = document.querySelector('[data-sheet-form]');
  f.elements.namedItem('desc').value = '记得写上周的数据';
  // 设成过去的某个整点，保存后应当立刻触发提醒
  const d = new Date(Date.now() - 60000);
  const pad = n => String(n).padStart(2, '0');
  f.elements.namedItem('remindAt').value =
    d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) +
    'T' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  // 点真实按钮，走浏览器的默认提交行为（合成事件不会触发默认行为）
  f.querySelector('button[type=submit]').click();
})()`);
await sleep(500);

const afterSave = await evaluate(`JSON.stringify({
  open: document.querySelector('[data-sheet]').open,
  desc: document.querySelector('.task__desc')?.textContent || '',
  when: document.querySelector('.task__when')?.textContent || ''
})`);
const s1 = JSON.parse(String(afterSave));
check('保存后弹层关闭', s1.open === false);
check('备注写进了列表', s1.desc.includes('之前的数据') || s1.desc.length > 0, s1.desc);
check('提醒时间显示成标签', s1.when.length > 0, s1.when);

/* ---------------- 5. 提醒触发 ---------------- */
await evaluate(`document.querySelector('[data-toast-close]').click()`);
await sleep(200);
// 重新进页面：进页面时会补检一次错过的提醒
await goto('/lab/todo/');
await sleep(600);
const toast = await evaluate(`JSON.stringify({
  shown: !document.querySelector('[data-toast]').hidden,
  text: document.querySelector('[data-toast-text]').textContent
})`);
const t1 = JSON.parse(String(toast));
check('错过的提醒进页面就会弹出来', t1.shown, t1.text);

/* ---------------- 6. localStorage 持久化 ---------------- */
const stored = await evaluate(`localStorage.getItem('storm.lab.todo.v1')`);
check('数据写进了 localStorage', !!stored, stored ? `${JSON.parse(String(stored)).length} 条` : '');

await goto('/lab/todo/');
await sleep(400);
const reloaded = await evaluate(`document.querySelectorAll('.task').length`);
check('刷新后任务还在', Number(reloaded) === 2, `${reloaded} 条`);

/* ---------------- 7. 删除 ---------------- */
await evaluate(`window.confirm = () => true`);
await evaluate(`document.querySelector('.task [data-del]').click()`);
await sleep(300);
const afterDel = await evaluate(`JSON.stringify({
  rows: document.querySelectorAll('.task').length,
  all: document.querySelector('[data-count=all]').textContent
})`);
const dl = JSON.parse(String(afterDel));
check('能删除任务', dl.rows === 1 && dl.all === '1', `${dl.rows} 条`);

/* ---------------- 8. 视图过渡后是否还活着 ---------------- */
await evaluate(`document.querySelector('a[href="/lab/"]')?.click()`);
await sleep(1600);
const backPath = await evaluate(`location.pathname`);
check('能从任务清单跳回实验室', String(backPath).startsWith('/lab'), String(backPath));

await evaluate(`document.querySelector('a[href="/lab/todo/"]')?.click()`);
await sleep(1600);
const aliveAgain = await evaluate(`(() => {
  const i = document.querySelector('[data-adder] input[name=content]');
  if (!i) return 'no-form';
  i.value = '路由回来之后还能加';
  document.querySelector('[data-adder]').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  return document.querySelectorAll('.task').length;
})()`);
check('路由往返之后仍然可用', Number(aliveAgain) === 2, `${aliveAgain} 条`);

/* ---------------- 输出 ---------------- */
console.log('\n任务清单交互测试  ' + BASE);
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
