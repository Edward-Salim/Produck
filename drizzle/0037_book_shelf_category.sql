ALTER TABLE "library_book" ADD COLUMN IF NOT EXISTS "shelf_category" text DEFAULT 'work' NOT NULL;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'library_book_shelf_category_check'
      AND conrelid = 'library_book'::regclass
  ) THEN
    ALTER TABLE "library_book" ADD CONSTRAINT "library_book_shelf_category_check" CHECK ("shelf_category" IN ('work', 'misc'));
  END IF;
END $$;
