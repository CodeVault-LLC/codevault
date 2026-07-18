import { extractText, getDocumentProxy, getMeta } from "unpdf"

import type { ExtractedDocument, IngestResult } from "./types"
import { createHash } from "node:crypto"

// Robustness against malformed input is explicitly best-effort, so parsing runs
// under a wall clock (design §9.2). A PDF crafted to make the parser spin must
// not hold a request open.
const PARSE_TIMEOUT_MS = 30_000

// Phase 1 uses unpdf, the pure-JS path. Phase 2 moves extraction to poppler and
// mutool on the container host, which are faster and handle more real-world
// documents — and adds the OCR fallback for scans (design §9.4).
//
// Note this goes slightly beyond Phase 1's stated scope, which said "no
// full-text yet". It has to: §11 blocks publish on the document containing
// searchable text, so with no extraction at all nothing could ever be
// published. Text falls out of the same parse as the page count, so taking it
// now costs nothing.

function withTimeout<T>(work: Promise<T>, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`${label} timed out after ${PARSE_TIMEOUT_MS}ms`)),
      PARSE_TIMEOUT_MS
    )

    work.then(resolve, reject).finally(() => clearTimeout(timer))
  })
}

function firstString(value: unknown): string | null {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null
}

/**
 * Derives everything the record stores about the file itself.
 *
 * Extraction failure is not ingest failure: if no text comes out, the document
 * is still accepted with `fulltext: null` and can be backfilled later by a pass
 * keyed off `fulltext is null`. Only a file that cannot be parsed at all is
 * rejected.
 */
export async function extractDocument(
  bytes: Uint8Array
): Promise<IngestResult> {
  // Both of these are read BEFORE parsing, and deliberately so: pdf.js takes
  // ownership of the buffer it is handed and detaches it, after which
  // `bytes.byteLength` reads 0 and the bytes are gone.
  const byteSize = bytes.byteLength
  const checksum = new Uint8Array(createHash("sha256").update(bytes).digest())

  let pageCount: number
  let fulltext: string | null = null
  let embeddedTitle: string | null = null
  let embeddedAuthor: string | null = null

  try {
    // One parse, reused for text and metadata — and handed its own copy, so
    // the caller's buffer survives. Without this, `ingestQuarantineObject`
    // would be left holding a detached array.
    const pdf = await withTimeout(
      getDocumentProxy(new Uint8Array(bytes)),
      "PDF parse"
    )

    const extracted = await withTimeout(
      extractText(pdf, { mergePages: true }),
      "Text extraction"
    )

    pageCount = extracted.totalPages
    fulltext = extracted.text.trim() === "" ? null : extracted.text

    try {
      const meta = await withTimeout(getMeta(pdf), "Metadata read")
      embeddedTitle = firstString(meta.info.Title)
      embeddedAuthor = firstString(meta.info.Author)
    } catch {
      // Metadata is a nicety — its absence only weakens the drift diff.
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error"

    // pdf.js reports an encrypted document as a password exception. That is a
    // permanent failure: retrying will not help, so the importer must not burn
    // attempts on it (design §10.5).
    const encrypted = /password/i.test(message)

    return {
      ok: false,
      reason: encrypted ? "encrypted" : "unreadable",
      detail: message,
    }
  }

  const document: ExtractedDocument = {
    byteSize,
    checksum,
    pageCount,
    embeddedTitle,
    embeddedAuthor,
    fulltext,
  }

  return { ok: true, document }
}
