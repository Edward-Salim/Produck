CREATE TABLE "chinese_reading_story" (
	"id" serial PRIMARY KEY NOT NULL,
	"level" integer NOT NULL,
	"reading" jsonb NOT NULL,
	"model" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"used_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "chinese_reading_story_level_idx" ON "chinese_reading_story" ("level");
