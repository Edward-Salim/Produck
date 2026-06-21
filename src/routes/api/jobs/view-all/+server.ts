import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import { jobListing } from '$lib/server/db/schema.js';
import { isNull, eq } from 'drizzle-orm';
import type { RequestHandler } from './$types.js';

export const POST: RequestHandler = async () => {
  const result = await db
    .update(jobListing)
    .set({ viewedAt: new Date() })
    .where(isNull(jobListing.viewedAt));

  return json({ marked: result.rowCount ?? 0 });
};
