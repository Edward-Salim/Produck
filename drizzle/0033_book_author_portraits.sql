ALTER TABLE "library_book" ADD COLUMN IF NOT EXISTS "author_portraits" jsonb DEFAULT '[]'::jsonb NOT NULL;
