import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import {
  appUser,
  project,
  actor,
  activity,
  storyMapTask,
  story,
  persona,
  interviewSnapshot,
  businessOutcome,
  productObjective,
  keyResult,
  idea,
  milestone,
  roadmapItem,
  backlogItem,
  experiencePhase,
  experienceStep,
  experienceTouchpoint
} from '$lib/server/db/schema.js';
import { eq, asc } from 'drizzle-orm';
import type { RequestHandler } from './$types.js';

// Admin check helper
async function isAdmin(locals: App.Locals) {
  const authId = locals.session?.user?.id;
  if (!authId) return false;
  const [user] = await db.select().from(appUser).where(eq(appUser.authId, authId));
  return user?.role === 'admin';
}

// GET: fetch all data for a project
export const GET: RequestHandler = async ({ url, locals }) => {
  if (!(await isAdmin(locals))) return json({ error: 'Forbidden' }, { status: 403 });

  const projectId = Number(url.searchParams.get('projectId'));
  if (!projectId) return json({ error: 'Missing projectId' }, { status: 400 });

  const [proj] = await db.select().from(project).where(eq(project.id, projectId));
  if (!proj) return json({ error: 'Project not found' }, { status: 404 });

  const actors = await db
    .select()
    .from(actor)
    .where(eq(actor.projectId, projectId))
    .orderBy(asc(actor.sortOrder));
  const activities = await db
    .select()
    .from(activity)
    .where(eq(activity.projectId, projectId))
    .orderBy(asc(activity.sortOrder));

  const activityIds = activities.map((a) => a.id);
  const tasks =
    activityIds.length > 0
      ? await db
          .select()
          .from(storyMapTask)
          .orderBy(asc(storyMapTask.sortOrder))
          .then((rows) => rows.filter((t) => activityIds.includes(t.activityId)))
      : [];

  const stories =
    activityIds.length > 0
      ? await db
          .select()
          .from(story)
          .orderBy(asc(story.sortOrder))
          .then((rows) => rows.filter((s) => activityIds.includes(s.activityId)))
      : [];

  const personas = await db
    .select()
    .from(persona)
    .where(eq(persona.projectId, projectId))
    .orderBy(asc(persona.sortOrder));
  const interviews = await db
    .select()
    .from(interviewSnapshot)
    .where(eq(interviewSnapshot.projectId, projectId));
  const outcomes = await db
    .select()
    .from(businessOutcome)
    .where(eq(businessOutcome.projectId, projectId));
  const objectives = await db
    .select()
    .from(productObjective)
    .where(eq(productObjective.projectId, projectId))
    .orderBy(asc(productObjective.sortOrder));

  const objectiveIds = objectives.map((o) => o.id);
  const krs =
    objectiveIds.length > 0
      ? await db
          .select()
          .from(keyResult)
          .orderBy(asc(keyResult.code))
          .then((rows) => rows.filter((kr) => objectiveIds.includes(kr.objectiveId)))
      : [];

  const ideas = await db.select().from(idea).where(eq(idea.projectId, projectId));
  const milestones = await db
    .select()
    .from(milestone)
    .where(eq(milestone.projectId, projectId))
    .orderBy(asc(milestone.sortOrder));

  const milestoneIds = milestones.map((m) => m.id);
  const rmItems =
    milestoneIds.length > 0
      ? await db
          .select()
          .from(roadmapItem)
          .orderBy(asc(roadmapItem.sortOrder))
          .then((rows) => rows.filter((r) => milestoneIds.includes(r.milestoneId)))
      : [];

  const blItems = await db
    .select()
    .from(backlogItem)
    .where(eq(backlogItem.projectId, projectId))
    .orderBy(asc(backlogItem.sortOrder));

  // Experience map (decoupled)
  const expPhases = await db
    .select()
    .from(experiencePhase)
    .where(eq(experiencePhase.projectId, projectId))
    .orderBy(asc(experiencePhase.sortOrder));
  const expPhaseIds = expPhases.map((p) => p.id);
  const expSteps =
    expPhaseIds.length > 0
      ? await db
          .select()
          .from(experienceStep)
          .orderBy(asc(experienceStep.sortOrder))
          .then((rows) => rows.filter((s) => expPhaseIds.includes(s.phaseId)))
      : [];
  const expStepIds = expSteps.map((s) => s.id);
  const expTouchpoints =
    expStepIds.length > 0
      ? await db
          .select()
          .from(experienceTouchpoint)
          .orderBy(asc(experienceTouchpoint.sortOrder))
          .then((rows) => rows.filter((t) => expStepIds.includes(t.stepId)))
      : [];

  return json({
    project: proj,
    actors,
    activities,
    tasks,
    stories,
    personas,
    interviews,
    outcomes,
    objectives,
    keyResults: krs,
    ideas,
    milestones,
    roadmapItems: rmItems,
    backlogItems: blItems,
    experiencePhases: expPhases,
    experienceSteps: expSteps,
    experienceTouchpoints: expTouchpoints
  });
};

