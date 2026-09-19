/**
 * lint-links.mjs —— 扫描构建产物里的死链
 *
 * 用法: node lint-links.mjs [起始目录，默认 dist] [--external]
 *
 * 只检查站内链接：把每个 HTML 里的 src/href 解析成 URL 路径，
 * 再看 dist 里有没有对应文件（含目录形式 /a/b/ -> /a/b/index.html）。
 * 加 --external 会额外请求一遍外链（慢，且受网络影响）。
 *
 * 靠 Node 内置模块，无需依赖。
 */
import { readdirSync, statSync, existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const rootArg = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : 'dist';
const dist = path.resolve(here, '..', rootArg);
const checkExternal = process.argv.includes('--external');

if (!existsSync(dist)) {
  console.error('没有找到目录: ' + dist);
  process.exit(1);
}

/* ---------- 收集所有 HTML ---------- */
function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = path.join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.html?$/i.test(name)) out.push(p);
  }
  return out;
}

const htmlFiles = walk(dist);

/* ---------- 解析出引用 ---------- */
const REF = /(?:src|href)\s*=\s*"([^"]+)"|(?:src|href)\s*=\s*'([^']+)'/gi;

function refsOf(file) {
  const s = readFileSync(file, 'utf8');
  const out = [];
  let m;
  while ((m = REF.exec(s))) out.push(decodeEntities(m[1] ?? m[2]));
  return out;
}

/** 把文件路径转成站点 URL 路径，例如 dist/lab/todo/index.html -> /lab/todo/ */
function urlPathOf(file) {
  let rel = path.relative(dist, file).split(path.sep).join('/');
  rel = rel.replace(/index\.html?$/i, '');
  return '/' + rel;
}

const SKIP = /^(?:#|mailto:|tel:|javascript:|data:)/i;
// 模板表达式（Angular / Vue / Handlebars）不是真实链接，会被当成死链误报
const TEMPLATE = /\{\{|\}\}|\$\{/;

/**
 * 已知的失效链接白名单。
 * 2026-09-19 已把老页面里的引用清理干净（多余的 style.css link、没做完的 Demo2/3/4），
 * 白名单清空，现在任何站内死链都会计入退出码。
 * 以后若再发现历史遗留死链，先修页面，不要往这里加。
 */
const KNOWN_BROKEN = new Set([
]);

/**
 * 属性值里的 & 会被序列化成 &#38; / &amp;，浏览器解析时会还原，
 * 扫描时要跟着还原一遍，否则含 & 的文件名会被误判成死链。
 */
function decodeEntities(s) {
  return s
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

const brokenInternal = [];
const knownBroken = [];
const slashlessInternal = [];
const externalSet = new Set();
let checkedInternal = 0;

for (const file of htmlFiles) {
  const from = urlPathOf(file);
  for (const raw of refsOf(file)) {
    const ref = raw.trim();
    if (!ref || SKIP.test(ref) || TEMPLATE.test(ref)) continue;

    let target;
    if (/^https?:\/\//i.test(ref)) {
      externalSet.add(ref);
      continue;
    }
    if (ref.startsWith('//')) {
      externalSet.add('https:' + ref);
      continue;
    }

    // 解析成绝对 URL 路径
    try {
      target = new URL(ref, 'http://x' + from).pathname;
    } catch {
      continue;
    }
    target = decodeURIComponent(target);

    checkedInternal++;
    const asFile = path.join(dist, target);
    const isFile = existsSync(asFile) && statSync(asFile).isFile();
    const isDir = existsSync(asFile) && statSync(asFile).isDirectory();
    const hasIndex = isDir && existsSync(path.join(asFile, 'index.html'));

    if (isFile) continue;

    // 目标是个目录但引用时没写结尾斜杠。astro preview 上直接 404，
    // 静态托管也多靠一次 301 兜着，所以单独列一类，不和真死链混在一起。
    if (hasIndex && !target.endsWith('/')) {
      slashlessInternal.push({ from, ref, target: target + '/' });
      continue;
    }

    if (hasIndex) continue; // 目录形式，写法正确

    const item = { from, ref, target };
    if (KNOWN_BROKEN.has(target)) knownBroken.push(item);
    else brokenInternal.push(item);
  }
}

/* ---------- 输出 ---------- */
console.log('\n死链扫描  ' + path.relative(process.cwd(), dist));
console.log('='.repeat(72));
console.log('HTML 文件   ' + htmlFiles.length);
console.log('站内引用    ' + checkedInternal);
console.log('外链        ' + externalSet.size + '（未检查）');
console.log('');

if (brokenInternal.length === 0) {
  console.log('站内链接全部有效。\n');
} else {
  console.log('发现 ' + brokenInternal.length + ' 条无效站内链接：\n');
  const seen = new Set();
  for (const b of brokenInternal) {
    const key = b.from + ' -> ' + b.ref;
    if (seen.has(key)) continue;
    seen.add(key);
    console.log('  在 ' + b.from);
    console.log('     ' + b.ref + '   (解析为 ' + b.target + ')');
  }
  console.log('');
}

if (slashlessInternal.length > 0) {
  const seen = new Set();
  const rows = [];
  for (const b of slashlessInternal) {
    const key = b.from + ' -> ' + b.ref;
    if (seen.has(key)) continue;
    seen.add(key);
    rows.push(b);
  }
  console.log('发现 ' + rows.length + ' 条缺结尾斜杠的站内链接：\n');
  for (const b of rows) {
    console.log('  在 ' + b.from);
    console.log('     ' + b.ref + '   应写成 ' + b.target);
  }
  console.log('');
  console.log('  构建是 directory 格式，目录地址少了结尾斜杠会 404（astro preview 直接 404，');
  console.log('  静态托管多靠一次 301 兜着）。写法参考 src/utils/format.ts 里的 postUrl / tagUrl。\n');
}

if (knownBroken.length > 0) {
  const seen = new Set();
  const rows = [];
  for (const b of knownBroken) {
    const key = b.from + ' -> ' + b.ref;
    if (seen.has(key)) continue;
    seen.add(key);
    rows.push(b);
  }
  console.log('已知失效链接 ' + rows.length + ' 条（2017 年原代码里就缺文件，不计入失败）：\n');
  for (const b of rows) {
    console.log('  在 ' + b.from + '  ->  ' + b.ref);
  }
  console.log('');
}

/* ---------- 可选：外链 ---------- */
if (checkExternal) {
  const urls = [...externalSet];
  console.log('正在检查 ' + urls.length + ' 条外链...\n');
  const bad = [];
  for (const u of urls) {
    let code = '000';
    try {
      const ctl = AbortSignal.timeout(12000);
      const r = await fetch(u, { method: 'HEAD', redirect: 'follow', signal: ctl });
      code = String(r.status);
    } catch {
      code = '000';
    }
    if (code === '000' || Number(code) >= 400) {
      bad.push({ u, code });
      console.log('  ' + code + '  ' + u);
    }
  }
  if (bad.length === 0) console.log('  外链全部可达。');
  console.log('');
}

process.exit(brokenInternal.length + slashlessInternal.length > 0 ? 1 : 0);
