import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import { appUser } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types.js';

export const GET: RequestHandler = async ({ locals }) => {
  const authId = locals.session?.user?.id;
  if (!authId) return json({}, { status: 401 });

  const [user] = await db.select({ preferences: appUser.preferences })
    .from(appUser)
    .where(eq(appUser.authId, authId))
    .limit(1);

  return json(user?.preferences ?? { music: true, sounds: true });
};

export const POST: RequestHandler = async ({ request, locals }) => {
  const authId = locals.session?.user?.id;
  if (!authId) return json({}, { status: 401 });

  const body = await request.json();

  const [existing] = await db.select({ preferences: appUser.preferences })
    .from(appUser)
    .where(eq(appUser.authId, authId))
    .limit(1);

  const current = (existing?.preferences ?? { music: true, sounds: true }) as Record<string, unknown>;
  const prefs: Record<string, unknown> = {
    music: body.music ?? current.music ?? true,
    sounds: body.sounds ?? current.sounds ?? true,
    hintAlwaysOn: body.hintAlwaysOn ?? current.hintAlwaysOn ?? false,
    selectedLevels: body.selectedLevels ?? current.selectedLevels ?? [],
    lastWorkspaceId: body.lastWorkspaceId !== undefined ? body.lastWorkspaceId : current.lastWorkspaceId,
    lastProjectId: body.lastProjectId !== undefined ? body.lastProjectId : current.lastProjectId,
    gameState: body.gameState !== undefined ? body.gameState : (current.gameState ?? undefined)
  };
  // Preserve highscore if not explicitly provided (only update when higher)
  if (body.highscore !== undefined) {
    const currentHighscore = (current.highscore as number) ?? 0;
    prefs.highscore = Math.max(body.highscore, currentHighscore);
    prefs.highscoreName = body.highscoreName ?? (current.highscoreName as string) ?? 'Anonymous';
  } else {
    prefs.highscore = current.highscore;
    prefs.highscoreName = current.highscoreName;
  }
  // Remove null game states
  if (prefs.gameState === null) delete prefs.gameState;

  await db.update(appUser)
    .set({ preferences: prefs })
    .where(eq(appUser.authId, authId));

  return json(prefs);
};
