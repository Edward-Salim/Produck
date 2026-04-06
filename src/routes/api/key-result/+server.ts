import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import { keyResult } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types.js';

export const PATCH: RequestHandler = async ({ request }) => {
  const { id, currentValue } = await request.json();
  if (!id || currentValue === undefined)
    return json({ error: 'Missing id or currentValue' }, { status: 400 });

  await db
    .update(keyResult)
    .set({
      currentValue: Math.round(Number(currentValue)),
      lastUpdated: new Date().toISOString().split('T')[0]
    })
    .where(eq(keyResult.id, id));

  return json({ ok: true });
};
