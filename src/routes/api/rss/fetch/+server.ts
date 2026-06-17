import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import { rssSource, rssArticle } from '$lib/server/db/schema.js';
import { eq, isNull, lt } from 'drizzle-orm';
import type { RequestHandler } from './$types.js';
import { createParser, extractImage } from '$lib/server/rss.js';

const parser = createParser();

function cleanDescription(text: string | null | undefined): string | null {
  if (!text) return null;
  if (/^Discussion\s*[|]\s*Link\s*$/i.test(text.trim())) return null;
  if (/^(Article URL:|Comments URL:|Points:|# Comments:)/m.test(text)) return null;
  if (text.trim().length < 15) return null;
  if (/^Dear subscriber,?\s*$/i.test(text.trim())) return null;
  return text;
}

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  const workspaceId = (body.workspaceId as number) || 0;

  const allSources = await db.select().from(rssSource);
  const sources = workspaceId > 0
    ? allSources.filter((r) => r.enabled && r.workspaceId === workspaceId)
    : allSources.filter((r) => r.enabled);

  if (sources.length === 0) {
    return json({ fetched: 0, message: 'No enabled RSS sources' });
  }

  const existingUrls = new Set(
    (await db.select({ url: rssArticle.url }).from(rssArticle)).map((a) => a.url)
  );

  // Fetch all feeds in parallel, track errors per source
  const errors: { source: string; error: string }[] = [];
  const results = await Promise.allSettled(
    sources.map((source) =>
      parser.parseURL(source.url).then(
        (feed) => ({
          source,
          items: (feed.items || []).filter(
            (item) => item.link && !existingUrls.has(item.link)
          )
        }),
        (err) => {
          errors.push({
            source: source.name,
            error: err instanceof Error ? err.message : 'Unknown error'
          });
          return null;
        }
      )
    )
  );

  // Collect all new items for batch insert
  const toInsert: (typeof rssArticle.$inferInsert)[] = [];
  for (const result of results) {
    if (result.status !== 'fulfilled' || !result.value) continue;
    const { source, items } = result.value;
    for (const item of items) {
      if (!item.link || existingUrls.has(item.link)) continue;
      const htmlContent = item['content:encoded'] || item.content || item.summary || null;
      toInsert.push({
        sourceId: source.id,
        title: item.title || 'Untitled',
        url: item.link,
        description: cleanDescription(item.contentSnippet || item.summary),
        author: item.creator || item.author || null,
        imageUrl: extractImage(item, htmlContent),
        publishedAt: item.isoDate ? new Date(item.isoDate) : null
      });
      existingUrls.add(item.link);
    }
  }

  // Batch insert all new articles at once
  let newArticleIds: number[] = [];
  if (toInsert.length > 0) {
    const inserted = await db.insert(rssArticle).values(toInsert).returning({ id: rssArticle.id });
    newArticleIds = inserted.map((r) => r.id);
  }

  // Backfill imageUrl from description for articles missing images
  const orphaned = await db
    .select({ id: rssArticle.id, description: rssArticle.description })
    .from(rssArticle)
    .where(isNull(rssArticle.imageUrl))
    .limit(100);
  for (const row of orphaned) {
    const html = row.description;
    if (!html) continue;
    const match = html.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
    if (match?.[1]) {
      let src = match[1];
      if (src.startsWith('//')) src = 'https:' + src;
      await db.update(rssArticle).set({ imageUrl: src }).where(eq(rssArticle.id, row.id));
    }
  }

  // Prune articles older than 14 days
  const cutoff = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  await db.delete(rssArticle).where(lt(rssArticle.fetchedAt, cutoff));

  return json({ fetched: toInsert.length, errors, newArticleIds });
};
