import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { dispatchJob } from '$lib/server/background-job.js';
import { eq } from 'drizzle-orm';
import { processChineseSongLyricImportJob } from '$lib/server/chinese-song-lyric-jobs.js';
import { ensureChineseSongLyricImportJobTable } from '$lib/server/chinese-song-lyric-schema.js';
import { db } from '$lib/server/db/index.js';
import { appUser, chineseSongLyricImportJob } from '$lib/server/db/schema.js';
import type { RequestHandler } from './$types.js';

export const POST: RequestHandler = async ({ request, locals, platform }) => {
  const authId = locals.session?.user?.id;
  const [caller] = authId ? await db.select().from(appUser).where(eq(appUser.authId, authId)) : [];
  if (!caller) return json({ error: 'Sign in to import song lyrics.' }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { rawSong?: unknown };
  const rawSong = typeof body.rawSong === 'string' ? body.rawSong.trim() : '';
  if (rawSong.length < 20) {
    return json({ error: 'Paste the song title and lyrics first.' }, { status: 400 });
  }

  try {
    await ensureChineseSongLyricImportJobTable(db);

    const jobId = crypto.randomUUID();
    await db.insert(chineseSongLyricImportJob).values({
      id: jobId,
      userId: caller.id,
      status: 'queued',
      rawSong
    });

    await dispatchJob(platform, { kind: 'chinese-song-lyric', id: jobId }, () =>
      processChineseSongLyricImportJob(db, env, jobId)
    );

    return json({ jobId, status: 'queued' }, { status: 202 });
  } catch (err) {
    console.error('Chinese song lyric import job creation failed:', err);
    return json(
      { error: err instanceof Error ? err.message : 'Could not start song import.' },
      { status: 500 }
    );
  }
};
