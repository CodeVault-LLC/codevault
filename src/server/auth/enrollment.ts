import { and, eq, gt, isNull } from "drizzle-orm"
import { createHash, randomBytes } from "node:crypto"

import type { EnrollmentGrant, IssuedEnrollmentToken } from "./enrollment-types"
import { db } from "@/server/db/client"
import { enrollmentToken, user } from "@/server/db/schema"

// One-time enrollment grants (design §7.3).
//
// Better Auth's addPasskey() is session-authenticated: it assumes a logged-in
// user. A provisioned-but-unenrolled admin has no session and no password, so
// there is no built-in first-passkey flow. This module is that flow.
//
// The same path is the recovery path — built once, used for both.

const TOKEN_BYTES = 32
const DEFAULT_TTL_MS = 60 * 60 * 1000

function hash(token: string): Buffer {
  return createHash("sha256").update(token).digest()
}

/**
 * Mints a token. The plaintext is returned exactly once, for the CLI to print;
 * only its SHA-256 hash is stored, so a database leak yields nothing usable.
 *
 * Deliver it out of band — Signal, or in person — never to the email address
 * that is the account identifier.
 */
export async function issueEnrollmentToken(
  userId: string,
  options: { ttlMs?: number; issuedBy?: string } = {}
): Promise<IssuedEnrollmentToken> {
  const token = randomBytes(TOKEN_BYTES).toString("base64url")
  const expiresAt = new Date(Date.now() + (options.ttlMs ?? DEFAULT_TTL_MS))

  await db.insert(enrollmentToken).values({
    userId,
    tokenHash: hash(token),
    expiresAt,
    issuedBy: options.issuedBy ?? null,
  })

  return { token, expiresAt }
}

/**
 * Resolves a token to the user it enrolls, without consuming it.
 *
 * Called during the WebAuthn ceremony's first leg, where the credential does
 * not exist yet and so cannot be committed to. Returns null for anything
 * invalid — unknown, expired, or already used — with no distinction between
 * them.
 */
export async function resolveEnrollmentGrant(
  token: string
): Promise<EnrollmentGrant | null> {
  const rows = await db
    .select({
      tokenId: enrollmentToken.id,
      userId: user.id,
      name: user.name,
      email: user.email,
    })
    .from(enrollmentToken)
    .innerJoin(user, eq(user.id, enrollmentToken.userId))
    .where(
      and(
        eq(enrollmentToken.tokenHash, hash(token)),
        isNull(enrollmentToken.usedAt),
        gt(enrollmentToken.expiresAt, new Date())
      )
    )
    .limit(1)

  return rows.length === 0 ? null : rows[0]
}

/**
 * Burns a token. Single-use is enforced by the database, not by a read
 * beforehand: the UPDATE is guarded on `used_at IS NULL`, so of two concurrent
 * redemptions exactly one updates a row and the other gets nothing.
 *
 * Returns whether this call was the one that consumed it.
 */
export async function burnEnrollmentToken(tokenId: string): Promise<boolean> {
  const burned = await db
    .update(enrollmentToken)
    .set({ usedAt: new Date() })
    .where(and(eq(enrollmentToken.id, tokenId), isNull(enrollmentToken.usedAt)))
    .returning({ id: enrollmentToken.id })

  return burned.length > 0
}
