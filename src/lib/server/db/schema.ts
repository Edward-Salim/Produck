import {
  sqliteTable,
  integer,
  text
} from 'drizzle-orm/sqlite-core';
import { relations, sql } from 'drizzle-orm';

// ── App User & Access ────────────────────────────────

export const appUser = sqliteTable('app_user', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  authId: text('auth_id').notNull().unique(),
  email: text('email').notNull(),
  displayName: text('display_name').notNull(),
  role: text('role').notNull().default('member'),
  passwordHash: text('password_hash'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
});

export const appUserRelations = relations(appUser, ({ many }) => ({
  projectAccess: many(projectAccess),
  sessions: many(authSession)
}));

export const authSession = sqliteTable('auth_session', {
  id: text('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => appUser.id, { onDelete: 'cascade' }),
  expiresAt: integer('expires_at').notNull()
});

export const authSessionRelations = relations(authSession, ({ one }) => ({
  user: one(appUser, { fields: [authSession.userId], references: [appUser.id] })
}));

export const projectAccess = sqliteTable('project_access', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id')
    .notNull()
    .references(() => appUser.id, { onDelete: 'cascade' }),
  projectId: integer('project_id')
    .notNull()
    .references(() => project.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
});

export const projectAccessRelations = relations(projectAccess, ({ one }) => ({
  user: one(appUser, { fields: [projectAccess.userId], references: [appUser.id] }),
  project: one(project, { fields: [projectAccess.projectId], references: [project.id] })
}));

export const workspaceAccess = sqliteTable('workspace_access', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id')
    .notNull()
    .references(() => appUser.id, { onDelete: 'cascade' }),
  workspaceId: integer('workspace_id')
    .notNull()
    .references(() => workspace.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
});

export const workspaceAccessRelations = relations(workspaceAccess, ({ one }) => ({
  user: one(appUser, { fields: [workspaceAccess.userId], references: [appUser.id] }),
  workspace: one(workspace, { fields: [workspaceAccess.workspaceId], references: [workspace.id] })
}));

// ── Workspace ─────────────────────────────────────────

export const workspace = sqliteTable('workspace', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
});

export const workspaceRelations = relations(workspace, ({ many }) => ({
  projects: many(project),
  ideas: many(idea)
}));

// ── Business Outcome ──────────────────────────────────

export const businessOutcome = sqliteTable('business_outcome', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer('project_id')
    .notNull()
    .references(() => project.id, { onDelete: 'cascade' }),
  year: integer('year').notNull(),
  code: text('code').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  metrics: text('metrics', { mode: 'json' }).$type<string[]>().default(sql`'[]'`)
});

// ── Product Objective ─────────────────────────────────

export const productObjective = sqliteTable('product_objective', {
  id: integer('id').primaryKey({ autoIncrement: true }),
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

export const keyResult = sqliteTable('key_result', {
  id: integer('id').primaryKey({ autoIncrement: true }),
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
  lastUpdated: text('last_updated').notNull()
});

export const keyResultRelations = relations(keyResult, ({ one }) => ({
  objective: one(productObjective, {
    fields: [keyResult.objectiveId],
    references: [productObjective.id]
  })
}));

// ── Artifact Pick ─────────────────────────────────────

export const artifactPick = sqliteTable('artifact_pick', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer('project_id')
    .notNull()
    .references(() => project.id, { onDelete: 'cascade' }),
  bookId: text('book_id').notNull(),
  artifactName: text('artifact_name').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
});

export const artifactPickRelations = relations(artifactPick, ({ one }) => ({
  project: one(project, { fields: [artifactPick.projectId], references: [project.id] })
}));

// ── Fintech Pick ──────────────────────────────────────

export const fintechPick = sqliteTable('fintech_pick', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer('project_id')
    .notNull()
    .references(() => project.id, { onDelete: 'cascade' }),
  companyId: text('company_id').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
});

export const fintechPickRelations = relations(fintechPick, ({ one }) => ({
  project: one(project, { fields: [fintechPick.projectId], references: [project.id] })
}));

