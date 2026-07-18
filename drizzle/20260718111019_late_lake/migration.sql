CREATE TYPE "classification" AS ENUM('public', 'internal');--> statement-breakpoint
CREATE TYPE "dissemination" AS ENUM('document_and_metadata', 'metadata_only');--> statement-breakpoint
CREATE TYPE "doc_type" AS ENUM('report', 'memorandum', 'note', 'conference_paper', 'presentation', 'preprint', 'dataset', 'white_paper');--> statement-breakpoint
CREATE TYPE "report_status" AS ENUM('draft', 'in_review', 'published', 'withdrawn');--> statement-breakpoint
CREATE TYPE "technical_review_type" AS ENUM('none', 'internal', 'external', 'single_expert');--> statement-breakpoint
CREATE TABLE "accession_sequence" (
	"year" integer PRIMARY KEY,
	"last_value" integer DEFAULT 0 NOT NULL
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
	"status" "report_status" DEFAULT 'draft'::"report_status" NOT NULL,
	"classification" "classification",
	"dissemination" "dissemination" DEFAULT 'document_and_metadata'::"dissemination" NOT NULL,
	"discoverable" boolean DEFAULT true NOT NULL,
	"embargo_until" timestamp with time zone,
	"title" text DEFAULT '' NOT NULL,
	"abstract" text DEFAULT '' NOT NULL,
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
CREATE INDEX "report_files_report_id_idx" ON "report_files" ("report_id");--> statement-breakpoint
CREATE INDEX "reports_search_vector_idx" ON "reports" USING gin ("search_vector");--> statement-breakpoint
CREATE INDEX "reports_listing_idx" ON "reports" ("status","classification","published_at" DESC NULLS LAST);--> statement-breakpoint
CREATE UNIQUE INDEX "reports_checksum_idx" ON "reports" ("checksum") WHERE checksum is not null;--> statement-breakpoint
ALTER TABLE "report_files" ADD CONSTRAINT "report_files_report_id_reports_id_fkey" FOREIGN KEY ("report_id") REFERENCES "reports"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "report_relations" ADD CONSTRAINT "report_relations_from_id_reports_id_fkey" FOREIGN KEY ("from_id") REFERENCES "reports"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "report_relations" ADD CONSTRAINT "report_relations_to_id_reports_id_fkey" FOREIGN KEY ("to_id") REFERENCES "reports"("id") ON DELETE CASCADE;