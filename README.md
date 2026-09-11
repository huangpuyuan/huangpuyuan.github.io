# Storm · 开泰

个人主页与笔记站。纯静态输出，托管在 GitHub Pages，没有服务器、没有数据库、没有外部 CDN。

- 线上地址：https://huangpuyuan.github.io/
- 技术栈：Astro 5 + Markdown 内容集合 + 原生 CSS，零运行时依赖

**文档**（`docs/` 目录）：

| 文档 | 什么时候看 |
|---|---|
| [`docs/换电脑继续做.md`](docs/换电脑继续做.md) | 换了台机器，想五步把项目跑起来 |
| [`docs/项目文档.md`](docs/项目文档.md) | 想搞清整体架构、目录、设计系统与三条硬规矩 |
| [`docs/重构总结-2026-09-11.md`](docs/重构总结-2026-09-11.md) | 想看这次重构做了什么、踩了哪些坑 |
| [`docs/对话交接.md`](docs/对话交接.md) | 换会话 / 换电脑接手，先看这份脉络与规矩 |

---

## 日常怎么用

### 写一篇新笔记

1. 在 `src/content/blog/` 新建 `.md` 文件，文件名就是网址（用英文小写加横线）
2. 开头写这几行：

```markdown
---
title: 文章标题
date: 2026-09-10
category: 笔记
summary: 一句话摘要，会用在列表、搜索结果和分享卡片里
---

正文从这里开始，正常写 Markdown 就行。
```

3. 双击 `publish.bat`，1 到 2 分钟后线上自动更新。

### 改站名、改链接、改首页内容

全部收在 **`src/config.ts`** 一个文件里：站名、副标题、导航、联系方式、作品列表、读诗篇目、兴趣标签、技能分组。
以后换域名也只需要改这里和 `astro.config.mjs` 的 `site`。

### 本地看效果

双击 `preview.bat`，浏览器自动打开 http://localhost:8080

---

## 目录结构

```
storm-site/
├─ src/
│  ├─ config.ts              ← 全站唯一配置源（改站名/链接/首页内容只动这里）
│  ├─ content.config.ts      ← 文章与数据结构讲解的字段校验
│  ├─ content/blog/          ← 所有笔记，Markdown 直接写在这
│  ├─ content/ds/            ← 数据结构讲解系列（跟着做一遍）
│  ├─ data/frontend.ts       ← 前端练习集的条目清单（标题 / 链接 / 备注）
│  ├─ layouts/BaseLayout.astro   ← 页面骨架、SEO、分享卡片、视图过渡
│  ├─ components/
│  │   ├─ Nav.astro          导航 + 主题切换
│  │   ├─ Footer.astro
│  │   ├─ ParticleField.astro 风暴粒子场（自绘 canvas）
│  │   ├─ SearchPalette.astro ⌘K 命令面板搜索
│  │   └─ ProgressBar.astro   文章阅读进度条
│  ├─ pages/
│  │   ├─ index.astro        首页
│  │   ├─ blog/index.astro   笔记列表（带分类筛选）
│  │   ├─ blog/[...slug].astro 文章详情（带目录）
│  │   ├─ tags/              分类页
│  │   ├─ lab/               实验室
│  │   │   ├─ index.astro           入口：三张卡片 + 快速跳转
│  │   │   ├─ frontend.astro        前端练习集索引
│  │   │   ├─ datastructures.astro  数据结构练习索引
│  │   │   ├─ datastructures/[slug].astro  讲解页（内容来自 src/content/ds）
│  │   │   └─ todo.astro            任务清单（原生 JS 重写）
│  │   ├─ about.astro
│  │   ├─ 404.astro
│  │   ├─ rss.xml.ts         订阅源
│  │   └─ search.json.ts     构建时生成搜索索引
│  ├─ styles/global.css      设计系统（配色、排版、组件）
│  └─ utils/format.ts        日期、阅读时长、分类转 URL
├─ public/                   图片、图标、分享卡片（原样复制到站点根目录）
│  ├─ audio/alert.mp3        任务清单的提醒音
│  ├─ images/                站点图片与文章配图
│  └─ lab/                   实验室：早年项目的原始文件，按原样托管
│     ├─ datastructures/      数据结构练习
│     ├─ frontend/            前端练习集
│     └─ vendor/              归档的第三方库（jQuery / Bootstrap / Angular / 图标字体）
├─ scripts/
│  ├─ publish.mjs            构建 + 提交 + 推送
│  ├─ preview.mjs            构建 + 本地预览
│  ├─ layout-audit.mjs       多档视口横向溢出体检
│  ├─ lint-links.mjs         全站死链扫描
│  ├─ shot.mjs               按主题截图
│  ├─ smoke.mjs              交互冒烟测试（含排版回归）
│  ├─ test-todo.mjs          任务清单的 21 项交互测试
│  ├─ make-og.mjs            渲染分享卡片图
│  ├─ og-card.html           分享卡片的模板（改配色/站名改这里）
│  ├─ fix-frontend-refs.mjs  把练习集里失效的 CDN 改成指向本地 vendor
│  ├─ add-lab-backlink.mjs   给 public/lab 下所有老页面注入"回实验室"浮标
│  ├─ add-console-mirror.mjs 把演示页的控制台输出画到页面上
│  └─ convert-posts.py       旧 Jekyll 文章迁移脚本
├─ .github/workflows/deploy.yml
├─ publish.bat               双击发布
├─ preview.bat               双击预览
└─ astro.config.mjs
```

