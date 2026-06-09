import { db } from '$lib/server/db/index.js';
import {
  idea,
  actor,
  activity,
  storyMapTask,
  story,
  businessOutcome,
  experiencePhase,
  experienceStep,
  experienceTouchpoint,
  interviewSnapshot,
  keyResult,
  productObjective,
  kanbanCard,
  epic,
  ticket,
  assumption,
  project
} from '$lib/server/db/schema.js';
import { asc, desc, eq } from 'drizzle-orm';
import type { KanbanCard } from '$lib/types/story-map.js';
import type { PageServerLoad } from './$types.js';

export type FrameworkSeedInstance = {
  id: string;
  templateId: string;
  title: string;
  values: Record<string, string>;
  updatedAt: string;
  updatedBy?: string;
};

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

function mapStory(
  s: typeof story.$inferSelect,
  activityCodeMap: Map<number, string>,
  taskCodeMap: Map<number, string>
) {
  return {
    id: s.code,
    title: s.title,
    activity: activityCodeMap.get(s.activityId) ?? '',
    task: s.taskId ? (taskCodeMap.get(s.taskId) ?? undefined) : undefined,
    asA: s.asA ?? '',
    wantTo: s.wantTo ?? '',
    soThat: s.soThat ?? '',
    pic: s.pic,
    picColor: s.picColor,
    done: s.done,
    details: (s.details as string[]) ?? [],
    checkedAcs: (s.checkedAcs as any[]) ?? [],
    assumptions: (s.assumptions as any[]) ?? []
  };
}

