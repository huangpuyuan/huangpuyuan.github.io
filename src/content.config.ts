import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    category: z.string().optional(),
    summary: z.string().optional(),
    draft: z.boolean().default(false)
  })
});

/**
 * 数据结构讲解系列（实验室 / 数据结构练习）
 * order 决定顺序，「上一篇 / 下一篇」和目录都按它排。
 * demo / source 指向 public/lab/datastructures 里的真实文件。
 */
const ds = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/ds' }),
  schema: z.object({
    title: z.string(),
    order: z.number(),
    summary: z.string(),
    /** 一句话结论，列表页和页头都用它 */
    gist: z.string().optional(),
    /** 常用操作的复杂度，如 ['查找 O(log n)', '插入 O(log n)'] */
    complexity: z.array(z.string()).default([]),
    /** 对应书里的章节名，来源是《学习 JavaScript 数据结构与算法》 */
    chapter: z.string().optional(),
    /** 演示页（public/lab/datastructures 下的相对路径） */
    demo: z.string().optional(),
    /** 源码文件（同上） */
    source: z.string().optional()
  })
});

export const collections = { blog, ds };
