/**
 * verify-es6-demos.mjs —— 在真实浏览器里跑每个 ES6 演示页，抓回镜像输出
 *
 * 演示页的价值在于「真的跑得起来」，所以必须用浏览器验，
 * 不能只看文件生成了没有。这里用 CDP 逐个打开、等脚本执行完、
 * 再把页面顶部那个 <pre>（console 镜像）的内容读出来。
 */
import { spawn } from 'node:child_process';
import { readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as sleep } from 'node:timers/promises';
import { requireChrome, profileDir } from './chrome.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.join(here, '..', 'public', 'lab', 'es6', 'lessons');

const only = process.argv[2];
let files = readdirSync(DIR).filter((f) => f.endsWith('.html')).sort();
if (only) files = files.filter((f) => f.includes(only));

const PORT = 9337;
const exe = requireChrome();
const chrome = spawn(exe, [
  '--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
  `--remote-debugging-port=${PORT}`,
  '--user-data-dir=' + profileDir('es6verify'),
  'about:blank'
], { stdio: 'ignore' });

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

let ws, id = 0;
const pending = new Map();

async function connect() {
  ws = new WebSocket(await targetWs());
  await new Promise((r) => (ws.onopen = r));
  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  };
}

function send(method, params = {}) {
  const my = ++id;
  ws.send(JSON.stringify({ id: my, method, params }));
  return new Promise((res) => pending.set(my, res));
}

async function evalIn(url, expr, waitMs) {
  await send('Page.navigate', { url });
  await sleep(waitMs);
  const r = await send('Runtime.evaluate', {
    expression: expr, returnByValue: true, awaitPromise: false
  });
  return r.result?.result?.value ?? '';
}

await connect();

const report = [];
for (const f of files) {
  const url = 'file://' + path.join(DIR, f);
  await send('Page.enable');
  // promise / generator 类的页面有 setTimeout，多等一会儿
  const wait = /promise|generator|iterator/.test(f) ? 3600 : 900;
  const out = await evalIn(
    url,
    `(function(){var p=document.querySelector('[data-lab-console]')?document.body.firstElementChild:null;
      return p?p.textContent:'<没有镜像元素>';})()`,
    wait
  );
  const lineCount = out.split('\n').filter((l) => l.trim()).length;
  report.push({ file: f, lines: lineCount, out });
}

await send('Browser.close').catch(() => {});
chrome.kill();

let bad = 0;
for (const r of report) {
  const flag = r.lines === 0 || r.out.includes('没有镜像元素') ? '❌' : '✅';
  if (flag === '❌') bad++;
  console.log(`\n${flag} ${r.file}  —  ${r.lines} 行输出`);
  console.log(r.out.split('\n').slice(0, 12).map((l) => '   ' + l).join('\n'));
}

console.log(`\n共 ${report.length} 个页面，${bad} 个异常。`);
process.exit(bad ? 1 : 0);
