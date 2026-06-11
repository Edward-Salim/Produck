import { db } from '$lib/server/db/index.js';
import { kanbanCard } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import { json } from '@sveltejs/kit';

export async function PATCH({ params, request }) {
  const cardId = Number(params.id);
  if (!cardId) return json({ error: 'Invalid card id' }, { status: 400 });

  const { blockReason, blockedBy } = await request.json();
  if (blockReason === undefined && blockedBy === undefined) {
    return json({ error: 'blockReason or blockedBy required' }, { status: 400 });
  }

  await db
    .update(kanbanCard)
    .set({ blockReason: blockReason ?? null, blockedBy: blockedBy ?? null, updatedAt: new Date() })
    .where(eq(kanbanCard.id, cardId));

  return json({ ok: true });
}
