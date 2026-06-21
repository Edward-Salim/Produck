import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import { jobSource, jobListing } from '$lib/server/db/schema.js';
import { eq, lt } from 'drizzle-orm';
import { fetchJobsFromSource, staleCutoff } from '$lib/server/jobs.js';
import type { RequestHandler } from './$types.js';

async function doRefresh() {
  const sources = await db.select().from(jobSource).where(eq(jobSource.enabled, true));
  if (sources.length === 0) return { fetched: 0, message: 'No enabled job sources' };

  // Extract canonical job ID from URL for cross-source matching
  const jobKey = (url: string) => {
    let m = url.match(/\/job-detail\/(J\d+)/);  // ATS / Shopee SG (new format)
    if (m) return m[1];
    m = url.match(/[?&]id=(J\d+)/);             // ATS / Shopee SG (old format)
    if (m) return m[1];
    m = url.match(/\/position\/(J\d+)/);        // SEA
    if (m) return m[1];
    m = url.match(/\/search\/(\d+)/);           // ByteDance
    if (m) return 'bd-' + m[1];
    return url;                                  // fallback
  };

  // Snapshot existing viewedAt keyed by canonical job ID so it
  // survives both refresh and cross-source dedup (SEA ↔ ATS)
  const existing = await db
    .select({ url: jobListing.url, viewedAt: jobListing.viewedAt })
    .from(jobListing);
  const viewedAtById = new Map<string, Date>();
  for (const row of existing) {
    if (row.viewedAt) {
      const key = jobKey(row.url);
      if (!viewedAtById.has(key)) viewedAtById.set(key, row.viewedAt);
    }
  }

  // Wipe old listings so every fetch gets fresh data
  await db.delete(jobListing);

  // Fetch all sources in parallel
  const results = await Promise.allSettled(
    sources.map((source) => fetchJobsFromSource(source))
  );

  const errors: { source: string; error: string }[] = [];
  const toInsert: (typeof jobListing.$inferInsert)[] = [];

  for (const result of results) {
    if (result.status !== 'fulfilled' || !result.value) continue;
    const { sourceName, listings, error } = result.value;

    if (error) {
      errors.push({ source: sourceName, error });
    }

    for (const job of listings) {
      if (!job.url || !job.isPM) continue;
      const source = sources.find((s) => s.name === sourceName);
      if (!source) continue;

      toInsert.push({
        sourceId: source.id,
        title: job.title,
        url: job.url,
        department: job.department,
        location: job.location,
        description: job.description,
        publishedAt: job.publishedAt,
        isPM: true,
        experienceYears: job.experienceYears,
        rejected: false,
        requiresChinese: job.requiresChinese,
        recruitType: job.recruitType,
        viewedAt: viewedAtById.get(jobKey(job.url)) ?? null
      });
    }
  }

  // Batch insert all new listings
  let inserted = 0;
  if (toInsert.length > 0) {
    const result = await db.insert(jobListing).values(toInsert).returning({ id: jobListing.id });
    inserted = result.length;
  }

  // Prune stale listings
  const cutoff = staleCutoff();
  await db.delete(jobListing).where(lt(jobListing.fetchedAt, cutoff));

  // Update source timestamps
  for (const source of sources) {
    await db.update(jobSource)
      .set({ updatedAt: new Date() })
      .where(eq(jobSource.id, source.id));
  }

  return { fetched: inserted, total: toInsert.length, errors };
}

export const POST: RequestHandler = async (event) => {
  const refreshPromise = doRefresh().then((result) => {
    console.log(`[Refresh] done: ${result.fetched}/${result.total} jobs, ${result.errors?.length ?? 0} errors`);
  }).catch((err) => {
    console.error('[Refresh] failed:', err);
  });

  // Keep the function alive on Netlify via waitUntil
  (event.platform as any)?.context?.waitUntil?.(refreshPromise);

  return json({ accepted: true });
};
