import {
	pgTable,
	pgEnum,
	serial,
	integer,
	text,
	boolean,
	jsonb,
	timestamp,
	date
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ── Enums ──────────────────────────────────────────────

export const kanoCategoryEnum = pgEnum('kano_category', [
	'must-have',
	'performance',
	'delighter'
]);

export const milestoneStatusEnum = pgEnum('milestone_status', [
	'planned',
	'in-progress',
	'done'
]);

export const roadmapItemStatusEnum = pgEnum('roadmap_item_status', [
	'planned',
	'in-progress',
	'done'
]);

export const backlogStatusEnum = pgEnum('backlog_status', [
	'todo',
	'in-progress',
	'done',
	'archived'
]);

export const backlogTypeEnum = pgEnum('backlog_type', [
	'feature',
	'bug',
	'task',
	'spike'
]);

// ── Workspace ─────────────────────────────────────────

export const workspace = pgTable('workspace', {
	id: serial('id').primaryKey(),
	name: text('name').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export const workspaceRelations = relations(workspace, ({ many }) => ({
	projects: many(project)
}));

// ── Project ────────────────────────────────────────────

export const project = pgTable('project', {
	id: serial('id').primaryKey(),
	workspaceId: integer('workspace_id').notNull().references(() => workspace.id, { onDelete: 'cascade' }),
	name: text('name').notNull(),
	shortName: text('short_name'),
	goal: text('goal'),
	levels: integer('levels').notNull().default(2),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export const projectRelations = relations(project, ({ one, many }) => ({
	workspace: one(workspace, { fields: [project.workspaceId], references: [workspace.id] }),
	actors: many(actor),
	activities: many(activity),
	personas: many(persona),
	milestones: many(milestone),
	backlogItems: many(backlogItem)
}));

// ── Actor ──────────────────────────────────────────────

export const actor = pgTable('actor', {
	id: serial('id').primaryKey(),
	projectId: integer('project_id')
		.notNull()
		.references(() => project.id, { onDelete: 'cascade' }),
	emoji: text('emoji').notNull(),
	label: text('label').notNull(),
	sortOrder: integer('sort_order').notNull().default(0)
});

export const actorRelations = relations(actor, ({ one }) => ({
	project: one(project, { fields: [actor.projectId], references: [project.id] })
}));

// ── Activity ───────────────────────────────────────────

export const activity = pgTable('activity', {
	id: serial('id').primaryKey(),
	projectId: integer('project_id')
		.notNull()
		.references(() => project.id, { onDelete: 'cascade' }),
	code: text('code').notNull(),
	title: text('title').notNull(),
	actorEmojis: jsonb('actor_emojis').$type<string[]>().default([]),
	sortOrder: integer('sort_order').notNull().default(0)
});

export const activityRelations = relations(activity, ({ one, many }) => ({
	project: one(project, { fields: [activity.projectId], references: [project.id] }),
	tasks: many(storyMapTask),
	stories: many(story)
}));

// ── Story Map Task ─────────────────────────────────────

export const storyMapTask = pgTable('story_map_task', {
	id: serial('id').primaryKey(),
	activityId: integer('activity_id')
		.notNull()
		.references(() => activity.id, { onDelete: 'cascade' }),
	code: text('code').notNull(),
	title: text('title').notNull(),
	sortOrder: integer('sort_order').notNull().default(0)
});

export const storyMapTaskRelations = relations(storyMapTask, ({ one, many }) => ({
	activity: one(activity, { fields: [storyMapTask.activityId], references: [activity.id] }),
	stories: many(story)
}));

// ── Story ──────────────────────────────────────────────

export const story = pgTable('story', {
	id: serial('id').primaryKey(),
	activityId: integer('activity_id')
		.notNull()
		.references(() => activity.id, { onDelete: 'cascade' }),
	taskId: integer('task_id').references(() => storyMapTask.id, { onDelete: 'set null' }),
	code: text('code').notNull(),
	title: text('title').notNull(),
	pic: text('pic').notNull().default(''),
	picColor: text('pic_color').notNull().default(''),
	done: boolean('done').notNull().default(false),
	kano: kanoCategoryEnum('kano').notNull(),
	asA: text('as_a'),
	wantTo: text('want_to'),
	soThat: text('so_that'),
	pains: jsonb('pains').$type<string[]>().default([]),
	gains: jsonb('gains').$type<string[]>().default([]),
	details: jsonb('details').$type<string[]>().default([]),
	checkedAcs: jsonb('checked_acs').$type<{ index: number; checkedAt: string }[]>().default([]),
	sortOrder: integer('sort_order').notNull().default(0)
});

export const storyRelations = relations(story, ({ one, many }) => ({
	activity: one(activity, { fields: [story.activityId], references: [activity.id] }),
	task: one(storyMapTask, { fields: [story.taskId], references: [storyMapTask.id] }),
	backlogItems: many(backlogItem)
}));

// ── Persona ────────────────────────────────────────────

export const persona = pgTable('persona', {
	id: serial('id').primaryKey(),
	projectId: integer('project_id')
		.notNull()
		.references(() => project.id, { onDelete: 'cascade' }),
	name: text('name').notNull(),
	role: text('role'),
	avatarUrl: text('avatar_url'),
	jobDescription: text('job_description'),
	// Company
	companyName: text('company_name'),
	companySize: text('company_size'),
	industry: text('industry'),
	// Demographics
	age: text('age'),
	gender: text('gender'),
	income: text('income'),
	educationLevel: text('education_level'),
	residentialEnvironment: text('residential_environment'),
	// Bio & Quote
	quote: text('quote'),
	biography: text('biography'),
	// Goals, Challenges, Motivators, Info Sources (arrays)
	goals: jsonb('goals').$type<string[]>().default([]),
	challenges: jsonb('challenges').$type<string[]>().default([]),
	motivators: jsonb('motivators').$type<string[]>().default([]),
	infoSources: jsonb('info_sources').$type<string[]>().default([]),
	sortOrder: integer('sort_order').notNull().default(0),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export const personaRelations = relations(persona, ({ one }) => ({
	project: one(project, { fields: [persona.projectId], references: [project.id] })
}));

// ── Milestone ──────────────────────────────────────────

export const milestone = pgTable('milestone', {
	id: serial('id').primaryKey(),
	projectId: integer('project_id')
		.notNull()
		.references(() => project.id, { onDelete: 'cascade' }),
	name: text('name').notNull(),
	targetDate: date('target_date', { mode: 'string' }),
	status: milestoneStatusEnum('status').notNull().default('planned'),
	sortOrder: integer('sort_order').notNull().default(0),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export const milestoneRelations = relations(milestone, ({ one, many }) => ({
	project: one(project, { fields: [milestone.projectId], references: [project.id] }),
	items: many(roadmapItem)
}));

// ── Roadmap Item ───────────────────────────────────────

export const roadmapItem = pgTable('roadmap_item', {
	id: serial('id').primaryKey(),
	milestoneId: integer('milestone_id')
		.notNull()
		.references(() => milestone.id, { onDelete: 'cascade' }),
	title: text('title').notNull(),
	description: text('description'),
	priority: integer('priority').notNull().default(0),
	status: roadmapItemStatusEnum('status').notNull().default('planned'),
	sortOrder: integer('sort_order').notNull().default(0),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export const roadmapItemRelations = relations(roadmapItem, ({ one }) => ({
	milestone: one(milestone, { fields: [roadmapItem.milestoneId], references: [milestone.id] })
}));

// ── Backlog Item ───────────────────────────────────────

export const backlogItem = pgTable('backlog_item', {
	id: serial('id').primaryKey(),
	projectId: integer('project_id')
		.notNull()
		.references(() => project.id, { onDelete: 'cascade' }),
	storyId: integer('story_id').references(() => story.id, { onDelete: 'set null' }),
	title: text('title').notNull(),
	description: text('description'),
	priority: integer('priority').notNull().default(0),
	status: backlogStatusEnum('status').notNull().default('todo'),
	type: backlogTypeEnum('type').notNull().default('feature'),
	sortOrder: integer('sort_order').notNull().default(0),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export const backlogItemRelations = relations(backlogItem, ({ one }) => ({
	project: one(project, { fields: [backlogItem.projectId], references: [project.id] }),
	story: one(story, { fields: [backlogItem.storyId], references: [story.id] })
}));
