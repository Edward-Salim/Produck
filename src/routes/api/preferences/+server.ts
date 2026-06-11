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
  const prefs = { music: body.music ?? true, sounds: body.sounds ?? true };

  await db.update(appUser)
    .set({ preferences: prefs })
    .where(eq(appUser.authId, authId));

  return json(prefs);
};
