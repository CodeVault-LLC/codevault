// Phase 4's state transitions, driven against a real database.
//
// These are the operations that change what the public can see — withdrawal,
// reinstatement, post-publication editing — so they are worth asserting on
// directly rather than through a screen. The visibility half of withdrawal is
// asserted in `server/reports/visibility.test.ts`; this file is about the
// transitions themselves and about what each one records.

import { afterAll, beforeEach, describe, expect, it } from "vitest"
import { and, eq, gt, inArray, sql } from "drizzle-orm"

import type { AuditActor } from "@/server/audit/types"
import type { NewReportRow } from "@/server/db/types"
import {
  addRelation,
  removeRelation,
  restoreReport,
  reviseReport,
  updateReport,
  withdrawReport,
} from "./mutations"
import { auditLog, reportRelations, reports } from "@/server/db/schema"
import { db } from "@/server/db/client"
import { listRelations } from "./record"

const ACTOR: AuditActor = {
  userId: null,
  email: "mutations-test@codevault.test",
  ip: "203.0.113.9",
  userAgent: "vitest",
}

const RUN = `MUT-${Date.now()}`

/**
 * A record that genuinely passes the publish gate.
 *
 * Written out in full rather than minimally, because half these tests turn on
 * whether an edit *breaks* the gate — and a fixture that was already failing it
 * would make them pass for the wrong reason.
 */
const PUBLISHABLE = {
  status: "published",
  classification: "public",
  title: "Thermal drift in unattended sensor arrays",
  abstract: Array.from({ length: 80 }, (_, i) => `word${i}`).join(" "),
  authors: [{ name: "A. Researcher", affiliation: "CodeVault" }],
  subjectCategory: "instrumentation",
  keywords: ["thermal", "sensors", "drift"],
  pdfKey: "reports/mut/v1/report.pdf",
  fileSize: 120_000,
  checksum: Buffer.alloc(32, 1),
  fulltext: "Extracted body text.",
  publishedAt: "2026-02-02",
} satisfies Partial<NewReportRow>

let reportId = ""
let otherId = ""
let watermark = 0

async function seed() {
  const [row] = await db
    .insert(reports)
    .values({ ...PUBLISHABLE, accessionId: `${RUN}-A` })
    .returning({ id: reports.id })

  const [other] = await db
    .insert(reports)
    .values({
      ...PUBLISHABLE,
      accessionId: `${RUN}-B`,
      title: "An earlier survey",
      // Each fixture needs its own checksum: there is a partial unique index on
      // the column, which is the archive's dedupe rule.
      checksum: Buffer.alloc(32, 2),
      pdfKey: "reports/mut-b/v1/report.pdf",
    })
    .returning({ id: reports.id })

  reportId = row.id
  otherId = other.id
}

beforeEach(async () => {
  const [row] = await db
    .select({ seq: sql<number>`coalesce(max(${auditLog.seq}), 0)` })
    .from(auditLog)
  watermark = Number(row.seq)

  await db.delete(reports).where(sql`${reports.accessionId} like ${`${RUN}%`}`)
  await seed()
})

afterAll(async () => {
  await db.delete(auditLog).where(gt(auditLog.seq, watermark))
  await db.delete(reports).where(sql`${reports.accessionId} like ${`${RUN}%`}`)
})

/** What the log recorded for one action since this test started. */
async function auditFor(action: string) {
  return db
    .select()
    .from(auditLog)
    .where(and(gt(auditLog.seq, watermark), eq(auditLog.action, action)))
}

async function statusOf(id: string) {
  const [row] = await db
    .select({
      status: reports.status,
      accessionId: reports.accessionId,
      withdrawnAt: reports.withdrawnAt,
      withdrawnReason: reports.withdrawnReason,
    })
    .from(reports)
    .where(eq(reports.id, id))

  return row
}

describe("withdrawal", () => {
  it("keeps the accession ID and records the reason", async () => {
    const result = await withdrawReport(reportId, "Superseded.", ACTOR)
    expect(result.ok).toBe(true)

    const row = await statusOf(reportId)
    expect(row.status).toBe("withdrawn")
    // Permanent and never reused, including after withdrawal (design §4.5).
    expect(row.accessionId).toBe(`${RUN}-A`)
    expect(row.withdrawnReason).toBe("Superseded.")
    expect(row.withdrawnAt).not.toBeNull()
  })

  it("does not delete the row or its file reference", async () => {
    await withdrawReport(reportId, "Superseded.", ACTOR)

    const [row] = await db
      .select({ pdfKey: reports.pdfKey })
      .from(reports)
      .where(eq(reports.id, reportId))

    // Withdrawal stops the document being served; it does not destroy it, which
    // is what makes reinstatement possible at all.
    expect(row.pdfKey).toBe("reports/mut/v1/report.pdf")
  })

  it("refuses a record that is not published", async () => {
    await withdrawReport(reportId, "Superseded.", ACTOR)

    // The guard is in the UPDATE's WHERE clause, so a second withdrawal cannot
    // overwrite the first one's reason and timestamp.
    const second = await withdrawReport(reportId, "A different reason.", ACTOR)

    expect(second).toEqual({ ok: false, reason: "wrong_status" })
    expect((await statusOf(reportId)).withdrawnReason).toBe("Superseded.")
  })

  it("records the classification on the audit entry", async () => {
    await withdrawReport(reportId, "Superseded.", ACTOR)

    const entries = await auditFor("report.withdraw")
    expect(entries).toHaveLength(1)
    expect(entries[0].classification).toBe("public")
    expect(entries[0].targetLabel).toBe(`${RUN}-A`)
    expect(entries[0].detail).toMatchObject({ reason: "Superseded." })
  })
})

