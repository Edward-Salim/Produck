import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import { appUser } from '$lib/server/db/schema.js';
import type { RequestHandler } from './$types.js';

export const GET: RequestHandler = async () => {
  const users = await db
    .select({
      displayName: appUser.displayName,
      preferences: appUser.preferences
    })
    .from(appUser);

  const leaderboard = users
    .map((u) => {
      const prefs = (u.preferences ?? {}) as Record<string, unknown>;
      return {
        name: (prefs.highscoreName as string) ?? u.displayName ?? 'Anonymous',
        score: (prefs.highscore as number) ?? 0
      };
    })
    .filter((e) => e.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  return json(leaderboard);
};
