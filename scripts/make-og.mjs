/**
 * make-og.mjs —— 把 scripts/og-card.html 渲染成分享卡片图
 *
 * 输出: public/images/og-default.png (1200x630)
 * 用法: node scripts/make-og.mjs
 *
 * 改了站名或配色后跑一次即可。靠本机 Chrome，无需额外依赖。
 */
import { spawn } from 'node:child_process';
import { existsSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pathToFileURL } from 'node:url';
import { setTimeout as sleep } from 'node:timers/promises';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const card = path.join(root, 'scripts', 'og-card.html');
const out = path.join(root, 'public', 'images', 'og-default.png');
const PORT = 9336;
const W = 1200;
const H = 630;

if (!existsSync(card)) {
  console.error('找不到 scripts/og-card.html');
  process.exit(1);
}

const exe = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome'
].find((p) => existsSync(p));

if (!exe) {
  console.error('没有找到 Chrome 或 Edge，无法渲染卡片。');
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
    '--user-data-dir=' + path.join(process.env.TEMP || '/tmp', 'og-profile'),
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
await send(
  'Emulation.setDeviceMetricsOverride',
  { width: W, height: H, deviceScaleFactor: 1, mobile: false },
  sid
);

await send('Page.navigate', { url: pathToFileURL(card).href }, sid);
await sleep(1500);

const shot = await send(
  'Page.captureScreenshot',
  { format: 'png', clip: { x: 0, y: 0, width: W, height: H, scale: 1 } },
  sid
);

if (!shot.result?.data) {
  console.error('截图失败，请检查 og-card.html 是否有报错。');
  process.exit(1);
}

writeFileSync(out, Buffer.from(shot.result.data, 'base64'));
console.log(`已生成 ${path.relative(root, out)}  (${W}x${H})`);

ws.close();
chrome.kill();
process.exit(0);
