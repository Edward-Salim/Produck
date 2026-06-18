import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import { rssSource, rssArticle } from '$lib/server/db/schema.js';
import { eq, and, isNull, lt, inArray, sql } from 'drizzle-orm';
import type { RequestHandler } from './$types.js';
import { createParser, extractImage, screenArticles, isObviouslyOffTopic, type ScreeningStats } from '$lib/server/rss.js';

const parser = createParser();

function cleanDescription(text: string | null | undefined): string | null {
  if (!text) return null;
  if (/^Discussion\s*[|]\s*Link\s*$/i.test(text.trim())) return null;
  if (/^(Article URL:|Comments URL:|Points:|# Comments:)/m.test(text)) return null;
  if (text.trim().length < 15) return null;
  if (/^Dear subscriber,?\s*$/i.test(text.trim())) return null;
  return text;
}

async function updateSourceAccuracy(stats: ScreeningStats) {
  for (const [name, s] of stats.bySource) {
    await db.update(rssSource)
      .set({ totalScreened: sql`total_screened + ${s.total}`, totalKept: sql`total_kept + ${s.kept}` })
      .where(eq(rssSource.name, name));
  }
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

  // Keyword pre-filter: obvious off-topic articles get rejected at insert time
  const sourceMap = new Map(sources.map((s) => [s.id, { category: s.category, region: s.region, sourceName: s.name }]));
  const keywordStats = new Map<string, { total: number; kept: number }>();
  for (const item of toInsert) {
    const src = sourceMap.get(item.sourceId!);
    if (src && isObviouslyOffTopic({ title: item.title!, ...src })) {
      item.rejected = true;
      const ks = keywordStats.get(src.sourceName) ?? { total: 0, kept: 0 };
      ks.total++;
      keywordStats.set(src.sourceName, ks);
    }
  }
  if (keywordStats.size > 0) {
    await updateSourceAccuracy({ bySource: keywordStats });
  }

  // Batch insert all articles (URL dedup works even for keyword-rejected items)
  if (toInsert.length > 0) {
    const inserted = await db.insert(rssArticle).values(toInsert).returning({ id: rssArticle.id, url: rssArticle.url });

    // AI screen only the keyword-passing items
    const aiQueue = toInsert.filter((a) => !a.rejected);
    if (aiQueue.length > 0) {
      const { kept: keepTitles, stats } = await screenArticles(
        aiQueue.map((a) => ({ title: a.title!, ...sourceMap.get(a.sourceId!)! }))
      );

      await updateSourceAccuracy(stats);

      const keepUrls = new Set<string>();
      for (const item of aiQueue) {
        if (keepTitles.has(item.title!)) keepUrls.add(item.url!);
      }

      const aiUrls = aiQueue.map((a) => a.url!);
      const rejectUrls = aiUrls.filter((url) => !keepUrls.has(url));
      // Mark all AI-screened articles as screened
      await db.update(rssArticle).set({ screened: true }).where(inArray(rssArticle.url, aiUrls));
      if (rejectUrls.length > 0) {
        await db.update(rssArticle).set({ rejected: true }).where(inArray(rssArticle.url, rejectUrls));
      }
    }
  }

  // Backfill imageUrl from description for articles missing images
  const orphaned = await db
    .select({ id: rssArticle.id, description: rssArticle.description })
    .from(rssArticle)
    .where(and(isNull(rssArticle.imageUrl), eq(rssArticle.rejected, false)))
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

  return json({ fetched: toInsert.length, errors });
};
