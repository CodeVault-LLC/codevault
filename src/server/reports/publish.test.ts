// Drives §8.4 step 3: the publish transition, against the real database and
// the real object store.

import { afterAll, beforeEach, describe, expect, it } from "vitest"
import { createHash } from "node:crypto"
import { eq, like } from "drizzle-orm"

import type { NewReportRow } from "@/server/db/types"
import { db } from "@/server/db/client"
import { env } from "@/env/server"
import { newQuarantineKey, reportPdfKey } from "@/server/storage/keys"
import { objectStore } from "@/server/storage/object-store"
import { publishReport } from "./publish"
import { accessionSequence, reports } from "@/server/db/schema"

const TITLE_TAG = `publish-test-${Date.now()}`

// 75+ words, so the abstract gate passes on the happy path.
const LONG_ABSTRACT = Array.from({ length: 80 }, (_, i) => `word${i}`).join(" ")

// Every draft gets distinct bytes. `reports_checksum_idx` is a real partial
// unique index that deduplicates the corpus by content, so two fixtures sharing
// one byte string collide — correctly.
let documentCounter = 0
function uniqueDocument(): Uint8Array {
  documentCounter += 1
  return new TextEncoder().encode(
    `%PDF-1.4\ndocument ${TITLE_TAG} #${documentCounter}\n`
  )
}

function completeDraft(
  bytes: Uint8Array,
  overrides: Partial<NewReportRow> = {}
): NewReportRow {
  return {
    title: TITLE_TAG,
    abstract: LONG_ABSTRACT,
    authors: [{ name: "L. Olsen", affiliation: "CodeVault" }],
    classification: "public",
    docType: "report",
    subjectCategory: "Aerospace",
    keywords: ["orbits", "debris", "simulation"],
    fulltext: "extracted body text",
    fileSize: bytes.byteLength,
    checksum: Buffer.from(createHash("sha256").update(bytes).digest()),
    status: "draft",
    ...overrides,
  }
}

/** A draft with no file attached. */
async function insertDraft(overrides: Partial<NewReportRow> = {}) {
  const [row] = await db
    .insert(reports)
    .values(completeDraft(uniqueDocument(), overrides))
    .returning({ id: reports.id })
  return row.id
}

/**
 * A draft whose file is already staged in quarantine, as the deposit flow would
 * leave it. Returns the report id, its quarantine key, and its bytes.
 */
async function stageDraft(overrides: Partial<NewReportRow> = {}) {
  const bytes = uniqueDocument()
  const quarantineKey = newQuarantineKey()

  await objectStore.put({
    bucket: env.BUCKET_QUARANTINE,
    key: quarantineKey,
    body: bytes,
    contentType: "application/pdf",
  })

  const [row] = await db
    .insert(reports)
    .values(completeDraft(bytes, { pdfKey: quarantineKey, ...overrides }))
    .returning({ id: reports.id })

  return { id: row.id, quarantineKey, bytes }
}

beforeEach(async () => {
  await db.delete(reports).where(like(reports.title, `${TITLE_TAG}%`))
})

afterAll(async () => {
  await db.delete(reports).where(like(reports.title, `${TITLE_TAG}%`))
})

describe("the publish gate blocks", () => {
  it("a record with no classification chosen", async () => {
    const id = await insertDraft({ classification: null })
    const result = await publishReport(id)

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.reason).toBe("gate_failed")
    expect(result.gate?.blockers.map((b) => b.code)).toContain(
      "classification_unset"
    )
  })

  it("a thin abstract, and allows it with a recorded reason", async () => {
    const thin = await insertDraft({ abstract: "Too short." })
    const blocked = await publishReport(thin)
    expect(blocked.ok).toBe(false)

    const excused = await stageDraft({
      abstract: "Too short.",
      abstractOverrideReason:
        "There are no author-identified significant results in this report.",
    })
    expect((await publishReport(excused.id)).ok).toBe(true)
  })

  it("surviving placeholder text", async () => {
    const id = await insertDraft({ abstract: `TODO ${LONG_ABSTRACT}` })
    const result = await publishReport(id)

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.gate?.blockers.map((b) => b.code)).toContain(
      "placeholder_text"
    )
  })

  it("a scanned PDF with no searchable text", async () => {
    const { id } = await stageDraft({ fulltext: null })
    const result = await publishReport(id)

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.gate?.blockers.map((b) => b.code)).toContain(
      "no_searchable_text"
    )
  })

  it("nothing when the record is metadata-only and has no file", async () => {
    // The file requirements do not apply when no document is being served.
    const id = await insertDraft({
      dissemination: "metadata_only",
      fulltext: null,
      checksum: null,
      fileSize: null,
    })

    expect((await publishReport(id)).ok).toBe(true)
  })
})

