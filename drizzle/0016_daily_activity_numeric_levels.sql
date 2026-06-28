ALTER TABLE "daily_activity" ALTER COLUMN "level" DROP DEFAULT;
--> statement-breakpoint
ALTER TABLE "daily_activity"
ALTER COLUMN "level" TYPE integer USING (
  CASE "level"
    WHEN 'Beginner' THEN 1
    WHEN 'Easy' THEN 2
    WHEN 'Casual' THEN 2
    WHEN 'Comfortable' THEN 3
    WHEN 'Good' THEN 4
    WHEN 'Very good' THEN 5
    ELSE 2
  END
);
--> statement-breakpoint
ALTER TABLE "daily_activity" ALTER COLUMN "level" SET DEFAULT 2;
--> statement-breakpoint
ALTER TABLE "daily_activity"
ADD CONSTRAINT "daily_activity_level_range" CHECK ("level" >= 1 AND "level" <= 5);
