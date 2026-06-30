CREATE TABLE "application_cover_letter_job" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" integer NOT NULL,
  "status" text DEFAULT 'queued' NOT NULL,
  "dump" text NOT NULL,
  "result" jsonb,
  "error" text,
  "model" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "application_cover_letter_job"
ADD CONSTRAINT "application_cover_letter_job_user_id_app_user_id_fk"
FOREIGN KEY ("user_id") REFERENCES "public"."app_user"("id")
ON DELETE cascade ON UPDATE no action;
