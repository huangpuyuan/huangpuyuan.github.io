/**
 * 本地预览：构建 -> 起一个本地服务器 -> 自动打开浏览器
 *
 * 双击项目根目录的 preview.bat 即可运行。
 */
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const PORT = Number(process.env.PORT) || 8080;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8'
};

console.log('\n正在构建站点...\n');

const build = spawn('npm', ['run', 'build'], { cwd: root, stdio: 'inherit', shell: process.platform === 'win32' });

build.on('exit', (code) => {
  if (code !== 0) {
    console.log('\n构建失败，请把上面的报错发给我。');
    process.exit(1);
  }
  serve();
});

function serve() {
  if (!existsSync(dist)) {
    console.log('没有找到 dist 目录。');
    process.exit(1);
  }

  createServer(async (req, res) => {
    let p = decodeURIComponent((req.url || '/').split('?')[0]);
    if (p.endsWith('/')) p += 'index.html';

    let file = path.join(dist, p);
    if (!path.resolve(file).startsWith(dist)) {
      res.writeHead(403).end('403');
      return;
    }

    try {
      if (!existsSync(file) && !path.extname(file)) {
        file = path.join(dist, p, 'index.html');
      }
      const buf = await readFile(file);
      res.writeHead(200, {
        'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream',
        'Cache-Control': 'no-store'
      });
      res.end(buf);
    } catch {
      try {
        const buf = await readFile(path.join(dist, '404.html'));
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(buf);
      } catch {
        res.writeHead(404).end('404');
      }
    }
  }).listen(PORT, () => {
    const url = `http://localhost:${PORT}/`;
    console.log('\n============================================');
    console.log('  预览地址： ' + url);
    console.log('  按 Ctrl + C 停止');
    console.log('============================================\n');

    const open =
      process.platform === 'win32'
        ? ['cmd', ['/c', 'start', '', url]]
        : process.platform === 'darwin'
          ? ['open', [url]]
          : ['xdg-open', [url]];
    spawn(open[0], open[1], { stdio: 'ignore', detached: true, shell: process.platform === 'win32' }).unref();
  });
}
