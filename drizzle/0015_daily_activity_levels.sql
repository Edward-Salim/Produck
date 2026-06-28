ALTER TABLE "daily_activity" ADD COLUMN IF NOT EXISTS "level" text DEFAULT 'Casual' NOT NULL;
