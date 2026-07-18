import type { IngestResult } from "./types"
import { createHash } from "node:crypto"
import { env } from "@/env/server"
import { exceedsSizeLimit, looksLikePdf } from "./validate"
import { extractDocument } from "./extract"
import { findDuplicate } from "./dedupe"
import { objectStore } from "@/server/storage/object-store"
import { renderCoverThumbnail } from "./thumbnail"
import { sanitizePdf } from "./sanitize"

/**
 * Validates, sanitizes and characterises an object sitting in quarantine.
 *
 * One write path, two clients: the dashboard's deposit flow and the bulk-import
 * CLI both come through here. Never two write paths into one datastore
 * (design §1).
 *
 * The order is load-bearing (design §9):
 *
 *   HEAD size → magic bytes → CDR sanitize → extract → thumbnail → dedupe
 *
 * Sanitization happens *before* extraction and hashing, so everything derived
 * describes the artifact that will actually be stored rather than the upload.
 * That is what makes the checksum a meaningful dedupe key and what stops the
 * full-text index describing bytes nobody will ever serve.
 *
 * A rejected object is deleted immediately rather than left to the bucket's 24h
 * lifecycle rule — the rule is the backstop for objects nobody ever tells us
 * about, not the primary cleanup.
 */
export async function ingestQuarantineObject(
  key: string,
  /** Excluded from the duplicate search, so re-uploading to a draft is fine. */
  reportId: string
): Promise<IngestResult> {
  const bucket = env.BUCKET_QUARANTINE

  const head = await objectStore.head({ bucket, key })
  if (!head) {
    return { ok: false, reason: "missing", detail: "No object at that key." }
  }

  if (head.contentLength === 0) {
    await objectStore.delete({ bucket, key })
    return { ok: false, reason: "empty", detail: "The uploaded file is empty." }
  }

  // The size cap lands here because R2 cannot enforce one at upload time.
  if (exceedsSizeLimit(head.contentLength)) {
    await objectStore.delete({ bucket, key })
    return {
      ok: false,
      reason: "too_large",
      detail: `${head.contentLength} bytes exceeds the upload limit.`,
    }
  }

  const bytes = await objectStore.get({ bucket, key })

  // Taken over the upload, before sanitization touches it, because this is the
  // deduplication key and it has to be stable for a given input. The
  // Ghostscript path is not byte-deterministic — it stamps `/CreationDate` —
  // so hashing its output would mean the same document deposited twice looked
  // like two documents. See `ExtractedDocument.checksum`.
  const checksum = new Uint8Array(createHash("sha256").update(bytes).digest())

  if (!(await looksLikePdf(bytes))) {
    await objectStore.delete({ bucket, key })
    return {
      ok: false,
      reason: "not_a_pdf",
      detail: "The file is not a PDF, whatever its name or Content-Type says.",
    }
  }

  // CDR before anything reads the document's content (design §9.3).
  const sanitized = await sanitizePdf(bytes)

  if (!sanitized.ok) {
    await objectStore.delete({ bucket, key })
    return {
      ok: false,
      reason: "sanitization_failed",
      detail: sanitized.detail,
    }
  }

  const result = await extractDocument(sanitized.bytes)

  // An unreadable or encrypted file is not archivable — drop it rather than
  // leaving an object nobody can open.
  if (!result.ok) {
    await objectStore.delete({ bucket, key })
    return result
  }

  // Same bytes as the archive will serve, so the record is never illustrated by
  // a page the depositor cannot download. Null on failure and never fatal.
  const thumbnail = await renderCoverThumbnail(sanitized.bytes)

  const duplicate = await findDuplicate(checksum, reportId)

  if (duplicate) {
    await objectStore.delete({ bucket, key })
    return {
      ok: false,
      reason: "duplicate",
      detail: duplicate.accessionId
        ? `These exact bytes are already archived as ${duplicate.accessionId} — “${duplicate.title}”.`
        : `These exact bytes are already attached to another draft — “${duplicate.title}”.`,
      duplicateOf: duplicate,
    }
  }

  return {
    ok: true,
    sanitizedBytes: sanitized.bytes,
    document: {
      ...result.document,
      checksum,
      thumbnail,
      sanitization: sanitized.report,
    },
  }
}
