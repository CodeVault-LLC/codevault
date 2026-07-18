import { and, eq } from "drizzle-orm"

import type { GateCandidate } from "@/core/reports/publish-gate-types"
import type { PublishOutcome } from "./publish-types"
import { allocateAccessionId } from "./accession"
import { db } from "@/server/db/client"
import { env } from "@/env/server"
import { evaluatePublishGate } from "@/core/reports/publish-gate"
import { objectStore } from "@/server/storage/object-store"
import { reportPdfKey, servingBucket } from "@/server/storage/keys"
import { reports } from "@/server/db/schema"

function toGateCandidate(row: typeof reports.$inferSelect): GateCandidate {
  return {
    title: row.title,
    abstract: row.abstract,
    abstractOverrideReason: row.abstractOverrideReason,
    authors: row.authors,
    classification: row.classification,
    dissemination: row.dissemination,
    docType: row.docType,
    subjectCategory: row.subjectCategory,
    keywords: row.keywords,
    pdfKey: row.pdfKey,
    fileSize: row.fileSize,
    checksum: row.checksum,
    fulltext: row.fulltext,
    pdfEmbeddedTitle: row.pdfEmbeddedTitle,
  }
}

/**
 * Publishes a draft: allocates its permanent identifier, moves its file into
 * the serving bucket and flips its status.
 *
 * Publication is a state transition, not a copy into a second system — there is
 * one `reports` table, and the public site and dashboard read it through the
 * same query layer (design §8.4).
 *
 * The three steps are ordered so that every failure is retryable:
 *
 *   1. Commit the identifier and destination key while still a draft. Once
 *      durable, a retry reuses them instead of burning a second identifier.
 *   2. Copy the file into the serving bucket. Idempotent.
 *   3. Commit the status flip, then delete the quarantine source.
 *
 * A crash between 2 and 3 leaves a draft with its file already in place, which
 * the next attempt completes. The reverse order — flipping status first — would
 * leave a published record pointing at a file that is not there yet, which is
 * strictly worse (design §10.5).
 */
export async function publishReport(reportId: string): Promise<PublishOutcome> {
  // Step 1: gate and allocate, inside one transaction.
  const prepared = await db.transaction(async (tx) => {
    const rows = await tx
      .select()
      .from(reports)
      .where(eq(reports.id, reportId))
      .limit(1)

    if (rows.length === 0) return { error: "not_found" } as const

    const row = rows[0]
    if (row.status !== "draft") return { error: "not_a_draft" } as const

    const gate = evaluatePublishGate(toGateCandidate(row))
    if (!gate.publishable) return { error: "gate_failed", gate } as const

    // Reuse an identifier from an interrupted earlier attempt rather than
    // allocating a second one.
    const accessionId =
      row.accessionId ??
      (await allocateAccessionId(tx, new Date().getUTCFullYear()))

    const quarantineKey = row.pdfKey
    const destinationKey = quarantineKey ? reportPdfKey(accessionId) : null

    await tx
      .update(reports)
      .set({ accessionId, updatedAt: new Date() })
      .where(eq(reports.id, reportId))

    return {
      error: null,
      accessionId,
      quarantineKey,
      destinationKey,
      classification: row.classification!,
    } as const
  })

  if (prepared.error) {
    return { ok: false, reason: prepared.error, gate: prepared.gate }
  }

  const { accessionId, quarantineKey, destinationKey, classification } =
    prepared
  const bucket = servingBucket(classification)

  // Step 2: copy into the serving bucket. Until this succeeds the file is not
  // reachable from any public URL, so an abandoned draft is never live.
  if (quarantineKey && destinationKey) {
    await objectStore.copy(
      { bucket: env.BUCKET_QUARANTINE, key: quarantineKey },
      { bucket, key: destinationKey }
    )
  }

  // Step 3: flip status. Guarded on still being a draft so two concurrent
  // publishes cannot both report success.
  const published = await db
    .update(reports)
    .set({
      status: "published",
      pdfKey: destinationKey,
      publishedAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date(),
    })
    .where(and(eq(reports.id, reportId), eq(reports.status, "draft")))
    .returning({ accessionId: reports.accessionId })

  if (published.length === 0) return { ok: false, reason: "not_a_draft" }

  // Best-effort. A leftover quarantine object is harmless and expires on the
  // bucket's 24h lifecycle rule; failing the publish over it would be worse.
  if (quarantineKey) {
    await objectStore
      .delete({ bucket: env.BUCKET_QUARANTINE, key: quarantineKey })
      .catch(() => {})
  }

  return { ok: true, accessionId }
}
