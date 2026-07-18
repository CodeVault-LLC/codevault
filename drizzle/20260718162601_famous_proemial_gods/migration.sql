-- Postgres marks array_to_string() STABLE, not IMMUTABLE, because in general it
-- depends on the element type's output function. A stored generated column may
-- only call IMMUTABLE functions, so using it directly in the reports
-- search_vector expression fails with "generation expression is not immutable".
--
-- For text[] specifically the operation genuinely is immutable, so wrap it and
-- say so. This must exist before the reports table that depends on it.
CREATE OR REPLACE FUNCTION immutable_array_to_string(arr text[], sep text)
RETURNS text
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
AS $$
  SELECT array_to_string(coalesce(arr, '{}'::text[]), sep)
$$;
--> statement-breakpoint
CREATE TYPE "classification" AS ENUM('public', 'internal');--> statement-breakpoint
CREATE TYPE "dissemination" AS ENUM('document_and_metadata', 'metadata_only');--> statement-breakpoint
CREATE TYPE "doc_type" AS ENUM('report', 'memorandum', 'note', 'conference_paper', 'presentation', 'preprint', 'dataset', 'white_paper');--> statement-breakpoint
CREATE TYPE "report_status" AS ENUM('draft', 'in_review', 'published', 'withdrawn');--> statement-breakpoint
CREATE TYPE "staff_role" AS ENUM('admin', 'staff');--> statement-breakpoint
CREATE TYPE "technical_review_type" AS ENUM('none', 'internal', 'external', 'single_expert');--> statement-breakpoint
CREATE TABLE "accession_sequence" (
	"year" integer PRIMARY KEY,
	"last_value" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"seq" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "audit_log_seq_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	"actor_user_id" text,
	"actor_email" text,
	"actor_credential_id" text,
	"action" text NOT NULL,
	"outcome" text NOT NULL,
	"target_type" text,
	"target_id" text,
	"target_label" text,
	"classification" "classification",
	"summary" text DEFAULT '' NOT NULL,
	"detail" jsonb DEFAULT '{}' NOT NULL,
	"ip" text,
	"user_agent" text,
	"prev_hash" bytea,
	"hash" bytea NOT NULL
);
--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "enrollment_token" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" text NOT NULL,
	"token_hash" bytea NOT NULL UNIQUE,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"issued_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "passkey" (
	"id" text PRIMARY KEY,
	"name" text,
	"public_key" text NOT NULL,
	"user_id" text NOT NULL,
	"credential_id" text NOT NULL,
	"counter" integer NOT NULL,
	"device_type" text NOT NULL,
	"backed_up" boolean NOT NULL,
	"transports" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"aaguid" text
);
--> statement-breakpoint
CREATE TABLE "rate_limit" (
	"id" text PRIMARY KEY,
	"key" text NOT NULL UNIQUE,
	"count" integer NOT NULL,
	"last_request" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY,
	"expires_at" timestamp with time zone NOT NULL,
	"token" text NOT NULL UNIQUE,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"email" text NOT NULL UNIQUE,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"role" "staff_role" DEFAULT 'staff'::"staff_role" NOT NULL,
	"disabled_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "report_files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"report_id" uuid NOT NULL,
	"kind" text NOT NULL,
	"bucket" text NOT NULL,
	"key" text NOT NULL,
	"byte_size" bigint NOT NULL,
	"checksum" bytea NOT NULL,
	"embargo_until" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "report_relations" (
	"from_id" uuid,
	"to_id" uuid,
	"relation" text,
	CONSTRAINT "report_relations_pkey" PRIMARY KEY("from_id","to_id","relation")
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"accession_id" text UNIQUE,
	"requested_accession_id" text UNIQUE,
	"status" "report_status" DEFAULT 'draft'::"report_status" NOT NULL,
	"classification" "classification",
	"dissemination" "dissemination" DEFAULT 'document_and_metadata'::"dissemination" NOT NULL,
	"discoverable" boolean DEFAULT true NOT NULL,
	"embargo_until" timestamp with time zone,
	"title" text DEFAULT '' NOT NULL,
	"abstract" text DEFAULT '' NOT NULL,
	"abstract_override_reason" text,
	"authors" jsonb DEFAULT '[]' NOT NULL,
	"doc_type" "doc_type" DEFAULT 'report'::"doc_type" NOT NULL,
	"technical_review_type" "technical_review_type" DEFAULT 'none'::"technical_review_type" NOT NULL,
	"project_slug" text,
	"subject_category" text,
	"keywords" text[] DEFAULT '{}'::text[] NOT NULL,
	"report_numbers" text[] DEFAULT '{}'::text[] NOT NULL,
	"license" text,
	"funding" jsonb DEFAULT '[]' NOT NULL,
	"doi" text UNIQUE,
	"pdf_key" text,
	"thumb_key" text,
	"page_count" integer,
	"file_size" bigint,
	"checksum" bytea,
	"fulltext" text,
	"pdf_embedded_title" text,
	"published_at" date,
	"withdrawn_at" timestamp with time zone,
	"withdrawn_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"search_vector" tsvector GENERATED ALWAYS AS (
        setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(abstract, '')), 'B') ||
        setweight(to_tsvector('english', immutable_array_to_string(keywords, ' ')), 'C') ||
        setweight(to_tsvector('english', coalesce(fulltext, '')), 'D')
      ) STORED
);
--> statement-breakpoint
CREATE TABLE "subject_categories" (
	"slug" text PRIMARY KEY,
	"name" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"position" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE INDEX "audit_log_occurred_at_idx" ON "audit_log" ("occurred_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "audit_log_actor_idx" ON "audit_log" ("actor_user_id");--> statement-breakpoint
CREATE INDEX "audit_log_action_idx" ON "audit_log" ("action");--> statement-breakpoint
CREATE INDEX "audit_log_target_idx" ON "audit_log" ("target_type","target_id");--> statement-breakpoint
CREATE INDEX "account_user_id_idx" ON "account" ("user_id");--> statement-breakpoint
CREATE INDEX "enrollment_token_user_id_idx" ON "enrollment_token" ("user_id");--> statement-breakpoint
CREATE INDEX "passkey_user_id_idx" ON "passkey" ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "passkey_credential_id_idx" ON "passkey" ("credential_id");--> statement-breakpoint
CREATE INDEX "session_user_id_idx" ON "session" ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" ("identifier");--> statement-breakpoint
CREATE INDEX "report_files_report_id_idx" ON "report_files" ("report_id");--> statement-breakpoint
CREATE INDEX "reports_search_vector_idx" ON "reports" USING gin ("search_vector");--> statement-breakpoint
CREATE INDEX "reports_listing_idx" ON "reports" ("status","classification","published_at" DESC NULLS LAST);--> statement-breakpoint
CREATE UNIQUE INDEX "reports_checksum_idx" ON "reports" ("checksum") WHERE checksum is not null;--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_actor_user_id_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "user"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "enrollment_token" ADD CONSTRAINT "enrollment_token_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "passkey" ADD CONSTRAINT "passkey_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "report_files" ADD CONSTRAINT "report_files_report_id_reports_id_fkey" FOREIGN KEY ("report_id") REFERENCES "reports"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "report_relations" ADD CONSTRAINT "report_relations_from_id_reports_id_fkey" FOREIGN KEY ("from_id") REFERENCES "reports"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "report_relations" ADD CONSTRAINT "report_relations_to_id_reports_id_fkey" FOREIGN KEY ("to_id") REFERENCES "reports"("id") ON DELETE CASCADE;