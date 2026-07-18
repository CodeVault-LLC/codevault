import { count, eq } from "drizzle-orm"

import type { AuditActor } from "@/server/audit/types"
import type { StaffSession } from "./session-types"
import type { Viewer } from "@/server/reports/types"
import { auth } from "./auth"
import { db } from "@/server/db/client"
import { passkey, user } from "@/server/db/schema"

/**
 * Resolves the caller's session from request headers.
 *
 * Always derived server-side from the cookie and the database. Client-supplied
 * context is untrusted and is never consulted here (design §7.6).
 *
 * The role and the disabled flag are read from `user` on every call rather than
 * trusted from whatever Better Auth cached in the session. That is the point of
 * database-backed sessions: revoking access — by demotion or by deactivation —
 * has to take effect on the next request, not whenever a token happens to
 * expire (design §7.5).
 */
export async function getStaffSession(
  headers: Headers
): Promise<StaffSession | null> {
  const result = await auth.api.getSession({ headers })
  if (!result) return null

  const rows = await db
    .select({
      role: user.role,
      name: user.name,
      email: user.email,
      disabledAt: user.disabledAt,
    })
    .from(user)
    .where(eq(user.id, result.user.id))
    .limit(1)

  // A session whose account was deleted underneath it is not a session.
  if (rows.length === 0) return null

  // A deactivated account still holds a valid cookie until it expires.
  // Refusing here is what makes deactivation immediate. Its sessions are
  // revoked at the point of deactivation as well — this is the belt to those
  // braces, and the one that survives a revocation that half-failed.
  if (rows[0].disabledAt) return null

  return {
    userId: result.user.id,
    name: rows[0].name,
    email: rows[0].email,
    role: rows[0].role,
  }
}

/**
 * The headers a proxy uses to report the original client address, most
 * specific first.
 *
 * `x-forwarded-for` is a list and only its first entry is the client; the rest
 * are proxies. Every one of these is trivially spoofable by anything that can
 * reach the origin directly, which is why this feeds an audit log — a record of
 * what was claimed — and never an authorization decision.
 */
const IP_HEADERS = ["cf-connecting-ip", "x-real-ip", "x-forwarded-for"] as const

function clientIp(headers: Headers): string | null {
  for (const header of IP_HEADERS) {
    const value = headers.get(header)
    if (value) return value.split(",")[0].trim()
  }

  return null
}

/**
 * Who to record as the actor on anything this request does.
 *
 * `credentialId` is null, and deliberately so. §7.7 asks for the credential
 * that signed the session, and it is the genuinely useful field — it separates
 * "someone signed in as you" from "your work laptop signed in as you". Better
 * Auth's passkey plugin does not record the credential on the session it
 * creates, so filling this in would mean guessing which of an account's
 * passkeys was used. The column exists and stays null until that can be
 * threaded through honestly: a plausible wrong answer in an audit log is worse
 * than a blank one.
 */
export function auditActor(
  staff: StaffSession | null,
  headers: Headers
): AuditActor {
  return {
    userId: staff?.userId ?? null,
    email: staff?.email ?? null,
    credentialId: null,
    ip: clientIp(headers),
    userAgent: headers.get("user-agent"),
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
