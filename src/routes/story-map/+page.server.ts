import { db } from '$lib/server/db/index.js';
import { project, actor, activity, storyMapTask, story } from '$lib/server/db/schema.js';
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
}

export interface BacklogEpic {
	code: string;
	title: string;
	actors: string[];
	stories: BacklogStory[];
}

export const load: PageServerLoad = async ({ url, parent }) => {
	const { projects } = await parent();
	const projectId = Number(url.searchParams.get('project')) || projects[0]?.id;

	if (!projectId) return { storyMap: null };

	const [proj] = await db.select().from(project).where(eq(project.id, projectId));
	if (!proj) return { storyMap: null };

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

	const activityCodeMap = new Map(activities.map((a) => [a.id, a.code]));
	const taskCodeMap = new Map(projectTasks.map((t) => [t.id, t.code]));

	const storyMap: StoryMapData = {
		product: proj.name,
		goal: proj.goal ?? undefined,
		actors: actors.map((a) => ({ emoji: a.emoji, label: a.label })),
		levels: proj.levels,
		activities: activities.map((a) => ({
			id: a.code,
			title: a.title,
			actors: (a.actorEmojis as string[]) ?? undefined,
			tasks: projectTasks
				.filter((t) => t.activityId === a.id)
				.map((t) => ({ id: t.code, title: t.title }))
		})),
		stories: { 'must-have': [], performance: [], delighter: [] }
	};

	for (const s of projectStories) {
		storyMap.stories[s.kano].push({
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
			checkedAcs: (s.checkedAcs as CheckedAC[]) ?? []
		});
	}

	// ── Backlog view data ──
	const activityTitleMap = new Map(activities.map((a) => [a.code, a.title]));
	const taskTitleMap = new Map(projectTasks.map((t) => [t.code, t.title]));
	const taskOrderMap = new Map(projectTasks.map((t) => [t.id, t.sortOrder]));

	const epicMap = new Map<string, BacklogStory[]>();

	for (const s of projectStories) {
		const epicCode = activityCodeMap.get(s.activityId) ?? '';
		const taskCode = s.taskId ? taskCodeMap.get(s.taskId) ?? null : null;

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
			checkedAcs: (s.checkedAcs as CheckedAC[]) ?? []
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

	return { storyMap, epics };
};
