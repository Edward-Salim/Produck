ALTER TABLE "story"
  ADD COLUMN IF NOT EXISTS "field_notes" jsonb DEFAULT '[]'::jsonb NOT NULL;
