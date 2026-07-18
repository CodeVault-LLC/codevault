/**
 * The narrow projection of a signed-in staff member.
 *
 * Deliberately small: whatever a route's `beforeLoad` returns is serialized and
 * shipped to the client, so this must never grow to carry a session token or
 * an internal flag (design §7.6).
 */
export type StaffSession = {
  userId: string
  name: string
  email: string
}
