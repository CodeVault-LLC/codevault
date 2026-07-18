// The audit log's controlled vocabularies.
//
// In `core` rather than beside the audit module in `server` for the same reason
// the report vocabularies are: the dashboard's filter dropdown renders these in
// the browser, so a `server/` import would drag server code into the client
// bundle to read two arrays of strings.

/**
 * Every auditable action, named once.
 *
 * A closed union rather than free-form strings. The log's filter needs to know
 * what can appear in it, and deriving that from `select distinct action` would
 * only ever offer actions that have already happened — so a filter for
 * something rare is missing precisely when you need it. A mistyped literal is
 * also a filter option matching nothing and a row nobody can find again.
 */
export const AUDIT_ACTIONS = [
  "report.publish",
  "report.update",
  "report.withdraw",
  "report.restore",
  "report.discard",
  "report.relation.add",
  "report.relation.remove",
  "report.revise",

  "user.provision",
  "user.role.change",
  "user.disable",
  "user.enable",
  "user.enrollment.issue",
  "user.sessions.revoke",
  "user.credential.revoke",
] as const

export type AuditAction = (typeof AUDIT_ACTIONS)[number]

export const AUDIT_OUTCOMES = ["success", "failure"] as const

export type AuditOutcome = (typeof AUDIT_OUTCOMES)[number]

/**
 * What each action reads as in the log.
 *
 * Past tense and plain: the log is a list of things that happened, and a row
 * that says "Publish" makes the reader do the tense conversion on every line.
 */
export const auditActionLabels: Record<AuditAction, string> = {
  "report.publish": "Published a report",
  "report.update": "Edited metadata",
  "report.withdraw": "Withdrew a report",
  "report.restore": "Reinstated a report",
  "report.discard": "Discarded a draft",
  "report.relation.add": "Linked two records",
  "report.relation.remove": "Unlinked two records",
  "report.revise": "Started a revision",

  "user.provision": "Provisioned an account",
  "user.role.change": "Changed a role",
  "user.disable": "Deactivated an account",
  "user.enable": "Reinstated an account",
  "user.enrollment.issue": "Issued an enrollment link",
  "user.sessions.revoke": "Revoked sessions",
  "user.credential.revoke": "Removed a passkey",
}

/**
 * An action's label, falling back to the raw string.
 *
 * The fallback is not defensive padding: `action` comes back from the database
 * as plain text, so a row written by a version that knew an action this one
 * does not is a real possibility — the log is append-only and outlives the code
 * that wrote it. Showing `report.embargo.lift` is more use than showing
 * nothing. The lookup is widened deliberately, because indexing the `Record`
 * directly would type the result as always-present and hide exactly that case.
 */
export function auditActionLabel(action: string): string {
  return (auditActionLabels as Record<string, string>)[action] ?? action
}
