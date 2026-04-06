import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import { idea } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types.js';

export const PATCH: RequestHandler = async ({ request }) => {
  const body = await request.json();
  const { id, status } = body;

  if (!id) return json({ error: 'Missing id' }, { status: 400 });

  const updates: Record<string, unknown> = {};
  if (status) updates.status = status;
  updates.updatedAt = new Date();

  await db.update(idea).set(updates).where(eq(idea.id, id));
  return json({ ok: true });
};
