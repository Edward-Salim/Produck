import { db } from '$lib/server/db/index.js';
import { kanbanActivity } from '$lib/server/db/schema.js';
import { desc, eq } from 'drizzle-orm';
import { json } from '@sveltejs/kit';

const COLUMN_LABELS: Record<string, string> = {
  'col-todo': 'To Do',
  'col-progress': 'In Progress',
  'col-review': 'Review',
  'col-blocked': 'Blocked',
  'col-done': 'Done'
};

export async function GET({ url }) {
  const projectId = Number(url.searchParams.get('projectId'));
  if (!projectId) return json({ activities: [] });

  try {
    const rows = await db
      .select()
      .from(kanbanActivity)
      .where(eq(kanbanActivity.projectId, projectId))
      .orderBy(desc(kanbanActivity.createdAt))
      .limit(100);

    const activities = rows.map((r) => ({
      id: r.id,
      cardId: `KC-${r.cardId}`,
      cardTitle: r.cardTitle,
      action: r.action,
      fromValue:
        r.action === 'move' ? (COLUMN_LABELS[r.fromValue ?? ''] ?? r.fromValue) : r.fromValue,
      toValue: r.action === 'move' ? (COLUMN_LABELS[r.toValue] ?? r.toValue) : r.toValue,
      actor: r.actor,
      createdAt: r.createdAt.toISOString()
    }));

    return json({ activities });
  } catch {
    return json({ activities: [] });
  }
}
