import { asc, eq, sql } from 'drizzle-orm';
import { chineseSongLyric } from '$lib/server/db/schema.js';
import { db } from '$lib/server/db/index.js';
import { compareLyricSongsByArtistAndTitle, songs as seedSongs } from './song-data.js';
import type { PageServerLoad } from './$types.js';

const VERIFIED_SEED_SONG_IDS = new Set([
  'gao-bai-qi-qiu',
  'nu-er-dian-xia-jay-chou',
  'qi-yue-de-ji-guang-jay-chou',
  'shui-xi-han-jay-chou',
  'ai-qin-hai-jay-chou',
  'i-do-jay-chou-i-do'
]);

async function seedSongLyrics() {
  if (seedSongs.length === 0) return;

  await db
    .insert(chineseSongLyric)
    .values(
      seedSongs.map((song, index) => ({
        slug: song.id,
        song,
        verified: VERIFIED_SEED_SONG_IDS.has(song.id),
        sortOrder: index,
        updatedAt: new Date()
      }))
    )
    .onConflictDoUpdate({
      target: chineseSongLyric.slug,
      set: {
        song: sql`excluded.song`,
        sortOrder: sql`excluded.sort_order`,
        updatedAt: new Date()
      }
    });
}

export const load: PageServerLoad = async ({ url }) => {
  await seedSongLyrics();

  const rows = await db
    .select({ song: chineseSongLyric.song, verified: chineseSongLyric.verified })
    .from(chineseSongLyric)
    .where(eq(chineseSongLyric.hidden, false))
    .orderBy(asc(chineseSongLyric.sortOrder), asc(chineseSongLyric.id));

  const songs = rows
    .map((row) => ({ ...row.song, verified: row.verified }))
    .sort(compareLyricSongsByArtistAndTitle);
  const selectedId = url.searchParams.get('song');

  return {
    songs,
    selectedId: songs.some((song) => song.id === selectedId) ? selectedId : null
  };
};
