DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'library_book' AND column_name = 'cover_zoom'
  ) THEN
    ALTER TABLE "library_book" ADD COLUMN "cover_zoom" double precision DEFAULT 1 NOT NULL;

    -- Preserve existing zooms once, without overwriting later database adjustments.
    UPDATE "library_book"
    SET "cover_zoom" = 1.025
    WHERE "id" IN (
      'user-story-mapping',
      'storytelling-with-data',
      'founders-dilemmas',
      'psychology-of-money',
      'art-of-spending-money',
      'atomic-habits',
      'lean-product-playbook',
      'good-strategy-bad-strategy',
      'never-split-the-difference',
      'measure-what-matters',
      'how-to-win-friends-and-influence-people',
      'paytech'
    );
  END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'library_book_cover_zoom_check'
      AND conrelid = 'library_book'::regclass
  ) THEN
    ALTER TABLE "library_book" ADD CONSTRAINT "library_book_cover_zoom_check" CHECK ("cover_zoom" BETWEEN 1 AND 2);
  END IF;
END $$;
