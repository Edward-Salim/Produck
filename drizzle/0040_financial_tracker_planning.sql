ALTER TABLE "financial_tracker_setting" ADD COLUMN IF NOT EXISTS "financial_plan" jsonb;
--> statement-breakpoint
ALTER TABLE "financial_tracker_ledger_entry" ADD COLUMN IF NOT EXISTS "status" text DEFAULT 'recorded' NOT NULL;
