import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import { trendSummary } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types.js';

/** Check if a briefing exists for a given date. Client polls this while
 *  showing the "generating" skeleton so it can refresh when ready. */
export const GET: RequestHandler = async ({ url }) => {
  const date = url.searchParams.get('date');
  if (!date) return json({ error: 'Missing date' }, { status: 400 });

  const rows = await db
    .select({ window: trendSummary.window, summary: trendSummary.summary })
    .from(trendSummary)
    .where(eq(trendSummary.date, date));

  const result: Record<string, string | null> = {};
  for (const r of rows) {
    result[r.window] = r.summary;
  }

  return json({
    hasMorning: 'morning' in result,
    hasEvening: 'evening' in result,
    hasAny: rows.length > 0
  });
};
