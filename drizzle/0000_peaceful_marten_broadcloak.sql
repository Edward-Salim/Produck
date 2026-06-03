CREATE TABLE "activity" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer,
	"idea_id" integer,
	"code" text NOT NULL,
	"title" text NOT NULL,
	"actor_emojis" jsonb DEFAULT '[]',
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "actor" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer,
	"idea_id" integer,
	"emoji" text NOT NULL,
	"label" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_user" (
	"id" serial PRIMARY KEY NOT NULL,
	"auth_id" text NOT NULL,
	"email" text NOT NULL,
	"display_name" text NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"password_hash" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "app_user_auth_id_unique" UNIQUE("auth_id")
);
--> statement-breakpoint
CREATE TABLE "artifact_pick" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"book_id" text NOT NULL,
	"artifact_name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth_session" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"expires_at" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "backlog_item" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer,
	"idea_id" integer,
	"story_id" integer,
	"title" text NOT NULL,
	"description" text,
	"priority" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'todo' NOT NULL,
	"type" text DEFAULT 'feature' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "business_outcome" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"year" integer NOT NULL,
	"code" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"metrics" jsonb DEFAULT '[]'
);
--> statement-breakpoint
CREATE TABLE "experience_phase" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"title" text NOT NULL,
	"actor_emojis" jsonb DEFAULT '[]',
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "experience_step" (
	"id" serial PRIMARY KEY NOT NULL,
	"phase_id" integer NOT NULL,
	"title" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "experience_touchpoint" (
	"id" serial PRIMARY KEY NOT NULL,
	"step_id" integer NOT NULL,
	"title" text NOT NULL,
	"as_a" text,
	"want_to" text,
	"so_that" text,
	"pains" jsonb DEFAULT '[]',
	"gains" jsonb DEFAULT '[]',
	"pic" text DEFAULT '' NOT NULL,
	"pic_color" text DEFAULT '' NOT NULL,
	"kpi" text DEFAULT '' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fintech_pick" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"company_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "idea" (
	"id" serial PRIMARY KEY NOT NULL,
	"workspace_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"project_id" integer,
	"status" text DEFAULT 'triage' NOT NULL,
	"proposer" text,
	"okr_code" text,
	"levels" integer DEFAULT 2 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "interview_snapshot" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"person_name" text NOT NULL,
	"person_role" text,
	"person_photo" text,
	"interview_date" text NOT NULL,
	"quote" text,
	"quick_facts" jsonb DEFAULT '[]',
	"insights" jsonb DEFAULT '[]',
	"opportunities" jsonb DEFAULT '[]',
	"transcript" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "key_result" (
	"id" serial PRIMARY KEY NOT NULL,
	"objective_id" integer NOT NULL,
	"code" text NOT NULL,
	"description" text NOT NULL,
	"target" text NOT NULL,
	"target_value" integer DEFAULT 0 NOT NULL,
	"current_value" integer DEFAULT 0 NOT NULL,
	"unit" text NOT NULL,
	"carried_from" text,
	"last_updated" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "milestone" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"name" text NOT NULL,
	"target_date" text,
	"status" text DEFAULT 'planned' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "persona" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"name" text NOT NULL,
	"role" text,
	"avatar_url" text,
	"job_description" text,
	"company_name" text,
	"company_size" text,
	"industry" text,
	"age" text,
	"gender" text,
	"income" text,
	"education_level" text,
	"residential_environment" text,
	"quote" text,
	"biography" text,
	"goals" jsonb DEFAULT '[]',
	"challenges" jsonb DEFAULT '[]',
	"motivators" jsonb DEFAULT '[]',
	"info_sources" jsonb DEFAULT '[]',
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pm_artifact" (
	"id" serial PRIMARY KEY NOT NULL,
	"book_id" integer NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"how_to" jsonb DEFAULT '[]',
	"figure" text,
	"figures" jsonb DEFAULT '[]'
);
--> statement-breakpoint
CREATE TABLE "pm_book" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"subtitle" text DEFAULT '',
	"author" text DEFAULT '',
	"year" integer DEFAULT 0,
	"cover_path" text DEFAULT '',
	CONSTRAINT "pm_book_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "pm_methodology" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"phase" text NOT NULL,
	"origin" text DEFAULT '' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"related_artifacts" jsonb DEFAULT '[]',
	"figure" text
);
--> statement-breakpoint
CREATE TABLE "product_objective" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"year" integer NOT NULL,
	"quarter" integer NOT NULL,
	"code" text NOT NULL,
	"title" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project" (
	"id" serial PRIMARY KEY NOT NULL,
	"workspace_id" integer NOT NULL,
	"name" text NOT NULL,
	"short_name" text,
	"levels" integer DEFAULT 2 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_access" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"project_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roadmap_item" (
	"id" serial PRIMARY KEY NOT NULL,
	"milestone_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"priority" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'planned' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rss_article" (
	"id" serial PRIMARY KEY NOT NULL,
	"source_id" integer NOT NULL,
	"title" text NOT NULL,
	"url" text NOT NULL,
	"description" text,
	"content" text,
	"author" text,
	"published_at" timestamp with time zone,
	"fetched_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rss_source" (
	"id" serial PRIMARY KEY NOT NULL,
	"workspace_id" integer NOT NULL,
	"name" text NOT NULL,
	"url" text NOT NULL,
	"category" text DEFAULT 'general' NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "story" (
	"id" serial PRIMARY KEY NOT NULL,
	"activity_id" integer NOT NULL,
	"task_id" integer,
	"code" text NOT NULL,
	"title" text NOT NULL,
	"pic" text DEFAULT '' NOT NULL,
	"pic_color" text DEFAULT '' NOT NULL,
	"done" boolean DEFAULT false NOT NULL,
	"kano" text NOT NULL,
	"as_a" text,
	"want_to" text,
	"so_that" text,
	"pains" jsonb DEFAULT '[]',
	"gains" jsonb DEFAULT '[]',
	"details" jsonb DEFAULT '[]',
	"checked_acs" jsonb DEFAULT '[]',
	"assumptions" jsonb DEFAULT '[]',
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "story_map_task" (
	"id" serial PRIMARY KEY NOT NULL,
	"activity_id" integer NOT NULL,
	"code" text NOT NULL,
	"title" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trend_summary" (
	"id" serial PRIMARY KEY NOT NULL,
	"workspace_id" integer NOT NULL,
	"date" text NOT NULL,
	"summary" text,
	"article_count" integer DEFAULT 0 NOT NULL,
	"generated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "workspace" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workspace_access" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"workspace_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "activity" ADD CONSTRAINT "activity_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity" ADD CONSTRAINT "activity_idea_id_idea_id_fk" FOREIGN KEY ("idea_id") REFERENCES "public"."idea"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "actor" ADD CONSTRAINT "actor_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "actor" ADD CONSTRAINT "actor_idea_id_idea_id_fk" FOREIGN KEY ("idea_id") REFERENCES "public"."idea"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "artifact_pick" ADD CONSTRAINT "artifact_pick_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth_session" ADD CONSTRAINT "auth_session_user_id_app_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "backlog_item" ADD CONSTRAINT "backlog_item_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "backlog_item" ADD CONSTRAINT "backlog_item_idea_id_idea_id_fk" FOREIGN KEY ("idea_id") REFERENCES "public"."idea"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "backlog_item" ADD CONSTRAINT "backlog_item_story_id_story_id_fk" FOREIGN KEY ("story_id") REFERENCES "public"."story"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_outcome" ADD CONSTRAINT "business_outcome_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "experience_phase" ADD CONSTRAINT "experience_phase_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "experience_step" ADD CONSTRAINT "experience_step_phase_id_experience_phase_id_fk" FOREIGN KEY ("phase_id") REFERENCES "public"."experience_phase"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "experience_touchpoint" ADD CONSTRAINT "experience_touchpoint_step_id_experience_step_id_fk" FOREIGN KEY ("step_id") REFERENCES "public"."experience_step"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fintech_pick" ADD CONSTRAINT "fintech_pick_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "idea" ADD CONSTRAINT "idea_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "idea" ADD CONSTRAINT "idea_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interview_snapshot" ADD CONSTRAINT "interview_snapshot_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "key_result" ADD CONSTRAINT "key_result_objective_id_product_objective_id_fk" FOREIGN KEY ("objective_id") REFERENCES "public"."product_objective"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "milestone" ADD CONSTRAINT "milestone_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "persona" ADD CONSTRAINT "persona_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pm_artifact" ADD CONSTRAINT "pm_artifact_book_id_pm_book_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."pm_book"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_objective" ADD CONSTRAINT "product_objective_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project" ADD CONSTRAINT "project_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_access" ADD CONSTRAINT "project_access_user_id_app_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_access" ADD CONSTRAINT "project_access_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roadmap_item" ADD CONSTRAINT "roadmap_item_milestone_id_milestone_id_fk" FOREIGN KEY ("milestone_id") REFERENCES "public"."milestone"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rss_article" ADD CONSTRAINT "rss_article_source_id_rss_source_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."rss_source"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rss_source" ADD CONSTRAINT "rss_source_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "story" ADD CONSTRAINT "story_activity_id_activity_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."activity"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "story" ADD CONSTRAINT "story_task_id_story_map_task_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."story_map_task"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "story_map_task" ADD CONSTRAINT "story_map_task_activity_id_activity_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."activity"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trend_summary" ADD CONSTRAINT "trend_summary_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_access" ADD CONSTRAINT "workspace_access_user_id_app_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_access" ADD CONSTRAINT "workspace_access_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE no action;