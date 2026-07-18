import type { StaffRole } from "@/core/auth/permissions"

/**
 * One passkey, as the accounts screen renders it.
 *
 * `deviceType` and `backedUp` are the WebAuthn BE/BS flags, and they are shown
 * rather than hidden because they are what "at least one hardware key" is
 * enforced by — a policy read off stored flags instead of FIDO MDS machinery
 * (design §7.2). A row that says "synced, backed up" versus one that says
 * "device-bound" is the difference the recovery design turns on.
 *
 * The public key is not here and never will be. It is not a secret, but it is
 * also not information anyone operating this dashboard can act on.
 */
export type CredentialSummary = {
  id: string
  name: string | null
  /** "singleDevice" | "multiDevice", straight from the authenticator. */
  deviceType: string
  backedUp: boolean
  createdAt: Date | null
}

export type StaffAccount = {
  id: string
  name: string
  email: string
  role: StaffRole
  /** Null when active. A timestamp, so "since when" is answerable. */
  disabledAt: Date | null
  createdAt: Date
  credentials: CredentialSummary[]
  /** Live sessions. The number the "revoke sessions" button acts on. */
  activeSessions: number
  /**
   * An unredeemed, unexpired enrollment link exists for this account.
   *
   * Worth surfacing: an account showing zero credentials *and* no pending link
   * cannot get in at all and needs one issued, whereas one with a link pending
   * is simply waiting on a person.
   */
  hasPendingEnrollment: boolean
}

/**
 * Why an account action was refused.
 *
 * All four are lockout guards rather than authorization failures — the caller
 * had the capability, and the system declined anyway because the action would
 * have left nobody able to undo it.
 */
export type AccountFailure =
  | "not_found"
  | "email_taken"
  // You cannot change your own role or deactivate yourself. Not paternalism:
  // it is the one mistake with no path back that does not involve the CLI.
  | "self"
  // The last active admin cannot be demoted or deactivated by anyone.
  | "last_admin"
  // §7.4's two-person control — an enrollment link is issued *for* someone, by
  // someone else. Recovering your own access goes through `admin:provision
  // --reissue`, which requires shell access to the host.
  | "self_enrollment"

export type AccountResult = { ok: true } | { ok: false; reason: AccountFailure }

export type ProvisionResult =
  | {
      ok: true
      userId: string
      /**
       * The plaintext enrollment URL. Returned exactly once, to be rendered
       * once, and never stored — only its SHA-256 hash reaches the database
       * (design §7.3).
       */
      enrollmentUrl: string
      expiresAt: Date
    }
  | { ok: false; reason: AccountFailure }

export type EnrollmentResult =
  | { ok: true; enrollmentUrl: string; expiresAt: Date }
  | { ok: false; reason: AccountFailure }
