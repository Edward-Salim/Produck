import { json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db/index.js';
import { appUser, chineseSongLyric } from '$lib/server/db/schema.js';
import type { RequestHandler } from './$types.js';

export const PUT: RequestHandler = async ({ request, params, locals }) => {
  const authId = locals.session?.user?.id;
  const [caller] = authId ? await db.select().from(appUser).where(eq(appUser.authId, authId)) : [];
  if (!caller) return json({ error: 'Sign in to verify lyrics.' }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { verified?: unknown };
  if (typeof body.verified !== 'boolean') {
    return json({ error: 'Missing verified value.' }, { status: 400 });
  }

  const [song] = await db
    .update(chineseSongLyric)
    .set({ verified: body.verified, updatedAt: new Date() })
    .where(eq(chineseSongLyric.slug, params.slug))
    .returning({ slug: chineseSongLyric.slug, verified: chineseSongLyric.verified });

  if (!song) return json({ error: 'Song not found.' }, { status: 404 });
  return json(song);
};
