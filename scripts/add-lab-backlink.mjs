/**
 * add-lab-backlink.mjs —— 给 public/lab 下的老页面注入一个"返回"小浮标
 *
 * 这些老页面是独立 HTML，不带新站的导航栏，进去之后只能按浏览器后退。
 * 这个脚本在 </body> 前插一个固定定位的小链接，其余内容一律不动。
 *
 * 浮标指向所在分区的索引页（/lab/frontend/ 或 /lab/datastructures/），
 * 相对路径按每个文件的实际深度算，所以深层页也能正确返回。
 *
 * 幂等：已有标记的会先用新版覆盖，不会叠加。
 */
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const lab = path.join(here, '..', 'public', 'lab');

const MARK = 'data-lab-backlink';

/** 分区 -> 浮标文案（分区索引页由 Astro 生成，不在 public 里） */
const SECTIONS = [
  { dir: 'frontend', label: '前端练习集' },
  { dir: 'datastructures', label: '数据结构练习' }
];

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === 'vendor') continue;
    const p = path.join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.html?$/i.test(name)) out.push(p);
  }
  return out;
}

function snippet(href, label) {
  const s =
    'position:fixed;left:16px;bottom:16px;z-index:2147483647;display:inline-flex;' +
    'align-items:center;gap:6px;padding:8px 14px;border-radius:999px;' +
    'background:rgba(15,20,28,.82);color:#fff;' +
    "font:500 13px/1 ui-sans-serif,-apple-system,'Segoe UI','PingFang SC','Microsoft YaHei',sans-serif;" +
    'text-decoration:none;box-shadow:0 4px 18px rgba(0,0,0,.28);' +
    'backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)';
  return (
    `<!-- ${MARK} -->\n` +
    `<a ${MARK} href="${href}" title="返回${label}" style="${s}">← ${label}</a>\n`
  );
}

let done = 0;

for (const { dir, label } of SECTIONS) {
  const root = path.join(lab, dir);
  if (!existsSync(root)) {
    console.log('跳过（不存在） ' + dir);
    continue;
  }

  for (const file of walk(root)) {
    const rel = path.relative(root, file).split(path.sep).join('/');
    // 文件所在目录相对分区根的深度，决定要往上走几层
    const dirRel = path.posix.dirname(rel);
    const depth = dirRel === '.' ? 0 : dirRel.split('/').length;
    const href = depth === 0 ? './' : '../'.repeat(depth);

    let s = readFileSync(file, 'utf8');
    const had = s.includes(MARK);
    if (had) {
      s = s.replace(new RegExp('<!--\\s*' + MARK + '\\s*-->\\s*<a[^>]*data-lab-backlink[^>]*>[\\s\\S]*?</a>\\s*\\n?'), '');
    }

    const at = s.toLowerCase().lastIndexOf('</body>');
    const block = snippet(href, label);
    s = at === -1 ? s + '\n' + block : s.slice(0, at) + block + s.slice(at);
    writeFileSync(file, s);
    console.log((had ? '已更新 ' : '已注入 ') + dir + '/' + rel + '  ->  ' + href);
    done++;
  }
}

console.log('\n共处理 ' + done + ' 个页面。');
