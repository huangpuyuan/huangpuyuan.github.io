/**
 * fix-frontend-refs.mjs —— 把 myExercises-FrontEnd 里失效的外部 CDN 引用
 * 改为指向 ../vendor（本地已归档的前端库）。
 *
 * 只在一次性搬运老项目时跑，跑完即可删除。
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const base = path.join(here, '..', 'public', 'lab', 'frontend');

// 文件 -> 命中 vendor 时的相对前缀
// 注：原 frontend/index.html 已经换成 src/pages/lab/frontend.astro，不在这个列表里了
const jobs = [
  ['demo/index.html', '../../vendor/'],
  ['demo.html', '../vendor/']
];

const MAP = [
  ['https://cdn.bootcss.com/bootstrap/3.3.7/css/bootstrap.min.css', 'bootstrap.min.css'],
  ['https://cdn.bootcss.com/bootstrap/3.3.7/js/bootstrap.min.js', 'bootstrap.min.js'],
  ['https://cdn.bootcss.com/jquery/1.12.4/jquery.min.js', 'jquery.min.js'],
  ['https://cdn.bootcss.com/angular.js/1.6.3/angular.min.js', 'angular.min.js'],
  [
    'https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css',
    'fonts/font-awesome.min.css'
  ],
  ['https://cdn.rawgit.com/konpa/devicon/master/devicon.min.css', 'devicon.min.css']
];

// 已失效的 favicon 与国内不可达的 Google Fonts
const DEAD = [
  /\s*<link rel="icon" type="image\/x-icon" href="https:\/\/assets-cdn\.github\.com\/favicon\.ico">/,
  /\s*@import url\('https:\/\/fonts\.googleapis\.com\/css\?family=Montserrat'\);/
];

for (const [file, prefix] of jobs) {
  const full = path.join(base, file);
  if (!existsSync(full)) {
    console.log('已跳过   ' + file + '（文件不存在）');
    continue;
  }
  let s = readFileSync(full, 'utf8');
  const before = s;
  for (const [from, to] of MAP) s = s.split(from).join(prefix + to);
  for (const re of DEAD) s = s.replace(re, '');
  if (s === before) {
    console.log('无需改动 ' + file);
  } else {
    writeFileSync(full, s);
    console.log('已修复   ' + file);
  }
}

/**
 * demo.html 里指向作业目录的几个链接当年没写结尾斜杠。
 * 目录形式的地址少了斜杠，静态托管上会直接 404，补上。
 */
{
  const full = path.join(base, 'demo.html');
  const s = readFileSync(full, 'utf8');
  const next = s.replace(/href="homeworks\/(homework\d+)"/g, 'href="homeworks/$1/"');
  if (next === s) {
    console.log('无需改动 demo.html 的作业链接');
  } else {
    writeFileSync(full, next);
    console.log('已补斜杠 demo.html 的作业链接');
  }
}
