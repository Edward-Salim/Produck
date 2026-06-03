CREATE TABLE IF NOT EXISTS "financial_tracker_budget_category" (
  "id" serial PRIMARY KEY NOT NULL,
  "owner_email" text NOT NULL,
  "label" text NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "financial_tracker_monthly_summary" (
  "id" serial PRIMARY KEY NOT NULL,
  "owner_email" text NOT NULL,
  "month_key" text NOT NULL,
  "label" text NOT NULL,
  "period" text NOT NULL,
  "updated" text NOT NULL,
  "rollover_planned" bigint NOT NULL,
  "rollover_actual" bigint NOT NULL,
  "income_planned" bigint NOT NULL,
  "income_actual" bigint NOT NULL,
  "expenses_planned" bigint NOT NULL,
  "expenses_actual" bigint NOT NULL,
  "bills_planned" bigint NOT NULL,
  "bills_actual" bigint NOT NULL,
  "savings_planned" bigint NOT NULL,
  "savings_actual" bigint NOT NULL,
  "debt_planned" bigint NOT NULL,
  "debt_actual" bigint NOT NULL,
  "leftover_planned" bigint NOT NULL,
  "leftover_actual" bigint NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "financial_tracker_category_row" (
  "id" serial PRIMARY KEY NOT NULL,
  "owner_email" text NOT NULL,
  "month_key" text NOT NULL,
  "section" text NOT NULL,
  "label" text NOT NULL,
  "planned" bigint NOT NULL,
  "actual" bigint NOT NULL,
  "due" text,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "financial_tracker_wallet" (
  "id" serial PRIMARY KEY NOT NULL,
  "owner_email" text NOT NULL,
  "label" text NOT NULL,
  "balance" bigint NOT NULL,
  "minimum_hold" bigint,
  "account_number" text,
  "balance_provided" boolean,
  "transactions_provided" boolean,
  "note" text,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "financial_tracker_investment" (
  "id" serial PRIMARY KEY NOT NULL,
  "owner_email" text NOT NULL,
  "label" text NOT NULL,
  "balance" bigint NOT NULL,
  "change" text NOT NULL,
  "direction" text NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "financial_tracker_debt_schedule" (
  "id" serial PRIMARY KEY NOT NULL,
  "owner_email" text NOT NULL,
  "provider" text NOT NULL,
  "due" text NOT NULL,
  "amount" bigint NOT NULL,
  "status" text NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "financial_tracker_ledger_month" (
  "id" serial PRIMARY KEY NOT NULL,
  "owner_email" text NOT NULL,
  "month_key" text NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "financial_tracker_ledger_entry" (
  "id" serial PRIMARY KEY NOT NULL,
  "owner_email" text NOT NULL,
  "entry_id" text NOT NULL,
  "month_key" text NOT NULL,
  "date" text NOT NULL,
  "description" text NOT NULL,
  "kind" text NOT NULL,
  "category" text NOT NULL,
  "amount" bigint NOT NULL,
  "from_account" text,
  "to_account" text,
  "payment_type" text NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "financial_tracker_expense_detail" (
  "id" serial PRIMARY KEY NOT NULL,
  "owner_email" text NOT NULL,
  "month_key" text NOT NULL,
  "category" text NOT NULL,
  "item" text NOT NULL,
  "price" bigint NOT NULL,
  "planned_qty" integer NOT NULL,
  "actual_qty" integer NOT NULL,
  "planned_amount" bigint NOT NULL,
  "actual_amount" bigint NOT NULL,
  "payment_method" text,
  "payment_type" text,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "financial_tracker_investment_forecast" (
  "id" serial PRIMARY KEY NOT NULL,
  "owner_email" text NOT NULL,
  "year" integer NOT NULL,
  "optimistic" bigint NOT NULL,
  "pessimist" bigint NOT NULL,
  "salary" bigint NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