describe("publishing a complete draft", () => {
  it("allocates an accession ID, moves the file and flips status", async () => {
    const { id, quarantineKey, bytes } = await stageDraft()

    const result = await publishReport(id)
    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.accessionId).toMatch(/^CV-\d{4}-\d{4}$/)

    const [row] = await db.select().from(reports).where(eq(reports.id, id))
    expect(row.status).toBe("published")
    expect(row.publishedAt).not.toBeNull()
    expect(row.pdfKey).toBe(reportPdfKey(result.accessionId))

    // The file is in the serving bucket…
    const served = await objectStore.head({
      bucket: env.BUCKET_PUBLIC,
      key: row.pdfKey!,
    })
    expect(served?.contentLength).toBe(bytes.byteLength)

    // …and no longer in quarantine.
    const staged = await objectStore.head({
      bucket: env.BUCKET_QUARANTINE,
      key: quarantineKey,
    })
    expect(staged).toBeNull()

    await objectStore.delete({ bucket: env.BUCKET_PUBLIC, key: row.pdfKey! })
  })

  it("routes an internal record to the internal bucket", async () => {
    const { id } = await stageDraft({ classification: "internal" })

    const result = await publishReport(id)
    expect(result.ok).toBe(true)
    if (!result.ok) return

    const key = reportPdfKey(result.accessionId)
    expect(
      await objectStore.head({ bucket: env.BUCKET_INTERNAL, key })
    ).not.toBeNull()
    // Never written to the public bucket.
    expect(
      await objectStore.head({ bucket: env.BUCKET_PUBLIC, key })
    ).toBeNull()

    await objectStore.delete({ bucket: env.BUCKET_INTERNAL, key })
  })

  it("refuses to publish the same record twice", async () => {
    const { id } = await stageDraft()

    const first = await publishReport(id)
    expect(first.ok).toBe(true)

    const second = await publishReport(id)
    expect(second.ok).toBe(false)
    if (second.ok) return
    expect(second.reason).toBe("not_a_draft")
  })

  it("allocates monotonic, never-reused identifiers", async () => {
    const a = await publishReport((await stageDraft()).id)
    const b = await publishReport((await stageDraft()).id)

    expect(a.ok && b.ok).toBe(true)
    if (!a.ok || !b.ok) return

    const seq = (value: string) => Number(value.split("-")[2])
    expect(seq(b.accessionId)).toBeGreaterThan(seq(a.accessionId))
  })

  it("does not burn a second identifier when retried after a failed flip", async () => {
    // Simulates an attempt interrupted after step 1: the draft already carries
    // an accession ID. Publishing must reuse it rather than allocate again.
    const { id } = await stageDraft()
    await db
      .update(reports)
      .set({ accessionId: `CV-1999-0001` })
      .where(eq(reports.id, id))

    const result = await publishReport(id)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.accessionId).toBe("CV-1999-0001")
  })
})

// A document that arrives already known by an identifier of its own — a
// standard, a certification — must keep it. Publishing it under a counter
// value would rename the thing the archive was asked to preserve.
describe("a staged accession identifier", () => {
  // Run-unique, for the same reason the titles and the document bytes are:
  // accession IDs are unique across the whole table and are deliberately never
  // released, so a fixture reusing a literal collides with its own last run.
  const SERIES = `T${Date.now().toString(36).toUpperCase().slice(-5)}`
  const staged = (n: number) => `CV-${SERIES}-${String(n).padStart(4, "0")}`

  async function sequenceFor(year: number): Promise<number> {
    const rows = await db
      .select({ lastValue: accessionSequence.lastValue })
      .from(accessionSequence)
      .where(eq(accessionSequence.year, year))

    // No row means the counter has never been touched for this year, which is
    // the state a manual publish must leave it in.
    return rows.length === 0 ? 0 : rows[0].lastValue
  }

  it("is used verbatim", async () => {
    const { id } = await stageDraft({ requestedAccessionId: staged(1) })

    const result = await publishReport(id)

    expect(result).toMatchObject({ ok: true, accessionId: staged(1) })
  })

  it("is cleared once published, leaving one source of truth", async () => {
    const { id } = await stageDraft({ requestedAccessionId: staged(2) })

    await publishReport(id)
    const [row] = await db.select().from(reports).where(eq(reports.id, id))

    expect(row.accessionId).toBe(staged(2))
    expect(row.requestedAccessionId).toBeNull()
  })

  it("leaves the counter unadvanced", async () => {
    const year = new Date().getUTCFullYear()
    const before = await sequenceFor(year)

    const { id } = await stageDraft({ requestedAccessionId: staged(3) })
    await publishReport(id)

    expect(await sequenceFor(year)).toBe(before)
  })

  it("falls back to the counter when absent", async () => {
    const { id } = await stageDraft({ requestedAccessionId: null })

    const result = await publishReport(id)

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.accessionId).toMatch(
      new RegExp(`^CV-${new Date().getUTCFullYear()}-\\d{4}$`)
    )
  })

  it("is refused when a published record already holds it", async () => {
    const first = await stageDraft({ requestedAccessionId: staged(9) })
    await publishReport(first.id)

    const second = await stageDraft({ requestedAccessionId: staged(9) })
    const result = await publishReport(second.id)

    expect(result).toEqual({ ok: false, reason: "accession_taken" })
  })

  it("leaves the losing draft a draft, with no identifier burned", async () => {
    const first = await stageDraft({ requestedAccessionId: staged(10) })
    await publishReport(first.id)

    const second = await stageDraft({ requestedAccessionId: staged(10) })
    await publishReport(second.id)
    const [row] = await db
      .select()
      .from(reports)
      .where(eq(reports.id, second.id))

    expect(row.status).toBe("draft")
    expect(row.accessionId).toBeNull()
  })

  // The gate checks shape before publish, but a value reaching the column by
  // any other path must not become a live identifier.
  it("refuses a malformed value rather than publishing under it", async () => {
    const { id } = await stageDraft({ requestedAccessionId: "not-an-id" })

    const result = await publishReport(id)

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.reason).toBe("gate_failed")
  })
})
