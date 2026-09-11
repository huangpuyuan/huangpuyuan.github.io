#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
package.py —— 把整个工程打成一个 zip，用来备份或换机器。

默认排除 node_modules、dist、.astro、_shots 这几个可以重新生成的目录，
保留 .git（有它才能在另一台机器上直接继续提交和推送）。

用法:
    python scripts/package.py                # 输出到上一级目录
    python scripts/package.py -o D:/backup   # 指定输出目录
    python scripts/package.py --no-git       # 不要 .git，包更小
"""

import argparse
import os
import sys
import zipfile
from datetime import datetime

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# 这些目录不打包：要么能重新生成，要么是本机的临时产物
EXCLUDE_DIRS = {'node_modules', 'dist', '.astro', '_shots', '__pycache__', '.idea', '.vscode'}
EXCLUDE_FILES = {'.DS_Store', 'Thumbs.db'}


def rel_posix(path: str) -> str:
    return os.path.relpath(path, ROOT).replace(os.sep, '/')


def should_skip_dir(name: str, with_git: bool) -> bool:
    if name in EXCLUDE_DIRS:
        return True
    if name == '.git' and not with_git:
        return True
    return False


def collect(with_git: bool):
    """按相对路径排序产出，保证同一个工程每次打包顺序一致"""
    out = []
    for cur, dirs, files in os.walk(ROOT):
        dirs[:] = sorted(d for d in dirs if not should_skip_dir(d, with_git))
        for f in sorted(files):
            if f in EXCLUDE_FILES:
                continue
            full = os.path.join(cur, f)
            out.append(full)
    return sorted(out, key=rel_posix)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('-o', '--out', default=os.path.dirname(ROOT), help='输出目录，默认工程上级目录')
    ap.add_argument('--name', default='', help='包名，默认 博客改造-源码-<日期>.zip')
    ap.add_argument('--no-git', action='store_true', help='不打包 .git，体积更小但没有提交历史')
    args = ap.parse_args()

    stamp = datetime.now().strftime('%Y-%m-%d')
    name = args.name or f'博客改造-源码-{stamp}.zip'
    out_path = os.path.join(args.out, name)
    os.makedirs(args.out, exist_ok=True)

    files = collect(with_git=not args.no_git)
    if not files:
        print('没有找到任何文件，检查一下目录')
        return 1

    total = 0
    with zipfile.ZipFile(out_path, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        for full in files:
            # 统一放进一个顶层目录，解压出来不会散一地
            arc = f'storm-site/{rel_posix(full)}'
            z.write(full, arc)
            total += os.path.getsize(full)

    size = os.path.getsize(out_path)
    print(f'已打包  {out_path}')
    print(f'文件数  {len(files)}')
    print(f'原始    {total / 1024 / 1024:.1f} MB')
    print(f'压缩后  {size / 1024 / 1024:.1f} MB')
    return 0


if __name__ == '__main__':
    sys.exit(main())
