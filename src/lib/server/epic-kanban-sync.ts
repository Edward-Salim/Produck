import { and, eq } from 'drizzle-orm';
import { db } from '$lib/server/db/index.js';
import { epic, frameworkInstance, kanbanCard, project, ticket } from '$lib/server/db/schema.js';

type CheckedAcceptanceCriterion = {
  index: number;
  checkedAt: string;
};

type BacklogStory = {
  id: string;
  title: string;
  kano?: string;
  pic?: string;
  picColor?: string;
  done?: boolean;
  acceptanceCriteria?: string[];
  checkedAcs?: CheckedAcceptanceCriterion[];
  taskOrder?: number;
};

type BacklogEpic = {
  code: string;
  title: string;
  stories?: BacklogStory[];
};

type BacklogValues = Record<string, unknown> & {
  backlog?: string;
};

function parseBacklog(values: BacklogValues): BacklogEpic[] {
  if (typeof values.backlog !== 'string') return [];

  try {
    const parsed = JSON.parse(values.backlog);
    return Array.isArray(parsed?.epics) ? parsed.epics : [];
  } catch {
    return [];
  }
}

function updateBacklogStory(
  values: BacklogValues,
  ticketCode: string,
  changes: Partial<Pick<BacklogStory, 'title' | 'pic' | 'done'>>
): BacklogValues {
  const epics = parseBacklog(values);
  let changed = false;

  const nextEpics = epics.map((backlogEpic) => ({
    ...backlogEpic,
    stories: (backlogEpic.stories ?? []).map((story) => {
      if (story.id !== ticketCode) return story;
      changed = true;
      return { ...story, ...changes };
    })
  }));

  return changed ? { ...values, backlog: JSON.stringify({ epics: nextEpics }) } : values;
}

export async function syncBacklogToKanban(
  projectId: number,
  values: BacklogValues,
  options: { force?: boolean } = {}
) {
  if (!options.force) {
    const [projectSettings] = await db
      .select({ enabled: project.epicKanbanSyncEnabled })
      .from(project)
      .where(eq(project.id, projectId))
      .limit(1);
    if (!projectSettings?.enabled) return;
  }

  const backlogEpics = parseBacklog(values);
  if (backlogEpics.length === 0) return;

  await db.transaction(async (tx) => {
    for (const [epicIndex, backlogEpic] of backlogEpics.entries()) {
      if (!backlogEpic.code?.trim() || !backlogEpic.title?.trim()) continue;

      let [storedEpic] = await tx
        .select()
        .from(epic)
        .where(and(eq(epic.projectId, projectId), eq(epic.code, backlogEpic.code)))
        .limit(1);

      if (storedEpic) {
        [storedEpic] = await tx
          .update(epic)
          .set({
            title: backlogEpic.title,
            sortOrder: epicIndex,
            updatedAt: new Date()
          })
          .where(eq(epic.id, storedEpic.id))
          .returning();
      } else {
        [storedEpic] = await tx
          .insert(epic)
          .values({
            projectId,
            code: backlogEpic.code,
            title: backlogEpic.title,
            sortOrder: epicIndex
          })
          .returning();
      }

      for (const [storyIndex, story] of (backlogEpic.stories ?? []).entries()) {
        if (!story.id?.trim() || !story.title?.trim()) continue;

        let [storedTicket] = await tx
          .select()
          .from(ticket)
          .where(and(eq(ticket.epicId, storedEpic.id), eq(ticket.code, story.id)))
          .limit(1);

        const ticketValues = {
          title: story.title,
          kano: story.kano ?? 'must-have',
          pic: story.pic ?? '',
          picColor: story.picColor ?? '',
          done: Boolean(story.done),
          acceptanceCriteria: story.acceptanceCriteria ?? [],
          checkedAcs: story.checkedAcs ?? [],
          sortOrder: story.taskOrder ?? storyIndex,
          updatedAt: new Date()
        };

        if (storedTicket) {
          [storedTicket] = await tx
            .update(ticket)
            .set(ticketValues)
            .where(eq(ticket.id, storedTicket.id))
            .returning();
        } else {
          [storedTicket] = await tx
            .insert(ticket)
            .values({
              epicId: storedEpic.id,
              code: story.id,
              ...ticketValues
            })
            .returning();
        }

        let [card] = await tx
          .select()
          .from(kanbanCard)
          .where(eq(kanbanCard.ticketId, storedTicket.id))
          .limit(1);

        if (!card) {
          [card] = await tx
            .select()
            .from(kanbanCard)
            .where(and(eq(kanbanCard.projectId, projectId), eq(kanbanCard.title, story.title)))
            .limit(1);
        }

        const columnId = story.done
          ? 'col-done'
          : card?.columnId === 'col-done'
            ? 'col-todo'
            : (card?.columnId ?? 'col-todo');

        if (card) {
          await tx
            .update(kanbanCard)
            .set({
              ticketId: storedTicket.id,
              title: story.title,
              assignee: story.pic ?? '',
              columnId,
              updatedAt: new Date()
            })
            .where(eq(kanbanCard.id, card.id));
        } else {
          await tx.insert(kanbanCard).values({
            projectId,
            ticketId: storedTicket.id,
            columnId,
            title: story.title,
            description: '',
            assignee: story.pic ?? '',
            priority: story.kano === 'performance' ? 'medium' : 'high',
            type: 'task',
            sortOrder: story.taskOrder ?? storyIndex
          });
        }
      }
    }
  });
}

export async function syncKanbanCardToBacklog(
  cardId: number,
  changes: { assignee?: string; done?: boolean },
  updatedBy?: string
) {
  const [card] = await db.select().from(kanbanCard).where(eq(kanbanCard.id, cardId)).limit(1);
  if (!card?.ticketId) return;

  const [projectSettings] = await db
    .select({ enabled: project.epicKanbanSyncEnabled })
    .from(project)
    .where(eq(project.id, card.projectId))
    .limit(1);
  if (!projectSettings?.enabled) return;

  const ticketChanges: Partial<typeof ticket.$inferInsert> = { updatedAt: new Date() };
  if (changes.assignee !== undefined) ticketChanges.pic = changes.assignee;
  if (changes.done !== undefined) ticketChanges.done = changes.done;

  const [storedTicket] = await db
    .update(ticket)
    .set(ticketChanges)
    .where(eq(ticket.id, card.ticketId))
    .returning();
  if (!storedTicket) return;

  const instances = await db
    .select()
    .from(frameworkInstance)
    .where(
      and(
        eq(frameworkInstance.projectId, card.projectId),
        eq(frameworkInstance.templateId, 'backlog')
      )
    );

  for (const instance of instances) {
    const values = (instance.values ?? {}) as BacklogValues;
    const nextValues = updateBacklogStory(values, storedTicket.code, {
      ...(changes.assignee !== undefined ? { pic: changes.assignee } : {}),
      ...(changes.done !== undefined ? { done: changes.done } : {})
    });
    if (nextValues === values) continue;

    await db
      .update(frameworkInstance)
      .set({
        values: nextValues as Record<string, string>,
        updatedBy: updatedBy ?? instance.updatedBy,
        updatedAt: new Date()
      })
      .where(eq(frameworkInstance.id, instance.id));
  }
}
