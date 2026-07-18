import { createServerFn } from "@tanstack/react-start"
import { eq } from "drizzle-orm"

import {
  beginUploadSchema,
  completeUploadSchema,
  reportIdSchema,
  saveDraftSchema,
} from "./schema"
import {
  beginUpload,
  completeUpload,
  createDraft,
  getDraft,
  saveDraft,
} from "./deposit"
import { deleteDraft, listDrafts } from "./drafts"
import { db } from "@/server/db/client"
import { publishReport } from "@/server/reports/publish"
import { recordAudit } from "@/server/audit/audit"
import { reports } from "@/server/db/schema"
import { requireCapability } from "@/server/auth/middleware"

// Every function here carries a capability.
//
// These are same-origin RPC endpoints reachable by direct POST no matter which
// route rendered the UI, so the guard on /admin protects the view and this
// protects the data (design §7.6). Naming the operation rather than the role
// keeps the role mapping in one table (`@/core/auth/permissions`).

const writeReports = requireCapability("reports.write")
const readReports = requireCapability("reports.read")

/**
 * POST, and called from a button rather than a route loader.
 *
 * It writes a row, so the only thing that may trigger it is an explicit act of
 * intent. A loader that created a draft would mint one on every visit, every
 * refresh and every back-navigation, filling the table with rows nobody asked
 * for and leaving no way to tell which of them was meant.
 */
export const createDraftFn = createServerFn({ method: "POST" })
  .middleware([writeReports])
  .handler(() => createDraft())

export const listDraftsFn = createServerFn({ method: "GET" })
  .middleware([readReports])
  .handler(() => listDrafts())

export const deleteDraftFn = createServerFn({ method: "POST" })
  .middleware([requireCapability("reports.discard")])
  .validator(reportIdSchema)
  .handler(async ({ data, context }) => {
    // Read before the delete, because afterwards there is nothing left to name
    // the entry with — and "which draft was discarded" is the only interesting
    // thing this entry has to say.
    const rows = await db
      .select({ title: reports.title })
      .from(reports)
      .where(eq(reports.id, data.reportId))
      .limit(1)

    const result = await deleteDraft(data.reportId)

    await recordAudit({
      actor: context.actor,
      action: "report.discard",
      outcome: result.ok ? "success" : "failure",
      targetType: "report",
      targetId: data.reportId,
      targetLabel: rows[0]?.title || "Untitled draft",
      summary: result.ok
        ? "Discarded a draft and its uploaded file."
        : `Refused: ${result.reason}.`,
    })

    return result
  })

export const beginUploadFn = createServerFn({ method: "POST" })
  .middleware([writeReports])
  .validator(beginUploadSchema)
  .handler(({ data }) => beginUpload(data.reportId, data.contentType))

export const completeUploadFn = createServerFn({ method: "POST" })
  .middleware([writeReports])
  .validator(completeUploadSchema)
  .handler(({ data }) => completeUpload(data.reportId, data.quarantineKey))

export const saveDraftFn = createServerFn({ method: "POST" })
  .middleware([writeReports])
  .validator(saveDraftSchema)
  .handler(({ data }) => saveDraft(data))

export const getDraftFn = createServerFn({ method: "GET" })
  .middleware([readReports])
  .validator(reportIdSchema)
  .handler(({ data }) => getDraft(data.reportId))

/**
 * Publish, audited.
 *
 * A refused publish is recorded as well as a successful one. A gate refusal is
 * not an error — it is the system working — but "someone tried to publish this
 * and could not" is exactly what you want to find in the log three weeks later
 * when asking why a record is still sitting in draft.
 */
export const publishReportFn = createServerFn({ method: "POST" })
  .middleware([requireCapability("reports.publish")])
  .validator(reportIdSchema)
  .handler(async ({ data, context }) => {
    const result = await publishReport(data.reportId)

    const rows = await db
      .select({ title: reports.title, classification: reports.classification })
      .from(reports)
      .where(eq(reports.id, data.reportId))
      .limit(1)

    await recordAudit({
      actor: context.actor,
      action: "report.publish",
      outcome: result.ok ? "success" : "failure",
      targetType: "report",
      targetId: data.reportId,
      targetLabel: result.ok ? result.accessionId : rows[0]?.title,
      // The column that makes "who put something internal into the world"
      // answerable without opening the record itself (design §7.7).
      classification: rows[0]?.classification,
      summary: result.ok
        ? `Published ${result.accessionId}.`
        : `Publish refused: ${result.reason}.`,
      detail: result.ok
        ? {}
        : {
            reason: result.reason,
            blockers:
              result.gate?.blockers.map((finding) => finding.code) ?? [],
          },
    })

    return result
  })
