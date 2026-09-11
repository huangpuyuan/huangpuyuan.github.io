#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
convert_posts.py —— 把 Jekyll 的 _posts 转成 Astro content collection 格式

处理内容：
  1. front matter: layout/title/categories  ->  title/date/category/slug
  2. 图片路径 ..\\images\\x.png  ->  /images/blog/x.png
  3. 清除 Jekyll 专有标记 {:toc} {: toc} {:target="_blank"}
  4. 自动生成 160 字以内的摘要
"""
import os
import re
import json
import sys

SRC = r"D:\ai\project\_posts_raw"
DST = r"D:\ai\project\storm-site\src\content\blog"

# 手工维护的 slug，保证 URL 好看且稳定
SLUGS = {
    "2019-10-14-Big_data_thinking": "big-data-thinking",
    "2019-11-05-digital_economy": "digital-economy",
    "2019-12-03-open_banking": "open-banking",
    "2019-5-1-Socialist_economic_theory": "socialist-economic-theory",
    "2019-6-1-_macroeconomic_policy": "macroeconomic-policy",
    "2019-7-1-The_Future_Lifetime_Model": "future-lifetime-model",
    "2019-8-13-how_to_research_(1)": "how-to-research-1",
    "2019-8-14-how_to_research_(2)": "how-to-research-2",
    "2019-8-16-Big_data_market_output_estimate": "big-data-market-output-estimate",
    "2019-8-16-working_quickly": "working-quickly",
    "2019-8-17-how_to_research_(3)": "how-to-research-3",
    "2019-8-19-Reduced_fat_diet": "reduced-fat-diet",
    "2019-8-21-Statistics_with_Julia": "statistics-with-julia",
    "2019-8-22-Julia_is_fast": "julia-is-fast",
    "2019-8-26-The_first_AI_stock": "first-ai-stock",
    "2019-8-29-How_to_Become_an_AI_Engineer": "how-to-become-an-ai-engineer",
    "2019-8-30-Math_in_Data_Science": "math-in-data-science",
}


def parse_front_matter(text):
    m = re.match(r"^---\s*\r?\n(.*?)\r?\n---\s*\r?\n?(.*)$", text, re.S)
    if not m:
        return {}, text
    meta = {}
    for line in m.group(1).splitlines():
        mm = re.match(r"^([A-Za-z_-]+)\s*:\s*(.*)$", line)
        if mm:
            meta[mm.group(1).strip()] = mm.group(2).strip()
    return meta, m.group(2)


def strip_markdown(s):
    s = re.sub(r"!\[[^\]]*\]\([^)]*\)", "", s)          # 图片
    s = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", s)        # 链接保留文字
    s = re.sub(r"[*_`>#]", "", s)                          # 强调与标题符号
    s = re.sub(r"\$[^$]*\$", "", s)                        # 公式
    s = re.sub(r"\s+", " ", s)
    return s.strip()


def make_summary(body):
    for block in re.split(r"\n\s*\n", body):
        b = block.strip()
        if not b:
            continue
        if b.startswith("![") or b.startswith("#") or b.startswith("* toc") or b.startswith("{"):
            continue
        if re.match(r"^[-*]\s", b):      # 列表也能当摘要
            b = re.sub(r"^[-*]\s*", "", b)
        text = strip_markdown(b)
        text = re.sub(r"^[>\s]*", "", text).strip()
        if len(text) < 12:
            continue
        return text[:110]
    return ""


def convert():
    os.makedirs(DST, exist_ok=True)
    files = sorted(f for f in os.listdir(SRC) if f.endswith(".md"))
    out = []
    for fn in files:
        stem = fn[:-3]
        with open(os.path.join(SRC, fn), "r", encoding="utf-8") as fh:
            raw = fh.read()

        meta, body = parse_front_matter(raw)

        # 日期
        dm = re.match(r"^(\d{4})-(\d{1,2})-(\d{1,2})-(.*)$", stem)
        if not dm:
            print("跳过（无法解析日期）:", fn, file=sys.stderr)
            continue
        year, month, day, rest = dm.groups()
        date = "%s-%02d-%02d" % (year, int(month), int(day))

        slug = SLUGS.get(stem) or re.sub(r"[^a-z0-9]+", "-", rest.lower()).strip("-")

        # 正文清洗
        body = body.replace("\r\n", "\n")
        body = re.sub(r"\.\.\\images\\", "/images/blog/", body)
        body = re.sub(r"\.\./images/", "/images/blog/", body)
        body = re.sub(r"!\[([^\]]*)\]\(/images/blog/([^)]+)\)", r"![\1](/images/blog/\2)", body)
        body = re.sub(r"^\s*\*\s*toc\s*$\n?", "", body, flags=re.M)
        body = re.sub(r"^\s*\{:\s*toc\s*\}\s*$\n?", "", body, flags=re.M)
        body = re.sub(r"\{:target=\"[^\"]*\"\}", "", body)
        body = re.sub(r"^\s*\{:toc\}\s*$\n?", "", body, flags=re.M)
        body = body.strip() + "\n"

        title = meta.get("title", slug).strip().strip('"')
        category = meta.get("categories", "").strip()
        summary = make_summary(body)

        fm = ["---"]
        fm.append("title: %s" % json.dumps(title, ensure_ascii=False))
        fm.append("date: %s" % date)
        if category:
            fm.append("category: %s" % json.dumps(category, ensure_ascii=False))
        fm.append("summary: %s" % json.dumps(summary, ensure_ascii=False))
        fm.append("---")
        fm.append("")

        with open(os.path.join(DST, slug + ".md"), "w", encoding="utf-8") as fh:
            fh.write("\n".join(fm) + body)

        out.append({
            "file": slug + ".md",
            "title": title,
            "date": date,
            "category": category,
            "chars": len(body),
            "images": len(re.findall(r"!\[", body)),
        })

    out.sort(key=lambda x: x["date"], reverse=True)
    print("转换完成，共 %d 篇\n" % len(out))
    print("%-34s %-12s %-8s %6s %4s" % ("文件", "日期", "分类", "字数", "图"))
    print("-" * 72)
    for o in out:
        print("%-34s %-12s %-8s %6d %4d" % (o["file"], o["date"], o["category"], o["chars"], o["images"]))


if __name__ == "__main__":
    convert()
