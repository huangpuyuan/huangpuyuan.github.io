import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// https://astro.build/config
export default defineConfig({
  // 部署在 GitHub Pages 用户站点根目录；以后换域名只改这一行和 src/config.ts
  site: 'https://huangpuyuan.github.io',
  build: {
    format: 'directory'
  },
  // 目录形式的地址一律带结尾斜杠。少了斜杠 astro dev 会帮你转，
  // 但静态托管不一定，所以站内链接也统一按这个写法来（见 src/utils/format.ts）。
  trailingSlash: 'always',
  // 视口内的链接提前预取，配合视图过渡让跳转几乎无等待
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport'
  },
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [
      [
        rehypeKatex,
        {
          // 老笔记里的公式写法不完全规范，容错处理，不要在构建时报警
          strict: false,
          throwOnError: false,
          trust: false
        }
      ]
    ],
    shikiConfig: {
      theme: 'github-light',
      wrap: true
    }
  },
  integrations: [sitemap()],
  devToolbar: { enabled: false }
});
