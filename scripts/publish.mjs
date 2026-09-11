/**
 * 一键发布：构建 -> 提交 -> 推送
 *
 * 双击项目根目录的 publish.bat 即可运行。
 */
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const isWin = process.platform === 'win32';

function run(cmd, args, opts = {}) {
  return spawnSync(cmd, args, {
    cwd: root,
    stdio: 'inherit',
    shell: isWin,
    ...opts
  });
}

function line(text = '') {
  console.log(text);
}

function banner(title) {
  line();
  line('============================================');
  line('  ' + title);
  line('============================================');
  line();
}

banner('Storm · 开泰 个人主页 · 一键发布');

/* ---------- 1. 依赖 ---------- */
if (!existsSync(path.join(root, 'node_modules'))) {
  line('[1/4] 首次运行，正在安装依赖，这一步可能要几分钟...');
  const r = run('npm', ['install']);
  if (r.status !== 0) {
    line('\n依赖安装失败，请检查网络后重试。');
    process.exit(1);
  }
} else {
  line('[1/4] 依赖已就绪。');
}

/* ---------- 2. 构建 ---------- */
line('[2/4] 正在构建站点...');
const build = run('npm', ['run', 'build']);
if (build.status !== 0) {
  line('\n构建失败，请把上面的报错发给我。');
  process.exit(1);
}
line('      构建完成，产物在 dist 目录。');

/* ---------- 3. 检查 git ---------- */
line('[3/4] 正在提交改动...');
if (!existsSync(path.join(root, '.git'))) {
  line();
  line('当前目录还不是 git 仓库，没法自动推送。');
  line('请先在项目目录执行：');
  line();
  line('  git init');
  line('  git remote add origin https://github.com/huangpuyuan/huangpuyuan.github.io.git');
  line('  git branch -M master');
  line();
  line('然后再运行一次本脚本。');
  process.exit(0);
}

const status = spawnSync('git', ['status', '--porcelain'], { cwd: root, encoding: 'utf8', shell: isWin });
if (!status.stdout.trim()) {
  line('      没有需要提交的改动，跳过。');
} else {
  run('git', ['add', '-A']);
  const stamp = new Date().toLocaleString('zh-CN');
  run('git', ['commit', '-m', `更新站点内容 ${stamp}`]);
  line('      已生成提交。');
}

/* ---------- 4. 推送 ---------- */
line('[4/4] 正在推送到 GitHub...');
const push = run('git', ['push']);
if (push.status !== 0) {
  line();
  line('推送失败。常见原因：');
  line('  · 还没登录 GitHub，需要先配置一次凭证');
  line('  · 远程分支名不是 master，用 git branch -M master 改一下');
  line();
  line('推上去之后 GitHub 会自动构建并发布，大约 1 到 2 分钟。');
  process.exit(1);
}

banner('发布完成');
line('地址： https://huangpuyuan.github.io/');
line('线上生效大约需要 1 到 2 分钟。');
line();
