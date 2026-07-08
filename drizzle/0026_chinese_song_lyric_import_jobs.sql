CREATE TABLE "chinese_song_lyric_import_job" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"status" text DEFAULT 'queued' NOT NULL,
	"raw_song" text NOT NULL,
	"song_slug" text,
	"error" text,
	"model" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "chinese_song_lyric_import_job" ADD CONSTRAINT "chinese_song_lyric_import_job_user_id_app_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_user"("id") ON DELETE cascade ON UPDATE no action;
