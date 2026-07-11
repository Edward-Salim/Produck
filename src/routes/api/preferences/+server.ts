import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import { appUser } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import { assertProjectAccess, assertWorkspaceAccess } from '$lib/server/access.js';
import type { RequestHandler } from './$types.js';

export const GET: RequestHandler = async ({ locals }) => {
  const authId = locals.session?.user?.id;
  if (!authId) return json({}, { status: 401 });

  const [user] = await db
    .select({ preferences: appUser.preferences })
    .from(appUser)
    .where(eq(appUser.authId, authId))
    .limit(1);

  return json(user?.preferences ?? { music: true, sounds: true });
};

export const POST: RequestHandler = async ({ request, locals }) => {
  const authId = locals.session?.user?.id;
  if (!authId) return json({}, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch (err) {
    if (err instanceof Error && err.message.toLowerCase().includes('aborted')) {
      return new Response(null, { status: 204 });
    }
    return json({ error: 'Invalid preferences payload' }, { status: 400 });
  }
  if (body.lastWorkspaceId !== undefined && body.lastWorkspaceId !== null) {
    await assertWorkspaceAccess(locals, Number(body.lastWorkspaceId));
  }
  if (body.lastProjectId !== undefined && body.lastProjectId !== null) {
    await assertProjectAccess(locals, Number(body.lastProjectId));
  }

  const [existing] = await db
    .select({ preferences: appUser.preferences })
    .from(appUser)
    .where(eq(appUser.authId, authId))
    .limit(1);

  const current = (existing?.preferences ?? { music: true, sounds: true }) as Record<
    string,
    unknown
  >;
  const hskStudiedTopics = Array.isArray(body.hskStudiedTopics)
    ? [
        ...new Set(
          body.hskStudiedTopics
            .filter((topic): topic is string => typeof topic === 'string')
            .map((topic) => topic.trim())
            .filter(Boolean)
        )
      ].slice(0, 100)
    : (current.hskStudiedTopics ?? []);
  const hsk2StudiedTopics = Array.isArray(body.hsk2StudiedTopics)
    ? [
        ...new Set(
          body.hsk2StudiedTopics
            .filter((topic): topic is string => typeof topic === 'string')
            .map((topic) => topic.trim())
            .filter(Boolean)
        )
      ].slice(0, 100)
    : (current.hsk2StudiedTopics ?? []);
  const prefs: Record<string, unknown> = {
    music: body.music ?? current.music ?? true,
    sounds: body.sounds ?? current.sounds ?? true,
    hintAlwaysOn: body.hintAlwaysOn ?? current.hintAlwaysOn ?? false,
    selectedLevels: body.selectedLevels ?? current.selectedLevels ?? [],
    readingSuccessCounts: current.readingSuccessCounts ?? {},
    hskStudiedTopics,
    hsk2StudiedTopics,
    lastWorkspaceId:
      body.lastWorkspaceId !== undefined ? body.lastWorkspaceId : current.lastWorkspaceId,
    lastProjectId: body.lastProjectId !== undefined ? body.lastProjectId : current.lastProjectId,
    gameState: body.gameState !== undefined ? body.gameState : (current.gameState ?? undefined)
  };
  // Preserve highscore if not explicitly provided (only update when higher)
  if (body.highscore !== undefined) {
    const currentHighscore = (current.highscore as number) ?? 0;
    prefs.highscore = Math.max(Number(body.highscore), currentHighscore);
    prefs.highscoreName = body.highscoreName ?? (current.highscoreName as string) ?? 'Anonymous';
  } else {
    prefs.highscore = current.highscore;
    prefs.highscoreName = current.highscoreName;
  }
  // Preserve masteredHanzi (merge: keep max sentences mastered per level)
  if (body.masteredHanzi !== undefined) {
    const incoming = body.masteredHanzi as Record<string, string[]>;
    const stored = (current.masteredHanzi as Record<string, string[]>) ?? {};
    const merged: Record<string, string[]> = {};
    for (const lv of new Set([...Object.keys(stored), ...Object.keys(incoming)])) {
      merged[lv] = [...new Set([...(stored[lv] ?? []), ...(incoming[lv] ?? [])])];
    }
    prefs.masteredHanzi = merged;
  } else {
    prefs.masteredHanzi = current.masteredHanzi;
  }

  if (body.readingSuccessCounts !== undefined && body.readingSuccessCounts != null) {
    const incoming = body.readingSuccessCounts as Record<string, number>;
    const stored = (current.readingSuccessCounts as Record<string, number>) ?? {};
    const merged: Record<string, number> = {};
    for (const lv of new Set([...Object.keys(stored), ...Object.keys(incoming)])) {
      merged[lv] = Math.max(Number(stored[lv] ?? 0), Number(incoming[lv] ?? 0));
    }
    prefs.readingSuccessCounts = merged;
  }

  if (body.completedReadingLevel !== undefined) {
    const level = Number(body.completedReadingLevel);
    if (Number.isInteger(level) && level >= 1 && level <= 7) {
      const stored = (prefs.readingSuccessCounts as Record<string, number>) ?? {};
      prefs.readingSuccessCounts = {
        ...stored,
        [level]: Number(stored[level] ?? 0) + 1
      };
    }
  }

  // Remove null game states
  if (prefs.gameState === null) delete prefs.gameState;

  await db.update(appUser).set({ preferences: prefs }).where(eq(appUser.authId, authId));

  return json(prefs);
};