describe("reinstatement", () => {
  it("clears the withdrawal it reverses", async () => {
    await withdrawReport(reportId, "Superseded.", ACTOR)
    expect(await restoreReport(reportId, ACTOR)).toEqual({ ok: true })

    const row = await statusOf(reportId)
    expect(row.status).toBe("published")
    // Left in place, the next tombstone would show a reason from a decision
    // that has since been reversed.
    expect(row.withdrawnAt).toBeNull()
    expect(row.withdrawnReason).toBeNull()
  })

  it("refuses a record that was never withdrawn", async () => {
    expect(await restoreReport(reportId, ACTOR)).toEqual({
      ok: false,
      reason: "wrong_status",
    })
  })

  it("leaves the reversal in the log", async () => {
    await withdrawReport(reportId, "Superseded.", ACTOR)
    await restoreReport(reportId, ACTOR)

    // The row no longer says it was ever withdrawn. The log is the only thing
    // that remembers, which is exactly why it is append-only.
    expect(await auditFor("report.withdraw")).toHaveLength(1)
    expect(await auditFor("report.restore")).toHaveLength(1)
  })
})

describe("editing after publication", () => {
  it("allows a correction that keeps the record compliant", async () => {
    const result = await updateReport(
      { reportId, patch: { title: "Thermal drift in sensor arrays" } },
      ACTOR
    )

    expect(result.ok).toBe(true)

    const [row] = await db
      .select({ title: reports.title })
      .from(reports)
      .where(eq(reports.id, reportId))

    // Cheap and unceremonious on purpose: a typo that needs a workflow is a
    // typo that does not get fixed (design §4.4).
    expect(row.title).toBe("Thermal drift in sensor arrays")
  })

  it("refuses an edit that would break the published record's gate", async () => {
    const result = await updateReport(
      { reportId, patch: { abstract: "Too short." } },
      ACTOR
    )

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.reason).toBe("would_break_gate")
    if (result.reason !== "would_break_gate") return
    expect(result.gate.blockers.map((b) => b.code)).toContain(
      "abstract_too_short"
    )
  })

  it("does not write anything when it refuses", async () => {
    await updateReport({ reportId, patch: { abstract: "Too short." } }, ACTOR)

    const [row] = await db
      .select({ abstract: reports.abstract })
      .from(reports)
      .where(eq(reports.id, reportId))

    // Refused rather than published-then-unpublished: the record is live and
    // cited, and pulling it because someone shortened an abstract would be a
    // far larger action than the one they took.
    expect(row.abstract).toBe(PUBLISHABLE.abstract)
  })

  it("permits the same edit on a draft", async () => {
    await db
      .update(reports)
      .set({ status: "draft" })
      .where(eq(reports.id, reportId))

    // A draft may be incomplete; a published record may not (design §2).
    const result = await updateReport(
      { reportId, patch: { abstract: "Too short." } },
      ACTOR
    )

    expect(result.ok).toBe(true)
  })

  it("records which fields moved, not their values", async () => {
    await updateReport({ reportId, patch: { title: "A new title" } }, ACTOR)

    const entries = await auditFor("report.update")
    expect(entries[0].detail).toMatchObject({ fields: ["title"] })
    // The values themselves are deliberately absent: an abstract runs to
    // thousands of words and an internal record's title is sensitive, and a log
    // holding both would be a second copy of the archive with no access
    // control.
    expect(JSON.stringify(entries[0].detail)).not.toContain("A new title")
  })
})

