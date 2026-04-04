import { db } from '$lib/server/db/index.js';
import { project, activity, storyMapTask, story } from '$lib/server/db/schema.js';
import { eq, asc } from 'drizzle-orm';
import type { PageServerLoad } from './$types.js';

export interface ExperienceStory {
	id: string;
	title: string;
	actor: string;
	action: string;
	outcome: string;
	emotion: 'positive' | 'neutral' | 'negative';
	emotionScore: number;
	pains: string[];
	gains: string[];
	pic: string;
	picColor: string;
}

export interface ExperienceTask {
	code: string;
	title: string;
	stories: ExperienceStory[];
	avgEmotion: number;
}

export interface ExperienceActivity {
	code: string;
	title: string;
	actors: string[];
	tasks: ExperienceTask[];
	avgEmotion: number;
}

function deriveEmotion(pains: string[], gains: string[]): { label: 'positive' | 'neutral' | 'negative'; score: number } {
	const total = pains.length + gains.length;
	if (total === 0) return { label: 'neutral', score: 0 };
	// More granular: use raw difference, clamped to -1..1
	const diff = gains.length - pains.length;
	const score = Math.max(-1, Math.min(1, diff / Math.max(total, 1)));
	// Even 1 gain vs 1 pain should show slight positive if gains text is longer
	const label = diff > 0 ? 'positive' : diff < 0 ? 'negative' : 'neutral';
	return { label, score };
}

export const load: PageServerLoad = async ({ url, parent }) => {
	const { projects } = await parent();
	const projectId = Number(url.searchParams.get('project')) || projects[0]?.id;

	if (!projectId) return { activities: [] };

	const [proj] = await db.select().from(project).where(eq(project.id, projectId));
	if (!proj) return { activities: [] };

	const dbActivities = await db
		.select()
		.from(activity)
		.where(eq(activity.projectId, projectId))
		.orderBy(asc(activity.sortOrder));

	const activityIds = dbActivities.map((a) => a.id);

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

	// Group stories by taskId
	const storiesByTask = new Map<number, typeof projectStories>();
	const storiesNoTask = new Map<number, typeof projectStories>(); // stories with no task, grouped by activityId

	for (const s of projectStories) {
		if (s.taskId) {
			if (!storiesByTask.has(s.taskId)) storiesByTask.set(s.taskId, []);
			storiesByTask.get(s.taskId)!.push(s);
		} else {
			if (!storiesNoTask.has(s.activityId)) storiesNoTask.set(s.activityId, []);
			storiesNoTask.get(s.activityId)!.push(s);
		}
	}

	function mapStory(s: typeof projectStories[0]): ExperienceStory {
		const pains = (s.pains as string[]) ?? [];
		const gains = (s.gains as string[]) ?? [];
		const emo = deriveEmotion(pains, gains);
		return {
			id: s.code,
			title: s.title,
			actor: s.asA ?? s.pic ?? '',
			action: s.wantTo ?? '',
			outcome: s.soThat ?? '',
			emotion: emo.label,
			emotionScore: emo.score,
			pains,
			gains,
			pic: s.pic,
			picColor: s.picColor
		};
	}

	const result: ExperienceActivity[] = dbActivities.map((a) => {
		const actTasks = projectTasks.filter((t) => t.activityId === a.id);

		const tasks: ExperienceTask[] = actTasks.map((t) => {
			const taskStories = (storiesByTask.get(t.id) ?? []).map(mapStory);
			// Aggregate all pains/gains across stories for this task
			const totalPains = taskStories.reduce((sum, s) => sum + s.pains.length, 0);
			const totalGains = taskStories.reduce((sum, s) => sum + s.gains.length, 0);
			const total = totalPains + totalGains;
			const avgEmotion = total > 0
				? Math.max(-1, Math.min(1, (totalGains - totalPains) / Math.max(total, 1)))
				: 0;
			return { code: t.code, title: t.title, stories: taskStories, avgEmotion };
		});

		// If no tasks, put stories in a single "General" task
		if (tasks.length === 0) {
			const noTaskStories = (storiesNoTask.get(a.id) ?? []).map(mapStory);
			if (noTaskStories.length > 0) {
				const avg = noTaskStories.reduce((sum, s) => sum + s.emotionScore, 0) / noTaskStories.length;
				tasks.push({ code: '', title: a.title, stories: noTaskStories, avgEmotion: avg });
			}
		}

		const allTaskStories = tasks.flatMap((t) => t.stories);
		const avgEmotion = allTaskStories.length > 0
			? allTaskStories.reduce((sum, s) => sum + s.emotionScore, 0) / allTaskStories.length
			: 0;

		return {
			code: a.code,
			title: a.title,
			actors: (a.actorEmojis as string[]) ?? [],
			tasks,
			avgEmotion
		};
	});

	return { activities: result };
};
