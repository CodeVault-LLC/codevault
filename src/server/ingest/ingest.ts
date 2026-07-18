import type { IngestResult } from "./types"
import { env } from "@/env/server"
import { exceedsSizeLimit, looksLikePdf } from "./validate"
import { extractDocument } from "./extract"
import { objectStore } from "@/server/storage/object-store"

/**
 * Validates and characterises an object sitting in the quarantine bucket.
 *
 * One write path, two clients: the dashboard's deposit flow and the bulk-import
 * CLI both come through here. Never two write paths into one datastore
 * (design §1).
 *
 * A rejected object is deleted immediately rather than left to the bucket's 24h
 * lifecycle rule — the rule is the backstop for objects nobody ever tells us
 * about, not the primary cleanup.
 */
export async function ingestQuarantineObject(
  key: string
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

  if (!(await looksLikePdf(bytes))) {
    await objectStore.delete({ bucket, key })
    return {
      ok: false,
      reason: "not_a_pdf",
      detail: "The file is not a PDF, whatever its name or Content-Type says.",
    }
  }

  const result = await extractDocument(bytes)

  // An unreadable or encrypted file is not archivable — drop it rather than
  // leaving an object nobody can open.
  if (!result.ok) {
    await objectStore.delete({ bucket, key })
  }

  return result
}
