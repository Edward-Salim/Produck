import { db } from '$lib/server/db/index.js';
import { kanbanCard } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import { json } from '@sveltejs/kit';
import { assertProjectAccess } from '$lib/server/access.js';

export async function PATCH({ params, request, locals }) {
  const cardId = Number(params.id);
  if (!cardId) return json({ error: 'Invalid card id' }, { status: 400 });

  const { blockReason, blockedBy } = await request.json();
  if (blockReason === undefined && blockedBy === undefined) {
    return json({ error: 'blockReason or blockedBy required' }, { status: 400 });
  }

  const [card] = await db
    .select({ projectId: kanbanCard.projectId })
    .from(kanbanCard)
    .where(eq(kanbanCard.id, cardId))
    .limit(1);
  if (!card) return json({ error: 'Card not found' }, { status: 404 });
  await assertProjectAccess(locals, card.projectId);

  await db
    .update(kanbanCard)
    .set({ blockReason: blockReason ?? null, blockedBy: blockedBy ?? null, updatedAt: new Date() })
    .where(eq(kanbanCard.id, cardId));

  return json({ ok: true });
}
