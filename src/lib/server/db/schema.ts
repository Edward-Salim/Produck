import {
  pgTable,
  serial,
  integer,
  text,
  boolean,
  jsonb,
  timestamp,
  bigint
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

// ── App User & Access ────────────────────────────────

export const appUser = pgTable('app_user', {
  id: serial('id').primaryKey(),
  authId: text('auth_id').notNull().unique(),
  email: text('email').notNull(),
  displayName: text('display_name').notNull(),
  role: text('role').notNull().default('member'),
  passwordHash: text('password_hash'),
  preferences: jsonb('preferences')
    .$type<{
      music?: boolean;
      sounds?: boolean;
      hintAlwaysOn?: boolean;
      selectedLevels?: number[];
      highscore?: number;
      highscoreName?: string;
      lastWorkspaceId?: number;
      lastProjectId?: number;
      gameState?: {
        gameState: string;
        poolIndex: number;
        health: number;
        totalCorrect: number;
        totalAttempts: number;
        bestStreak: number;
        streak: number;
        currentLevel: number;
        selectedLevels: number[];
        shuffledHanzi: string[];
        hintedSlots?: number[];
        hintUsedThisSentence?: boolean;
      };
    }>()
    .default({ music: true, sounds: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

export const appUserRelations = relations(appUser, ({ many }) => ({
  projectAccess: many(projectAccess),
  sessions: many(authSession)
}));

export const authSession = pgTable('auth_session', {
  id: text('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => appUser.id, { onDelete: 'cascade' }),
  expiresAt: integer('expires_at').notNull()
});

export const authSessionRelations = relations(authSession, ({ one }) => ({
  user: one(appUser, { fields: [authSession.userId], references: [appUser.id] })
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

export const workspaceAccess = pgTable('workspace_access', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => appUser.id, { onDelete: 'cascade' }),
  workspaceId: integer('workspace_id')
    .notNull()
    .references(() => workspace.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

export const workspaceAccessRelations = relations(workspaceAccess, ({ one }) => ({
  user: one(appUser, { fields: [workspaceAccess.userId], references: [appUser.id] }),
  workspace: one(workspace, { fields: [workspaceAccess.workspaceId], references: [workspace.id] })
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
  metrics: jsonb('metrics')
    .$type<string[]>()
    .default(sql`'[]'`)
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
  lastUpdated: text('last_updated').notNull()
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

// ── PM Book ───────────────────────────────────────────

export const pmBook = pgTable('pm_book', {
  id: serial('id').primaryKey(),
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

export const pmArtifact = pgTable('pm_artifact', {
  id: serial('id').primaryKey(),
  bookId: integer('book_id')
    .notNull()
    .references(() => pmBook.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  category: text('category').notNull(),
  description: text('description').notNull().default(''),
  howTo: jsonb('how_to')
    .$type<string[]>()
    .default(sql`'[]'`),
  figure: text('figure'),
  figures: jsonb('figures')
    .$type<string[]>()
    .default(sql`'[]'`)
});

export const pmArtifactRelations = relations(pmArtifact, ({ one }) => ({
  book: one(pmBook, { fields: [pmArtifact.bookId], references: [pmBook.id] })
}));

// ── PM Methodology ────────────────────────────────────

export const pmMethodology = pgTable('pm_methodology', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  phase: text('phase').notNull(),
  origin: text('origin').notNull().default(''),
  description: text('description').notNull().default(''),
  relatedArtifacts: jsonb('related_artifacts')
    .$type<string[]>()
    .default(sql`'[]'`),
  figure: text('figure')
});

// ── Daily Activity Picker ─────────────────────────────

export const dailyActivity = pgTable('daily_activity', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  category: text('category').notNull(),
  categoryDescription: text('category_description').notNull().default(''),
  name: text('name').notNull(),
  detail: text('detail').notNull().default(''),
  icon: text('icon').notNull().default('sparkles'),
  level: integer('level').notNull().default(2),
  enabled: boolean('enabled').notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

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
  levels: integer('levels').notNull().default(2),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export const ideaRelations = relations(idea, ({ one, many }) => ({
  workspace: one(workspace, { fields: [idea.workspaceId], references: [workspace.id] }),
  project: one(project, { fields: [idea.projectId], references: [project.id] }),
  activities: many(activity),
  actors: many(actor),
  backlogItems: many(backlogItem)
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

export const activity = pgTable('activity', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id').references(() => project.id, { onDelete: 'cascade' }),
  ideaId: integer('idea_id').references(() => idea.id, { onDelete: 'cascade' }),
  code: text('code').notNull(),
  title: text('title').notNull(),
  actorEmojis: jsonb('actor_emojis')
    .$type<string[]>()
    .default(sql`'[]'`),
  sortOrder: integer('sort_order').notNull().default(0)
});

export const activityRelations = relations(activity, ({ one, many }) => ({
  project: one(project, { fields: [activity.projectId], references: [project.id] }),
  idea: one(idea, { fields: [activity.ideaId], references: [idea.id] }),
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
  kano: text('kano').notNull(),
  asA: text('as_a'),
  wantTo: text('want_to'),
  soThat: text('so_that'),
  pains: jsonb('pains')
    .$type<string[]>()
    .default(sql`'[]'`),
  gains: jsonb('gains')
    .$type<string[]>()
    .default(sql`'[]'`),
  details: jsonb('details')
    .$type<string[]>()
    .default(sql`'[]'`),
  checkedAcs: jsonb('checked_acs')
    .$type<{ index: number; checkedAt: string }[]>()
    .default(sql`'[]'`),
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
    .default(sql`'[]'`),
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
  goals: jsonb('goals')
    .$type<string[]>()
    .default(sql`'[]'`),
  challenges: jsonb('challenges')
    .$type<string[]>()
    .default(sql`'[]'`),
  motivators: jsonb('motivators')
    .$type<string[]>()
    .default(sql`'[]'`),
  infoSources: jsonb('info_sources')
    .$type<string[]>()
    .default(sql`'[]'`),
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
  interviewDate: text('interview_date').notNull(),
  quote: text('quote'),
  quickFacts: jsonb('quick_facts')
    .$type<string[]>()
    .default(sql`'[]'`),
  insights: jsonb('insights')
    .$type<string[]>()
    .default(sql`'[]'`),
  opportunities: jsonb('opportunities')
    .$type<string[]>()
    .default(sql`'[]'`),
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
  targetDate: text('target_date'),
  status: text('status').notNull().default('planned'),
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
  status: text('status').notNull().default('planned'),
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
  projectId: integer('project_id').references(() => project.id, { onDelete: 'cascade' }),
  ideaId: integer('idea_id').references(() => idea.id, { onDelete: 'cascade' }),
  storyId: integer('story_id').references(() => story.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  description: text('description'),
  priority: integer('priority').notNull().default(0),
  status: text('status').notNull().default('todo'),
  type: text('type').notNull().default('feature'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export const backlogItemRelations = relations(backlogItem, ({ one }) => ({
  project: one(project, { fields: [backlogItem.projectId], references: [project.id] }),
  idea: one(idea, { fields: [backlogItem.ideaId], references: [idea.id] }),
  story: one(story, { fields: [backlogItem.storyId], references: [story.id] })
}));

// ── Epic & Ticket (standalone, decoupled from Story Map) ──

export const epic = pgTable('epic', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id')
    .notNull()
    .references(() => project.id, { onDelete: 'cascade' }),
  code: text('code').notNull(),
  title: text('title').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export const epicRelations = relations(epic, ({ one, many }) => ({
  project: one(project, { fields: [epic.projectId], references: [project.id] }),
  tickets: many(ticket)
}));

export const ticket = pgTable('ticket', {
  id: serial('id').primaryKey(),
  epicId: integer('epic_id')
    .notNull()
    .references(() => epic.id, { onDelete: 'cascade' }),
  code: text('code').notNull(),
  title: text('title').notNull(),
  kano: text('kano').notNull().default('must-have'),
  pic: text('pic').notNull().default(''),
  picColor: text('pic_color').notNull().default(''),
  done: boolean('done').notNull().default(false),
  acceptanceCriteria: jsonb('acceptance_criteria')
    .$type<string[]>()
    .default(sql`'[]'`),
  checkedAcs: jsonb('checked_acs')
    .$type<{ index: number; checkedAt: string }[]>()
    .default(sql`'[]'`),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export const ticketRelations = relations(ticket, ({ one }) => ({
  epic: one(epic, { fields: [ticket.epicId], references: [epic.id] })
}));

// ── Assumption (standalone, decoupled from Story Map) ──

export const assumption = pgTable('assumption', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id')
    .notNull()
    .references(() => project.id, { onDelete: 'cascade' }),
  type: text('type').notNull().default('desirability'),
  assumption: text('assumption').notNull(),
  rationale: text('rationale').notNull().default(''),
  testMethod: text('test_method').notNull().default(''),
  successCriteria: text('success_criteria').notNull().default(''),
  actualResults: text('actual_results').notNull().default(''),
  status: text('status').notNull().default('untested'),
  lastTested: text('last_tested'),
  importance: integer('importance').notNull().default(5),
  evidence: integer('evidence').notNull().default(3),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export const assumptionRelations = relations(assumption, ({ one }) => ({
  project: one(project, { fields: [assumption.projectId], references: [project.id] })
}));

// ── Kanban Card ────────────────────────────────────────

export const kanbanCard = pgTable('kanban_card', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id')
    .notNull()
    .references(() => project.id, { onDelete: 'cascade' }),
  columnId: text('column_id').notNull().default('col-todo'),
  title: text('title').notNull(),
  description: text('description'),
  assignee: text('assignee'),
  blockReason: text('block_reason'),
  blockedBy: text('blocked_by'),
  dueDate: text('due_date'),
  priority: text('priority').notNull().default('none'),
  type: text('type').notNull().default('task'),
  storyPoints: integer('story_points'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export const kanbanCardRelations = relations(kanbanCard, ({ one }) => ({
  project: one(project, { fields: [kanbanCard.projectId], references: [project.id] })
}));

// ── Kanban Activity Log ────────────────────────────────

export const kanbanActivity = pgTable('kanban_activity', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id')
    .notNull()
    .references(() => project.id, { onDelete: 'cascade' }),
  cardId: integer('card_id').notNull(),
  cardTitle: text('card_title').notNull(),
  action: text('action').notNull(), // 'move' | 'assign'
  fromValue: text('from_value'),
  toValue: text('to_value').notNull(),
  actor: text('actor').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

// ── Application Cover Letter Jobs ─────────────────────

export const applicationCoverLetterJob = pgTable('application_cover_letter_job', {
  id: text('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => appUser.id, { onDelete: 'cascade' }),
  status: text('status').notNull().default('queued'),
  dump: text('dump').notNull(),
  result: jsonb('result').$type<{
    company: string;
    role: string;
    recipient: string;
    companyTag: string;
    plainText: string;
    model: string;
    linkedinMessages?: { label: string; useCase: string; text: string }[];
  }>(),
  error: text('error'),
  model: text('model'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

// ── Framework Instances (user drafts) ─────────────────

export const frameworkInstance = pgTable('framework_instance', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id')
    .notNull()
    .references(() => project.id, { onDelete: 'cascade' }),
  templateId: text('template_id').notNull(),
  title: text('title').notNull(),
  values: jsonb('values').$type<Record<string, string>>().default({}),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  updatedBy: text('updated_by')
});

// ── Experience Map (decoupled from Story Map) ────────

export const experiencePhase = pgTable('experience_phase', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id')
    .notNull()
    .references(() => project.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  actorEmojis: jsonb('actor_emojis')
    .$type<string[]>()
    .default(sql`'[]'`),
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
  pains: jsonb('pains')
    .$type<string[]>()
    .default(sql`'[]'`),
  gains: jsonb('gains')
    .$type<string[]>()
    .default(sql`'[]'`),
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

// ── Job Board Aggregation ────────────────────────────

export const jobSource = pgTable('job_source', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  url: text('url').notNull(),
  type: text('type').notNull().default('bytedance'), // 'bytedance' | 'html' | 'rss'
  region: text('region').notNull().default('indonesia'),
  enabled: boolean('enabled').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export const jobSourceRelations = relations(jobSource, ({ many }) => ({
  listings: many(jobListing)
}));

export const jobListing = pgTable('job_listing', {
  id: serial('id').primaryKey(),
  sourceId: integer('source_id')
    .notNull()
    .references(() => jobSource.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  url: text('url').notNull(),
  department: text('department'),
  location: text('location'),
  description: text('description'),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  fetchedAt: timestamp('fetched_at', { withTimezone: true }).notNull().defaultNow(),
  isPM: boolean('is_pm').notNull().default(false),
  experienceYears: integer('experience_years'),
  rejected: boolean('rejected').notNull().default(false),
  requiresChinese: boolean('requires_chinese').notNull().default(false),
  recruitType: text('recruit_type'),
  viewedAt: timestamp('viewed_at', { withTimezone: true })
});

export const jobListingRelations = relations(jobListing, ({ one }) => ({
  source: one(jobSource, { fields: [jobListing.sourceId], references: [jobSource.id] })
}));

// ── RSS / Trend Analysis ─────────────────────────────

export const rssSource = pgTable('rss_source', {
  id: serial('id').primaryKey(),
  workspaceId: integer('workspace_id'),
  name: text('name').notNull(),
  url: text('url').notNull(),
  category: text('category').notNull().default('general'),
  region: text('region').notNull().default('global'),
  enabled: boolean('enabled').notNull().default(true),
  totalScreened: integer('total_screened').notNull().default(0),
  totalKept: integer('total_kept').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

export const rssSourceRelations = relations(rssSource, ({ many }) => ({
  articles: many(rssArticle)
}));

export const rssArticle = pgTable('rss_article', {
  id: serial('id').primaryKey(),
  sourceId: integer('source_id')
    .notNull()
    .references(() => rssSource.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  url: text('url').notNull().unique(),
  description: text('description'),
  content: text('content'),
  author: text('author'),
  imageUrl: text('image_url'),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  fetchedAt: timestamp('fetched_at', { withTimezone: true }).notNull().defaultNow(),
  rejected: boolean('rejected').notNull().default(false),
  screened: boolean('screened').notNull().default(false)
});

export const rssArticleRelations = relations(rssArticle, ({ one }) => ({
  source: one(rssSource, { fields: [rssArticle.sourceId], references: [rssSource.id] })
}));

export const trendSummary = pgTable('trend_summary', {
  id: serial('id').primaryKey(),
  workspaceId: integer('workspace_id'),
  date: text('date').notNull(),
  window: text('window').notNull().default('morning'),
  summary: text('summary'),
  articleCount: integer('article_count').notNull().default(0),
  generatedAt: timestamp('generated_at', { withTimezone: true })
});

// ── Financial Tracker ────────────────────────────────

const money = (name: string) => bigint(name, { mode: 'number' });

export const financialTrackerBudgetCategory = pgTable('financial_tracker_budget_category', {
  id: serial('id').primaryKey(),
  ownerEmail: text('owner_email').notNull(),
  label: text('label').notNull(),
  allocationShare: integer('allocation_share').notNull().default(0),
  sortOrder: integer('sort_order').notNull().default(0),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export const financialTrackerSetting = pgTable('financial_tracker_setting', {
  id: serial('id').primaryKey(),
  ownerEmail: text('owner_email').notNull(),
  monthlyAllocation: money('monthly_allocation').notNull().default(3000000),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export const financialTrackerMonthlySummary = pgTable('financial_tracker_monthly_summary', {
  id: serial('id').primaryKey(),
  ownerEmail: text('owner_email').notNull(),
  monthKey: text('month_key').notNull(),
  label: text('label').notNull(),
  period: text('period').notNull(),
  updated: text('updated').notNull(),
  rolloverPlanned: money('rollover_planned').notNull(),
  rolloverActual: money('rollover_actual').notNull(),
  incomePlanned: money('income_planned').notNull(),
  incomeActual: money('income_actual').notNull(),
  expensesPlanned: money('expenses_planned').notNull(),
  expensesActual: money('expenses_actual').notNull(),
  billsPlanned: money('bills_planned').notNull(),
  billsActual: money('bills_actual').notNull(),
  savingsPlanned: money('savings_planned').notNull(),
  savingsActual: money('savings_actual').notNull(),
  debtPlanned: money('debt_planned').notNull(),
  debtActual: money('debt_actual').notNull(),
  leftoverPlanned: money('leftover_planned').notNull(),
  leftoverActual: money('leftover_actual').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export const financialTrackerCategoryRow = pgTable('financial_tracker_category_row', {
  id: serial('id').primaryKey(),
  ownerEmail: text('owner_email').notNull(),
  monthKey: text('month_key').notNull(),
  section: text('section').notNull(),
  label: text('label').notNull(),
  planned: money('planned').notNull(),
  actual: money('actual').notNull(),
  due: text('due'),
  sortOrder: integer('sort_order').notNull().default(0),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export const financialTrackerWallet = pgTable('financial_tracker_wallet', {
  id: serial('id').primaryKey(),
  ownerEmail: text('owner_email').notNull(),
  label: text('label').notNull(),
  balance: money('balance').notNull(),
  minimumHold: money('minimum_hold'),
  accountNumber: text('account_number'),
  balanceProvided: boolean('balance_provided'),
  transactionsProvided: boolean('transactions_provided'),
  note: text('note'),
  sortOrder: integer('sort_order').notNull().default(0),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export const financialTrackerInvestment = pgTable('financial_tracker_investment', {
  id: serial('id').primaryKey(),
  ownerEmail: text('owner_email').notNull(),
  label: text('label').notNull(),
  ticker: text('ticker'),
  sharesScaled: bigint('shares_scaled', { mode: 'number' }),
  costBasis: money('cost_basis'),
  currency: text('currency').notNull().default('USD'),
  latestPriceScaled: bigint('latest_price_scaled', { mode: 'number' }),
  latestPriceAt: timestamp('latest_price_at', { withTimezone: true }),
  balance: money('balance').notNull(),
  change: text('change').notNull(),
  direction: text('direction').notNull(),
  dividendYieldBps: integer('dividend_yield_bps'),
  sortOrder: integer('sort_order').notNull().default(0),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export const financialTrackerInvestmentSnapshot = pgTable('financial_tracker_investment_snapshot', {
  id: serial('id').primaryKey(),
  ownerEmail: text('owner_email').notNull(),
  snapshotKey: text('snapshot_key').notNull(),
  label: text('label').notNull(),
  ticker: text('ticker'),
  balance: money('balance').notNull(),
  costBasis: money('cost_basis').notNull(),
  change: text('change').notNull(),
  direction: text('direction').notNull(),
  latestPriceScaled: bigint('latest_price_scaled', { mode: 'number' }),
  latestPriceAt: timestamp('latest_price_at', { withTimezone: true }),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

export const financialTrackerDebtSchedule = pgTable('financial_tracker_debt_schedule', {
  id: serial('id').primaryKey(),
  ownerEmail: text('owner_email').notNull(),
  provider: text('provider').notNull(),
  due: text('due').notNull(),
  amount: money('amount').notNull(),
  status: text('status').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export const financialTrackerLedgerMonth = pgTable('financial_tracker_ledger_month', {
  id: serial('id').primaryKey(),
  ownerEmail: text('owner_email').notNull(),
  monthKey: text('month_key').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export const financialTrackerLedgerEntry = pgTable('financial_tracker_ledger_entry', {
  id: serial('id').primaryKey(),
  ownerEmail: text('owner_email').notNull(),
  entryId: text('entry_id').notNull(),
  monthKey: text('month_key').notNull(),
  date: text('date').notNull(),
  description: text('description').notNull(),
  kind: text('kind').notNull(),
  category: text('category').notNull(),
  amount: money('amount').notNull(),
  fromAccount: text('from_account'),
  toAccount: text('to_account'),
  paymentType: text('payment_type').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export const financialTrackerExpenseDetail = pgTable('financial_tracker_expense_detail', {
  id: serial('id').primaryKey(),
  ownerEmail: text('owner_email').notNull(),
  monthKey: text('month_key').notNull(),
  category: text('category').notNull(),
  item: text('item').notNull(),
  price: money('price').notNull(),
  plannedQty: integer('planned_qty').notNull(),
  actualQty: integer('actual_qty').notNull(),
  plannedAmount: money('planned_amount').notNull(),
  actualAmount: money('actual_amount').notNull(),
  paymentMethod: text('payment_method'),
  paymentType: text('payment_type'),
  sortOrder: integer('sort_order').notNull().default(0),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export const financialTrackerInvestmentForecast = pgTable('financial_tracker_investment_forecast', {
  id: serial('id').primaryKey(),
  ownerEmail: text('owner_email').notNull(),
  year: integer('year').notNull(),
  optimistic: money('optimistic').notNull(),
  pessimist: money('pessimist').notNull(),
  salary: money('salary').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export const financialTrackerForecastPreference = pgTable('financial_tracker_forecast_preference', {
  id: serial('id').primaryKey(),
  ownerEmail: text('owner_email').notNull(),
  forecastMode: text('forecast_mode').notNull().default('optimistic'),
  returnProfile: text('return_profile').notNull().default('vti'),
  investmentCurrency: text('investment_currency').notNull().default('idr'),
  retirementAge: integer('retirement_age').notNull().default(40),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export const financialTrackerForecastOverride = pgTable('financial_tracker_forecast_override', {
  id: serial('id').primaryKey(),
  ownerEmail: text('owner_email').notNull(),
  relativeYear: integer('relative_year').notNull(),
  monthIndex: integer('month_index'),
  salary: money('salary'),
  investmentContributionRateBps: integer('investment_contribution_rate_bps'),
  extraMonthlyInvestment: money('extra_monthly_investment'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});
