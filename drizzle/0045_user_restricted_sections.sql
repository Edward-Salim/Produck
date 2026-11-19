ALTER TABLE "app_user"
  ADD COLUMN IF NOT EXISTS "restricted_sections" text[] DEFAULT '{}'::text[] NOT NULL;