---

## 架构上做了什么

相比 2017 年那个 Jekyll 站：

| 项目 | 旧版 | 现在 |
|---|---|---|
| 构建环境 | Ruby + Jekyll + Node + gulp 四套 | 只要 Node |
| 外部 CDN | 4 个（bootcss 等） | 0 个 |
| 字体 | Google Fonts（国内打不开） | 系统字体栈 |
| 图标 | Font Awesome + Devicon，约 1MB | 内联 SVG |
| 粒子背景 | particles.js 走 CDN | 自绘 canvas，约 3KB，带风向拖尾 |
| 内容配置 | 散落在 6 个 include 文件里 | 收敛到 `src/config.ts` |
| 笔记 | 另建一个 Jekyll 仓库 | 合并进来，Markdown 直接写 |
| 早年项目 | 散在 3 个独立仓库 | 合并进 `/lab/`，一个站点管全部 |
| 页面跳转 | 整页刷新 | 视图过渡 + 预取，接近单页应用 |
| 搜索 | 无 | ⌘K 命令面板，构建时生成索引 |
| 分类 | 无 | 分类页 + 列表页筛选 |
| 文章目录 | 无 | 自动生成，滚动高亮 |
| 阅读进度 | 无 | 顶部进度条 |
| 深色模式 | 无 | 跟随系统 + 手动切换 |
| 公式 | 显示 LaTeX 源码 | KaTeX 正常渲染 |
| 订阅 | 无 | RSS |
| 站点地图 | 2019 年手工版 | 构建时自动生成 |
| 分享卡片 | 无 | Open Graph + 品牌卡片图 |

---

## 首次部署要做的事

仓库里已经放好自动部署工作流，GitHub 那边需要手动改一个设置：

1. 打开 https://github.com/huangpuyuan/huangpuyuan.github.io/settings/pages
2. 把 **Source** 从 `Deploy from a branch` 改成 **`GitHub Actions`**
3. 保存

之后每次推送 `master` 分支，GitHub 会自动构建并发布。

> 切换后仓库里原有的 Jekyll 文件（`_config.yml`、`_layouts/`、`index.html` 等）会失效。
> 建议先把旧站点归档到一个 `legacy` 分支，确认新版没问题后再删。

---

## 站内链接一律带结尾斜杠

构建用的是 `build.format: 'directory'`，所以 `/blog/open-banking` 实际落在 `/blog/open-banking/index.html`。**引用时少写那个斜杠是真的会 404**，不是「浏览器会自动补上」这么轻松。

所以站内地址统一这样写：

```html
<a href="/blog/">列表页</a>
<a href="/blog/open-banking/">文章详情</a>   ← 结尾必须有 /
```

代码里不要手拼，用 `src/utils/format.ts` 里现成的两个函数：

```ts
import { postUrl, tagUrl } from '../utils/format';

postUrl(post.id)      // /blog/<id>/
tagUrl(category)      // /tags/<slug>/
```

这个坑踩过一次：笔记列表和首页的文章卡片当时写的是 `/blog/${post.id}`，点下去落到 404，功能测试还全是绿的（因为断言只看了 `location.pathname`，跳 404 时地址栏照样是对的）。现在 `smoke.mjs` 会检查正文渲染出来没有，`lint-links.mjs` 会扫出缺斜杠的链接，两道关卡都补上了。

> 顺带记一笔：本地 `astro preview` 对 `/about` 这种不带斜杠的地址直接返回 404，`astro dev` 会替你转。两边行为不一致，所以别靠 dev 环境的「能打开」来判断链接写对没有。

---

## 质量检查脚本

改完东西想确认没搞坏，可以跑：

```bash
node scripts/smoke.mjs http://localhost:8080     # 交互冒烟测试（20 项，含排版与路由可达性）
node scripts/test-todo.mjs http://localhost:8080 # 任务清单交互测试（21 项）
node scripts/layout-audit.mjs http://localhost:8080/lab/ 1440,430,320   # 响应式溢出体检
node scripts/lint-links.mjs dist                 # 站内死链 + 缺结尾斜杠扫描
node scripts/make-og.mjs                         # 重新生成分享卡片图
```

五个脚本都靠本机 Chrome 和 Node 内置模块，不需要额外装依赖（要跑测试得先把站点跑在 8080 上）。

`lint-links` 会报两类问题，都算失败：**真死链**（文件根本不存在）和**缺结尾斜杠**（目标是个目录，但引用时没写 `/`）。后者在 `astro preview` 上会直接 404，静态托管上也多靠一次 301 兜着，所以当成错误处理。

