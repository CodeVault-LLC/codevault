import type { StaffAccount } from "@/server/admin/user-types"
import type { StaffRole } from "@/core/auth/permissions"
import { adminUsers } from "@/core/config/admin"

/**
 * Why an action is unavailable against a given account, or null if it is.
 *
 * Pure, and separate from the components, for one reason: these are the guards
 * that stop the accounts screen locking the archive out of itself, and the
 * server enforces every one of them independently. Deriving them in one place
 * means the disabled state and the tooltip explaining it come from the same
 * expression, so a control cannot be greyed out for a reason the UI then fails
 * to give — or worse, offered when the server will refuse it.
 */
export type ActionBlock = string | null

export type AccountGuards = {
  /** How many active admins exist, this account included. */
  activeAdmins: number
  /** The signed-in account's id. */
  currentUserId: string
}

function isLastActiveAdmin(
  account: StaffAccount,
  guards: AccountGuards
): boolean {
  return (
    account.role === "admin" && !account.disabledAt && guards.activeAdmins <= 1
  )
}

function isSelf(account: StaffAccount, guards: AccountGuards): boolean {
  return account.id === guards.currentUserId
}

/** Whether this account's role may be changed to `role`. */
export function blocksRoleChange(
  account: StaffAccount,
  guards: AccountGuards,
  role: StaffRole
): ActionBlock {
  if (account.role === role) return null
  // The one mistake on this screen with no way back through the UI: demote
  // yourself and the control that would undo it is now hidden from you.
  if (isSelf(account, guards)) return adminUsers.selfRefused
  if (role !== "admin" && isLastActiveAdmin(account, guards)) {
    return adminUsers.lastAdminRefused
  }
  return null
}

export function blocksDeactivate(
  account: StaffAccount,
  guards: AccountGuards
): ActionBlock {
  if (isSelf(account, guards)) return adminUsers.selfRefused
  if (isLastActiveAdmin(account, guards)) return adminUsers.lastAdminRefused
  return null
}

/**
 * §7.4's two-person control: a link is issued *for* someone, by someone else.
 * Recovering your own access goes through `admin:provision --reissue`, which
 * needs shell access to the host — a meaningfully different thing to hold than
 * a browser tab.
 */
export function blocksEnrollment(
  account: StaffAccount,
  guards: AccountGuards
): ActionBlock {
  return isSelf(account, guards) ? adminUsers.selfEnrollmentRefused : null
}

/**
 * How an account's ability to sign in reads at a glance.
 *
 * Deliberately not the same axis as `role`. An account can hold the highest
 * role and still be unable to get in, and that combination is exactly the one
 * worth spotting from across a table.
 */
export type AccountState =
  | "active"
  | "deactivated"
  // Provisioned, no credentials, and a link already waiting on a person.
  | "pending"
  // Provisioned, no credentials, and no link outstanding — this account is
  // stuck and needs someone to act.
  | "locked_out"

export function accountState(account: StaffAccount): AccountState {
  if (account.disabledAt) return "deactivated"
  if (account.credentials.length > 0) return "active"
  return account.hasPendingEnrollment ? "pending" : "locked_out"
}
