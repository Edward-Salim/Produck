import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { dispatchJob } from '$lib/server/background-job.js';
import { and, eq, sql } from 'drizzle-orm';
import {
  CHINESE_READING_LEVELS,
  VocabGuardError,
  getVocabGuard,
  normalizeReading,
  validateReadingVocabulary,
  type HskLevel
} from '$lib/server/chinese-reading.js';
import { processChineseReadingJob } from '$lib/server/chinese-reading-jobs.js';
import { ensureChineseReadingStoryTable } from '$lib/server/chinese-reading-schema.js';
import { db } from '$lib/server/db/index.js';
import { appUser, chineseReadingJob, chineseReadingStory } from '$lib/server/db/schema.js';
import type { RequestHandler } from './$types.js';

export const POST: RequestHandler = async ({ request, locals, platform }) => {
  const authId = locals.session?.user?.id;
  const [caller] = authId ? await db.select().from(appUser).where(eq(appUser.authId, authId)) : [];
  if (!caller) return json({ error: 'Sign in to generate AI readings.' }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as {
    level?: unknown;
    force?: unknown;
    allowCache?: unknown;
  };
  const requestedLevel = Number(body.level);
  const level = (
    CHINESE_READING_LEVELS.has(requestedLevel) && requestedLevel <= 3 ? requestedLevel : 1
  ) as HskLevel;
  const force = body.force === true;
  const allowCache = body.allowCache === true;

  try {
    await ensureChineseReadingStoryTable(db);
    if (allowCache && !force) {
      const guard = await getVocabGuard(level, platform?.env.ASSETS);
      const cachedStories = await db
        .select()
        .from(chineseReadingStory)
        .where(eq(chineseReadingStory.level, level))
        .orderBy(sql`random()`)
        .limit(8);

      for (const cached of cachedStories) {
        try {
          const reading = normalizeReading(cached.reading);
          validateReadingVocabulary(reading, level, guard);

          await db
            .update(chineseReadingStory)
            .set({ usedAt: new Date() })
            .where(eq(chineseReadingStory.id, cached.id))
            .catch((err) => console.warn('Could not update Chinese reading cache usage:', err));

          return json({ reading, level, cached: true });
        } catch (err) {
          if (err instanceof VocabGuardError) {
            console.warn(
              `Deleting invalid cached Chinese reading ${cached.id} for HSK ${level}; unknown words: ${err.unknownWords.join('、')}`
            );
            await db
              .delete(chineseReadingStory)
              .where(eq(chineseReadingStory.id, cached.id))
              .catch((deleteErr) =>
                console.warn('Could not delete invalid Chinese reading cache entry:', deleteErr)
              );
          } else {
            console.warn('Skipping cached Chinese reading that failed validation:', err);
          }
        }
      }
    }

    const jobId = crypto.randomUUID();
    await db.insert(chineseReadingJob).values({
      id: jobId,
      userId: caller.id,
      level,
      status: 'queued'
    });

    await dispatchJob(platform, { kind: 'chinese-reading', id: jobId }, () =>
      processChineseReadingJob(db, env, jobId)
    );

    return json({ jobId, status: 'queued', level }, { status: 202 });
  } catch (err) {
    console.error('Chinese reading job creation failed:', err);
    return json(
      { error: err instanceof Error ? err.message : 'Could not start reading generation.' },
      { status: 500 }
    );
  }
};

export const DELETE: RequestHandler = async ({ request, locals }) => {
  const authId = locals.session?.user?.id;
  const [caller] = authId ? await db.select().from(appUser).where(eq(appUser.authId, authId)) : [];
  if (!caller) return json({ error: 'Sign in to manage reading jobs.' }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { jobId?: unknown };
  if (typeof body.jobId !== 'string') return json({ error: 'Missing jobId' }, { status: 400 });

  await ensureChineseReadingStoryTable(db);
  await db
    .delete(chineseReadingJob)
    .where(and(eq(chineseReadingJob.id, body.jobId), eq(chineseReadingJob.userId, caller.id)));

  return json({ ok: true });
};
