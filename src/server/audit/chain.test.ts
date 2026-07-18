// The hash chain's claim is that tampering is *detectable* (design §7.7). That
// claim is worth exactly as much as a test that actually tampers, so this file
// alters a committed row and asserts the chain notices.

import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { eq, gt, sql } from "drizzle-orm"

import { auditLog } from "@/server/db/schema"
import { chainHash } from "./chain"
import { db } from "@/server/db/client"
import { recordAudit, verifyAuditChain } from "./audit"

const ACTOR = {
  userId: null,
  email: "chain-test@codevault.test",
  ip: "203.0.113.7",
  userAgent: "vitest",
}

// The sequence number the log had before this file wrote anything, so cleanup
// removes exactly these rows and no others.
let watermark = 0

beforeAll(async () => {
  const [row] = await db
    .select({ seq: sql<number>`coalesce(max(${auditLog.seq}), 0)` })
    .from(auditLog)

  watermark = Number(row.seq)
})

afterAll(async () => {
  await db.delete(auditLog).where(gt(auditLog.seq, watermark))
})

describe("the audit chain", () => {
  it("verifies a log it wrote itself", async () => {
    await recordAudit({
      actor: ACTOR,
      action: "report.publish",
      summary: "First.",
      detail: { a: 1, b: "two" },
    })
    await recordAudit({
      actor: ACTOR,
      action: "report.withdraw",
      summary: "Second.",
    })

    const result = await verifyAuditChain()

    expect(result.ok).toBe(true)
    expect(result.brokenAt).toBeNull()
  })

  it("survives a detail object whose keys Postgres reorders", async () => {
    // The reason `canonicalize` sorts keys. jsonb does not preserve key order,
    // so a hash taken over insertion order would fail to reproduce on read and
    // the chain would report tampering on a row nobody touched. Keys chosen so
    // that alphabetical and insertion order genuinely differ.
    await recordAudit({
      actor: ACTOR,
      action: "user.role.change",
      summary: "Reordered.",
      detail: { zulu: 1, alpha: 2, mike: { yankee: 3, bravo: 4 } },
    })

    const result = await verifyAuditChain()
    expect(result.ok).toBe(true)
  })

  it("detects an entry altered after the fact", async () => {
    await recordAudit({
      actor: ACTOR,
      action: "report.update",
      summary: "The original summary.",
    })

    const [target] = await db
      .select({ seq: auditLog.seq })
      .from(auditLog)
      .orderBy(auditLog.seq)
      .where(gt(auditLog.seq, watermark))
      .limit(1)

    // Rewriting history without recomputing the hash: exactly what the chain
    // exists to catch.
    await db
      .update(auditLog)
      .set({ summary: "A quietly rewritten summary." })
      .where(eq(auditLog.seq, target.seq))

    const result = await verifyAuditChain()

    expect(result.ok).toBe(false)
    expect(result.brokenAt).toBe(target.seq)
  })

  it("detects an entry removed from the middle", async () => {
    // Restore the row the previous test broke, so this one starts from a chain
    // that verifies and is measuring only its own tampering.
    await repairChain()
    expect((await verifyAuditChain()).ok).toBe(true)

    const rows = await db
      .select({ seq: auditLog.seq })
      .from(auditLog)
      .where(gt(auditLog.seq, watermark))
      .orderBy(auditLog.seq)

    // The second of at least three, so there is a row after it whose prev_hash
    // now points at something that is gone.
    const removed = rows[1]
    await db.delete(auditLog).where(eq(auditLog.seq, removed.seq))

    const result = await verifyAuditChain()

    expect(result.ok).toBe(false)
    // The break surfaces at the *next* row: its stored prev_hash no longer
    // matches the hash of the row now preceding it.
    expect(result.brokenAt).toBe(rows[2].seq)
  })
})

/**
 * Recomputes every hash from the current row contents.
 *
 * Only a test helper, and deliberately not exported from the audit module — it
 * is precisely the capability the chain assumes an attacker would have to
 * exercise to cover their tracks, and having it in production code would be
 * handing them the tool.
 */
async function repairChain() {
  const rows = await db.select().from(auditLog).orderBy(auditLog.seq)

  // Buffer rather than Uint8Array: `chainHash` returns whichever node's crypto
  // hands back, and the bytea column's insert type is specifically Buffer.
  let prev: Buffer | null = null

  for (const row of rows) {
    const hash: Buffer = Buffer.from(chainHash(row, prev))
    await db
      .update(auditLog)
      .set({ prevHash: prev, hash })
      .where(eq(auditLog.seq, row.seq))
    prev = hash
  }
}
