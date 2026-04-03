/**
 * Seed script: imports static JSON story map files into the database.
 * Run with: bun run scripts/seed.ts
 */
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import * as schema from '../src/lib/server/db/schema';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error('DATABASE_URL is not set');

const client = postgres(DATABASE_URL);
const db = drizzle(client, { schema });

interface JsonActor {
	emoji: string;
	label: string;
}
interface JsonTask {
	id: string;
	title: string;
}
interface JsonActivity {
	id: string;
	title: string;
	actors?: string[] | null;
	tasks?: JsonTask[];
}
interface JsonStory {
	id: string;
	title: string;
	activity: string;
	task?: string;
	pic: string;
	picColor: string;
	done: boolean;
	asA?: string;
	wantTo?: string;
	soThat?: string;
	pains?: string[];
	gains?: string[];
	details?: string[];
}
interface JsonData {
	product: string;
	goal?: string;
	actors: JsonActor[];
	levels?: number;
	activities: JsonActivity[];
	stories: {
		'must-have': JsonStory[];
		performance: JsonStory[];
		delighter: JsonStory[];
	};
}

async function seedFile(filePath: string) {
	const raw = await readFile(filePath, 'utf-8');
	const data: JsonData = JSON.parse(raw);

	console.log(`Seeding: ${data.product}`);

	// 1. Create project
	const [proj] = await db
		.insert(schema.project)
		.values({
			name: data.product,
			goal: data.goal ?? null,
			levels: data.levels ?? 2
		})
		.returning();

	// 2. Create actors
	for (let i = 0; i < data.actors.length; i++) {
		const a = data.actors[i];
		await db.insert(schema.actor).values({
			projectId: proj.id,
			emoji: a.emoji,
			label: a.label,
			sortOrder: i
		});
	}

	// 3. Create activities + tasks, track code -> DB id mappings
	const activityIdMap = new Map<string, number>(); // "A1" -> db id
	const taskIdMap = new Map<string, number>(); // "T1" -> db id

	for (let i = 0; i < data.activities.length; i++) {
		const act = data.activities[i];
		const [dbAct] = await db
			.insert(schema.activity)
			.values({
				projectId: proj.id,
				code: act.id,
				title: act.title,
				actorEmojis: act.actors ?? [],
				sortOrder: i
			})
			.returning();

		activityIdMap.set(act.id, dbAct.id);

		// Tasks (3-level)
		if (act.tasks) {
			for (let j = 0; j < act.tasks.length; j++) {
				const t = act.tasks[j];
				const [dbTask] = await db
					.insert(schema.storyMapTask)
					.values({
						activityId: dbAct.id,
						code: t.id,
						title: t.title,
						sortOrder: j
					})
					.returning();

				taskIdMap.set(t.id, dbTask.id);
			}
		}
	}

	// 4. Create stories
	const kanoCategories = ['must-have', 'performance', 'delighter'] as const;

	for (const kano of kanoCategories) {
		const stories = data.stories[kano] ?? [];
		for (let i = 0; i < stories.length; i++) {
			const s = stories[i];

			const activityId = activityIdMap.get(s.activity);
			if (!activityId) {
				console.warn(`  Skipping story ${s.id}: activity ${s.activity} not found`);
				continue;
			}

			const taskId = s.task ? taskIdMap.get(s.task) ?? null : null;

			await db.insert(schema.story).values({
				activityId,
				taskId,
				code: s.id,
				title: s.title,
				pic: s.pic,
				picColor: s.picColor,
				done: s.done,
				kano,
				asA: s.asA ?? null,
				wantTo: s.wantTo ?? null,
				soThat: s.soThat ?? null,
				pains: s.pains ?? [],
				gains: s.gains ?? [],
				details: s.details ?? [],
				sortOrder: i
			});
		}
	}

	console.log(`  Done: ${data.product} (project id: ${proj.id})`);
}

async function main() {
	const dataDir = join(import.meta.dirname, '..', 'static', 'data');
	const files = (await readdir(dataDir)).filter((f) => f.endsWith('.json'));

	console.log(`Found ${files.length} data files\n`);

	for (const file of files) {
		await seedFile(join(dataDir, file));
	}

	console.log('\nAll done!');
	await client.end();
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
