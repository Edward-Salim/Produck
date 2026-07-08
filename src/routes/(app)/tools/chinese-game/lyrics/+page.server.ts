import { asc, sql } from 'drizzle-orm';
import { chineseSongLyric } from '$lib/server/db/schema.js';
import { db } from '$lib/server/db/index.js';
import { songs as seedSongs } from './song-data.js';
import type { PageServerLoad } from './$types.js';

async function seedSongLyrics() {
  if (seedSongs.length === 0) return;

  await db
    .insert(chineseSongLyric)
    .values(
      seedSongs.map((song, index) => ({
        slug: song.id,
        song,
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
    .select({ song: chineseSongLyric.song })
    .from(chineseSongLyric)
    .orderBy(asc(chineseSongLyric.sortOrder), asc(chineseSongLyric.id));

  const songs = rows.map((row) => row.song);
  const selectedId = url.searchParams.get('song');

  return {
    songs,
    selectedId: songs.some((song) => song.id === selectedId) ? selectedId : null
  };
};
