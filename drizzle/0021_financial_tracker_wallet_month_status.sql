CREATE TABLE IF NOT EXISTS "financial_tracker_wallet_month_status" (
  "id" serial PRIMARY KEY NOT NULL,
  "owner_email" text NOT NULL,
  "month_key" text NOT NULL,
  "wallet_label" text NOT NULL,
  "balance_provided" boolean DEFAULT false NOT NULL,
  "transactions_provided" boolean DEFAULT false NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "financial_tracker_wallet_month_status_unique"
  ON "financial_tracker_wallet_month_status" ("owner_email", "month_key", "wallet_label");
