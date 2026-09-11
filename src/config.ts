/**
 * 全站唯一配置源
 * 改站名、改链接、改导航、改首页内容，都只动这个文件。
 */

export const site = {
  /** 英文站名 */
  name: 'Storm',
  /** 中文名 */
  nameZh: '开泰',
  /** 浏览器标题后缀 */
  title: 'Storm',
  /** 首页副标题 */
  role: 'Software Developer',
  /** 一句话介绍 */
  tagline: '写点研究笔记，放几个写过的东西，偶尔读诗。',

  /** 站点地址（换了域名只改这里） */
  url: 'https://huangpuyuan.github.io',
  /** 如果部署在子路径，填 '/repo-name'，根域名留空 */
  base: '',

  /** 默认分享卡片图 */
  ogImage: '/images/og-default.png'
} as const;

/**
 * 顶部导航
 * 站内页面一律写结尾斜杠：构建是 directory 格式，少斜杠会 404，详见 utils/format.ts
 */
export const nav = [
  { label: '笔记', href: '/blog/' },
  { label: '作品', href: '/#works' },
  { label: '实验室', href: '/lab/' },
  { label: '读诗', href: '/#poems' },
  { label: '关于', href: '/about/' }
] as const;

/** 首页 hero 上的联系入口（显示名刻意不含真名） */
export const contacts = [
  { label: 'Email', href: 'mailto:huangpuyuan@outlook.com' },
  { label: 'GitHub', href: 'https://github.com/huangpuyuan' },
  { label: 'Weibo', href: 'http://www.weibo.com/u/1782128912' },
  { label: 'Steam', href: 'http://steamcommunity.com/profiles/76561198095641607/' }
] as const;

/** 写过的项目（href 以 / 开头的是站内自托管，其余为外部链接） */
export const works = [
  {
    title: '我的第一个单页应用',
    desc: '用 AngularJS 从零搭的单页应用，路由、双向绑定、指令都自己写了一遍。',
    href: 'https://huangpuyuan.github.io/app_angularJS/dist/',
    tag: 'AngularJS',
    year: '2017'
  },
  {
    title: '我的任务清单',
    desc: '一个轻量的待办清单，带时间提醒。当年用 jQuery 写的，现在已经用原生 JavaScript 重写。',
    href: '/lab/todo/',
    tag: 'JavaScript',
    year: '2017 / 2026'
  },
  {
    title: '前端练习集',
    desc: '学前端那两年攒下的作业与练习，HTML5、CSS3、JavaScript 都有，两百来个文件。',
    href: '/lab/frontend/',
    tag: '练习集',
    year: '2017'
  },
  {
    title: '数据结构练习',
    desc: '用 JavaScript 手写一遍基础数据结构，树、散列表、字典、集合、图都有演示页。',
    href: '/lab/datastructures/',
    tag: 'JavaScript',
    year: '2017'
  },
  {
    title: '移动适配的名人书画展',
    desc: '给书画展做的移动端适配页面，那会儿还在用 rem。',
    href: 'http://lss4.hkstv.hk/zt/index.html',
    tag: '移动端',
    year: '2017'
  }
] as const;

/**
 * 实验室：早年写的小东西。
 * 前端练习集和数据结构是原样托管的归档，任务清单是用现在的样式重写的。
 */
export const labs = [
  {
    slug: 'todo',
    title: '任务清单',
    desc: '一个轻量的待办清单，可以给每条任务设提醒时间，到点会响。2017 年用 jQuery 写过一版，这次用原生 JavaScript 重写。',
    href: '/lab/todo/',
    tag: 'JavaScript',
    year: '2017 / 2026',
    parts: ['增删改查', '提醒时间', '本地存储'],
    note: '数据只存在这台设备的浏览器里，不上传也不同步。'
  },
  {
    slug: 'frontend',
    title: '前端练习集',
    desc: '学前端那两年攒下的全部作业和练习，从 CSS 画图到移动端页面都有。源码原样保留，排版换成了现在这套。',
    href: '/lab/frontend/',
    tag: '练习集',
    year: '2016',
    parts: ['CSS 绘图', '原生 JS', 'H5 页面', '慕课练习'],
    note: '七十多个页面，里面有当年的半成品，能打开就算成功。'
  },
  {
    slug: 'datastructures',
    title: '数据结构练习',
    desc: '读《学习 JavaScript 数据结构与算法》时手写的基础结构，树、散列表、字典、集合、图都有演示页，另外配了一套从思路到代码的分步讲解。',
    href: '/lab/datastructures/',
    tag: 'JavaScript',
    year: '2017 / 2026',
    parts: ['分步讲解', '二叉搜索树', '散列表', '集合', '图'],
    note: '讲解是新写的，源码保持 2017 年那一版没动。'
  }
] as const;

/** 更早期的练习，以 issue 形式散落在仓库里 */
export const earlyNotes = [
  { title: 'JavaScript Without Loops', href: 'https://github.com/huangpuyuan/myExercises-FrontEnd/issues/1' },
  { title: '学会使用 Angular 2', href: 'https://github.com/huangpuyuan/Angular2Action/issues/1' },
  { title: 'RESTful API 设计指南', href: 'https://github.com/huangpuyuan/restfulAPI/issues/1' }
] as const;

/** 读诗板块 */
export const poems = [
  { title: '一本书', author: '艾米莉·狄金森' },
  { title: '我会像青草一样呼吸', author: '顾城' },
  { title: '远方', author: '三毛' },
  { title: '乡愁', author: '席慕蓉' }
] as const;

/** 兴趣标签 */
export const loves = ['design', '古典乐', '电影', '诗', '哲学', '乒乓球', '科幻', '电子游戏'] as const;

/** 关于页的技能分组 */
export const skills = [
  { group: '早年的前端', items: ['HTML5', 'Bootstrap', 'Less'] },
  { group: '日常在写', items: ['JavaScript', 'Angular', 'PHP'] },
  { group: '工具', items: ['Git', 'Gulp', 'MySQL'] }
] as const;
