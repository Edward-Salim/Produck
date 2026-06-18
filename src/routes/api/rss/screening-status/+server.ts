import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import { rssArticle } from '$lib/server/db/schema.js';
import { and, eq, gt, count } from 'drizzle-orm';
import type { RequestHandler } from './$types.js';

/** Returns how many articles are still waiting for AI screening, plus total
 *  articles in the current batch (so the client can show progress).
 *  Only counts articles fetched in the last 15 minutes to avoid stale
 *  counts from pre-migration rows or crashed screening runs. */
export const GET: RequestHandler = async () => {
  const cutoff = new Date(Date.now() - 15 * 60 * 1000);
  const [{ value: unscreened }] = await db
    .select({ value: count() })
    .from(rssArticle)
    .where(and(
      eq(rssArticle.screened, false),
      eq(rssArticle.rejected, false),
      gt(rssArticle.fetchedAt, cutoff)
    ));

  const [{ value: total }] = await db
    .select({ value: count() })
    .from(rssArticle)
    .where(gt(rssArticle.fetchedAt, cutoff));

  return json({ unscreened, total });
};
