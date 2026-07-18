import { and, eq, isNull, lt } from "drizzle-orm"

import type { QuarantineEvent, SweepOutcome } from "./notification-types"
import { classifyFailure } from "./types"
import { db } from "@/server/db/client"
import { env } from "@/env/server"
import { ingestQuarantineObject } from "./ingest"
import { objectStore } from "@/server/storage/object-store"
import { reports } from "@/server/db/schema"

/**
 * Reacting to objects appearing in quarantine (design §9.1).
 *
 * The problem this solves: the deposit form calls `completeUpload` after its
 * PUT finishes, but a client that uploads and then closes the tab never does.
 * Without something watching the bucket, those bytes sit unvalidated
 * indefinitely — an object nobody has checked, in a bucket the pipeline trusts.
 *
 * R2's native event notifications into Cloudflare Queues are the mechanism.
 * Note this is *not* the S3-compatible bucket-notification API, which R2 does
 * not implement, so nothing here can be tested against the S3 emulator by
 * pointing it at that.
 *
 * Two entry points, because the notification is not a guarantee:
 *
 * - `handleQuarantineEvent` — the fast path, driven by the queue.
 * - `sweepOrphanedUploads`  — the backstop, for events that never arrived. A
 *   delivery guarantee of "at least once" is still not "always", and the
 *   failure mode is silent.
 */

/**
 * How long an object may sit in quarantine unclaimed before the sweep treats it
 * as abandoned.
 *
 * Comfortably longer than the presign TTL plus a slow upload of the maximum
 * size, so a legitimate in-flight deposit is never swept out from under
 * someone.
 */
const ORPHAN_AGE_MS = 60 * 60 * 1000

/**
 * Ingests an object the bucket has just told us about.
 *
 * Idempotent by design, because queue delivery is at-least-once and the same
 * event will sometimes arrive twice: an object already ingested has been
 * deleted from quarantine by the first pass, so the second finds nothing and
 * returns `missing` — which the taxonomy classes as transient, and which the
 * duplicate check below turns into a no-op rather than a retry storm.
 */
export async function handleQuarantineEvent(
  event: QuarantineEvent
): Promise<SweepOutcome> {
  // The key alone does not say which draft it belongs to; the draft recorded it
  // when the upload was presigned. No matching row means the object is not
  // attached to anything, which is exactly what the sweep exists to clean up.
  const rows = await db
    .select({
      id: reports.id,
      status: reports.status,
      checksum: reports.checksum,
    })
    .from(reports)
    .where(eq(reports.pdfKey, event.key))
    .limit(1)

  if (rows.length === 0) {
    await objectStore
      .delete({ bucket: env.BUCKET_QUARANTINE, key: event.key })
      .catch(() => {})

    return { key: event.key, outcome: "orphaned" }
  }

  const draft = rows[0]

  // The deposit form's own `completeUpload` got there first — it is the same
  // pipeline, and re-running it would sanitize an already-sanitized artifact
  // and re-hash it for nothing.
  if (draft.checksum !== null) {
    return { key: event.key, outcome: "already_ingested" }
  }

  if (draft.status !== "draft") {
    return { key: event.key, outcome: "already_ingested" }
  }

  const result = await ingestQuarantineObject(event.key, draft.id)

  if (!result.ok) {
    return {
      key: event.key,
      outcome: "rejected",
      reason: result.reason,
      failureClass: classifyFailure(result.reason),
      detail: result.detail,
    }
  }

  return { key: event.key, outcome: "ingested" }
}

/**
 * Deletes quarantined objects no draft claims.
 *
 * The bucket's 24h lifecycle rule is the real backstop and this does not
 * replace it. What it adds is the database's side of the same cleanup: a draft
 * row pointing at a key whose upload never completed, which the lifecycle rule
 * cannot see and which would otherwise show a file that is not there.
 */
export async function sweepOrphanedUploads(): Promise<SweepOutcome[]> {
  const cutoff = new Date(Date.now() - ORPHAN_AGE_MS)

  const stale = await db
    .select({ id: reports.id, pdfKey: reports.pdfKey })
    .from(reports)
    .where(
      and(
        eq(reports.status, "draft"),
        // A checksum is written only once ingest has succeeded, so its absence
        // alongside a key is precisely "uploaded but never validated".
        isNull(reports.checksum),
        lt(reports.updatedAt, cutoff)
      )
    )

  const outcomes: SweepOutcome[] = []

  for (const row of stale) {
    if (!row.pdfKey) continue

    const head = await objectStore.head({
      bucket: env.BUCKET_QUARANTINE,
      key: row.pdfKey,
    })

    if (!head) {
      // The object is gone but the draft still points at it — clear the pointer
      // so the form shows "no file" rather than a phantom.
      await db
        .update(reports)
        .set({ pdfKey: null, updatedAt: new Date() })
        .where(eq(reports.id, row.id))

      outcomes.push({ key: row.pdfKey, outcome: "orphaned" })
      continue
    }

    // The object is there and never got validated — a notification that never
    // arrived. Run it through the pipeline now.
    outcomes.push(await handleQuarantineEvent({ key: row.pdfKey }))
  }

  return outcomes
}
