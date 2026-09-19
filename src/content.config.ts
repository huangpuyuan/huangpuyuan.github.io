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

/**
 * Julia 统计模拟笔记（实验室 / Julia）
 * 和 ds 一样的结构，但 demo 换成「脚本」——浏览器跑不了 Julia，
 * 所以每篇配的是「代码 + 实测输出 + 讲解」。
 */
const julia = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/julia' }),
  schema: z.object({
    title: z.string(),
    order: z.number(),
    /** 文件名带 .jl 点号会被去掉（dice.jl.md → dicejl），所以显式指定 */
    slug: z.string().optional(),
    summary: z.string(),
    gist: z.string().optional(),
    complexity: z.array(z.string()).default([]),
    chapter: z.string().optional(),
    /** 脚本文件（public/lab/julia 下的相对路径） */
    script: z.string().optional()
  })
});

/**
 * Python 学习笔记（实验室 / Python）
 * 2018 基础 + 2024 数据分析两批笔记合并而来，来源仓库 Coding 与 pyhton3_data。
 * script 指向 public/lab/python/scripts 下的可运行脚本。
 */
const python = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/python' }),
  schema: z.object({
    title: z.string(),
    order: z.number(),
    /** 文件名可能不便于做 slug 时显式指定 */
    slug: z.string().optional(),
    /** 列表页与页头用的一句话简介 */
    description: z.string(),
    gist: z.string().optional(),
    /** 预估阅读分钟数 */
    minutes: z.number().optional(),
    /** 分类标签，如 Pandas / 机器学习 */
    tag: z.string().optional(),
    updated: z.string().optional(),
    /** 对应脚本（public/lab/python/scripts 下的文件名） */
    script: z.string().optional()
  })
});

/**
 * ES6 学习笔记（实验室 / ES6）
 * 来源仓库 ES6learning，17 个 lesson 做成浏览器可跑的演示页。
 * demo 指向 public/lab/es6 下的 html。
 */
const es6 = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/es6' }),
  schema: z.object({
    title: z.string(),
    order: z.number(),
    slug: z.string().optional(),
    description: z.string(),
    gist: z.string().optional(),
    minutes: z.number().optional(),
    tag: z.string().optional(),
    updated: z.string().optional(),
    /** 演示页（public/lab/es6 下的相对路径） */
    demo: z.string().optional(),
    /** 对应的 lesson 编号，如 '1,2,3' */
    lessons: z.string().optional()
  })
});

export const collections = { blog, ds, julia, python, es6 };
