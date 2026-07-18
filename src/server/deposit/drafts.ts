import { and, eq, sql } from "drizzle-orm"

import type { DeleteDraftResult, DraftSummary } from "./types"
import { db } from "@/server/db/client"
import { env } from "@/env/server"
import { evaluatePublishGate } from "@/core/reports/publish-gate"
import { objectStore } from "@/server/storage/object-store"
import { reports } from "@/server/db/schema"
import { toGateCandidate } from "@/server/reports/publish"

/**
 * Drafts read in one scan.
 *
 * The gate is a pure TypeScript function rather than SQL, so "which drafts are
 * blocked" cannot be answered by the database — the rows have to be fetched and
 * judged in process. Fine at this corpus size, and not past a few thousand
 * drafts, at which point the answer is a materialized `blocker_count` column
 * maintained on write rather than a bigger scan here.
 */
const DRAFT_SCAN_LIMIT = 200

/**
 * How much of `fulltext` to read when probing whether any was extracted.
 *
 * Bounded on purpose: `fulltext` is a TOASTed column holding an entire
 * extracted document, and selecting it whole for 200 drafts would pull tens of
 * megabytes per page load. The gate only asks whether the trimmed value is
 * empty, and `btrim` before `left` makes the prefix empty exactly when the
 * whole value is — so the verdict is identical.
 *
 * That equivalence is what makes the truncation safe. If the gate ever starts
 * measuring fulltext length, select the column in full instead.
 */
const FULLTEXT_PROBE_CHARS = 64

/**
 * Every draft in progress, each with the gate's verdict on it.
 *
 * One query serving both the deposit landing page and the overview's "needs
 * attention" panel. They differ only in how they sort and filter the result,
 * which is not worth two round trips or two copies of this projection.
 */
export async function listDrafts(): Promise<DraftSummary[]> {
  const rows = await db
    .select({
      id: reports.id,
      createdAt: reports.createdAt,
      updatedAt: reports.updatedAt,
      pageCount: reports.pageCount,

      // Exactly the gate's own columns — see `toGateCandidate`.
      title: reports.title,
      abstract: reports.abstract,
      abstractOverrideReason: reports.abstractOverrideReason,
      authors: reports.authors,
      classification: reports.classification,
      dissemination: reports.dissemination,
      docType: reports.docType,
      subjectCategory: reports.subjectCategory,
      keywords: reports.keywords,
      pdfKey: reports.pdfKey,
      fileSize: reports.fileSize,
      checksum: reports.checksum,
      pdfEmbeddedTitle: reports.pdfEmbeddedTitle,

      fulltext: sql<
        string | null
      >`left(btrim(${reports.fulltext}), ${FULLTEXT_PROBE_CHARS})`,
    })
    .from(reports)
    .where(eq(reports.status, "draft"))
    .orderBy(reports.createdAt)
    .limit(DRAFT_SCAN_LIMIT)

  return rows.map((row) => {
    const gate = evaluatePublishGate(toGateCandidate(row))

    return {
      id: row.id,
      // A draft may genuinely have no title yet; the gate is what complains
      // about that, so the row just needs something to render.
      title: row.title || "Untitled draft",
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      hasFile: Boolean(row.pdfKey),
      pageCount: row.pageCount,
      fileSize: row.fileSize,
      blockerCount: gate.blockers.length,
      topBlocker: gate.blockers[0]?.message ?? "",
      publishable: gate.publishable,
    } satisfies DraftSummary
  })
}

/**
 * Discards a draft and the quarantined file behind it.
 *
 * Only ever a draft. Withdrawal is a state transition and not a delete —
 * citations must not break (design §4.4) — so a published record has no path
 * through here at all, and the status predicate in the `where` clause is what
 * enforces that rather than a check the caller could forget.
 *
 * The object is deleted before the row, in that order deliberately. A crash
 * between the two leaves a row pointing at a key that is gone, which renders as
 * a draft with no file — recoverable by re-uploading. The reverse order leaves
 * an object nothing references, which nothing would ever clean up before the
 * bucket's 24h lifecycle rule notices.
 */
export async function deleteDraft(
  reportId: string
): Promise<DeleteDraftResult> {
  const rows = await db
    .select({ pdfKey: reports.pdfKey, status: reports.status })
    .from(reports)
    .where(eq(reports.id, reportId))
    .limit(1)

  if (rows.length === 0) return { ok: false, reason: "not_found" }
  if (rows[0].status !== "draft") return { ok: false, reason: "not_a_draft" }

  const { pdfKey } = rows[0]

  if (pdfKey) {
    try {
      await objectStore.delete({ bucket: env.BUCKET_QUARANTINE, key: pdfKey })
    } catch {
      // The lifecycle rule expires the quarantine bucket after 24h, so a failed
      // delete costs a day of storage rather than a leak. Not a reason to keep
      // a draft the depositor has asked to be rid of.
    }
  }

  await db
    .delete(reports)
    .where(and(eq(reports.id, reportId), eq(reports.status, "draft")))

  return { ok: true }
}
