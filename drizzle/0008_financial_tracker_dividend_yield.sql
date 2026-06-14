ALTER TABLE "financial_tracker_investment"
ADD COLUMN IF NOT EXISTS "dividend_yield_bps" integer;
