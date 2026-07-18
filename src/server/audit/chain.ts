import { createHash } from "node:crypto"

import type { AuditLogRow } from "@/server/db/types"

// The hash chain's arithmetic, kept apart from the database so it can be tested
// against hand-built rows and so `verifyAuditChain` and `recordAudit` are
// provably running the same function rather than two that agree by inspection.

/** Exactly the columns the hash covers, in the order it covers them. */
export type ChainableEntry = Pick<
  AuditLogRow,
  | "occurredAt"
  | "actorUserId"
  | "actorEmail"
  | "actorCredentialId"
  | "action"
  | "outcome"
  | "targetType"
  | "targetId"
  | "targetLabel"
  | "classification"
  | "summary"
  | "detail"
  | "ip"
  | "userAgent"
>

/**
 * JSON with object keys sorted, recursively.
 *
 * This is load-bearing rather than tidiness. `detail` is a `jsonb` column, and
 * Postgres does not preserve key order in jsonb — it stores keys in its own
 * order and hands them back that way. So hashing `JSON.stringify(detail)` at
 * write time and again at verify time would compare a hash of the order the
 * application happened to build the object in against a hash of the order
 * Postgres chose, and the chain would read as broken on rows nobody touched.
 *
 * Sorting at both ends makes the two identical by construction.
 */
function canonicalize(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value)

  if (Array.isArray(value)) {
    // Array order is meaningful and is preserved by jsonb, so it is kept.
    return `[${value.map(canonicalize).join(",")}]`
  }

  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, item]) => item !== undefined)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([key, item]) => `${JSON.stringify(key)}:${canonicalize(item)}`)

  return `{${entries.join(",")}}`
}

/**
 * The bytes an entry hashes as.
 *
 * `seq` is deliberately absent. It is `generated always as identity`, so it
 * does not exist until the insert returns — and the chain does not need it,
 * because the ordering it asserts is carried by `prev_hash` pointing at the
 * row before. Including it would mean either a second UPDATE to fix the hash
 * up or hashing a value the writer had to guess.
 */
function serialize(entry: ChainableEntry): string {
  return canonicalize({
    occurredAt: entry.occurredAt.toISOString(),
    actorUserId: entry.actorUserId,
    actorEmail: entry.actorEmail,
    actorCredentialId: entry.actorCredentialId,
    action: entry.action,
    outcome: entry.outcome,
    targetType: entry.targetType,
    targetId: entry.targetId,
    targetLabel: entry.targetLabel,
    classification: entry.classification,
    summary: entry.summary,
    detail: entry.detail,
    ip: entry.ip,
    userAgent: entry.userAgent,
  })
}

/**
 * `sha256(prev_hash || row)` (design §7.7).
 *
 * The previous hash is folded in first, so altering any row invalidates every
 * hash after it rather than just its own. `prev` is null on the first row and
 * only that one, which is what anchors the chain.
 *
 * This makes tampering *detectable*, not impossible: anyone who can write to
 * this table can also recompute the chain. That is the honest property for a
 * log stored in the database it audits, and it is still the difference between
 * a quiet edit and one that requires deliberate effort across every later row.
 */
export function chainHash(entry: ChainableEntry, prev: Uint8Array | null) {
  const digest = createHash("sha256")
  if (prev) digest.update(prev)
  digest.update(serialize(entry), "utf8")
  return digest.digest()
}
