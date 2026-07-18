// Exercises the ingest pipeline against the real object store and database,
// using real PDFs produced by Ghostscript.

import { afterAll, describe, expect, it } from "vitest"
import { execFileSync } from "node:child_process"
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { eq } from "drizzle-orm"
import { join } from "node:path"
import { randomUUID } from "node:crypto"
import { tmpdir } from "node:os"

import { classifyFailure, isRetryable } from "./types"
import { hasPdfMagic, looksLikePdf } from "./validate"
import { db } from "@/server/db/client"
import { env } from "@/env/server"
import { ingestQuarantineObject } from "./ingest"
import { newQuarantineKey } from "@/server/storage/keys"
import { objectStore } from "@/server/storage/object-store"
import { reports } from "@/server/db/schema"
import { scanForDangerousConstructs } from "./sanitize"

const workdir = mkdtempSync(join(tmpdir(), "codevault-ingest-"))

const POSTSCRIPT = `[ /Title (Orbital decay in low-earth constellations)
  /Author (L. Olsen)
  /DOCINFO pdfmark
/Helvetica findfont 12 scalefont setfont
72 700 moveto (A study of collision avoidance in dense orbital shells.) show
showpage
72 700 moveto (Page two: results and discussion.) show
showpage
`

function buildPdf(postscript: string, name: string): Uint8Array {
  const ps = join(workdir, `${name}.ps`)
  const pdf = join(workdir, `${name}.pdf`)
  writeFileSync(ps, postscript)

  execFileSync("gs", [
    "-q",
    "-dNOPAUSE",
    "-dBATCH",
    "-sDEVICE=pdfwrite",
    "-o",
    pdf,
    ps,
  ])

  return new Uint8Array(readFileSync(pdf))
}

const PDF = buildPdf(POSTSCRIPT, "sample")

/**
 * A document no other test has seen.
 *
 * Necessary because `reports_checksum_idx` deduplicates the whole corpus by
 * content: any test that writes a checksum makes those exact bytes a duplicate
 * for every test that runs after it. Distinct bytes per case keeps them
 * order-independent.
 */
let documentCounter = 0
function uniquePdf(): Uint8Array {
  documentCounter += 1
  return buildPdf(
    `/Helvetica findfont 12 scalefont setfont
72 700 moveto (Distinct document number ${documentCounter}.) show
showpage
`,
    `unique-${documentCounter}`
  )
}

async function stage(bytes: Uint8Array): Promise<string> {
  const key = newQuarantineKey()
  await objectStore.put({
    bucket: env.BUCKET_QUARANTINE,
    key,
    body: bytes,
    contentType: "application/pdf",
  })
  return key
}

/** A draft to attach an ingest to, since dedupe now needs a row to exclude. */
async function insertDraft(): Promise<string> {
  const [row] = await db
    .insert(reports)
    .values({})
    .returning({ id: reports.id })
  return row.id
}

const createdDrafts: string[] = []

async function draft(): Promise<string> {
  const id = await insertDraft()
  createdDrafts.push(id)
  return id
}

afterAll(async () => {
  for (const id of createdDrafts) {
    await db.delete(reports).where(eq(reports.id, id))
  }
  rmSync(workdir, { recursive: true, force: true })
})

describe("signature validation", () => {
  it("accepts a real PDF", async () => {
    expect(hasPdfMagic(PDF)).toBe(true)
    expect(await looksLikePdf(PDF)).toBe(true)
  })

  it("rejects HTML wearing a .pdf name", async () => {
    const html = new TextEncoder().encode("<!doctype html><script>alert(1)")
    expect(hasPdfMagic(html)).toBe(false)
    expect(await looksLikePdf(html)).toBe(false)
  })
})

describe("the dangerous-construct scan", () => {
  it("finds an embedded /OpenAction", () => {
    const bytes = new TextEncoder().encode(
      "%PDF-1.4\n1 0 obj << /OpenAction << /S /JavaScript /JS (app.alert(1)) >> >>"
    )

    expect(scanForDangerousConstructs(bytes)).toEqual(
      expect.arrayContaining(["/OpenAction", "/JavaScript", "/JS"])
    )
  })

  it("finds nothing in an ordinary document", () => {
    expect(scanForDangerousConstructs(PDF)).toEqual([])
  })
})

describe("the failure taxonomy", () => {
  it("marks bad bytes permanent so the importer stops retrying them", () => {
    expect(classifyFailure("encrypted")).toBe("permanent")
    expect(classifyFailure("not_a_pdf")).toBe("permanent")
    expect(classifyFailure("duplicate")).toBe("permanent")
    expect(isRetryable("encrypted")).toBe(false)
  })

  it("marks infrastructure failures transient", () => {
    expect(classifyFailure("missing")).toBe("transient")
    expect(classifyFailure("storage_error")).toBe("transient")
    expect(isRetryable("missing")).toBe(true)
  })
})

