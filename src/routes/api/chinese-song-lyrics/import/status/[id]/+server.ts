import { json } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import { ensureChineseSongLyricImportJobTable } from '$lib/server/chinese-song-lyric-schema.js';
import { db } from '$lib/server/db/index.js';
import { appUser, chineseSongLyricImportJob } from '$lib/server/db/schema.js';
import type { RequestHandler } from './$types.js';

const STALE_JOB_MS = 5 * 60 * 1000;

export const GET: RequestHandler = async ({ params, locals }) => {
  const authId = locals.session?.user?.id;
  const [caller] = authId ? await db.select().from(appUser).where(eq(appUser.authId, authId)) : [];
  if (!caller) return json({ error: 'Sign in to read import status.' }, { status: 401 });

  await ensureChineseSongLyricImportJobTable(db);

  const [job] = await db
    .select({
      id: chineseSongLyricImportJob.id,
      status: chineseSongLyricImportJob.status,
      songSlug: chineseSongLyricImportJob.songSlug,
      error: chineseSongLyricImportJob.error,
      model: chineseSongLyricImportJob.model,
      updatedAt: chineseSongLyricImportJob.updatedAt
    })
    .from(chineseSongLyricImportJob)
    .where(
      and(
        eq(chineseSongLyricImportJob.id, params.id),
        eq(chineseSongLyricImportJob.userId, caller.id)
      )
    );

  if (!job) return json({ error: 'Job not found' }, { status: 404 });

  const updatedAt = job.updatedAt instanceof Date ? job.updatedAt : new Date(job.updatedAt);
  const isStale =
    (job.status === 'queued' || job.status === 'running') &&
    Date.now() - updatedAt.getTime() > STALE_JOB_MS;

  if (isStale) {
    const error = 'Song import timed out in the background worker. Try again.';
    await db
      .update(chineseSongLyricImportJob)
      .set({ status: 'failed', error, updatedAt: new Date() })
      .where(
        and(
          eq(chineseSongLyricImportJob.id, params.id),
          eq(chineseSongLyricImportJob.userId, caller.id)
        )
      );

    return json({ ...job, status: 'failed', error, updatedAt: new Date() });
  }

  return json(job);
};
