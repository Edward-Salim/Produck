import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import { jobListing } from '$lib/server/db/schema.js';
import { eq, isNull } from 'drizzle-orm';
import type { RequestHandler } from './$types.js';

export const POST: RequestHandler = async ({ request }) => {
  const { jobId } = await request.json();
  if (!jobId) return json({ error: 'Missing jobId' }, { status: 400 });

  await db
    .update(jobListing)
    .set({ viewedAt: new Date() })
    .where(eq(jobListing.id, jobId));

  return json({ ok: true });
};