export const load: PageServerLoad = async ({ cookies, locals, url }) => {
  const workspaceId = Number(cookies.get('active_workspace'));
  const projectId = Number(url.searchParams.get('project') || cookies.get('active_project'));
  const displayName = locals.session?.user?.displayName;
  if (!workspaceId) return { seededInstances: [] as FrameworkSeedInstance[], workspaceId: 0 as number, projectId: 0 as number, displayName };
  if (!projectId) return { seededInstances: [] as FrameworkSeedInstance[], workspaceId: workspaceId as number, projectId: 0 as number, displayName };

  const seededInstances: FrameworkSeedInstance[] = [];

  // ── Outcomes ──
  const bos = await db
    .select()
    .from(businessOutcome)
    .where(eq(businessOutcome.projectId, projectId))
    .orderBy(asc(businessOutcome.year));

  const objs = await db
    .select()
    .from(productObjective)
    .where(eq(productObjective.projectId, projectId))
    .orderBy(asc(productObjective.sortOrder));

  const objectiveRows = [];
  for (const obj of objs) {
    const krs = await db
      .select()
      .from(keyResult)
      .where(eq(keyResult.objectiveId, obj.id))
      .orderBy(asc(keyResult.code));

    objectiveRows.push({
      id: String(obj.id),
      code: obj.code,
      title: obj.title,
      year: obj.year,
      quarter: obj.quarter,
      keyResults: krs.map((kr) => ({
        id: String(kr.id),
        code: kr.code,
        description: kr.description,
        target: kr.target,
        targetValue: kr.targetValue,
        currentValue: kr.currentValue,
        unit: kr.unit,
        carriedFrom: kr.carriedFrom ?? '',
        lastUpdated: kr.lastUpdated
      }))
    });
  }

  if (bos.length > 0 || objectiveRows.length > 0) {
    seededInstances.push({
      id: `outcomes-db-project-${projectId}`,
      templateId: 'outcomes',
      title: 'Outcomes',
    values: {
      outcomes: JSON.stringify({
        businessOutcomes: bos.map((bo) => ({
          id: String(bo.id),
          code: bo.code,
          title: bo.title,
          description: bo.description ?? '',
          metrics: ((bo.metrics ?? []) as string[]).join('\n'),
          year: bo.year
        })),
        objectives: objectiveRows
      })
    },
    updatedAt: new Date().toISOString(),
    updatedBy: displayName
    });
  }

  // ── Experience Map ──
  const experiencePhases = await db
    .select()
    .from(experiencePhase)
    .where(eq(experiencePhase.projectId, projectId))
    .orderBy(asc(experiencePhase.sortOrder));

  if (experiencePhases.length > 0) {
    const experiencePhaseIds = experiencePhases.map((p) => p.id);
    const experienceSteps = await db
      .select()
      .from(experienceStep)
      .orderBy(asc(experienceStep.sortOrder))
      .then((steps) => steps.filter((s) => experiencePhaseIds.includes(s.phaseId)));

    const experienceStepIds = experienceSteps.map((s) => s.id);
    const experienceTouchpoints = await db
      .select()
      .from(experienceTouchpoint)
      .orderBy(asc(experienceTouchpoint.sortOrder))
      .then((tps) => tps.filter((tp) => experienceStepIds.includes(tp.stepId)));

    seededInstances.push({
      id: `experience-map-db-project-${projectId}`,
      templateId: 'experience-map',
      title: 'Experience Map',
      values: {
        experienceMap: JSON.stringify({
          outcomes: bos.map((bo) => ({ code: bo.code, title: bo.title })),
          phases: experiencePhases.map((phase) => ({
            id: String(phase.id),
            title: phase.title,
            actors: (phase.actorEmojis ?? []) as string[],
            steps: experienceSteps
              .filter((s) => s.phaseId === phase.id)
              .map((s) => ({
                id: String(s.id),
                title: s.title,
                touchpoints: experienceTouchpoints
                  .filter((tp) => tp.stepId === s.id)
                  .map((tp) => ({
                    id: String(tp.id),
                    title: tp.title,
                    actor: tp.asA ?? tp.pic ?? '',
                    action: tp.wantTo ?? '',
                    outcome: tp.soThat ?? '',
                    pains: ((tp.pains ?? []) as string[]).join('\n'),
                    gains: ((tp.gains ?? []) as string[]).join('\n'),
                    pic: tp.pic,
                    picColor: tp.picColor,
                    kpi: tp.kpi
                  }))
              }))
          }))
        })
      },
      updatedAt: new Date().toISOString(),
    updatedBy: displayName
    });
  }

  // ── Interview Snapshots ──
  const snapshots = await db
    .select()
    .from(interviewSnapshot)
    .where(eq(interviewSnapshot.projectId, projectId))
    .orderBy(desc(interviewSnapshot.interviewDate), desc(interviewSnapshot.id));

  if (snapshots.length > 0) {
    seededInstances.push({
      id: `interview-snapshots-db-project-${projectId}`,
      templateId: 'interview-snapshot',
      title: 'Interview Snapshots',
      values: {
        snapshots: JSON.stringify(
          snapshots.map((row) => ({
            id: String(row.id),
            personName: row.personName,
            personRole: row.personRole ?? '',
            personPhoto: row.personPhoto ?? '',
            interviewDate: row.interviewDate,
            quote: row.quote ?? '',
            quickFacts: ((row.quickFacts ?? []) as string[]).join('\n'),
            insights: ((row.insights ?? []) as string[]).join('\n'),
            opportunities: ((row.opportunities ?? []) as string[]).join('\n'),
            transcript: row.transcript ?? ''
          }))
        )
      },
      updatedAt: snapshots[0].updatedAt.toISOString(),
      updatedBy: displayName
    });
  }

  // ── Idea Bank ──
  const ideas = await db
    .select()
    .from(idea)
    .where(eq(idea.projectId, projectId))
    .orderBy(asc(idea.createdAt));

  if (ideas.length > 0) {
    seededInstances.push({
      id: `idea-bank-db-project-${projectId}`,
      templateId: 'idea-bank',
      title: 'Idea Bank',
      values: {
        ideas: JSON.stringify(
          ideas.map((i) => ({
            id: `db-${i.id}`,
            title: i.title,
            description: i.description ?? '',
            status: i.status,
            proposer: i.proposer ?? '',
            okrCode: i.okrCode ?? '',
            createdAt: i.createdAt.toISOString()
          }))
        )
      },
      updatedAt: new Date().toISOString(),
    updatedBy: displayName
    });
  }

  // ── Story Map, Backlog & Assumptions (project-wide, decoupled from ideas) ──
  const projectRow = await db
    .select({ name: project.name, levels: project.levels })
    .from(project)
    .where(eq(project.id, projectId))
    .then((rows) => rows[0]);

  // Activities and actors — project-scoped only (decoupled from Ideas)
  const projectActivities = await db
    .select()
    .from(activity)
    .where(eq(activity.projectId, projectId))
    .orderBy(asc(activity.sortOrder));

  const projectActors = await db
    .select()
    .from(actor)
    .where(eq(actor.projectId, projectId))
    .orderBy(asc(actor.sortOrder));

  const activityIds = projectActivities.map((a) => a.id);

  const allTasks =
    activityIds.length > 0
      ? await db.select().from(storyMapTask).orderBy(asc(storyMapTask.sortOrder))
      : [];
  const projectTasks = allTasks.filter((t) => activityIds.includes(t.activityId));

  const allStories =
    activityIds.length > 0
      ? await db.select().from(story).orderBy(asc(story.sortOrder))
      : [];
  const projectStories = allStories.filter((s) => activityIds.includes(s.activityId));

  const activityCodeMap = new Map(projectActivities.map((a) => [a.id, a.code]));
  const taskCodeMap = new Map(projectTasks.map((t) => [t.id, t.code]));

  // ── Story Map (only if there are stories) ──
  if (projectStories.length > 0) {
    const storyMap = {
    product: projectRow?.name ?? 'Project',
    actors: projectActors.map((a) => ({ emoji: a.emoji, label: a.label })),
    levels: projectRow?.levels ?? 2,
    activities: projectActivities.map((a) => ({
      id: a.code,
      title: a.title,
      actors: (a.actorEmojis as string[]) ?? [],
      tasks: projectTasks
        .filter((t) => t.activityId === a.id)
        .map((t) => ({ id: t.code, title: t.title }))
    })),
    stories: {
      'must-have': projectStories
        .filter((s) => s.kano === 'must-have')
        .map((s) => mapStory(s, activityCodeMap, taskCodeMap)),
      performance: projectStories
        .filter((s) => s.kano === 'performance')
        .map((s) => mapStory(s, activityCodeMap, taskCodeMap)),
      delighter: projectStories
        .filter((s) => s.kano === 'delighter')
        .map((s) => mapStory(s, activityCodeMap, taskCodeMap))
    } as Record<string, any[]>
  };

    seededInstances.push({
      id: `story-map-db-project-${projectId}`,
      templateId: 'story-map',
      title: 'Story Map',
      values: { storyMap: JSON.stringify(storyMap) },
      updatedAt: new Date().toISOString(),
    updatedBy: displayName
    });
  }

  // ── Epics (standalone, decoupled from Story Map) ──
  const epicRows = await db
    .select()
    .from(epic)
    .where(eq(epic.projectId, projectId))
    .orderBy(asc(epic.sortOrder));

  const epicIds = epicRows.map((e) => e.id);
  const ticketRows =
    epicIds.length > 0
      ? await db.select().from(ticket).orderBy(asc(ticket.sortOrder))
      : [];

  if (epicRows.length > 0) {
    const epicsData = epicRows.map((e) => ({
      code: e.code,
      title: e.title,
      actors: [] as string[],
      stories: ticketRows
        .filter((s) => s.epicId === e.id)
        .map((s) => ({
          id: s.code,
          title: s.title,
          epic: e.code,
          task: null,
          taskOrder: s.sortOrder,
          kano: s.kano,
          pic: s.pic,
          picColor: s.picColor,
          done: s.done,
          acceptanceCriteria: (s.acceptanceCriteria as string[]) ?? [],
          checkedAcs: (s.checkedAcs as any[]) ?? [],
          assumptions: [] as any[]
        }))
    }));

    seededInstances.push({
      id: `backlog-db-project-${projectId}`,
      templateId: 'backlog',
      title: 'Epics',
      values: { backlog: JSON.stringify({ epics: epicsData }) },
      updatedAt: new Date().toISOString(),
    updatedBy: displayName
    });
  }

  // ── Assumptions (standalone, decoupled from Story Map) ──
  const assumptionRows = await db
    .select()
    .from(assumption)
    .where(eq(assumption.projectId, projectId))
    .orderBy(asc(assumption.sortOrder));

  if (assumptionRows.length > 0) {
    const typeOrder: Record<string, number> = { desirability: 0, feasibility: 1, usability: 2, viability: 3 };
    const typeIndex: Record<string, number> = {};
    const prefixMap: Record<string, string> = {
      desirability: 'D', feasibility: 'F', usability: 'U', viability: 'V'
    };

    const allAssumptions = assumptionRows.map((a) => {
      typeIndex[a.type] = (typeIndex[a.type] ?? 0) + 1;
      return {
        id: String(a.id),
        label: `${prefixMap[a.type] ?? '?'}${typeIndex[a.type]}`,
        type: a.type,
        assumption: a.assumption,
        rationale: a.rationale,
        testMethod: a.testMethod,
        successCriteria: a.successCriteria,
        actualResults: a.actualResults,
        status: a.status,
        lastTested: a.lastTested,
        importance: a.importance,
        evidence: a.evidence
      };
    });

    seededInstances.push({
      id: `assumption-test-db-project-${projectId}`,
      templateId: 'assumption-test',
      title: 'Assumption Test',
      values: { assumptions: JSON.stringify(allAssumptions) },
      updatedAt: new Date().toISOString(),
    updatedBy: displayName
    });
  }

  // ── Kanban Board ──
  try {
    const kanbanCards = await db
      .select()
      .from(kanbanCard)
      .where(eq(kanbanCard.projectId, projectId))
      .orderBy(asc(kanbanCard.sortOrder), asc(kanbanCard.createdAt));

      // Sort within each column: priority → type
      const priorityRank: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3, none: 4 };
      const typeRank: Record<string, number> = { bug: 0, feature: 1, improvement: 2, task: 3 };

      kanbanCards.sort((a, b) => {
        const pA = priorityRank[a.priority] ?? 4, pB = priorityRank[b.priority] ?? 4;
        const tA = typeRank[a.type] ?? 9, tB = typeRank[b.type] ?? 9;
        return pA - pB || tA - tB;
      });

      if (kanbanCards.length > 0) {
      const columns = COLUMN_IDS.map((colId) => ({
        id: colId,
        title: COLUMN_TITLES[colId] ?? colId,
        color: COLUMN_COLORS[colId] ?? '#f3f4f6',
        wipLimit: null,
        cards: kanbanCards
          .filter((k) => k.columnId === colId)
          .map((k) => ({
            id: `KC-${k.id}`,
            title: k.title,
            description: k.description ?? '',
            assignee: k.assignee ?? '',
            dueDate: k.dueDate ?? '',
            storyPoints: k.storyPoints ?? null,
            priority: k.priority,
            type: (k.type as KanbanCard['type']) ?? 'task',
            createdAt: k.createdAt.toISOString()
          }))
      }));

      seededInstances.push({
        id: `kanban-db-project-${projectId}`,
        templateId: 'kanban',
        title: 'Kanban Board',
        values: { kanban: JSON.stringify(columns) },
        updatedAt: new Date().toISOString(),
    updatedBy: displayName
      });
    }
  } catch {
    // Table not yet created — skip kanban (run `pnpm db:push`)
  }

  return { seededInstances, workspaceId: workspaceId as number, projectId: projectId as number };
};
