import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import { idea, actor, activity, storyMapTask, story } from '$lib/server/db/schema.js';
import { eq, asc } from 'drizzle-orm';
import type { StoryMapData } from '$lib/types/story-map.js';
import type { RequestHandler } from './$types.js';

// [id] is now an ideaId
export const GET: RequestHandler = async ({ params }) => {
  const ideaId = Number(params.id);
  if (isNaN(ideaId)) return json({ error: 'Invalid id' }, { status: 400 });

  const [ideaRow] = await db.select().from(idea).where(eq(idea.id, ideaId));
  if (!ideaRow) return json({ error: 'Not found' }, { status: 404 });

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

  const data: StoryMapData = {
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
    if (data.stories[kanoKey]) {
      data.stories[kanoKey].push({
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
        details: (s.details as string[]) ?? []
      });
    }
  }

  return json(data);
};
