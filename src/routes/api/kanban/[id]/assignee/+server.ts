import { db } from '$lib/server/db/index.js';
import { kanbanCard, kanbanActivity } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import { json } from '@sveltejs/kit';
import { assertProjectAccess } from '$lib/server/access.js';

export async function PATCH({ params, request, locals }) {
  const cardId = Number(params.id);
  if (!cardId) return json({ error: 'Invalid card id' }, { status: 400 });

  const { assignee } = await request.json();
  if (assignee === undefined) return json({ error: 'assignee required' }, { status: 400 });

  const actor = locals.session?.user?.displayName ?? 'Someone';

  const [card] = await db.select().from(kanbanCard).where(eq(kanbanCard.id, cardId));
  if (!card) return json({ error: 'Card not found' }, { status: 404 });
  await assertProjectAccess(locals, card.projectId);
  const oldAssignee = card?.assignee ?? '';

  await db
    .update(kanbanCard)
    .set({ assignee, updatedAt: new Date() })
    .where(eq(kanbanCard.id, cardId));

  if (oldAssignee !== assignee) {
    await db.insert(kanbanActivity).values({
      projectId: card.projectId,
      cardId: card.id,
      cardTitle: card.title,
      action: 'assign',
      fromValue: oldAssignee || 'unassigned',
      toValue: assignee || 'unassigned',
      actor
    });
  }

  return json({ ok: true });
}
