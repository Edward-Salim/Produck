import { db } from '$lib/server/db/index.js';
import { rssSource, rssArticle, trendSummary } from '$lib/server/db/schema.js';
import { eq, desc } from 'drizzle-orm';
import type { PageServerLoad } from './$types.js';
import Parser from 'rss-parser';

const parser = new Parser({
  timeout: 20000,
  headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Produck RSS Reader/1.0)' }
});

const STALE_HOURS = 24;

async function fetchFeeds(workspaceId: number) {
  const sources = await db
    .select()
    .from(rssSource)
    .where(eq(rssSource.workspaceId, workspaceId))
    .then((rows) => rows.filter((r) => r.enabled));

  if (sources.length === 0) return 0;

  const existingArticles = await db.select({ url: rssArticle.url }).from(rssArticle);
  const existingUrls = new Set(existingArticles.map((a) => a.url));

  let totalFetched = 0;

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
    } catch {
      // Silently skip failed sources during auto-fetch
    }
  }

  return totalFetched;
}

export const load: PageServerLoad = async ({ cookies }) => {
  // RSS is profile-level, not workspace-scoped — load all sources
  const sources = await db.select().from(rssSource);

  // Auto-fetch if stale
  if (sources.length > 0) {
    const [latest] = await db
      .select({ fetchedAt: rssArticle.fetchedAt })
      .from(rssArticle)
      .orderBy(desc(rssArticle.fetchedAt))
      .limit(1);

    const lastFetch = latest?.fetchedAt ? new Date(latest.fetchedAt).getTime() : 0;
    const hoursAgo = (Date.now() - lastFetch) / (1000 * 60 * 60);

    if (hoursAgo >= STALE_HOURS) {
      // Fetch all workspaces' sources
      const wsIds = [...new Set(sources.map((s) => s.workspaceId))];
      for (const wsId of wsIds) {
        await fetchFeeds(wsId);
      }
    }
  }

  // Get recent articles with source info (last 200)
  const articles = await db
    .select({
      id: rssArticle.id,
      title: rssArticle.title,
      url: rssArticle.url,
      description: rssArticle.description,
      author: rssArticle.author,
      publishedAt: rssArticle.publishedAt,
      fetchedAt: rssArticle.fetchedAt,
      sourceName: rssSource.name,
      sourceCategory: rssSource.category
    })
    .from(rssArticle)
    .innerJoin(rssSource, eq(rssArticle.sourceId, rssSource.id))
    .orderBy(desc(rssArticle.publishedAt))
    .limit(200);

  // Get summaries from all workspaces
  const summaries = await db.select().from(trendSummary).orderBy(desc(trendSummary.date)).limit(30);

  // Pass first workspace ID for backward compat with manual fetch
  const workspaceId =
    Number(cookies.get('active_workspace') || '0') || sources[0]?.workspaceId || 0;

  return { sources, articles, summaries, workspaceId };
};
