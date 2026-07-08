import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { eq } from 'drizzle-orm';
import {
  getChineseSongLyricImportJobSecret,
  processChineseSongLyricImportJob
} from '$lib/server/chinese-song-lyric-jobs.js';
import { ensureChineseSongLyricImportJobTable } from '$lib/server/chinese-song-lyric-schema.js';
import { db } from '$lib/server/db/index.js';
import { appUser, chineseSongLyricImportJob } from '$lib/server/db/schema.js';
import type { RequestHandler } from './$types.js';

async function triggerBackgroundJob(
  origin: string,
  jobId: string,
  waitUntil?: (promise: Promise<unknown>) => void
) {
  const fallback = () =>
    processChineseSongLyricImportJob(db, env, jobId).catch((fallbackErr) => {
      console.error('Chinese song lyric import fallback job failed:', fallbackErr);
    });

  if (!waitUntil) {
    void fallback();
    return;
  }

  const secret = getChineseSongLyricImportJobSecret(env);
  const trigger = fetch(`${origin}/api/chinese-song-lyrics/import/jobs/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jobId, secret })
  });

  try {
    const response = await trigger;
    if (response.ok || response.status === 202) return;
    throw new Error(`Background function returned ${response.status}`);
  } catch (err) {
    console.warn(
      'Chinese song lyric import background function trigger failed, using fallback:',
      err
    );
    waitUntil(fallback());
  }
}

export const POST: RequestHandler = async ({ request, locals, url, platform }) => {
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

    const netlifyContext = (platform as any)?.context;
    await triggerBackgroundJob(url.origin, jobId, netlifyContext?.waitUntil?.bind(netlifyContext));

    return json({ jobId, status: 'queued' }, { status: 202 });
  } catch (err) {
    console.error('Chinese song lyric import job creation failed:', err);
    return json(
      { error: err instanceof Error ? err.message : 'Could not start song import.' },
      { status: 500 }
    );
  }
};
