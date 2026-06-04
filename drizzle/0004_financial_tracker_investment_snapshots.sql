CREATE TABLE IF NOT EXISTS "financial_tracker_investment_snapshot" (
  "id" serial PRIMARY KEY NOT NULL,
  "owner_email" text NOT NULL,
  "snapshot_key" text NOT NULL,
  "label" text NOT NULL,
  "ticker" text,
  "balance" bigint NOT NULL,
  "cost_basis" bigint NOT NULL,
  "change" text NOT NULL,
  "direction" text NOT NULL,
  "latest_price_scaled" bigint,
  "latest_price_at" timestamp with time zone,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
