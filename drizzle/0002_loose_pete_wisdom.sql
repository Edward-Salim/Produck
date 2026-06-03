ALTER TABLE "financial_tracker_budget_category"
  ADD COLUMN IF NOT EXISTS "allocation_share" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "financial_tracker_setting" (
  "id" serial PRIMARY KEY NOT NULL,
  "owner_email" text NOT NULL,
  "monthly_allocation" bigint DEFAULT 3000000 NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
UPDATE "financial_tracker_budget_category"
SET "allocation_share" = CASE "label"
  WHEN 'Meals' THEN 50
  WHEN 'Household Supplies' THEN 8
  WHEN 'Transportation' THEN 10
  WHEN 'Utilities' THEN 8
  WHEN 'Mobile Data' THEN 2
  WHEN 'Subscriptions' THEN 2
  WHEN 'Personal Care' THEN 4
  WHEN 'Health' THEN 3
  WHEN 'Learning' THEN 5
  WHEN 'Admin' THEN 3
  WHEN 'One-off' THEN 5
  WHEN 'Reimbursements' THEN 0
  WHEN '?' THEN 0
  ELSE "allocation_share"
END;
--> statement-breakpoint
INSERT INTO "financial_tracker_setting" ("owner_email", "monthly_allocation")
SELECT DISTINCT "owner_email", 3000000
FROM "financial_tracker_budget_category"
WHERE NOT EXISTS (
  SELECT 1
  FROM "financial_tracker_setting"
  WHERE "financial_tracker_setting"."owner_email" = "financial_tracker_budget_category"."owner_email"
);
