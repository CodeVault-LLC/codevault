import { and, eq } from "drizzle-orm"
import type { z } from "zod"

import type {
  BeginUploadResult,
  CompleteUploadResult,
  DraftView,
} from "./types"
import type { GateCandidate } from "@/core/reports/publish-gate-types"
import type { saveDraftSchema } from "./schema"
import { db } from "@/server/db/client"
import { env } from "@/env/server"
import { evaluatePublishGate } from "@/core/reports/publish-gate"
import { ingestQuarantineObject } from "@/server/ingest/ingest"
import { newQuarantineKey } from "@/server/storage/keys"
import { objectStore } from "@/server/storage/object-store"
import { reports } from "@/server/db/schema"

// Short TTL: the URL is issued as the depositor picks a file and used
// immediately. R2 cannot cap upload size at signing time, so a narrow window is
// one of the few mitigations available (design §9.1).
const UPLOAD_TTL_SECONDS = 10 * 60

const TEXT_PREVIEW_CHARS = 400

/** Creates an empty draft. No accession ID is allocated until publish. */
export async function createDraft(): Promise<string> {
  const [row] = await db.insert(reports).values({}).returning({
    id: reports.id,
  })
  return row.id
}

/**
 * Issues a presigned PUT into the quarantine bucket.
 *
 * The key is generated server-side and random — never derived from the
 * uploaded filename, which would hand a user control over the storage path and
 * extension.
 */
export async function beginUpload(
  reportId: string,
  contentType: string
): Promise<BeginUploadResult> {
  const quarantineKey = newQuarantineKey()

  const uploadUrl = await objectStore.presignUpload({
    bucket: env.BUCKET_QUARANTINE,
    key: quarantineKey,
    contentType,
    expiresInSeconds: UPLOAD_TTL_SECONDS,
  })

  // Recorded against the draft so a client that uploads and then never calls
  // back still leaves a trail. Until publish this key points at quarantine, so
  // the file is not reachable from any public URL.
  await db
    .update(reports)
    .set({ pdfKey: quarantineKey, updatedAt: new Date() })
    .where(and(eq(reports.id, reportId), eq(reports.status, "draft")))

  return { quarantineKey, uploadUrl, expiresInSeconds: UPLOAD_TTL_SECONDS }
}

/**
 * Runs §9 over the uploaded object and writes what it derived onto the draft.
 *
 * Everything here is derived, never hand-entered: page count, size, checksum,
 * extracted text, and the PDF's embedded title — the last of which exists so
 * the dashboard can diff it against what the depositor typed and surface
 * metadata drift (design §1).
 */
export async function completeUpload(
  reportId: string,
  quarantineKey: string
): Promise<CompleteUploadResult> {
  const result = await ingestQuarantineObject(quarantineKey)

  if (!result.ok) {
    // Ingest already deleted the offending object. Clear the pointer so the
    // draft does not reference a key that is gone.
    await db
      .update(reports)
      .set({ pdfKey: null, updatedAt: new Date() })
      .where(eq(reports.id, reportId))

    return { ok: false, reason: result.reason, detail: result.detail }
  }

  const doc = result.document

  await db
    .update(reports)
    .set({
      pdfKey: quarantineKey,
      pageCount: doc.pageCount,
      fileSize: doc.byteSize,
      checksum: Buffer.from(doc.checksum),
      fulltext: doc.fulltext,
      pdfEmbeddedTitle: doc.embeddedTitle,
      updatedAt: new Date(),
    })
    .where(and(eq(reports.id, reportId), eq(reports.status, "draft")))

  return {
    ok: true,
    review: {
      pageCount: doc.pageCount,
      byteSize: doc.byteSize,
      checksum: Buffer.from(doc.checksum).toString("hex"),
      embeddedTitle: doc.embeddedTitle,
      embeddedAuthor: doc.embeddedAuthor,
      textPreview: doc.fulltext?.slice(0, TEXT_PREVIEW_CHARS) ?? null,
      hasSearchableText: Boolean(doc.fulltext?.trim()),
    },
  }
}

/**
 * Saves metadata. Always permitted, however incomplete — validation happens at
 * publish, not at save (design §2).
 */
export async function saveDraft(
  input: z.infer<typeof saveDraftSchema>
): Promise<void> {
  await db
    .update(reports)
    .set({ ...input.patch, updatedAt: new Date() })
    .where(and(eq(reports.id, input.reportId), eq(reports.status, "draft")))
}

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
 * The draft plus a live gate evaluation, so the form can show a persistent
 * checklist of what is blocking publish rather than failing on submit
 * (design §8.2).
 */
export async function getDraft(reportId: string): Promise<DraftView | null> {
  const rows = await db
    .select()
    .from(reports)
    .where(eq(reports.id, reportId))
    .limit(1)

  if (rows.length === 0) return null

  const row = rows[0]
  const gate = evaluatePublishGate(toGateCandidate(row))

  // The extracted body text is never shipped to the browser — it runs to
  // megabytes and the form has no use for it. Whether it exists is what the
  // checklist needs.
  const { fulltext, searchVector: _vector, ...rest } = row

  return {
    report: { ...rest, hasSearchableText: Boolean(fulltext?.trim()) },
    gate,
  }
}
