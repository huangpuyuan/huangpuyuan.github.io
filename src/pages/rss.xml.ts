import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { site } from '../config';

export async function GET(context: { site?: URL }) {
  const posts = (await getCollection('blog', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf()
  );

  return rss({
    title: `${site.name} · 笔记`,
    description: site.tagline,
    site: context.site ?? site.url,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.summary ?? '',
      link: `/blog/${post.id}/`,
      categories: post.data.category ? [post.data.category] : []
    })),
    customData: '<language>zh-cn</language>'
  });
}
