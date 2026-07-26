import { db } from '$lib/server/db/index.js';
import { kanbanCard, kanbanActivity } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import { json } from '@sveltejs/kit';
import { assertProjectAccess } from '$lib/server/access.js';
import { syncKanbanCardToBacklog } from '$lib/server/epic-kanban-sync.js';

export async function PATCH({ params, request, locals }) {
  const cardId = Number(params.id);
  if (!cardId) return json({ error: 'Invalid card id' }, { status: 400 });

  const { columnId } = await request.json();
  if (!columnId) return json({ error: 'columnId required' }, { status: 400 });

  const actor = locals.session?.user?.displayName ?? 'Someone';

  // Fetch current state for logging
  const [card] = await db.select().from(kanbanCard).where(eq(kanbanCard.id, cardId));
  if (!card) return json({ error: 'Card not found' }, { status: 404 });
  await assertProjectAccess(locals, card.projectId);
  const oldColumn = card?.columnId ?? '';

  await db
    .update(kanbanCard)
    .set({ columnId, updatedAt: new Date() })
    .where(eq(kanbanCard.id, cardId));

  await syncKanbanCardToBacklog(cardId, { done: columnId === 'col-done' }, actor);

  // Log activity if the column actually changed
  if (oldColumn !== columnId) {
    await db.insert(kanbanActivity).values({
      projectId: card.projectId,
      cardId: card.id,
      cardTitle: card.title,
      action: 'move',
      fromValue: oldColumn,
      toValue: columnId,
      actor
    });
  }

  return json({ ok: true });
}
