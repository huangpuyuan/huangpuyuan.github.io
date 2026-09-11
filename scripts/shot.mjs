/**
 * shot.mjs —— 用 CDP 截图，可指定主题（浅色/深色）与视口
 *
 * 用法: node shot.mjs <url> <宽> <高> <light|dark> <输出文件> ["截图前执行的JS"]
 */
import { spawn } from 'node:child_process';
import { existsSync, writeFileSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const [url, w = '1400', h = '2400', theme = 'light', out = 'shot.png', action = '', mode = ''] =
  process.argv.slice(2);
const PORT = 9334;

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
    '--user-data-dir=' + process.env.TEMP + '\\shot-profile',
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
  { width: Number(w), height: Number(h), deviceScaleFactor: 1, mobile: Number(w) < 700 },
  sid
);
await send(
  'Emulation.setEmulatedMedia',
  { features: [{ name: 'prefers-color-scheme', value: theme }] },
  sid
);

await send('Page.navigate', { url }, sid);
await sleep(2200);

if (action) {
  await send('Runtime.evaluate', { expression: action, returnByValue: true }, sid);
  await sleep(1200);
}

const shot = await send(
  'Page.captureScreenshot',
  { format: 'png', captureBeyondViewport: mode !== 'viewport' },
  sid
);
writeFileSync(out, Buffer.from(shot.result.data, 'base64'));
console.log(`已保存 ${out}  (${w}x${h}, ${theme})`);

ws.close();
chrome.kill();
process.exit(0);
