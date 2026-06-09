import { db } from '$lib/server/db/index.js';
import { kanbanCard } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import { json } from '@sveltejs/kit';

export async function PATCH({ params, request }) {
  const cardId = Number(params.id);
  if (!cardId) return json({ error: 'Invalid card id' }, { status: 400 });

  const { assignee } = await request.json();
  if (assignee === undefined) return json({ error: 'assignee required' }, { status: 400 });

  await db
    .update(kanbanCard)
    .set({ assignee, updatedAt: new Date() })
    .where(eq(kanbanCard.id, cardId));

  return json({ ok: true });
}
