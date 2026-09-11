/**
 * scan-frontend-titles.mjs —— 一次性勘察：把 frontend 下所有 HTML 的标题打出来
 * 用来决定哪些标题可用、哪些要手工覆盖。跑完可删。
 */
import { readdirSync, statSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const base = path.join(here, '..', 'public', 'lab', 'frontend');

function walk(dir, out = []) {
  for (const n of readdirSync(dir)) {
    const p = path.join(dir, n);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.html?$/i.test(n)) out.push(p);
  }
  return out;
}

for (const f of walk(base).sort()) {
  const rel = path.relative(base, f).split(path.sep).join('/');
  let t = '';
  try {
    const m = readFileSync(f, 'utf8').match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    if (m) t = m[1].replace(/\s+/g, ' ').trim();
  } catch {}
  console.log((t || '(无标题)').padEnd(34, ' ') + ' | ' + rel);
}
