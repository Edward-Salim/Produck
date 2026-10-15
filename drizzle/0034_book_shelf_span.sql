ALTER TABLE "library_book" ADD COLUMN IF NOT EXISTS "shelf_span" integer DEFAULT 1 NOT NULL;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'library_book_shelf_span_check'
      AND conrelid = 'library_book'::regclass
  ) THEN
    ALTER TABLE "library_book" ADD CONSTRAINT "library_book_shelf_span_check" CHECK ("shelf_span" IN (1, 2));
  END IF;
END $$;
