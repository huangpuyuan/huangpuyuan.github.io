import { getCollection } from 'astro:content';
import { plainText } from '../utils/format';

/**
 * 构建时生成搜索索引，运行时不请求任何第三方服务
 */
export async function GET() {
  const posts = await getCollection('blog', ({ data }) => !data.draft);

  const index = posts
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
    .map((post) => ({
      slug: post.id,
      title: post.data.title,
      date: post.data.date.toISOString().slice(0, 10),
      category: post.data.category ?? '',
      summary: post.data.summary ?? '',
      text: plainText(post.body ?? '').slice(0, 1200)
    }));

  return new Response(JSON.stringify(index), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
}
