// User-facing strings for the dashboard. Content lives in config
// (docs/code-rules.md); the components own structure and presentation.
//
// The voice is the same as everywhere else — plain, understated, never
// promotional — but the reader is different. An operator already knows what
// this tool does and is here to get something done, so the copy explains
// *consequences* rather than features. "Publishing allocates a permanent
// identifier" is worth a sentence; "manage your reports with ease" is not.

import type { AuditOutcome } from "@/core/audit/vocabulary"
import type { RelationType } from "@/core/reports/types"

export const adminReports = {
  title: "Reports",
  description:
    "Every record in the archive, in every state — drafts, published, withdrawn.",

  searchLabel: "Find a record",
  searchPlaceholder: "Title, accession ID or report number",

  empty: "Nothing here yet. Deposit a report to start the archive.",
  // Distinct from the above: an empty archive and an over-narrow filter are
  // different problems, and only one of them is the operator's to fix.
  emptyFiltered: "No records match these filters.",

  allStatuses: "All",
  clearFilters: "Clear filters",
} as const

export const adminRecord = {
  metadataTitle: "Metadata",
  metadataDescription:
    "Corrections are cheap and unceremonious by design — a typo that needs a workflow is a typo that does not get fixed. A published record still has to pass its own publish gate, so an edit that would break it is refused rather than quietly taking the record down.",

  cataloguingTitle: "Cataloguing",
  cataloguingDescription:
    "Editorial fields. Report numbers may repeat across revisions; the accession ID never does.",

  documentTitle: "Document",
  documentDescription:
    "Derived on ingest and never hand-entered. To attach different bytes, deposit a revision.",

  relationsTitle: "Related records",
  relationsDescription:
    "A revision is a separate record joined by a typed relation, not a new version of this row. Links are written in both directions, so the other record knows too.",
  relationsEmpty: "Nothing linked to this record yet.",
  relationTargetLabel: "Accession ID of the other record",
  relationTargetHelp:
    "A draft has no accession ID yet — paste its internal ID from the URL instead.",

  stateTitle: "State",

  withdrawTitle: "Withdraw this record?",
  withdrawDescription:
    "The record keeps its accession ID and its page, and the page becomes a tombstone so existing citations still resolve. The document stops being served, and the record leaves search, browse and the sitemap. It is not deleted, and the identifier is never reused.",
  withdrawReasonLabel: "Reason",
  withdrawReasonHelp:
    "Shown publicly on the tombstone. Someone arriving from a footnote reads this to find out what happened, so write it for them.",

  restoreTitle: "Reinstate this record?",
  restoreDescription:
    "The record goes back to published and its document is served again. The recorded withdrawal reason is cleared — the audit log is what remembers this happened.",

  reviseTitle: "Start a revision?",
  reviseDescription:
    "Creates a new draft with this record's description copied across, linked as its successor. The document does not carry over: a revision is a different document, and this one keeps its own record and its own citations exactly as they are.",
} as const

export const relationLabels: Record<RelationType, string> = {
  IsNewVersionOf: "Is a new version of",
  IsPreviousVersionOf: "Is a previous version of",
  Obsoletes: "Obsoletes",
  IsObsoletedBy: "Is obsoleted by",
  IsSupplementTo: "Supplements",
  References: "References",
}

/**
 * A relation's label, falling back to the raw DataCite term.
 *
 * `relation` is `text` in the database rather than an enum, because DataCite's
 * vocabulary grows and we would rather add a term than run a migration
 * (schema/report-relations.ts). So an unlabelled term is a real case, and
 * showing `IsSupplementedBy` beats showing an empty cell. The widened lookup is
 * what keeps that case visible to the type checker.
 */
export function relationLabel(relation: string): string {
  return (relationLabels as Record<string, string>)[relation] ?? relation
}

export const adminUsers = {
  title: "Accounts",
  description:
    "Who can sign in, what they can do, and which passkeys they hold.",

  empty: "No accounts yet.",

  // Column headings, kept here so the table and the passkey drawer agree on
  // what things are called.
  columns: {
    account: "Account",
    role: "Role",
    passkeys: "Passkeys",
    sessions: "Sessions",
    state: "State",
  },

  // What each state means, in one clause. The distinction that matters is the
  // last two: both are "cannot sign in", but only one of them is waiting on a
  // person rather than on an admin.
  stateLabels: {
    active: "Active",
    deactivated: "Deactivated",
    pending: "Awaiting enrollment",
    locked_out: "No way in",
  },
  stateHints: {
    active: "Holds at least one passkey and can sign in.",
    deactivated: "Cannot sign in. Sessions were revoked at deactivation.",
    pending: "An enrollment link is issued and waiting to be used.",
    locked_out:
      "No passkeys and no enrollment link outstanding. Issue one, or this account stays stuck.",
  },

  provisionTitle: "Provision an account",
  provisionDescription:
    "Creates the account with no credentials and returns a one-time enrollment link. Nothing secret is stored — only a hash of the link.",

  // The instruction that matters most on the whole screen.
  tokenDelivery:
    "Copy this now — it is shown once and cannot be retrieved. Deliver it out of band, in person or over Signal. Never send it to the email address it signs in.",

  credentialsTitle: "Passkeys",
  credentialsDescription:
    "Two credentials on different failure domains — one synced, one hardware key — is the recovery design. Removing the last one is allowed: a stolen device is exactly when you need to, and the way back in is a link from another admin.",
  credentialsEmpty: "This account holds no passkeys.",

  singleCredentialWarning:
    "One passkey and no backup. If it is lost, this account needs another admin to issue an enrollment link.",
  noCredentialsWarning:
    "No passkeys. This account cannot sign in until it enrolls one.",
  pendingEnrollment: "An enrollment link is issued and waiting to be used.",

  selfEnrollmentRefused:
    "An enrollment link has to be issued by a different admin. Recover your own access with `bun run admin:provision --reissue`, which needs shell access to the host.",
  lastAdminRefused:
    "This is the only active admin. Promote someone else first, or the archive locks itself out of this screen.",
  selfRefused: "You cannot change your own role or deactivate yourself.",
} as const

export const adminAudit = {
  title: "Audit log",
  description:
    "Append-only, and hash-chained so an edit to it is detectable. Never records a session token, an enrollment token, or a WebAuthn challenge.",

  chainOk: "Hash chain verified.",
  chainBroken:
    "The hash chain does not verify. An entry has been altered or removed.",

  empty: "Nothing recorded yet.",
  emptyFiltered: "No entries match these filters.",

  allActions: "All actions",
  allOutcomes: "Any outcome",
} as const

export const auditOutcomeLabels: Record<AuditOutcome, string> = {
  success: "Succeeded",
  failure: "Refused",
}
