/**
 * layout-audit.mjs —— 用 Chrome DevTools Protocol 检查页面是否有横向溢出
 *
 * 用法: node layout-audit.mjs <url> [宽度1,宽度2,...]
 * 依赖: 只需要 Node 22+（内置 WebSocket）和本机 Chrome
 */
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import { requireChrome, profileDir } from './chrome.mjs';

const URL_TO_TEST = process.argv[2] || 'http://localhost:8080/';
const WIDTHS = (process.argv[3] || '1440,1024,768,430,375,320').split(',').map(Number);
const PORT = 9333;

const exe = requireChrome();

const chrome = spawn(
  exe,
  [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    `--remote-debugging-port=${PORT}`,
    '--user-data-dir=' + profileDir('layout-audit'),
    'about:blank'
  ],
  { stdio: 'ignore', detached: false }
);

async function getWsUrl() {
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

const wsUrl = await getWsUrl();
const ws = new WebSocket(wsUrl);
let id = 0;
const pending = new Map();

await new Promise((res) => (ws.onopen = res));

ws.onmessage = (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg);
    pending.delete(msg.id);
  }
};

function send(method, params = {}, sessionId) {
  const mid = ++id;
  return new Promise((resolve) => {
    pending.set(mid, resolve);
    ws.send(JSON.stringify({ id: mid, method, params, sessionId }));
  });
}

// 新建一个页面 target
const { result: target } = await send('Target.createTarget', { url: 'about:blank' });
const { result: attached } = await send('Target.attachToTarget', {
  targetId: target.targetId,
  flatten: true
});
const sid = attached.sessionId;

await send('Page.enable', {}, sid);
await send('Runtime.enable', {}, sid);

const report = [];

for (const w of WIDTHS) {
  await send(
    'Emulation.setDeviceMetricsOverride',
    { width: w, height: 900, deviceScaleFactor: 1, mobile: w < 700 },
    sid
  );

  await send('Page.navigate', { url: URL_TO_TEST }, sid);
  await sleep(1600);

  const expr = `(() => {
    const de = document.documentElement;
    const offenders = [];
    document.querySelectorAll('body *').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.right > de.clientWidth + 1) {
        offenders.push({
          tag: el.tagName.toLowerCase(),
          cls: (el.className && el.className.toString().slice(0, 60)) || '',
          right: Math.round(r.right),
          w: Math.round(r.width)
        });
      }
    });
    // 去重，只留最外层
    const seen = new Set();
    const uniq = offenders.filter(o => {
      const k = o.tag + '|' + o.cls;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    }).slice(0, 6);
    return JSON.stringify({
      viewport: de.clientWidth,
      scrollWidth: de.scrollWidth,
      overflow: de.scrollWidth - de.clientWidth,
      bodyScrollWidth: document.body.scrollWidth,
      offenders: uniq
    });
  })()`;

  const evalRes = await send(
    'Runtime.evaluate',
    { expression: expr, returnByValue: true },
    sid
  );
  const raw = evalRes?.result?.result?.value;
  if (typeof raw !== 'string') {
    console.error('取值失败:', JSON.stringify(evalRes).slice(0, 500));
    process.exit(1);
  }
  const data = JSON.parse(raw);
  report.push({ width: w, ...data });
}

console.log('\n' + URL_TO_TEST);
console.log('='.repeat(72));
for (const r of report) {
  const flag = r.overflow > 1 ? '溢出 ' + r.overflow + 'px' : '正常';
  console.log(`视口 ${String(r.width).padStart(4)}px  ->  scrollWidth ${String(r.scrollWidth).padStart(4)}px   ${flag}`);
  if (r.offenders.length) {
    r.offenders.forEach((o) => console.log(`      . ${o.tag}.${o.cls}  右边界 ${o.right}px`));
  }
}
console.log('');

ws.close();
chrome.kill();
process.exit(0);
