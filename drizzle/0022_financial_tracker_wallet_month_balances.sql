ALTER TABLE "financial_tracker_wallet_month_status"
  ADD COLUMN IF NOT EXISTS "balance" bigint,
  ADD COLUMN IF NOT EXISTS "minimum_hold" bigint;
