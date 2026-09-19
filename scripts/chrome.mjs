/**
 * chrome.mjs —— 找一个能用的 Chrome/Chromium，供各个 CDP 脚本共用
 *
 * 原来每个脚本都各自写死了一遍 Windows 路径，在 macOS / Linux 上直接
 * 报「没有找到 Chrome 或 Edge」。这里统一成跨平台候选列表。
 */
import { existsSync } from 'node:fs';

const CANDIDATES = [
  // Linux
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/snap/bin/chromium',
  '/opt/google/chrome/chrome',
  // macOS
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  // Windows
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
];

/** 找到可用的浏览器可执行文件；找不到返回 null */
export function findChrome() {
  return CANDIDATES.find((p) => existsSync(p)) ?? null;
}

/** 找浏览器，找不到就打印提示并退出 */
export function requireChrome() {
  const exe = findChrome();
  if (!exe) {
    console.error('没有找到 Chrome 或 Edge');
    process.exit(1);
  }
  return exe;
}

/** 各个脚本用的 profile 目录，放在临时目录下，跨平台 */
export function profileDir(name) {
  return process.platform === 'win32'
    ? `${process.env.TEMP || '.'}\\${name}-profile`
    : `/tmp/${name}-profile`;
}
