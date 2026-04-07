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

export const kanoCategoryEnum = pgEnum('kano_category', ['must-have', 'performance', 'delighter']);

export const milestoneStatusEnum = pgEnum('milestone_status', ['planned', 'in-progress', 'done']);

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

export const backlogTypeEnum = pgEnum('backlog_type', ['feature', 'bug', 'task', 'spike']);

export const appRoleEnum = pgEnum('app_role', ['admin', 'member']);

// ── App User & Access ────────────────────────────────

export const appUser = pgTable('app_user', {
  id: serial('id').primaryKey(),
  authId: text('auth_id').notNull().unique(),
  email: text('email').notNull(),
  displayName: text('display_name').notNull(),
  role: appRoleEnum('role').notNull().default('member'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

export const appUserRelations = relations(appUser, ({ many }) => ({
  projectAccess: many(projectAccess)
}));

export const projectAccess = pgTable('project_access', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => appUser.id, { onDelete: 'cascade' }),
  projectId: integer('project_id')
    .notNull()
    .references(() => project.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

export const projectAccessRelations = relations(projectAccess, ({ one }) => ({
  user: one(appUser, { fields: [projectAccess.userId], references: [appUser.id] }),
  project: one(project, { fields: [projectAccess.projectId], references: [project.id] })
}));

// ── Workspace ─────────────────────────────────────────

export const workspace = pgTable('workspace', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export const workspaceRelations = relations(workspace, ({ many }) => ({
  projects: many(project),
  ideas: many(idea)
}));

// ── Business Outcome ──────────────────────────────────

export const businessOutcome = pgTable('business_outcome', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id')
    .notNull()
    .references(() => project.id, { onDelete: 'cascade' }),
  year: integer('year').notNull(),
  code: text('code').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  metrics: jsonb('metrics').$type<string[]>().default([])
});

// ── Product Objective ─────────────────────────────────

export const productObjective = pgTable('product_objective', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id')
    .notNull()
    .references(() => project.id, { onDelete: 'cascade' }),
  year: integer('year').notNull(),
  quarter: integer('quarter').notNull(),
  code: text('code').notNull(),
  title: text('title').notNull(),
  sortOrder: integer('sort_order').notNull().default(0)
});

// ── Key Result ────────────────────────────────────────

export const keyResult = pgTable('key_result', {
  id: serial('id').primaryKey(),
  objectiveId: integer('objective_id')
    .notNull()
    .references(() => productObjective.id, { onDelete: 'cascade' }),
  code: text('code').notNull(),
  description: text('description').notNull(),
  target: text('target').notNull(),
  targetValue: integer('target_value').notNull().default(0),
  currentValue: integer('current_value').notNull().default(0),
  unit: text('unit').notNull(),
  carriedFrom: text('carried_from'),
  lastUpdated: date('last_updated', { mode: 'string' }).notNull()
});

export const keyResultRelations = relations(keyResult, ({ one }) => ({
  objective: one(productObjective, {
    fields: [keyResult.objectiveId],
    references: [productObjective.id]
  })
}));

// ── Artifact Pick ─────────────────────────────────────

export const artifactPick = pgTable('artifact_pick', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id')
    .notNull()
    .references(() => project.id, { onDelete: 'cascade' }),
  bookId: text('book_id').notNull(),
  artifactName: text('artifact_name').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

export const artifactPickRelations = relations(artifactPick, ({ one }) => ({
  project: one(project, { fields: [artifactPick.projectId], references: [project.id] })
}));

// ── Fintech Pick ──────────────────────────────────────

export const fintechPick = pgTable('fintech_pick', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id')
    .notNull()
    .references(() => project.id, { onDelete: 'cascade' }),
  companyId: text('company_id').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

export const fintechPickRelations = relations(fintechPick, ({ one }) => ({
  project: one(project, { fields: [fintechPick.projectId], references: [project.id] })
}));

// ── Idea ──────────────────────────────────────────────

export const idea = pgTable('idea', {
  id: serial('id').primaryKey(),
  workspaceId: integer('workspace_id')
    .notNull()
    .references(() => workspace.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  projectId: integer('project_id').references(() => project.id, { onDelete: 'set null' }),
  status: text('status').notNull().default('triage'),
  proposer: text('proposer'),
  okrCode: text('okr_code'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export const ideaRelations = relations(idea, ({ one }) => ({
  workspace: one(workspace, { fields: [idea.workspaceId], references: [workspace.id] }),
  project: one(project, { fields: [idea.projectId], references: [project.id] })
}));

// ── Project ────────────────────────────────────────────

export const project = pgTable('project', {
  id: serial('id').primaryKey(),
  workspaceId: integer('workspace_id')
    .notNull()
    .references(() => workspace.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  shortName: text('short_name'),
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
  assumptions: jsonb('assumptions')
    .$type<
      {
        id: string;
        type: 'desirability' | 'feasibility' | 'usability' | 'viability';
        assumption: string;
        rationale: string;
        testMethod: string;
        successCriteria: string;
        actualResults: string;
        status: 'untested' | 'validated' | 'revalidate' | 'invalidated';
        lastTested: string | null;
        importance: number;
        evidence: number;
      }[]
    >()
    .default([]),
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

// ── Interview Snapshot ────────────────────────────────

export const interviewSnapshot = pgTable('interview_snapshot', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id')
    .notNull()
    .references(() => project.id, { onDelete: 'cascade' }),
  personName: text('person_name').notNull(),
  personRole: text('person_role'),
  personPhoto: text('person_photo'),
  interviewDate: date('interview_date', { mode: 'string' }).notNull(),
  quote: text('quote'),
  quickFacts: jsonb('quick_facts').$type<string[]>().default([]),
  insights: jsonb('insights').$type<string[]>().default([]),
  opportunities: jsonb('opportunities').$type<string[]>().default([]),
  transcript: text('transcript'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export const interviewSnapshotRelations = relations(interviewSnapshot, ({ one }) => ({
  project: one(project, { fields: [interviewSnapshot.projectId], references: [project.id] })
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

// ── Experience Map (decoupled from Story Map) ────────

export const experiencePhase = pgTable('experience_phase', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id')
    .notNull()
    .references(() => project.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  actorEmojis: jsonb('actor_emojis').$type<string[]>().default([]),
  sortOrder: integer('sort_order').notNull().default(0)
});

export const experiencePhaseRelations = relations(experiencePhase, ({ one, many }) => ({
  project: one(project, { fields: [experiencePhase.projectId], references: [project.id] }),
  steps: many(experienceStep)
}));

export const experienceStep = pgTable('experience_step', {
  id: serial('id').primaryKey(),
  phaseId: integer('phase_id')
    .notNull()
    .references(() => experiencePhase.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  sortOrder: integer('sort_order').notNull().default(0)
});

export const experienceStepRelations = relations(experienceStep, ({ one, many }) => ({
  phase: one(experiencePhase, {
    fields: [experienceStep.phaseId],
    references: [experiencePhase.id]
  }),
  touchpoints: many(experienceTouchpoint)
}));

export const experienceTouchpoint = pgTable('experience_touchpoint', {
  id: serial('id').primaryKey(),
  stepId: integer('step_id')
    .notNull()
    .references(() => experienceStep.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  asA: text('as_a'),
  wantTo: text('want_to'),
  soThat: text('so_that'),
  pains: jsonb('pains').$type<string[]>().default([]),
  gains: jsonb('gains').$type<string[]>().default([]),
  pic: text('pic').notNull().default(''),
  picColor: text('pic_color').notNull().default(''),
  sortOrder: integer('sort_order').notNull().default(0)
});

export const experienceTouchpointRelations = relations(experienceTouchpoint, ({ one }) => ({
  step: one(experienceStep, {
    fields: [experienceTouchpoint.stepId],
    references: [experienceStep.id]
  })
}));

// ── RSS / Trend Analysis ─────────────────────────────

export const rssSource = pgTable('rss_source', {
  id: serial('id').primaryKey(),
  workspaceId: integer('workspace_id')
    .notNull()
    .references(() => workspace.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  url: text('url').notNull(),
  category: text('category').notNull().default('general'),
  enabled: boolean('enabled').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

export const rssSourceRelations = relations(rssSource, ({ one, many }) => ({
  workspace: one(workspace, { fields: [rssSource.workspaceId], references: [workspace.id] }),
  articles: many(rssArticle)
}));

export const rssArticle = pgTable('rss_article', {
  id: serial('id').primaryKey(),
  sourceId: integer('source_id')
    .notNull()
    .references(() => rssSource.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  url: text('url').notNull(),
  description: text('description'),
  content: text('content'),
  author: text('author'),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  fetchedAt: timestamp('fetched_at', { withTimezone: true }).notNull().defaultNow()
});

export const rssArticleRelations = relations(rssArticle, ({ one }) => ({
  source: one(rssSource, { fields: [rssArticle.sourceId], references: [rssSource.id] })
}));

export const trendSummary = pgTable('trend_summary', {
  id: serial('id').primaryKey(),
  workspaceId: integer('workspace_id')
    .notNull()
    .references(() => workspace.id, { onDelete: 'cascade' }),
  date: date('date', { mode: 'string' }).notNull(),
  summary: text('summary'),
  articleCount: integer('article_count').notNull().default(0),
  generatedAt: timestamp('generated_at', { withTimezone: true })
});

export const trendSummaryRelations = relations(trendSummary, ({ one }) => ({
  workspace: one(workspace, { fields: [trendSummary.workspaceId], references: [workspace.id] })
}));
