CREATE TYPE "staff_role" AS ENUM('admin', 'staff');--> statement-breakpoint
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
ALTER TABLE "user" ADD COLUMN "role" "staff_role" DEFAULT 'staff'::"staff_role" NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "disabled_at" timestamp with time zone;--> statement-breakpoint
CREATE INDEX "audit_log_occurred_at_idx" ON "audit_log" ("occurred_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "audit_log_actor_idx" ON "audit_log" ("actor_user_id");--> statement-breakpoint
CREATE INDEX "audit_log_action_idx" ON "audit_log" ("action");--> statement-breakpoint
CREATE INDEX "audit_log_target_idx" ON "audit_log" ("target_type","target_id");--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_actor_user_id_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "user"("id") ON DELETE SET NULL;--> statement-breakpoint
-- Hand-written backfill, not generated.
--
-- `role` defaults to 'staff' because the *lower* privilege is the safe default
-- for every future insert (schema/auth.ts). But the accounts that already exist
-- were provisioned before roles did, and at least one of them has to be able to
-- reach user management — otherwise applying this migration locks the archive's
-- only admin out of the screen that grants roles.
--
-- The oldest account is promoted, that being the one `admin:provision` created
-- first under its "create only if no admin exists" guard. Guarded on there
-- being no admin already, so re-running against a database that has one is a
-- no-op rather than a second promotion.
UPDATE "user" SET "role" = 'admin'
WHERE "id" = (SELECT "id" FROM "user" ORDER BY "created_at", "id" LIMIT 1)
  AND NOT EXISTS (SELECT 1 FROM "user" WHERE "role" = 'admin');
