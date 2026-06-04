ALTER TABLE "financial_tracker_forecast_preference"
ADD COLUMN IF NOT EXISTS "retirement_age" integer DEFAULT 40 NOT NULL;
