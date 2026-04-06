import { db } from '$lib/server/db/index.js';
import { rssSource, rssArticle, trendSummary } from '$lib/server/db/schema.js';
import { eq, desc } from 'drizzle-orm';
import type { PageServerLoad } from './$types.js';

export const load: PageServerLoad = async ({ cookies }) => {
  const workspaceId = Number(cookies.get('active_workspace') || '0');

  const sources = workspaceId
    ? await db.select().from(rssSource).where(eq(rssSource.workspaceId, workspaceId))
    : [];

  // Get recent articles with source info (last 200)
  const articles = workspaceId
    ? await db
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
        .where(eq(rssSource.workspaceId, workspaceId))
        .orderBy(desc(rssArticle.publishedAt))
        .limit(200)
    : [];

  // Get summaries
  const summaries = workspaceId
    ? await db
        .select()
        .from(trendSummary)
        .where(eq(trendSummary.workspaceId, workspaceId))
        .orderBy(desc(trendSummary.date))
        .limit(30)
    : [];

  return { sources, articles, summaries, workspaceId };
};
