CREATE TABLE IF NOT EXISTS "financial_tracker_forecast_preference" (
  "id" serial PRIMARY KEY NOT NULL,
  "owner_email" text NOT NULL,
  "forecast_mode" text DEFAULT 'optimistic' NOT NULL,
  "return_profile" text DEFAULT 'vti' NOT NULL,
  "investment_currency" text DEFAULT 'idr' NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "financial_tracker_forecast_override" (
  "id" serial PRIMARY KEY NOT NULL,
  "owner_email" text NOT NULL,
  "relative_year" integer NOT NULL,
  "month_index" integer,
  "salary" bigint,
  "investment_contribution_rate_bps" integer,
  "extra_monthly_investment" bigint,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
