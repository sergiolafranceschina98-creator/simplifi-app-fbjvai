CREATE TABLE "analyses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"image_url" text NOT NULL,
	"extracted_text" text,
	"hidden_risks" jsonb,
	"money_traps" jsonb,
	"auto_renew_traps" jsonb,
	"dangerous_clauses" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
