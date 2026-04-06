import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import { rssSource, rssArticle } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types.js';
import Parser from 'rss-parser';

const parser = new Parser({
  timeout: 20000,
  headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Produck RSS Reader/1.0)' }
});

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  const workspaceId = body.workspaceId as number;

  if (!workspaceId) return json({ error: 'Missing workspaceId' }, { status: 400 });

  // Get all enabled sources for this workspace
  const sources = await db
    .select()
    .from(rssSource)
    .where(eq(rssSource.workspaceId, workspaceId))
    .then((rows) => rows.filter((r) => r.enabled));

  if (sources.length === 0) {
    return json({ fetched: 0, message: 'No enabled RSS sources' });
  }

  // Get existing article URLs to deduplicate
  const existingArticles = await db.select({ url: rssArticle.url }).from(rssArticle);
  const existingUrls = new Set(existingArticles.map((a) => a.url));

  let totalFetched = 0;
  const errors: { source: string; error: string }[] = [];

  for (const source of sources) {
    try {
      const feed = await parser.parseURL(source.url);
      const newItems = (feed.items || []).filter(
        (item) => item.link && !existingUrls.has(item.link)
      );

      for (const item of newItems) {
        if (!item.link) continue;
        await db.insert(rssArticle).values({
          sourceId: source.id,
          title: item.title || 'Untitled',
          url: item.link,
          description: item.contentSnippet || item.summary || null,
          content: item['content:encoded'] || item.content || null,
          author: item.creator || item.author || null,
          publishedAt: item.isoDate ? new Date(item.isoDate) : null
        });
        existingUrls.add(item.link);
        totalFetched++;
      }
    } catch (err) {
      errors.push({
        source: source.name,
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  }

  return json({ fetched: totalFetched, errors });
};
