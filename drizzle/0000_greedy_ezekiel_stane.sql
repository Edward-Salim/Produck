CREATE TABLE `activity` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` integer,
	`idea_id` integer,
	`code` text NOT NULL,
	`title` text NOT NULL,
	`actor_emojis` text DEFAULT '[]',
	`sort_order` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `project`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`idea_id`) REFERENCES `idea`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `actor` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` integer,
	`idea_id` integer,
	`emoji` text NOT NULL,
	`label` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `project`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`idea_id`) REFERENCES `idea`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `app_user` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`auth_id` text NOT NULL,
	`email` text NOT NULL,
	`display_name` text NOT NULL,
	`role` text DEFAULT 'member' NOT NULL,
	`password_hash` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `app_user_auth_id_unique` ON `app_user` (`auth_id`);--> statement-breakpoint
CREATE TABLE `artifact_pick` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` integer NOT NULL,
	`book_id` text NOT NULL,
	`artifact_name` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `project`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `auth_session` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `app_user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `backlog_item` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` integer,
	`idea_id` integer,
	`story_id` integer,
	`title` text NOT NULL,
	`description` text,
	`priority` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'todo' NOT NULL,
	`type` text DEFAULT 'feature' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `project`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`idea_id`) REFERENCES `idea`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`story_id`) REFERENCES `story`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `business_outcome` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` integer NOT NULL,
	`year` integer NOT NULL,
	`code` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`metrics` text DEFAULT '[]',
	FOREIGN KEY (`project_id`) REFERENCES `project`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `experience_phase` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` integer NOT NULL,
	`title` text NOT NULL,
	`actor_emojis` text DEFAULT '[]',
	`sort_order` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `project`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `experience_step` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`phase_id` integer NOT NULL,
	`title` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`phase_id`) REFERENCES `experience_phase`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `experience_touchpoint` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`step_id` integer NOT NULL,
	`title` text NOT NULL,
	`as_a` text,
	`want_to` text,
	`so_that` text,
	`pains` text DEFAULT '[]',
	`gains` text DEFAULT '[]',
	`pic` text DEFAULT '' NOT NULL,
	`pic_color` text DEFAULT '' NOT NULL,
	`kpi` text DEFAULT '' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`step_id`) REFERENCES `experience_step`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `fintech_pick` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` integer NOT NULL,
	`company_id` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `project`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `idea` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`workspace_id` integer NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`project_id` integer,
	`status` text DEFAULT 'triage' NOT NULL,
	`proposer` text,
	`okr_code` text,
	`levels` integer DEFAULT 2 NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspace`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`project_id`) REFERENCES `project`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `interview_snapshot` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` integer NOT NULL,
	`person_name` text NOT NULL,
	`person_role` text,
	`person_photo` text,
	`interview_date` text NOT NULL,
	`quote` text,
	`quick_facts` text DEFAULT '[]',
	`insights` text DEFAULT '[]',
	`opportunities` text DEFAULT '[]',
	`transcript` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `project`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `key_result` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`objective_id` integer NOT NULL,
	`code` text NOT NULL,
	`description` text NOT NULL,
	`target` text NOT NULL,
	`target_value` integer DEFAULT 0 NOT NULL,
	`current_value` integer DEFAULT 0 NOT NULL,
	`unit` text NOT NULL,
	`carried_from` text,
	`last_updated` text NOT NULL,
	FOREIGN KEY (`objective_id`) REFERENCES `product_objective`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `milestone` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` integer NOT NULL,
	`name` text NOT NULL,
	`target_date` text,
	`status` text DEFAULT 'planned' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `project`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `persona` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` integer NOT NULL,
	`name` text NOT NULL,
	`role` text,
	`avatar_url` text,
	`job_description` text,
	`company_name` text,
	`company_size` text,
	`industry` text,
	`age` text,
	`gender` text,
	`income` text,
	`education_level` text,
	`residential_environment` text,
	`quote` text,
	`biography` text,
	`goals` text DEFAULT '[]',
	`challenges` text DEFAULT '[]',
	`motivators` text DEFAULT '[]',
	`info_sources` text DEFAULT '[]',
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `project`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `pm_artifact` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`book_id` integer NOT NULL,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`how_to` text DEFAULT '[]',
	`figure` text,
	`figures` text DEFAULT '[]',
	FOREIGN KEY (`book_id`) REFERENCES `pm_book`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `pm_book` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`subtitle` text DEFAULT '',
	`author` text DEFAULT '',
	`year` integer DEFAULT 0,
	`cover_path` text DEFAULT ''
);
--> statement-breakpoint
CREATE UNIQUE INDEX `pm_book_slug_unique` ON `pm_book` (`slug`);--> statement-breakpoint
CREATE TABLE `pm_methodology` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`phase` text NOT NULL,
	`origin` text DEFAULT '' NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`related_artifacts` text DEFAULT '[]',
	`figure` text
);
--> statement-breakpoint
CREATE TABLE `product_objective` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` integer NOT NULL,
	`year` integer NOT NULL,
	`quarter` integer NOT NULL,
	`code` text NOT NULL,
	`title` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `project`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `project` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`workspace_id` integer NOT NULL,
	`name` text NOT NULL,
	`short_name` text,
	`levels` integer DEFAULT 2 NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspace`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `project_access` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`project_id` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `app_user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`project_id`) REFERENCES `project`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `roadmap_item` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`milestone_id` integer NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`priority` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'planned' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`milestone_id`) REFERENCES `milestone`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `rss_article` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`source_id` integer NOT NULL,
	`title` text NOT NULL,
	`url` text NOT NULL,
	`description` text,
	`content` text,
	`author` text,
	`published_at` integer,
	`fetched_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`source_id`) REFERENCES `rss_source`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `rss_source` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`workspace_id` integer NOT NULL,
	`name` text NOT NULL,
	`url` text NOT NULL,
	`category` text DEFAULT 'general' NOT NULL,
	`enabled` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspace`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `story` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`activity_id` integer NOT NULL,
	`task_id` integer,
	`code` text NOT NULL,
	`title` text NOT NULL,
	`pic` text DEFAULT '' NOT NULL,
	`pic_color` text DEFAULT '' NOT NULL,
	`done` integer DEFAULT false NOT NULL,
	`kano` text NOT NULL,
	`as_a` text,
	`want_to` text,
	`so_that` text,
	`pains` text DEFAULT '[]',
	`gains` text DEFAULT '[]',
	`details` text DEFAULT '[]',
	`checked_acs` text DEFAULT '[]',
	`assumptions` text DEFAULT '[]',
	`sort_order` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`activity_id`) REFERENCES `activity`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`task_id`) REFERENCES `story_map_task`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `story_map_task` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`activity_id` integer NOT NULL,
	`code` text NOT NULL,
	`title` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`activity_id`) REFERENCES `activity`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `trend_summary` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`workspace_id` integer NOT NULL,
	`date` text NOT NULL,
	`summary` text,
	`article_count` integer DEFAULT 0 NOT NULL,
	`generated_at` integer,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspace`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `workspace` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `workspace_access` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`workspace_id` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `app_user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspace`(`id`) ON UPDATE no action ON DELETE cascade
);