---

## 实验室（/lab/）

早年三个独立仓库合并进来的，现在分成两类东西：

**索引页是重写的**，用站点自己的样式，和别处长得一样：

| 页面 | 说明 |
|---|---|
| `/lab/` | 入口，三张卡片 + 顶部快速跳转 |
| `/lab/frontend/` | 前端练习集索引 |
| `/lab/datastructures/` | 数据结构练习索引，带「跟着做一遍」讲解系列 |
| `/lab/datastructures/<结构>/` | 每个结构一份分步讲解，内容在 `src/content/ds/` |
| `/lab/todo/` | 任务清单，2017 年那版是 jQuery 写的，现在用原生 JS 重写，去掉了 jQuery / store.js / datetimepicker 三个依赖 |

数据结构那套讲解是新写的，八个结构各一篇：栈、队列、链表、集合、字典、散列表、二叉搜索树、图。每篇的骨架都一样，先说清它解决什么问题，再给个生活里的类比，然后把代码一步一步写出来，最后是复杂度和常见坑。**源码引用的是仓库里 2017 年那一版原文件，不是重写的伪代码**，所以讲解和演示页对得上。

要加一篇，在 `src/content/ds/` 里新建一个 `.md` 就行。`order` 决定顺序，「上一篇 / 下一篇」和索引页的编号都跟着走；`demo` 和 `source` 填 `public/lab/datastructures/` 下的相对路径，构建时会确认文件真的存在才渲染链接。

练习集和数据结构的索引页会在**构建时**逐个检查链接对应的文件是否真的存在，不存在就不渲染。所以索引页里不会有死链，加条目只要改 `src/data/frontend.ts`。

**原始文件仍然原样托管**在 `public/lab/` 下，通过 `/lab/...` 直接访问。这部分改动原则是**只做加法**：

| 做了什么 | 为什么 |
|---|---|
| jQuery / Bootstrap / Angular / Font Awesome / devicon 换成本地 `vendor/` | 原来走的 `cdn.rawgit.com` 已经关停，`cdn.bootcss.com`、`maxcdn` 随时会断 |
| 每个老页面右下角加一个"回实验室"浮标 | 老页面不带新站导航，进去之后只能按浏览器后退 |
| 演示页注入控制台镜像 | 数据结构那批页面只 `console.log`，不注入的话打开是一片空白 |
| `demo.html` 里 5 个作业目录链接补上结尾斜杠 | 原写法少了斜杠，静态托管上会 404 |

原始逻辑、目录结构、页面内容一律没动，四件事都是纯追加（最后一件只改了 5 个 `href` 的写法）。

如果以后要重新搬运，按顺序跑：

```bash
node scripts/fix-frontend-refs.mjs     # 修 CDN 引用
node scripts/add-lab-backlink.mjs      # 加返回浮标
node scripts/add-console-mirror.mjs    # 加控制台镜像
```

三个脚本都是幂等的，重复跑会用新版本覆盖旧版本，不会叠加。

### 改 lab 页面时容易踩的坑

任务清单和练习集索引里有一部分 DOM 是 JS 运行时拼出来的（`innerHTML` / `createElement`）。

Astro 的 `<style>` 默认会编译成 `.cls[data-astro-cid-xxxx]` 这种形式，属性只加给模板里写死的元素。**运行时生成的元素拿不到这个属性，对应样式会静默失效**，不报错，只是排版悄悄散掉。

所以这类元素的样式必须写成作用域内的 `:global()`：

```css
/* 对：挂在模板里的父元素下面，既能命中，又不会外泄 */
.tasks :global(.task) { display: flex; }

/* 错：编译成 .task[data-astro-cid-xxx]，动态生成的 .task 匹配不上 */
.task { display: flex; }
```

`scripts/smoke.mjs` 里有两条断言专门盯这个（搜索结果项的横向排布、任务清单列表项的横向排布），改坏了会直接报错。

### 已知的失效链接（2017 年原代码里就有，不是搬运导致的）

- `frontend/exercises/CSS3_Slides/index.html` 里的 **Demo2 / Demo3 / Demo4** 三个链接，对应的 `index2~4.html` 从来没写过
- `frontend/css-plotting/parellelogram/parallelograms.html` 引用了一个不存在的 `style.css`

按「只做加法」的原则没有删，跑 `node scripts/lint-links.mjs dist` 会把它们单独列出来，**不计入失败退出码**。清单写在脚本顶部的 `KNOWN_BROKEN` 里。想让它们彻底消失，把老页面里对应的引用行删掉，再从这个清单里划掉即可。

---

## 备注

- 默认分支是 `master`
- `public/.nojekyll` 必须保留，否则 GitHub Pages 会忽略 `_astro` 目录，样式会全丢
- 公式用 `$...$` 和 `$$...$$`，由 KaTeX 渲染
- 站点地址里仍带着 GitHub 账号名，要彻底换掉得买域名再加 `CNAME` 文件
