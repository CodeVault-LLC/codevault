// Who may do what.
//
// Two roles rather than a permission matrix per user. At this team size an
// arbitrary matrix is a configuration surface nobody audits, whereas two named
// roles are a thing a person can hold in their head and reason about out loud.
// The capability list is the part worth being explicit about: it names the
// operations, so a new screen asks "which capability is this" rather than
// inventing its own check.
//
// Pure, and free of server imports, so the sidebar can hide what a role cannot
// reach while the server function refuses it independently. Those are two
// different jobs: this module informs the UI and decides on the server, but the
// UI's use of it is a courtesy — the server function's is the enforcement
// (design §7.6).

export const STAFF_ROLES = ["admin", "staff"] as const

export type StaffRole = (typeof STAFF_ROLES)[number]

export const CAPABILITIES = [
  // The dashboard's view of the archive — every record in every state,
  // including internal ones.
  "reports.read",
  // Deposit, and edit metadata before or after publication.
  "reports.write",
  "reports.publish",
  // Withdraw is reversible but consequential; restore can put something back
  // that was taken down deliberately, so it is held higher.
  "reports.withdraw",
  "reports.restore",
  // Discarding a draft. Only ever a draft — a published record is withdrawn,
  // never deleted (design §4.4).
  "reports.discard",

  "users.read",
  // Provision an account, change a role, disable or reinstate one.
  "users.write",
  // Issue enrollment tokens, revoke sessions, remove credentials.
  "users.credentials",

  "audit.read",
] as const

export type Capability = (typeof CAPABILITIES)[number]

/**
 * The grants, written out in full rather than as "staff plus extras".
 *
 * Spelling both roles out costs a few lines and buys the property that reading
 * one row tells you everything that role can do. A derived role — `staff`
 * inheriting from a base, `admin` spreading `staff` — reads as less code and
 * then quietly grants something the day a capability is added to the base.
 */
const GRANTS: Record<StaffRole, ReadonlySet<Capability>> = {
  admin: new Set(CAPABILITIES),
  staff: new Set<Capability>([
    "reports.read",
    "reports.write",
    "reports.publish",
    "reports.withdraw",
    "reports.discard",
  ]),
}

export function can(role: StaffRole, capability: Capability): boolean {
  return GRANTS[role].has(capability)
}

export const roleLabels: Record<StaffRole, string> = {
  admin: "Admin",
  staff: "Staff",
}

export const roleDescriptions: Record<StaffRole, string> = {
  admin:
    "Everything staff can do, plus managing accounts and reading the audit log.",
  staff: "Deposit, describe, publish and withdraw reports.",
}
