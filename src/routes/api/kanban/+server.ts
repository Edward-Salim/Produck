import { db } from '$lib/server/db/index.js';
import { kanbanCard } from '$lib/server/db/schema.js';
import { asc, eq } from 'drizzle-orm';
import { json } from '@sveltejs/kit';
import type { KanbanCard } from '$lib/types/story-map.js';

const COLUMN_IDS = ['col-todo', 'col-progress', 'col-review', 'col-blocked', 'col-done'] as const;
const COLUMN_TITLES: Record<string, string> = {
  'col-todo': 'To Do',
  'col-progress': 'In Progress',
  'col-review': 'Review',
  'col-blocked': 'Blocked',
  'col-done': 'Done'
};
const COLUMN_COLORS: Record<string, string> = {
  'col-todo': '#dbeafe',
  'col-progress': '#fef3c7',
  'col-review': '#f3e8ff',
  'col-blocked': '#fee2e2',
  'col-done': '#d1fae5'
};

export async function GET({ url }) {
  const projectId = Number(url.searchParams.get('projectId'));

  if (!projectId) return json({ columns: [] });

  try {
    const cards = await db
      .select()
      .from(kanbanCard)
      .where(eq(kanbanCard.projectId, projectId))
      .orderBy(asc(kanbanCard.sortOrder), asc(kanbanCard.createdAt));

    const priorityRank: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3, none: 4 };
    const typeRank: Record<string, number> = { bug: 0, feature: 1, improvement: 2, task: 3 };

    cards.sort((a, b) => {
      const pA = priorityRank[a.priority] ?? 4, pB = priorityRank[b.priority] ?? 4;
      const tA = typeRank[a.type] ?? 9, tB = typeRank[b.type] ?? 9;
      return pA - pB || tA - tB;
    });

    const columns = COLUMN_IDS.map((colId) => ({
      id: colId,
      title: COLUMN_TITLES[colId] ?? colId,
      color: COLUMN_COLORS[colId] ?? '#f3f4f6',
      wipLimit: null,
      cards: cards
        .filter((k) => k.columnId === colId)
        .map((k) => ({
          id: `KC-${k.id}`,
          title: k.title,
          description: k.description ?? '',
          assignee: k.assignee ?? '',
          blockReason: k.blockReason ?? '',
          blockedBy: k.blockedBy ?? '',
          dueDate: k.dueDate ?? '',
          storyPoints: k.storyPoints ?? null,
          priority: k.priority,
          type: (k.type as KanbanCard['type']) ?? 'task',
          createdAt: k.createdAt.toISOString()
        }))
    }));

    return json({ columns });
  } catch {
    return json({ columns: [] });
  }
}
