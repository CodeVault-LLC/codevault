import {
  bigint,
  bytea,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core"

import type { AuditDetail } from "@/server/audit/types"
import { classificationEnum } from "./enums"
import { user } from "./auth"

/**
 * The append-only audit log (design §7.7).
 *
 * Two properties are what make this worth having over `console.log`:
 *
 * **It is hash-chained.** Each row stores `sha256(prev_hash || canonical(row))`,
 * so removing or altering an entry breaks every hash after it. That does not
 * make the log tamper-*proof* — anyone with write access to Postgres could
 * recompute the whole chain — but it makes tampering *detectable*, which is the
 * achievable property for a log that lives in the database it audits. Detecting
 * it is `verifyAuditChain`.
 *
 * **It never holds a secret.** No session tokens, no enrollment tokens, no
 * WebAuthn challenges, ever. `credentialId` is a public identifier and is
 * recorded deliberately: knowing *which* passkey acted is the difference
 * between "someone signed in as you" and "your work laptop signed in as you".
 *
 * Nothing here cascades on delete and nothing references a report. An audit
 * entry outlives its subject on purpose: "who deleted this and when" is
 * precisely the question that survives the thing being deleted, so the target
 * is recorded as a plain identifier plus a label rather than a foreign key.
 */
export const auditLog = pgTable(
  "audit_log",
  {
    // Sequence, not a UUID: the chain is an order, and the primary key should
    // say so. `generated always` means the application cannot choose one.
    seq: bigint("seq", { mode: "number" })
      .generatedAlwaysAsIdentity()
      .primaryKey(),

    occurredAt: timestamp("occurred_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    // Nullable, and `set null` rather than `cascade`: deleting an account must
    // not delete the record of what it did. The email below is what keeps the
    // row readable afterwards.
    actorUserId: text("actor_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    // Denormalized at write time. An audit row has to stay legible without a
    // join to a table whose row may be gone or renamed.
    actorEmail: text("actor_email"),
    // Which passkey signed the session that took this action.
    actorCredentialId: text("actor_credential_id"),

    action: text("action").notNull(),
    outcome: text("outcome").notNull(),

    // 'report' | 'user' | 'session' | 'credential'. Deliberately not a foreign
    // key — see above.
    targetType: text("target_type"),
    targetId: text("target_id"),
    // How the target should read in the log once its row no longer exists: an
    // accession ID, a title, an email.
    targetLabel: text("target_label"),

    // Recorded on report actions specifically. "Who published something
    // internal" is the question this column exists to make answerable without
    // reading the record it refers to (design §7.7).
    classification: classificationEnum("classification"),

    summary: text("summary").notNull().default(""),
    // Action-specific detail — a withdrawal reason, a role change's before and
    // after. Never credentials.
    detail: jsonb("detail").$type<AuditDetail>().notNull().default({}),

    ip: text("ip"),
    userAgent: text("user_agent"),

    // Null on the very first row, and only that one.
    prevHash: bytea("prev_hash"),
    hash: bytea("hash").notNull(),
  },
  (table) => [
    index("audit_log_occurred_at_idx").on(table.occurredAt.desc()),
    index("audit_log_actor_idx").on(table.actorUserId),
    index("audit_log_action_idx").on(table.action),
    index("audit_log_target_idx").on(table.targetType, table.targetId),
  ]
)
