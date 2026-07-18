// Exercises the ingest pipeline against the real object store, using a real
// PDF produced by Ghostscript (two pages, with embedded Title and Author).

import { afterAll, describe, expect, it } from "vitest"
import { execFileSync } from "node:child_process"
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { tmpdir } from "node:os"

import { env } from "@/env/server"
import { hasPdfMagic, looksLikePdf } from "./validate"
import { ingestQuarantineObject } from "./ingest"
import { newQuarantineKey } from "@/server/storage/keys"
import { objectStore } from "@/server/storage/object-store"

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

function buildPdf(): Uint8Array {
  const ps = join(workdir, "sample.ps")
  const pdf = join(workdir, "sample.pdf")
  writeFileSync(ps, POSTSCRIPT)

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

const PDF = buildPdf()

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

afterAll(() => {
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

describe("ingesting a quarantined object", () => {
  it("extracts page count, checksum, embedded title and text", async () => {
    const key = await stage(PDF)
    const result = await ingestQuarantineObject(key)

    expect(result.ok).toBe(true)
    if (!result.ok) return

    const doc = result.document
    expect(doc.pageCount).toBe(2)
    expect(doc.byteSize).toBe(PDF.byteLength)
    expect(doc.checksum).toHaveLength(32)
    expect(doc.embeddedTitle).toBe("Orbital decay in low-earth constellations")
    expect(doc.embeddedAuthor).toBe("L. Olsen")
    expect(doc.fulltext).toContain("collision avoidance")

    await objectStore.delete({ bucket: env.BUCKET_QUARANTINE, key })
  })

  it("rejects a non-PDF and deletes it from quarantine", async () => {
    const key = await stage(new TextEncoder().encode("<html>not a pdf</html>"))

    const result = await ingestQuarantineObject(key)
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

    const result = await ingestQuarantineObject(key)
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.reason).toBe("empty")
  })

  it("reports a missing object rather than throwing", async () => {
    const result = await ingestQuarantineObject("uploads/does-not-exist.pdf")

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.reason).toBe("missing")
  })
})
