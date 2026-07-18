import { and, count, desc, eq, sql } from "drizzle-orm"
import type { SQL } from "drizzle-orm"

import type {
  AuditEntry,
  AuditFilter,
  AuditPage,
  AuditWrite,
  ChainVerification,
} from "./types"
import type { ChainableEntry } from "./chain"
import { auditLog } from "@/server/db/schema"
import { chainHash } from "./chain"
import { db } from "@/server/db/client"

// The append-only log (design §7.7). Reads and writes; nothing here updates or
// deletes a row, and nothing ever should — the chain's whole claim is that the
// application only ever appends.

/**
 * Advisory lock key for the chain's tail.
 *
 * Two concurrent writers would otherwise both read the same last hash and both
 * link to it, producing a fork: two rows claiming the same predecessor, and a
 * verification pass that fails on a log nobody tampered with. A transaction-
 * scoped advisory lock serializes exactly the read-tail-then-append window and
 * releases on commit or rollback without a cleanup path.
 *
 * The number is arbitrary but must be stable — it names this lock and no other.
 */
const CHAIN_LOCK_KEY = 0x0a0d17_10

/**
 * Appends one entry.
 *
 * Never throws. This is called from inside operations that have already
 * happened — a report is published, a role is changed — and a logging failure
 * must not roll back or appear to fail work that genuinely succeeded. A
 * swallowed error here is the lesser harm; the greater one is a publish that
 * reports failure because its audit row would not write.
 *
 * The cost of that choice is that the log can have gaps under failure, which is
 * why the chain hashes what it does: a gap is invisible, but an *edit* is not.
 */
export async function recordAudit(entry: AuditWrite): Promise<void> {
  try {
    await db.transaction(async (tx) => {
      await tx.execute(sql`select pg_advisory_xact_lock(${CHAIN_LOCK_KEY})`)

      const tail = await tx
        .select({ hash: auditLog.hash })
        .from(auditLog)
        .orderBy(desc(auditLog.seq))
        .limit(1)

      const prevHash = tail.length === 0 ? null : tail[0].hash

      // Stamped here rather than by `default now()`, because the hash covers
      // this value and the writer has to know it before the insert.
      const row: ChainableEntry = {
        occurredAt: new Date(),
        actorUserId: entry.actor.userId,
        actorEmail: entry.actor.email,
        actorCredentialId: entry.actor.credentialId ?? null,
        action: entry.action,
        outcome: entry.outcome ?? "success",
        targetType: entry.targetType ?? null,
        targetId: entry.targetId ?? null,
        targetLabel: entry.targetLabel ?? null,
        classification: entry.classification ?? null,
        summary: entry.summary ?? "",
        detail: entry.detail ?? {},
        ip: entry.actor.ip ?? null,
        userAgent: entry.actor.userAgent ?? null,
      }

      await tx.insert(auditLog).values({
        ...row,
        prevHash,
        hash: chainHash(row, prevHash),
      })
    })
  } catch (error) {
    // Deliberately to stderr and no further. There is no user-facing surface
    // for this and nothing the caller could usefully do about it.
    console.error("audit: failed to append an entry", error)
  }
}

function filterWhere(filter: AuditFilter): SQL | undefined {
  const predicates: SQL[] = []

  if (filter.action) predicates.push(eq(auditLog.action, filter.action))
  if (filter.outcome) predicates.push(eq(auditLog.outcome, filter.outcome))
  if (filter.actorUserId) {
    predicates.push(eq(auditLog.actorUserId, filter.actorUserId))
  }
  if (filter.targetId) predicates.push(eq(auditLog.targetId, filter.targetId))

  return predicates.length === 0 ? undefined : and(...predicates)
}

/**
 * One page of the log, newest first, with the total for pagination.
 *
 * `prev_hash` and `hash` are not selected. They are 32 raw bytes apiece that
 * mean nothing to a reader, and the question they answer — "has this been
 * tampered with" — is answered by `verifyAuditChain` as one verdict rather than
 * by printing digests nobody will compare by eye.
 */
export async function listAudit(filter: AuditFilter): Promise<AuditPage> {
  const where = filterWhere(filter)

  const [entries, totals] = await Promise.all([
    db
      .select({
        seq: auditLog.seq,
        occurredAt: auditLog.occurredAt,
        actorEmail: auditLog.actorEmail,
        actorCredentialId: auditLog.actorCredentialId,
        action: auditLog.action,
        outcome: auditLog.outcome,
        targetType: auditLog.targetType,
        targetId: auditLog.targetId,
        targetLabel: auditLog.targetLabel,
        classification: auditLog.classification,
        summary: auditLog.summary,
        detail: auditLog.detail,
        ip: auditLog.ip,
        userAgent: auditLog.userAgent,
      })
      .from(auditLog)
      .where(where)
      .orderBy(desc(auditLog.seq))
      .limit(filter.limit)
      .offset(filter.offset),
    db.select({ total: count() }).from(auditLog).where(where),
  ])

  return {
    entries: entries satisfies AuditEntry[],
    total: totals[0]?.total ?? 0,
  }
}

/**
 * How much of the chain one verification pass covers.
 *
 * Bounded because verification reads every column of every row it checks and
 * has to hold the previous hash to check the next — it cannot be done in SQL
 * and it cannot skip. At this scale the whole log fits comfortably; the limit
 * exists so that a log which has grown past that does not turn a page load into
 * a full table scan, and the count returned says how much was actually checked.
 */
const VERIFY_LIMIT = 5000

/**
 * Recomputes the chain and reports the first row that does not match.
 *
 * Walks forward from the beginning, because a chain can only be verified in the
 * direction it was built: each row's hash depends on the one before it, so the
 * first mismatch invalidates everything after and is the only interesting
 * number.
 */
export async function verifyAuditChain(): Promise<ChainVerification> {
  const rows = await db
    .select()
    .from(auditLog)
    .orderBy(auditLog.seq)
    .limit(VERIFY_LIMIT)

  let prev: Uint8Array | null = null

  for (const row of rows) {
    const expected = chainHash(row, prev)

    // Compared as hex rather than byte-by-byte: the driver may hand back a
    // Buffer or a Uint8Array depending on the column, and hex is one
    // comparison that is right for both.
    const matches =
      Buffer.from(expected).toString("hex") ===
      Buffer.from(row.hash).toString("hex")

    if (!matches) {
      return { ok: false, checked: rows.length, brokenAt: row.seq }
    }

    prev = row.hash
  }

  return { ok: true, checked: rows.length, brokenAt: null }
}
