import { desc, eq, sql } from 'drizzle-orm';
import {
  CHINESE_SONG_LYRICS_MODEL,
  standardizeChineseSongLyrics,
  type ChineseSongLyricsEnv
} from './chinese-song-lyrics.js';
import { ensureChineseSongLyricImportJobTable } from './chinese-song-lyric-schema.js';
import { chineseSongLyric, chineseSongLyricImportJob } from './db/schema.js';
import type { LyricSong } from '../../routes/(app)/tools/chinese-game/lyrics/song-data.js';

const ACTIVE_JOB_LOCK_MS = 12 * 60 * 1000;

function normalizeMatchText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[üǖǘǚǜ]/g, 'u')
    .replace(/[^a-z0-9\p{Script=Han}]+/gu, '')
    .trim();
}

function tokenOverlap(left: string, right: string) {
  const leftTokens = new Set(
    left
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .split(/[^a-z0-9\p{Script=Han}]+/gu)
      .filter((token) => token.length > 1)
  );
  const rightTokens = right
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .split(/[^a-z0-9\p{Script=Han}]+/gu)
    .filter((token) => token.length > 1);

  return rightTokens.some((token) => leftTokens.has(token));
}

function sameNormalized(left: string, right: string) {
  const normalizedLeft = normalizeMatchText(left);
  const normalizedRight = normalizeMatchText(right);
  return Boolean(normalizedLeft && normalizedRight && normalizedLeft === normalizedRight);
}

function containmentMatch(left: string, right: string) {
  const normalizedLeft = normalizeMatchText(left);
  const normalizedRight = normalizeMatchText(right);
  return Boolean(
    normalizedLeft &&
    normalizedRight &&
    (normalizedLeft.includes(normalizedRight) || normalizedRight.includes(normalizedLeft))
  );
}

function nonEmptyStrings(values: Array<string | undefined>) {
  return values.filter((value): value is string => Boolean(value));
}

function singerMatchScore(imported: LyricSong, existing: LyricSong) {
  const importedSingers = nonEmptyStrings([
    imported.singer,
    imported.singerHanzi,
    imported.singerPinyin
  ]);
  const existingSingers = nonEmptyStrings([
    existing.singer,
    existing.singerHanzi,
    existing.singerPinyin
  ]);

  for (const importedSinger of importedSingers) {
    for (const existingSinger of existingSingers) {
      if (sameNormalized(importedSinger, existingSinger)) return 35;
    }
  }

  for (const importedSinger of importedSingers) {
    for (const existingSinger of existingSingers) {
      if (containmentMatch(importedSinger, existingSinger)) return 25;
      if (tokenOverlap(importedSinger, existingSinger)) return 15;
    }
  }

  return 0;
}

function duplicateScore(imported: LyricSong, existing: LyricSong) {
  let score = 0;

  if (sameNormalized(imported.titleHanzi, existing.titleHanzi)) score += 50;
  if (sameNormalized(imported.titlePinyin, existing.titlePinyin)) score += 45;
  if (sameNormalized(imported.titleEnglish, existing.titleEnglish)) score += 25;
  if (sameNormalized(imported.id, existing.id)) score += 45;

  return score + singerMatchScore(imported, existing);
}

async function findExistingSongForImport(database: any, song: LyricSong) {
  const [slugMatch] = await database
    .select({
      slug: chineseSongLyric.slug,
      song: chineseSongLyric.song,
      sortOrder: chineseSongLyric.sortOrder
    })
    .from(chineseSongLyric)
    .where(eq(chineseSongLyric.slug, song.id))
    .limit(1);

  if (slugMatch) return slugMatch;

  const existingSongs = await database
    .select({
      slug: chineseSongLyric.slug,
      song: chineseSongLyric.song,
      sortOrder: chineseSongLyric.sortOrder
    })
    .from(chineseSongLyric);

  const [best] = existingSongs
    .map((existing: { slug: string; song: LyricSong; sortOrder: number }) => ({
      ...existing,
      score: duplicateScore(song, existing.song)
    }))
    .filter((existing: { score: number }) => existing.score >= 75)
    .sort((left: { score: number }, right: { score: number }) => right.score - left.score);

  return best ?? null;
}

async function nextSongSortOrder(database: any) {
  const [lastSong] = await database
    .select({ sortOrder: chineseSongLyric.sortOrder })
    .from(chineseSongLyric)
    .orderBy(desc(chineseSongLyric.sortOrder), desc(chineseSongLyric.id))
    .limit(1);

  return (lastSong?.sortOrder ?? -1) + 1;
}

export async function processChineseSongLyricImportJob(
  database: any,
  env: ChineseSongLyricsEnv,
  jobId: string
) {
  await ensureChineseSongLyricImportJobTable(database);

  const [job] = await database
    .select()
    .from(chineseSongLyricImportJob)
    .where(eq(chineseSongLyricImportJob.id, jobId));

  if (!job) throw new Error(`Chinese song lyric import job not found: ${jobId}`);
  if (job.status === 'completed') return job.songSlug;
  if (job.status === 'failed') return null;
  if (job.status === 'running') {
    const updatedAt = job.updatedAt instanceof Date ? job.updatedAt : new Date(job.updatedAt);
    if (Date.now() - updatedAt.getTime() < ACTIVE_JOB_LOCK_MS) return job.songSlug ?? null;
  }

  await database
    .update(chineseSongLyricImportJob)
    .set({ status: 'running', error: null, updatedAt: new Date() })
    .where(eq(chineseSongLyricImportJob.id, jobId));

  try {
    const song = await standardizeChineseSongLyrics(env, job.rawSong);
    const existing = await findExistingSongForImport(database, song);
    const targetSlug = existing?.slug ?? song.id;
    const storedSong = { ...song, id: targetSlug };
    const model = env.DEEPSEEK_MODEL ?? CHINESE_SONG_LYRICS_MODEL;

    await database
      .update(chineseSongLyricImportJob)
      .set({ songSlug: targetSlug, model, updatedAt: new Date() })
      .where(eq(chineseSongLyricImportJob.id, jobId));

    await database
      .insert(chineseSongLyric)
      .values({
        slug: targetSlug,
        song: storedSong,
        sortOrder: existing?.sortOrder ?? (await nextSongSortOrder(database)),
        updatedAt: new Date()
      })
      .onConflictDoUpdate({
        target: chineseSongLyric.slug,
        set: {
          song: sql`excluded.song`,
          updatedAt: new Date()
        }
      });

    await database
      .update(chineseSongLyricImportJob)
      .set({
        status: 'completed',
        songSlug: targetSlug,
        model,
        error: null,
        updatedAt: new Date()
      })
      .where(eq(chineseSongLyricImportJob.id, jobId));

    return targetSlug;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Chinese song lyric import failed';

    await database
      .update(chineseSongLyricImportJob)
      .set({ status: 'failed', error: message, updatedAt: new Date() })
      .where(eq(chineseSongLyricImportJob.id, jobId));

    throw new Error(message);
  }
}

export function getChineseSongLyricImportJobSecret(env: {
  CHINESE_SONG_LYRIC_JOB_SECRET?: string;
  CHINESE_READING_JOB_SECRET?: string;
  APPLICATION_JOB_SECRET?: string;
  DATABASE_URL?: string;
}) {
  return (
    env.CHINESE_SONG_LYRIC_JOB_SECRET ||
    env.CHINESE_READING_JOB_SECRET ||
    env.APPLICATION_JOB_SECRET ||
    env.DATABASE_URL ||
    ''
  );
}
