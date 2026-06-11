import { db } from '$lib/server/db/index.js';
import { kanbanCard, kanbanActivity } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import { json } from '@sveltejs/kit';

const COLUMN_LABELS: Record<string, string> = {
  'col-todo': 'To Do',
  'col-progress': 'In Progress',
  'col-review': 'Review',
  'col-blocked': 'Blocked',
  'col-done': 'Done'
};

export async function PATCH({ params, request, locals }) {
  const cardId = Number(params.id);
  if (!cardId) return json({ error: 'Invalid card id' }, { status: 400 });

  const { columnId } = await request.json();
  if (!columnId) return json({ error: 'columnId required' }, { status: 400 });

  const actor = locals.session?.user?.displayName ?? 'Someone';

  // Fetch current state for logging
  const [card] = await db.select().from(kanbanCard).where(eq(kanbanCard.id, cardId));
  const oldColumn = card?.columnId ?? '';

  await db
    .update(kanbanCard)
    .set({ columnId, updatedAt: new Date() })
    .where(eq(kanbanCard.id, cardId));

  // Log activity if the column actually changed
  if (oldColumn !== columnId && card) {
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
