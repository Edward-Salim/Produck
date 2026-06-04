ALTER TABLE "financial_tracker_investment"
  ADD COLUMN IF NOT EXISTS "ticker" text,
  ADD COLUMN IF NOT EXISTS "shares_scaled" bigint,
  ADD COLUMN IF NOT EXISTS "cost_basis" bigint,
  ADD COLUMN IF NOT EXISTS "currency" text NOT NULL DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS "latest_price_scaled" bigint,
  ADD COLUMN IF NOT EXISTS "latest_price_at" timestamp with time zone;
