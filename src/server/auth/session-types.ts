import type { StaffRole } from "@/core/auth/permissions"

/**
 * The narrow projection of a signed-in staff member.
 *
 * Deliberately small: whatever a route's `beforeLoad` returns is serialized and
 * shipped to the client, so this must never grow to carry a session token or
 * an internal flag (design §7.6).
 *
 * `role` is on it deliberately, and is not an exception to that rule. It is not
 * a secret — the account learns what it can do the moment it tries anything —
 * and the sidebar needs it in order not to offer screens the server will
 * refuse. Withholding it would produce a dashboard full of links that 403.
 */
export type StaffSession = {
  userId: string
  name: string
  email: string
  role: StaffRole
}