describe("ingesting a quarantined object", () => {
  it("extracts page count, checksum, embedded title and text", async () => {
    const key = await stage(PDF)
    const result = await ingestQuarantineObject(key, await draft())

    expect(result.ok).toBe(true)
    if (!result.ok) return

    const doc = result.document
    expect(doc.pageCount).toBe(2)
    expect(doc.checksum).toHaveLength(32)
    expect(doc.embeddedTitle).toBe("Orbital decay in low-earth constellations")
    expect(doc.embeddedAuthor).toBe("L. Olsen")
    expect(doc.fulltext).toContain("collision avoidance")

    // The byte size describes the sanitized artifact — the bytes that will be
    // stored and served.
    expect(doc.byteSize).toBe(result.sanitizedBytes.byteLength)

    await objectStore.delete({ bucket: env.BUCKET_QUARANTINE, key })
  })

  // The property the whole dedupe scheme rests on. Ghostscript stamps
  // `/CreationDate` into its output, so hashing the sanitized artifact would
  // make this fail for any document carrying active content — and fail
  // silently, as a duplicate record rather than an error.
  it("derives the same checksum from the same source bytes every time", async () => {
    const document = uniquePdf()

    const firstKey = await stage(document)
    const first = await ingestQuarantineObject(firstKey, await draft())

    const secondKey = await stage(document)
    const second = await ingestQuarantineObject(secondKey, await draft())

    expect(first.ok && second.ok).toBe(true)
    if (!first.ok || !second.ok) return

    expect(Buffer.from(first.document.checksum)).toEqual(
      Buffer.from(second.document.checksum)
    )

    await objectStore.delete({ bucket: env.BUCKET_QUARANTINE, key: firstKey })
    await objectStore.delete({ bucket: env.BUCKET_QUARANTINE, key: secondKey })
  })

  it("sanitizes the document and reports what it did", async () => {
    const key = await stage(PDF)
    const result = await ingestQuarantineObject(key, await draft())

    expect(result.ok).toBe(true)
    if (!result.ok) return

    // Whichever tier ran, the output is still a PDF — §9.3's re-verification.
    expect(hasPdfMagic(result.sanitizedBytes)).toBe(true)
    expect(result.document.sanitization.originalByteSize).toBe(PDF.byteLength)
    expect(["mutool", "ghostscript", "none"]).toContain(
      result.document.sanitization.method
    )

    await objectStore.delete({ bucket: env.BUCKET_QUARANTINE, key })
  })

  it("refuses bytes already archived under another record", async () => {
    const document = uniquePdf()
    const first = await draft()
    const firstKey = await stage(document)
    const firstResult = await ingestQuarantineObject(firstKey, first)

    expect(firstResult.ok).toBe(true)
    if (!firstResult.ok) return

    // Record the checksum the way `completeUpload` would, so the second
    // deposit has something to collide with.
    await db
      .update(reports)
      .set({
        checksum: Buffer.from(firstResult.document.checksum),
        title: "The original",
      })
      .where(eq(reports.id, first))

    const secondKey = await stage(document)
    const secondResult = await ingestQuarantineObject(secondKey, await draft())

    expect(secondResult.ok).toBe(false)
    if (secondResult.ok) return

    expect(secondResult.reason).toBe("duplicate")
    expect(secondResult.duplicateOf?.reportId).toBe(first)
    expect(secondResult.detail).toContain("The original")

    // The rejected copy is not left sitting in the bucket.
    expect(
      await objectStore.head({ bucket: env.BUCKET_QUARANTINE, key: secondKey })
    ).toBeNull()

    await objectStore.delete({ bucket: env.BUCKET_QUARANTINE, key: firstKey })
  })

  it("lets the same draft replace its own file", async () => {
    const document = uniquePdf()
    const id = await draft()

    const firstKey = await stage(document)
    const firstResult = await ingestQuarantineObject(firstKey, id)
    expect(firstResult.ok).toBe(true)
    if (!firstResult.ok) return

    await db
      .update(reports)
      .set({ checksum: Buffer.from(firstResult.document.checksum) })
      .where(eq(reports.id, id))

    // Re-uploading the same document to the draft that already holds it is a
    // replacement, not a collision.
    const secondKey = await stage(document)
    const secondResult = await ingestQuarantineObject(secondKey, id)

    expect(secondResult.ok).toBe(true)

    await objectStore.delete({ bucket: env.BUCKET_QUARANTINE, key: firstKey })
    await objectStore.delete({ bucket: env.BUCKET_QUARANTINE, key: secondKey })
  })

  it("rejects a non-PDF and deletes it from quarantine", async () => {
    const key = await stage(new TextEncoder().encode("<html>not a pdf</html>"))

    const result = await ingestQuarantineObject(key, await draft())
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.reason).toBe("not_a_pdf")

    // Nothing invalid is left sitting in the bucket.
    expect(
      await objectStore.head({ bucket: env.BUCKET_QUARANTINE, key })
    ).toBeNull()
  })

  it("rejects an empty upload", async () => {
    const key = await stage(new Uint8Array(0))

    const result = await ingestQuarantineObject(key, await draft())
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.reason).toBe("empty")
  })

  it("reports a missing object rather than throwing", async () => {
    const result = await ingestQuarantineObject(
      `uploads/${randomUUID()}.pdf`,
      await draft()
    )

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.reason).toBe("missing")
  })
})