describe("typed relations", () => {
  it("writes the inverse alongside the link", async () => {
    expect(
      await addRelation(reportId, otherId, "IsNewVersionOf", ACTOR)
    ).toEqual({ ok: true })

    const forward = await listRelations(reportId)
    expect(forward).toHaveLength(1)
    expect(forward[0].relation).toBe("IsNewVersionOf")

    // The superseded record has to know it was superseded, or its page is
    // silently incomplete.
    const back = await listRelations(otherId)
    expect(back).toHaveLength(1)
    expect(back[0].relation).toBe("IsPreviousVersionOf")
  })

  it("is idempotent", async () => {
    await addRelation(reportId, otherId, "IsNewVersionOf", ACTOR)
    await addRelation(reportId, otherId, "IsNewVersionOf", ACTOR)

    // Linking twice is not a mistake worth interrupting anyone over.
    expect(await listRelations(reportId)).toHaveLength(1)
  })

  it("refuses to relate a record to itself", async () => {
    expect(
      await addRelation(reportId, reportId, "IsNewVersionOf", ACTOR)
    ).toEqual({ ok: false, reason: "self_relation" })
  })

  it("removes both directions", async () => {
    await addRelation(reportId, otherId, "IsNewVersionOf", ACTOR)
    await removeRelation(reportId, otherId, "IsNewVersionOf", ACTOR)

    expect(await listRelations(reportId)).toHaveLength(0)
    // The two sides cannot be left disagreeing about whether they are linked.
    expect(await listRelations(otherId)).toHaveLength(0)
  })
})

describe("revisions", () => {
  it("creates a separate draft linked to its predecessor", async () => {
    const result = await reviseReport(reportId, ACTOR)
    expect(result.ok).toBe(true)
    if (!result.ok) return

    const [draft] = await db
      .select()
      .from(reports)
      .where(eq(reports.id, result.draftId))

    // An independent record with its own identifier, not a version of the row
    // it came from (design §4.4).
    expect(draft.id).not.toBe(reportId)
    expect(draft.status).toBe("draft")
    expect(draft.accessionId).toBeNull()

    const relations = await listRelations(result.draftId)
    expect(relations[0].relation).toBe("IsNewVersionOf")
    expect(relations[0].reportId).toBe(reportId)
  })

  it("carries the description across but not the document", async () => {
    const result = await reviseReport(reportId, ACTOR)
    if (!result.ok) return

    const [draft] = await db
      .select()
      .from(reports)
      .where(eq(reports.id, result.draftId))

    expect(draft.title).toBe(PUBLISHABLE.title)
    expect(draft.keywords).toEqual(PUBLISHABLE.keywords)

    // The premise of a revision is that there is a new set of bytes. Copying
    // these would produce a draft claiming to hold a document it does not, and
    // the publish gate would wave it through.
    expect(draft.pdfKey).toBeNull()
    expect(draft.checksum).toBeNull()
    expect(draft.fileSize).toBeNull()
    expect(draft.fulltext).toBeNull()
  })

  it("leaves the predecessor untouched", async () => {
    await reviseReport(reportId, ACTOR)

    const row = await statusOf(reportId)
    // Rev A stays exactly as it was, for anyone who cited Rev A.
    expect(row.status).toBe("published")
    expect(row.accessionId).toBe(`${RUN}-A`)
  })

  it("refuses to revise a draft", async () => {
    await db
      .update(reports)
      .set({ status: "draft" })
      .where(eq(reports.id, reportId))

    // Revising a draft is just editing it, and a chain of drafts superseding
    // drafts has no reader on the other end.
    expect(await reviseReport(reportId, ACTOR)).toEqual({
      ok: false,
      reason: "wrong_status",
    })
  })

  it("can revise a withdrawn record", async () => {
    await withdrawReport(reportId, "Superseded.", ACTOR)

    // The common case for a revision, in fact: the withdrawal reason is often
    // "a corrected version exists".
    const result = await reviseReport(reportId, ACTOR)
    expect(result.ok).toBe(true)
  })
})

// Drafts created by the revision tests are keyed by UUID rather than an
// accession ID, so the `like` cleanup above cannot see them. This removes them
// by their relation to the fixtures instead.
afterAll(async () => {
  const links = await db
    .select({ fromId: reportRelations.fromId })
    .from(reportRelations)
    .where(inArray(reportRelations.toId, [reportId, otherId]))

  if (links.length > 0) {
    await db.delete(reports).where(
      inArray(
        reports.id,
        links.map((link) => link.fromId)
      )
    )
  }
})

// The identifier is the one field on a record that can never be corrected
// later, so the boundary between "still choosable" and "frozen" is worth
// asserting directly rather than inferring from the screen.
describe("staging an accession id", () => {
  it("accepts one on a draft", async () => {
    const [draft] = await db
      .insert(reports)
      .values({ title: "A draft awaiting its identifier" })
      .returning({ id: reports.id })

    const result = await updateReport(
      { reportId: draft.id, patch: { requestedAccessionId: "CV-STD-0001" } },
      ACTOR
    )

    expect(result.ok).toBe(true)

    const [row] = await db
      .select({ requested: reports.requestedAccessionId })
      .from(reports)
      .where(eq(reports.id, draft.id))

    expect(row.requested).toBe("CV-STD-0001")
  })

  it("refuses one on a published record, whose identifier is frozen", async () => {
    const result = await updateReport(
      { reportId, patch: { requestedAccessionId: "CV-STD-0002" } },
      ACTOR
    )

    expect(result).toEqual({ ok: false, reason: "accession_not_editable" })
  })
})
