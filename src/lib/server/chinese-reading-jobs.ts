import { and, desc, eq } from 'drizzle-orm';
import {
  CHINESE_READING_MODEL,
  generateValidatedReading,
  getVocabGuard,
  type ChineseReadingAvoidance,
  type ChineseReadingEnv,
  type HskLevel
} from './chinese-reading.js';
import { ensureChineseReadingStoryTable } from './chinese-reading-schema.js';
import { chineseReadingJob, chineseReadingStory } from './db/schema.js';

async function getRecentReadingsToAvoid(
  database: any,
  userId: number,
  level: HskLevel,
  currentJobId: string
): Promise<ChineseReadingAvoidance> {
  const recentJobs = await database
    .select({
      id: chineseReadingJob.id,
      reading: chineseReadingJob.reading
    })
    .from(chineseReadingJob)
    .where(
      and(
        eq(chineseReadingJob.userId, userId),
        eq(chineseReadingJob.level, level),
        eq(chineseReadingJob.status, 'completed')
      )
    )
    .orderBy(desc(chineseReadingJob.updatedAt))
    .limit(8);

  return recentJobs
    .filter((recent: { id: string }) => recent.id !== currentJobId)
    .map((recent: { reading?: any }) => ({
      titleHanzi: typeof recent.reading?.titleHanzi === 'string' ? recent.reading.titleHanzi : '',
      titleEnglish:
        typeof recent.reading?.titleEnglish === 'string' ? recent.reading.titleEnglish : '',
      openingHanzi:
        typeof recent.reading?.storyHanzi?.[0] === 'string' ? recent.reading.storyHanzi[0] : ''
    }))
    .filter(
      (reading: ChineseReadingAvoidance[number]) =>
        reading.titleHanzi || reading.titleEnglish || reading.openingHanzi
    )
    .slice(0, 6);
}

export async function processChineseReadingJob(
  database: any,
  env: ChineseReadingEnv,
  jobId: string
) {
  await ensureChineseReadingStoryTable(database);

  const [job] = await database
    .select()
    .from(chineseReadingJob)
    .where(eq(chineseReadingJob.id, jobId));

  if (!job) throw new Error(`Chinese reading job not found: ${jobId}`);
  if (job.status === 'completed') return job.reading;

  await database
    .update(chineseReadingJob)
    .set({ status: 'running', error: null, updatedAt: new Date() })
    .where(eq(chineseReadingJob.id, jobId));

  try {
    const level = job.level as HskLevel;
    const guard = getVocabGuard(level);
    const avoidReadings = await getRecentReadingsToAvoid(database, job.userId, level, jobId);
    const result = await generateValidatedReading(env, level, guard, { avoidReadings });
    const model = env.DEEPSEEK_MODEL ?? CHINESE_READING_MODEL;

    if (result.unknownWords.length === 0) {
      await database
        .insert(chineseReadingStory)
        .values({ level, reading: result.reading, model })
        .catch((err: unknown) => console.warn('Could not save Chinese reading cache:', err));
    }

    await database
      .update(chineseReadingJob)
      .set({
        status: 'completed',
        reading: result.reading,
        unknownWords: result.unknownWords,
        model,
        error: null,
        updatedAt: new Date()
      })
      .where(eq(chineseReadingJob.id, jobId));

    return result.reading;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Chinese reading generation failed';

    await database
      .update(chineseReadingJob)
      .set({ status: 'failed', error: message, updatedAt: new Date() })
      .where(eq(chineseReadingJob.id, jobId));

    throw new Error(message);
  }
}

export function getChineseReadingJobSecret(env: {
  CHINESE_READING_JOB_SECRET?: string;
  APPLICATION_JOB_SECRET?: string;
  DATABASE_URL?: string;
}) {
  return env.CHINESE_READING_JOB_SECRET || env.APPLICATION_JOB_SECRET || env.DATABASE_URL || '';
}
