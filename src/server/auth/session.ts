import { count, eq } from "drizzle-orm"

import type { StaffSession } from "./session-types"
import type { Viewer } from "@/server/reports/types"
import { auth } from "./auth"
import { db } from "@/server/db/client"
import { passkey } from "@/server/db/schema"

/**
 * Resolves the caller's session from request headers.
 *
 * Always derived server-side from the cookie and the database. Client-supplied
 * context is untrusted and is never consulted here (design §7.6).
 */
export async function getStaffSession(
  headers: Headers
): Promise<StaffSession | null> {
  const result = await auth.api.getSession({ headers })
  if (!result) return null

  return {
    userId: result.user.id,
    name: result.user.name,
    email: result.user.email,
  }
}

export async function resolveViewer(headers: Headers): Promise<Viewer> {
  const session = await getStaffSession(headers)
  return session
    ? { kind: "staff", userId: session.userId }
    : { kind: "anonymous" }
}

/**
 * How many credentials this account has.
 *
 * Two minimum, on different failure domains, is the primary recovery control —
 * enforced in code rather than left to policy, by blocking access to internal
 * documents until a second credential exists (design §7.4).
 */
export async function countCredentials(userId: string): Promise<number> {
  const [row] = await db
    .select({ total: count() })
    .from(passkey)
    .where(eq(passkey.userId, userId))

  return row.total
}
