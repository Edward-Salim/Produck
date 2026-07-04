import { json } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import { ensureChineseReadingStoryTable } from '$lib/server/chinese-reading-schema.js';
import { db } from '$lib/server/db/index.js';
import { appUser, chineseReadingJob } from '$lib/server/db/schema.js';
import type { RequestHandler } from './$types.js';

const STALE_JOB_MS = 5 * 60 * 1000;

export const GET: RequestHandler = async ({ params, locals }) => {
  const authId = locals.session?.user?.id;
  const [caller] = authId ? await db.select().from(appUser).where(eq(appUser.authId, authId)) : [];
  if (!caller) return json({ error: 'Sign in to read generation status.' }, { status: 401 });

  await ensureChineseReadingStoryTable(db);

  const [job] = await db
    .select({
      id: chineseReadingJob.id,
      level: chineseReadingJob.level,
      status: chineseReadingJob.status,
      reading: chineseReadingJob.reading,
      unknownWords: chineseReadingJob.unknownWords,
      error: chineseReadingJob.error,
      model: chineseReadingJob.model,
      updatedAt: chineseReadingJob.updatedAt
    })
    .from(chineseReadingJob)
    .where(and(eq(chineseReadingJob.id, params.id), eq(chineseReadingJob.userId, caller.id)));

  if (!job) return json({ error: 'Job not found' }, { status: 404 });

  const updatedAt = job.updatedAt instanceof Date ? job.updatedAt : new Date(job.updatedAt);
  const isStale =
    (job.status === 'queued' || job.status === 'running') &&
    Date.now() - updatedAt.getTime() > STALE_JOB_MS;

  if (isStale) {
    const error = 'Chinese reading generation timed out in the background worker. Try again.';
    await db
      .update(chineseReadingJob)
      .set({ status: 'failed', error, updatedAt: new Date() })
      .where(and(eq(chineseReadingJob.id, params.id), eq(chineseReadingJob.userId, caller.id)));

    return json({ ...job, status: 'failed', error, updatedAt: new Date() });
  }

  return json(job);
};
