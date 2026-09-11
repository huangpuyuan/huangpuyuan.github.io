/**
 * add-console-mirror.mjs —— 给数据结构演示页注入"控制台输出镜像"
 *
 * 这批 2017 年的演示页只会 console.log，直接打开是一片空白。
 * 这个脚本在 <body> 开头插一段独立脚本，把 console.log 的内容同时画到页面上，
 * 原来的逻辑一行不动；控制台照常输出。
 *
 * 幂等：重复跑会用新版覆盖旧版，不会叠加。
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const base = path.join(here, '..', 'public', 'lab', 'datastructures');

const targets = [
  'trees/binarySearchTree.html',
  'hash/UsingHash.html',
  'hash/usingHashTableSeparateChaining.html',
  'hash/linearProbing.html',
  'dictionary/UsingDictionary.html',
  'set/UsingSet.html',
  'graph/usinggraph.html'
];

const MARK = 'data-lab-console';

const SNIPPET = `<!-- ${MARK} -->
<script ${MARK}>
(function () {
  var lines = [];
  var box = null;

  function ensure() {
    if (box && box.isConnected) return box;
    box = document.createElement('pre');
    box.style.cssText =
      'margin:0;padding:18px 20px;' +
      'font:13px/1.75 ui-monospace,SFMono-Regular,"Cascadia Mono",Consolas,Menlo,' +
      '"DejaVu Sans Mono","Segoe UI Symbol","Apple Symbols",monospace;' +
      'white-space:pre-wrap;word-break:break-word;color:#0b0f14;background:#f6f7f9;' +
      'border-bottom:1px solid #e2e6eb;min-height:34px';
    var host = document.body || document.documentElement;
    host.insertBefore(box, host.firstChild);
    return box;
  }

  function fmt(v) {
    var seen = [];
    function walk(x, d) {
      if (x === null) return 'null';
      var t = typeof x;
      if (t === 'string') return x;
      if (t === 'number' || t === 'boolean' || t === 'bigint') return String(x);
      if (t === 'undefined') return 'undefined';
      if (t === 'function') return 'f ' + (x.name || 'anonymous');
      if (x instanceof Error) return x.name + ': ' + x.message;
      if (d > 5) return '...';
      if (seen.indexOf(x) > -1) return '[Circular]';
      seen.push(x);
      if (Array.isArray(x)) {
        return '[' + x.map(function (i) { return walk(i, d + 1); }).join(', ') + ']';
      }
      return '{' + Object.keys(x).map(function (k) {
        return k + ': ' + walk(x[k], d + 1);
      }).join(', ') + '}';
    }
    return walk(v, 0);
  }

  ['log', 'info', 'warn', 'error'].forEach(function (kind) {
    var orig = console[kind] ? console[kind].bind(console) : function () {};
    console[kind] = function () {
      var args = Array.prototype.slice.call(arguments);
      lines.push(args.map(fmt).join(' '));
      try { ensure().textContent = lines.join('\\n'); } catch (e) {}
      orig.apply(null, args);
    };
  });

  window.addEventListener('load', function () {
    setTimeout(function () {
      if (!lines.length) {
        ensure().textContent = '(页面跑完了，但没有任何输出)';
      }
    }, 80);
  });
})();
</script>
`;

for (const file of targets) {
  const full = path.join(base, file);
  if (!existsSync(full)) {
    console.log('跳过（不存在） ' + file);
    continue;
  }
  let s = readFileSync(full, 'utf8');

  // 已有旧版本就先摘掉，再用新版插回去（方便改字体/改样式后重跑）
  const hadOld = s.includes(MARK);
  if (hadOld) {
    s = s.replace(new RegExp('<!--\\s*' + MARK + '\\s*-->[\\s\\S]*?</script>\\s*\\n?'), '');
  }

  const m = s.match(/<body[^>]*>/i);
  if (!m) {
    console.log('找不到 body，跳过 ' + file);
    continue;
  }
  const at = m.index + m[0].length;
  s = s.slice(0, at) + '\n' + SNIPPET + s.slice(at);
  writeFileSync(full, s);
  console.log((hadOld ? '已更新镜像 ' : '已注入镜像 ') + file);
}