// PUT: overwrite project data from JSON
export const PUT: RequestHandler = async ({ request, locals }) => {
  if (!(await isAdmin(locals))) return json({ error: 'Forbidden' }, { status: 403 });

  const data = await request.json();
  const projectId = data.project?.id;
  if (!projectId) return json({ error: 'Missing project.id in JSON' }, { status: 400 });

  try {
    // Update project metadata
    if (data.project) {
      const { id, createdAt, updatedAt, ...updates } = data.project;
      await db.update(project).set(updates).where(eq(project.id, projectId));
    }

    // Helper: sync a table by deleting all and re-inserting
    async function syncTable(table: any, rows: any[], filterCol: any, filterVal: number) {
      await db.delete(table).where(eq(filterCol, filterVal));
      for (const row of rows) {
        const { id, createdAt, updatedAt, ...rest } = row;
        await db.insert(table).values({ ...rest, [filterCol.name]: filterVal });
      }
    }

    // Sync direct project children
    if (data.actors) await syncTable(actor, data.actors, actor.projectId, projectId);
    if (data.personas) await syncTable(persona, data.personas, persona.projectId, projectId);
    if (data.interviews)
      await syncTable(interviewSnapshot, data.interviews, interviewSnapshot.projectId, projectId);
    if (data.outcomes)
      await syncTable(businessOutcome, data.outcomes, businessOutcome.projectId, projectId);

    // Activities + tasks + stories need careful ordering (foreign keys)
    if (data.activities) {
      // Delete old stories, tasks, activities (cascade should handle but be explicit)
      const oldActivities = await db
        .select({ id: activity.id })
        .from(activity)
        .where(eq(activity.projectId, projectId));
      for (const a of oldActivities) {
        await db.delete(story).where(eq(story.activityId, a.id));
        await db.delete(storyMapTask).where(eq(storyMapTask.activityId, a.id));
      }
      await db.delete(activity).where(eq(activity.projectId, projectId));

      // Re-insert activities
      const activityIdMap = new Map<number, number>();
      for (const a of data.activities) {
        const { id: oldId, ...rest } = a;
        const [inserted] = await db
          .insert(activity)
          .values({ ...rest, projectId })
          .returning({ id: activity.id });
        activityIdMap.set(oldId, inserted.id);
      }

      // Re-insert tasks
      const taskIdMap = new Map<number, number>();
      if (data.tasks) {
        for (const t of data.tasks) {
          const { id: oldId, activityId: oldActId, ...rest } = t;
          const newActId = activityIdMap.get(oldActId) ?? oldActId;
          const [inserted] = await db
            .insert(storyMapTask)
            .values({ ...rest, activityId: newActId })
            .returning({ id: storyMapTask.id });
          taskIdMap.set(oldId, inserted.id);
        }
      }

      // Re-insert stories
      if (data.stories) {
        for (const s of data.stories) {
          const { id: oldId, activityId: oldActId, taskId: oldTaskId, ...rest } = s;
          const newActId = activityIdMap.get(oldActId) ?? oldActId;
          const newTaskId = oldTaskId ? (taskIdMap.get(oldTaskId) ?? oldTaskId) : null;
          await db.insert(story).values({ ...rest, activityId: newActId, taskId: newTaskId });
        }
      }
    }

    // Objectives + key results
    if (data.objectives) {
      const oldObjs = await db
        .select({ id: productObjective.id })
        .from(productObjective)
        .where(eq(productObjective.projectId, projectId));
      for (const o of oldObjs) {
        await db.delete(keyResult).where(eq(keyResult.objectiveId, o.id));
      }
      await db.delete(productObjective).where(eq(productObjective.projectId, projectId));

      const objIdMap = new Map<number, number>();
      for (const o of data.objectives) {
        const { id: oldId, ...rest } = o;
        const [inserted] = await db
          .insert(productObjective)
          .values({ ...rest, projectId })
          .returning({ id: productObjective.id });
        objIdMap.set(oldId, inserted.id);
      }

      if (data.keyResults) {
        for (const kr of data.keyResults) {
          const { id: oldId, objectiveId: oldObjId, ...rest } = kr;
          const newObjId = objIdMap.get(oldObjId) ?? oldObjId;
          await db.insert(keyResult).values({ ...rest, objectiveId: newObjId });
        }
      }
    }

    // Milestones + roadmap items
    if (data.milestones) {
      const oldMs = await db
        .select({ id: milestone.id })
        .from(milestone)
        .where(eq(milestone.projectId, projectId));
      for (const m of oldMs) {
        await db.delete(roadmapItem).where(eq(roadmapItem.milestoneId, m.id));
      }
      await db.delete(milestone).where(eq(milestone.projectId, projectId));

      const msIdMap = new Map<number, number>();
      for (const m of data.milestones) {
        const { id: oldId, ...rest } = m;
        const [inserted] = await db
          .insert(milestone)
          .values({ ...rest, projectId })
          .returning({ id: milestone.id });
        msIdMap.set(oldId, inserted.id);
      }

      if (data.roadmapItems) {
        for (const r of data.roadmapItems) {
          const { id: oldId, milestoneId: oldMsId, ...rest } = r;
          const newMsId = msIdMap.get(oldMsId) ?? oldMsId;
          await db.insert(roadmapItem).values({ ...rest, milestoneId: newMsId });
        }
      }
    }

    if (data.backlogItems)
      await syncTable(backlogItem, data.backlogItems, backlogItem.projectId, projectId);

    // Experience map (decoupled)
    if (data.experiencePhases) {
      const oldPhases = await db
        .select({ id: experiencePhase.id })
        .from(experiencePhase)
        .where(eq(experiencePhase.projectId, projectId));
      for (const p of oldPhases) {
        const oldSteps = await db
          .select({ id: experienceStep.id })
          .from(experienceStep)
          .where(eq(experienceStep.phaseId, p.id));
        for (const s of oldSteps) {
          await db.delete(experienceTouchpoint).where(eq(experienceTouchpoint.stepId, s.id));
        }
        await db.delete(experienceStep).where(eq(experienceStep.phaseId, p.id));
      }
      await db.delete(experiencePhase).where(eq(experiencePhase.projectId, projectId));

      const phaseIdMap = new Map<number, number>();
      for (const p of data.experiencePhases) {
        const { id: oldId, ...rest } = p;
        const [inserted] = await db
          .insert(experiencePhase)
          .values({ ...rest, projectId })
          .returning({ id: experiencePhase.id });
        phaseIdMap.set(oldId, inserted.id);
      }

      if (data.experienceSteps) {
        const stepIdMap = new Map<number, number>();
        for (const s of data.experienceSteps) {
          const { id: oldId, phaseId: oldPhaseId, ...rest } = s;
          const newPhaseId = phaseIdMap.get(oldPhaseId) ?? oldPhaseId;
          const [inserted] = await db
            .insert(experienceStep)
            .values({ ...rest, phaseId: newPhaseId })
            .returning({ id: experienceStep.id });
          stepIdMap.set(oldId, inserted.id);
        }

        if (data.experienceTouchpoints) {
          for (const t of data.experienceTouchpoints) {
            const { id: oldId, stepId: oldStepId, ...rest } = t;
            const newStepId = stepIdMap.get(oldStepId) ?? oldStepId;
            await db.insert(experienceTouchpoint).values({ ...rest, stepId: newStepId });
          }
        }
      }
    }

    return json({ ok: true });
  } catch (err) {
    console.error('Admin data save failed:', err);
    return json({ error: err instanceof Error ? err.message : 'Save failed' }, { status: 500 });
  }
};
