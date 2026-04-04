import { db } from '$lib/server/db/index.js';
import { project, activity, storyMapTask, story } from '$lib/server/db/schema.js';
import { eq, asc } from 'drizzle-orm';
import type { PageServerLoad } from './$types.js';

export interface BacklogStory {
	id: string;
	title: string;
	epic: string;
	task: string | null;
	kano: string;
	pic: string;
	picColor: string;
	done: boolean;
	asA: string | null;
	wantTo: string | null;
	soThat: string | null;
	acceptanceCriteria: string[];
}

export interface BacklogEpic {
	code: string;
	title: string;
	stories: BacklogStory[];
}

export const load: PageServerLoad = async ({ url, parent }) => {
	const { projects } = await parent();
	const projectId = Number(url.searchParams.get('project')) || projects[0]?.id;

	if (!projectId) return { epics: [] };

	const [proj] = await db.select().from(project).where(eq(project.id, projectId));
	if (!proj) return { epics: [] };

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
	const activityTitleMap = new Map(activities.map((a) => [a.code, a.title]));
	const taskCodeMap = new Map(projectTasks.map((t) => [t.id, t.code]));
	const taskTitleMap = new Map(projectTasks.map((t) => [t.code, t.title]));

	// Group stories by activity (epic)
	const epicMap = new Map<string, BacklogStory[]>();

	for (const s of projectStories) {
		const epicCode = activityCodeMap.get(s.activityId) ?? '';
		const taskCode = s.taskId ? taskCodeMap.get(s.taskId) ?? null : null;

		const backlogStory: BacklogStory = {
			id: s.code,
			title: s.title,
			epic: epicCode,
			task: taskCode ? (taskTitleMap.get(taskCode) ?? taskCode) : null,
			kano: s.kano,
			pic: s.pic,
			picColor: s.picColor,
			done: s.done,
			asA: s.asA,
			wantTo: s.wantTo,
			soThat: s.soThat,
			acceptanceCriteria: (s.details as string[]) ?? []
		};

		if (!epicMap.has(epicCode)) epicMap.set(epicCode, []);
		epicMap.get(epicCode)!.push(backlogStory);
	}

	const epics: BacklogEpic[] = activities.map((a) => ({
		code: a.code,
		title: a.title,
		stories: (epicMap.get(a.code) ?? []).sort((a, b) => {
			const taskA = a.task ?? '';
			const taskB = b.task ?? '';
			return taskA.localeCompare(taskB);
		})
	}));

	return { epics };
};
