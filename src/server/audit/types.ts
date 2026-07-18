import type { AuditAction, AuditOutcome } from "@/core/audit/vocabulary"
import type { Classification } from "@/core/reports/types"

// The action and outcome vocabularies live in `@/core/audit/vocabulary`: the
// log's filter dropdown renders them in the browser, so they cannot sit under
// `server/`. Re-exported here so a server-side consumer has one import for the
// audit types.
export type { AuditAction, AuditOutcome }

export type AuditTargetType = "report" | "user" | "credential"

/**
 * What may go in an entry's `detail`.
 *
 * A closed JSON union rather than `Record<string, unknown>`. The column is
 * `jsonb`, the value is hashed into the chain, and the whole page is serialized
 * across the RPC boundary — three reasons the shape has to be something that
 * survives a round trip byte-for-byte. `unknown` typechecks and then puts a
 * `Date`, a `Buffer` or a class instance in the log, where it becomes `{}` and
 * the chain hash of a value nobody can reconstruct.
 */
export type JsonValue =
  string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }

export type AuditDetail = Record<string, JsonValue>

/** Who took the action. Resolved from the session, never from client input. */
export type AuditActor = {
  userId: string | null
  email: string | null
  /** Which passkey signed the session. Public identifier, never a secret. */
  credentialId?: string | null
  ip?: string | null
  userAgent?: string | null
}

export type AuditWrite = {
  actor: AuditActor
  action: AuditAction
  /** Defaults to "success" — a refusal has to say so explicitly. */
  outcome?: AuditOutcome
  targetType?: AuditTargetType
  targetId?: string | null
  /** How the target reads once its row is gone: accession ID, email, title. */
  targetLabel?: string | null
  classification?: Classification | null
  summary?: string
  detail?: AuditDetail
}

export type AuditEntry = {
  seq: number
  occurredAt: Date
  actorEmail: string | null
  actorCredentialId: string | null
  action: string
  outcome: string
  targetType: string | null
  targetId: string | null
  targetLabel: string | null
  classification: Classification | null
  summary: string
  detail: AuditDetail
  ip: string | null
  userAgent: string | null
}

export type AuditFilter = {
  action?: AuditAction
  actorUserId?: string
  targetId?: string
  outcome?: AuditOutcome
  limit: number
  offset: number
}

export type AuditPage = {
  entries: AuditEntry[]
  total: number
}

/**
 * The chain's verdict.
 *
 * `brokenAt` is the sequence number of the first row whose stored hash does not
 * match a recomputation. Everything after it is unverifiable too, so one number
 * is the whole answer rather than a list.
 */
export type ChainVerification = {
  ok: boolean
  checked: number
  brokenAt: number | null
}
