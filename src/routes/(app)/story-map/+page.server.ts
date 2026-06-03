import { db } from '$lib/server/db/index.js';
import { actor, activity, storyMapTask, story, idea } from '$lib/server/db/schema.js';
import { eq, asc } from 'drizzle-orm';
import type { StoryMapData } from '$lib/types/story-map.js';
import type { PageServerLoad } from './$types.js';

export interface CheckedAC {
  index: number;
  checkedAt: string;
}

export interface BacklogStory {
  id: string;
  title: string;
  epic: string;
  task: string | null;
  taskOrder: number;
  kano: string;
  pic: string;
  picColor: string;
  done: boolean;
  acceptanceCriteria: string[];
  checkedAcs: CheckedAC[];
  assumptions: any[];
}

export interface BacklogEpic {
  code: string;
  title: string;
  actors: string[];
  stories: BacklogStory[];
}

export const load: PageServerLoad = async ({ url }) => {
  const ideaId = Number(url.searchParams.get('idea'));
  if (!ideaId) return { storyMap: null, epics: [], ideaMeta: null };

  const [ideaRow] = await db.select().from(idea).where(eq(idea.id, ideaId));
  if (!ideaRow) return { storyMap: null, epics: [], ideaMeta: null };

  const ideaMeta = {
    description: ideaRow.description,
    status: ideaRow.status,
    proposer: ideaRow.proposer,
    okrCode: ideaRow.okrCode
  };

  const actors = await db
    .select()
    .from(actor)
    .where(eq(actor.ideaId, ideaId))
    .orderBy(asc(actor.sortOrder));

  const activities = await db
    .select()
    .from(activity)
    .where(eq(activity.ideaId, ideaId))
    .orderBy(asc(activity.sortOrder));

  const activityIds = activities.map((a) => a.id);

  const allTasks =
    activityIds.length > 0
      ? await db.select().from(storyMapTask).orderBy(asc(storyMapTask.sortOrder))
      : [];
  const ideaTasks = allTasks.filter((t) => activityIds.includes(t.activityId));

  const allStories =
    activityIds.length > 0 ? await db.select().from(story).orderBy(asc(story.sortOrder)) : [];
  const ideaStories = allStories.filter((s) => activityIds.includes(s.activityId));

  const activityCodeMap = new Map(activities.map((a) => [a.id, a.code]));
  const taskCodeMap = new Map(ideaTasks.map((t) => [t.id, t.code]));

  const storyMap: StoryMapData = {
    product: ideaRow.title,
    actors: actors.map((a) => ({ emoji: a.emoji, label: a.label })),
    levels: ideaRow.levels,
    activities: activities.map((a) => ({
      id: a.code,
      title: a.title,
      actors: (a.actorEmojis as string[]) ?? undefined,
      tasks: ideaTasks
        .filter((t) => t.activityId === a.id)
        .map((t) => ({ id: t.code, title: t.title }))
    })),
    stories: { 'must-have': [], performance: [], delighter: [] }
  };

  for (const s of ideaStories) {
    const kanoKey = s.kano as 'must-have' | 'performance' | 'delighter';
    if (storyMap.stories[kanoKey]) {
      storyMap.stories[kanoKey].push({
        id: s.code,
        title: s.title,
        activity: activityCodeMap.get(s.activityId) ?? '',
        task: s.taskId ? taskCodeMap.get(s.taskId) : undefined,
        pic: s.pic,
        picColor: s.picColor,
        done: s.done,
        asA: s.asA ?? undefined,
        wantTo: s.wantTo ?? undefined,
        soThat: s.soThat ?? undefined,
        pains: (s.pains as string[]) ?? [],
        gains: (s.gains as string[]) ?? [],
        details: (s.details as string[]) ?? [],
        checkedAcs: (s.checkedAcs as CheckedAC[]) ?? [],
        assumptions: (s.assumptions as any[]) ?? []
      });
    }
  }

  // ── Backlog view data ──
  const taskTitleMap = new Map(ideaTasks.map((t) => [t.code, t.title]));
  const taskOrderMap = new Map(ideaTasks.map((t) => [t.id, t.sortOrder]));

  const epicMap = new Map<string, BacklogStory[]>();

  for (const s of ideaStories) {
    const epicCode = activityCodeMap.get(s.activityId) ?? '';
    const taskCode = s.taskId ? (taskCodeMap.get(s.taskId) ?? null) : null;

    const bs: BacklogStory = {
      id: s.code,
      title: s.title,
      epic: epicCode,
      task: taskCode ? (taskTitleMap.get(taskCode) ?? taskCode) : null,
      taskOrder: s.taskId ? (taskOrderMap.get(s.taskId) ?? 0) : 0,
      kano: s.kano,
      pic: s.pic,
      picColor: s.picColor,
      done: s.done,
      acceptanceCriteria: (s.details as string[]) ?? [],
      checkedAcs: (s.checkedAcs as CheckedAC[]) ?? [],
      assumptions: (s.assumptions as any[]) ?? []
    };

    if (!epicMap.has(epicCode)) epicMap.set(epicCode, []);
    epicMap.get(epicCode)!.push(bs);
  }

  const epics: BacklogEpic[] = activities.map((a) => ({
    code: a.code,
    title: a.title,
    actors: (a.actorEmojis as string[]) ?? [],
    stories: (epicMap.get(a.code) ?? []).sort((x, y) => x.taskOrder - y.taskOrder)
  }));

  return { storyMap, epics, ideaMeta };
};
