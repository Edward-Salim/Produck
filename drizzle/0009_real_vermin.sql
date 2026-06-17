CREATE TABLE "framework_instance" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"template_id" text NOT NULL,
	"title" text NOT NULL,
	"values" jsonb DEFAULT '{}'::jsonb,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" text
);
--> statement-breakpoint
CREATE TABLE "kanban_activity" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"card_id" integer NOT NULL,
	"card_title" text NOT NULL,
	"action" text NOT NULL,
	"from_value" text,
	"to_value" text NOT NULL,
	"actor" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "financial_tracker_investment" ADD COLUMN "dividend_yield_bps" integer;--> statement-breakpoint
ALTER TABLE "kanban_card" ADD COLUMN "block_reason" text;--> statement-breakpoint
ALTER TABLE "kanban_card" ADD COLUMN "blocked_by" text;--> statement-breakpoint
ALTER TABLE "rss_article" ADD COLUMN "image_url" text;--> statement-breakpoint
ALTER TABLE "framework_instance" ADD CONSTRAINT "framework_instance_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kanban_activity" ADD CONSTRAINT "kanban_activity_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;