/** 日期与阅读时长等展示用的小工具 */

export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatDateCN(date: Date): string {
  return `${date.getFullYear()} 年 ${date.getMonth() + 1} 月 ${date.getDate()} 日`;
}

/** 中文按字符数估算，约 380 字/分钟 */
export function readingTime(text: string): string {
  const chars = text.replace(/\s/g, '').length;
  const minutes = Math.max(1, Math.round(chars / 380));
  return `${minutes} 分钟`;
}

/** 分类名转 URL 片段：中文保留，空格转横线 */
export function tagSlug(name: string): string {
  return name
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[/?#%]/g, '')
    .toLowerCase();
}

/**
 * 站内地址一律带结尾斜杠。
 *
 * 构建用的是 build.format: 'directory'，/blog/xxx 实际落在 /blog/xxx/index.html。
 * 少了结尾斜杠，很多静态服务器（含 astro preview）会直接 404，
 * 而不是像想象中那样自动补上。所以别在这里省斜杠。
 */
export function postUrl(id: string): string {
  return `/blog/${id.replace(/\/+$/, '')}/`;
}

export function tagUrl(name: string): string {
  return `/tags/${tagSlug(name)}/`;
}

/** 去掉 Markdown 与公式标记，留下纯文本，用于搜索索引与摘要 */
export function plainText(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\$\$[\s\S]*?\$\$/g, ' ')
    .replace(/\$[^$\n]*\$/g, ' ')
    .replace(/^\s{0,3}#{1,6}\s*/gm, '')
    .replace(/^\s*>\s?/gm, '')
    .replace(/[*_`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
