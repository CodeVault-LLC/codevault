// The enrollment grant is the entire authorization for a first-passkey
// ceremony, so its lifecycle is worth testing directly (design §7.3).

import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { eq } from "drizzle-orm"

import {
  burnEnrollmentToken,
  issueEnrollmentToken,
  resolveEnrollmentGrant,
} from "./enrollment"
import { db } from "@/server/db/client"
import { enrollmentToken, user } from "@/server/db/schema"

const USER_ID = `enroll-test-${Date.now()}`
const EMAIL = `${USER_ID}@example.test`

beforeAll(async () => {
  await db.insert(user).values({
    id: USER_ID,
    name: "Enrollment Test",
    email: EMAIL,
  })
})

afterAll(async () => {
  // Cascades to the tokens.
  await db.delete(user).where(eq(user.id, USER_ID))
})

describe("issuing a grant", () => {
  it("returns a token that resolves to the user", async () => {
    const { token } = await issueEnrollmentToken(USER_ID)

    const grant = await resolveEnrollmentGrant(token)
    expect(grant?.userId).toBe(USER_ID)
    expect(grant?.email).toBe(EMAIL)
  })

  it("stores only the hash, never the token", async () => {
    const { token } = await issueEnrollmentToken(USER_ID)

    const rows = await db
      .select()
      .from(enrollmentToken)
      .where(eq(enrollmentToken.userId, USER_ID))

    // A database leak must not yield anything usable.
    const stored = rows.map((row) => row.tokenHash.toString("utf8"))
    expect(stored).not.toContain(token)

    for (const row of rows) {
      expect(row.tokenHash).toHaveLength(32)
    }
  })
})

describe("redeeming a grant", () => {
  it("rejects an unknown token", async () => {
    expect(await resolveEnrollmentGrant("not-a-real-token")).toBeNull()
  })

  it("rejects an expired token", async () => {
    const { token } = await issueEnrollmentToken(USER_ID, { ttlMs: -1000 })
    expect(await resolveEnrollmentGrant(token)).toBeNull()
  })

  it("is single use", async () => {
    const { token } = await issueEnrollmentToken(USER_ID)

    const grant = await resolveEnrollmentGrant(token)
    expect(grant).not.toBeNull()

    expect(await burnEnrollmentToken(grant!.tokenId)).toBe(true)
    expect(await resolveEnrollmentGrant(token)).toBeNull()
  })

  it("lets only one of two concurrent redemptions win", async () => {
    // Single use is enforced by the UPDATE's `used_at IS NULL` guard, not by a
    // read beforehand — otherwise two simultaneous requests could both pass.
    const { token } = await issueEnrollmentToken(USER_ID)
    const grant = await resolveEnrollmentGrant(token)

    const results = await Promise.all([
      burnEnrollmentToken(grant!.tokenId),
      burnEnrollmentToken(grant!.tokenId),
      burnEnrollmentToken(grant!.tokenId),
    ])

    expect(results.filter(Boolean)).toHaveLength(1)
  })
})