// ── PM Book ───────────────────────────────────────────

export const pmBook = sqliteTable('pm_book', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  subtitle: text('subtitle').default(''),
  author: text('author').default(''),
  year: integer('year').default(0),
  coverPath: text('cover_path').default('')
});

export const pmBookRelations = relations(pmBook, ({ many }) => ({
  artifacts: many(pmArtifact)
}));

// ── PM Artifact ───────────────────────────────────────

export const pmArtifact = sqliteTable('pm_artifact', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  bookId: integer('book_id')
    .notNull()
    .references(() => pmBook.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  category: text('category').notNull(),
  description: text('description').notNull().default(''),
  howTo: text('how_to', { mode: 'json' }).$type<string[]>().default(sql`'[]'`),
  figure: text('figure'),
  figures: text('figures', { mode: 'json' }).$type<string[]>().default(sql`'[]'`)
});

export const pmArtifactRelations = relations(pmArtifact, ({ one }) => ({
  book: one(pmBook, { fields: [pmArtifact.bookId], references: [pmBook.id] })
}));

// ── PM Methodology ────────────────────────────────────

export const pmMethodology = sqliteTable('pm_methodology', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  phase: text('phase').notNull(),
  origin: text('origin').notNull().default(''),
  description: text('description').notNull().default(''),
  relatedArtifacts: text('related_artifacts', { mode: 'json' }).$type<string[]>().default(sql`'[]'`),
  figure: text('figure')
});

// ── Idea ──────────────────────────────────────────────

export const idea = sqliteTable('idea', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  workspaceId: integer('workspace_id')
    .notNull()
    .references(() => workspace.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  projectId: integer('project_id').references(() => project.id, { onDelete: 'set null' }),
  status: text('status').notNull().default('triage'),
  proposer: text('proposer'),
  okrCode: text('okr_code'),
  levels: integer('levels').notNull().default(2),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
});

export const ideaRelations = relations(idea, ({ one, many }) => ({
  workspace: one(workspace, { fields: [idea.workspaceId], references: [workspace.id] }),
  project: one(project, { fields: [idea.projectId], references: [project.id] }),
  activities: many(activity),
  actors: many(actor),
  backlogItems: many(backlogItem)
}));

// ── Project ────────────────────────────────────────────

export const project = sqliteTable('project', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  workspaceId: integer('workspace_id')
    .notNull()
    .references(() => workspace.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  shortName: text('short_name'),
  levels: integer('levels').notNull().default(2),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
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

export const actor = sqliteTable('actor', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer('project_id').references(() => project.id, { onDelete: 'cascade' }),
  ideaId: integer('idea_id').references(() => idea.id, { onDelete: 'cascade' }),
  emoji: text('emoji').notNull(),
  label: text('label').notNull(),
  sortOrder: integer('sort_order').notNull().default(0)
});

export const actorRelations = relations(actor, ({ one }) => ({
  project: one(project, { fields: [actor.projectId], references: [project.id] }),
  idea: one(idea, { fields: [actor.ideaId], references: [idea.id] })
}));

// ── Activity ───────────────────────────────────────────

export const activity = sqliteTable('activity', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer('project_id').references(() => project.id, { onDelete: 'cascade' }),
  ideaId: integer('idea_id').references(() => idea.id, { onDelete: 'cascade' }),
  code: text('code').notNull(),
  title: text('title').notNull(),
  actorEmojis: text('actor_emojis', { mode: 'json' }).$type<string[]>().default(sql`'[]'`),
  sortOrder: integer('sort_order').notNull().default(0)
});

export const activityRelations = relations(activity, ({ one, many }) => ({
  project: one(project, { fields: [activity.projectId], references: [project.id] }),
  idea: one(idea, { fields: [activity.ideaId], references: [idea.id] }),
  tasks: many(storyMapTask),
  stories: many(story)
}));

// ── Story Map Task ─────────────────────────────────────

