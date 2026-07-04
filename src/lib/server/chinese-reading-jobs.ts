import { eq } from 'drizzle-orm';
import {
  CHINESE_READING_MODEL,
  generateValidatedReading,
  getVocabGuard,
  type ChineseReadingEnv,
  type HskLevel
} from './chinese-reading.js';
import { ensureChineseReadingStoryTable } from './chinese-reading-schema.js';
import { chineseReadingJob, chineseReadingStory } from './db/schema.js';

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
    const result = await generateValidatedReading(env, level, guard);
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