export const storyMapTask = sqliteTable('story_map_task', {
  id: integer('id').primaryKey({ autoIncrement: true }),
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

export const story = sqliteTable('story', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  activityId: integer('activity_id')
    .notNull()
    .references(() => activity.id, { onDelete: 'cascade' }),
  taskId: integer('task_id').references(() => storyMapTask.id, { onDelete: 'set null' }),
  code: text('code').notNull(),
  title: text('title').notNull(),
  pic: text('pic').notNull().default(''),
  picColor: text('pic_color').notNull().default(''),
  done: integer('done', { mode: 'boolean' }).notNull().default(false),
  kano: text('kano').notNull(),
  asA: text('as_a'),
  wantTo: text('want_to'),
  soThat: text('so_that'),
  pains: text('pains', { mode: 'json' }).$type<string[]>().default(sql`'[]'`),
  gains: text('gains', { mode: 'json' }).$type<string[]>().default(sql`'[]'`),
  details: text('details', { mode: 'json' }).$type<string[]>().default(sql`'[]'`),
  checkedAcs: text('checked_acs', { mode: 'json' }).$type<{ index: number; checkedAt: string }[]>().default(sql`'[]'`),
  assumptions: text('assumptions', { mode: 'json' })
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
    .default(sql`'[]'`),
  sortOrder: integer('sort_order').notNull().default(0)
});

export const storyRelations = relations(story, ({ one, many }) => ({
  activity: one(activity, { fields: [story.activityId], references: [activity.id] }),
  task: one(storyMapTask, { fields: [story.taskId], references: [storyMapTask.id] }),
  backlogItems: many(backlogItem)
}));

// ── Persona ────────────────────────────────────────────

export const persona = sqliteTable('persona', {
  id: integer('id').primaryKey({ autoIncrement: true }),
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
  goals: text('goals', { mode: 'json' }).$type<string[]>().default(sql`'[]'`),
  challenges: text('challenges', { mode: 'json' }).$type<string[]>().default(sql`'[]'`),
  motivators: text('motivators', { mode: 'json' }).$type<string[]>().default(sql`'[]'`),
  infoSources: text('info_sources', { mode: 'json' }).$type<string[]>().default(sql`'[]'`),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
});

export const personaRelations = relations(persona, ({ one }) => ({
  project: one(project, { fields: [persona.projectId], references: [project.id] })
}));

// ── Interview Snapshot ────────────────────────────────

export const interviewSnapshot = sqliteTable('interview_snapshot', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer('project_id')
    .notNull()
    .references(() => project.id, { onDelete: 'cascade' }),
  personName: text('person_name').notNull(),
  personRole: text('person_role'),
  personPhoto: text('person_photo'),
  interviewDate: text('interview_date').notNull(),
  quote: text('quote'),
  quickFacts: text('quick_facts', { mode: 'json' }).$type<string[]>().default(sql`'[]'`),
  insights: text('insights', { mode: 'json' }).$type<string[]>().default(sql`'[]'`),
  opportunities: text('opportunities', { mode: 'json' }).$type<string[]>().default(sql`'[]'`),
  transcript: text('transcript'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
});

export const interviewSnapshotRelations = relations(interviewSnapshot, ({ one }) => ({
  project: one(project, { fields: [interviewSnapshot.projectId], references: [project.id] })
}));

// ── Milestone ──────────────────────────────────────────

export const milestone = sqliteTable('milestone', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer('project_id')
    .notNull()
    .references(() => project.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  targetDate: text('target_date'),
  status: text('status').notNull().default('planned'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
});

export const milestoneRelations = relations(milestone, ({ one, many }) => ({
  project: one(project, { fields: [milestone.projectId], references: [project.id] }),
  items: many(roadmapItem)
}));

// ── Roadmap Item ───────────────────────────────────────

export const roadmapItem = sqliteTable('roadmap_item', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  milestoneId: integer('milestone_id')
    .notNull()
    .references(() => milestone.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  priority: integer('priority').notNull().default(0),
  status: text('status').notNull().default('planned'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
});

export const roadmapItemRelations = relations(roadmapItem, ({ one }) => ({
  milestone: one(milestone, { fields: [roadmapItem.milestoneId], references: [milestone.id] })
}));

// ── Backlog Item ───────────────────────────────────────

export const backlogItem = sqliteTable('backlog_item', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer('project_id').references(() => project.id, { onDelete: 'cascade' }),
  ideaId: integer('idea_id').references(() => idea.id, { onDelete: 'cascade' }),
  storyId: integer('story_id').references(() => story.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  description: text('description'),
  priority: integer('priority').notNull().default(0),
  status: text('status').notNull().default('todo'),
  type: text('type').notNull().default('feature'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
});

export const backlogItemRelations = relations(backlogItem, ({ one }) => ({
  project: one(project, { fields: [backlogItem.projectId], references: [project.id] }),
  idea: one(idea, { fields: [backlogItem.ideaId], references: [idea.id] }),
  story: one(story, { fields: [backlogItem.storyId], references: [story.id] })
}));

// ── Experience Map (decoupled from Story Map) ────────

export const experiencePhase = sqliteTable('experience_phase', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer('project_id')
    .notNull()
    .references(() => project.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  actorEmojis: text('actor_emojis', { mode: 'json' }).$type<string[]>().default(sql`'[]'`),
  sortOrder: integer('sort_order').notNull().default(0)
});

export const experiencePhaseRelations = relations(experiencePhase, ({ one, many }) => ({
  project: one(project, { fields: [experiencePhase.projectId], references: [project.id] }),
  steps: many(experienceStep)
}));

export const experienceStep = sqliteTable('experience_step', {
  id: integer('id').primaryKey({ autoIncrement: true }),
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

export const experienceTouchpoint = sqliteTable('experience_touchpoint', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  stepId: integer('step_id')
    .notNull()
    .references(() => experienceStep.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  asA: text('as_a'),
  wantTo: text('want_to'),
  soThat: text('so_that'),
  pains: text('pains', { mode: 'json' }).$type<string[]>().default(sql`'[]'`),
  gains: text('gains', { mode: 'json' }).$type<string[]>().default(sql`'[]'`),
  pic: text('pic').notNull().default(''),
  picColor: text('pic_color').notNull().default(''),
  kpi: text('kpi').notNull().default(''),
  sortOrder: integer('sort_order').notNull().default(0)
});

export const experienceTouchpointRelations = relations(experienceTouchpoint, ({ one }) => ({
  step: one(experienceStep, {
    fields: [experienceTouchpoint.stepId],
    references: [experienceStep.id]
  })
}));

// ── RSS / Trend Analysis ─────────────────────────────

export const rssSource = sqliteTable('rss_source', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  workspaceId: integer('workspace_id')
    .notNull()
    .references(() => workspace.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  url: text('url').notNull(),
  category: text('category').notNull().default('general'),
  enabled: integer('enabled', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
});

export const rssSourceRelations = relations(rssSource, ({ one, many }) => ({
  workspace: one(workspace, { fields: [rssSource.workspaceId], references: [workspace.id] }),
  articles: many(rssArticle)
}));

export const rssArticle = sqliteTable('rss_article', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sourceId: integer('source_id')
    .notNull()
    .references(() => rssSource.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  url: text('url').notNull(),
  description: text('description'),
  content: text('content'),
  author: text('author'),
  publishedAt: integer('published_at', { mode: 'timestamp' }),
  fetchedAt: integer('fetched_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
});

export const rssArticleRelations = relations(rssArticle, ({ one }) => ({
  source: one(rssSource, { fields: [rssArticle.sourceId], references: [rssSource.id] })
}));

export const trendSummary = sqliteTable('trend_summary', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  workspaceId: integer('workspace_id')
    .notNull()
    .references(() => workspace.id, { onDelete: 'cascade' }),
  date: text('date').notNull(),
  summary: text('summary'),
  articleCount: integer('article_count').notNull().default(0),
  generatedAt: integer('generated_at', { mode: 'timestamp' })
});

export const trendSummaryRelations = relations(trendSummary, ({ one }) => ({
  workspace: one(workspace, { fields: [trendSummary.workspaceId], references: [workspace.id] })
}));
