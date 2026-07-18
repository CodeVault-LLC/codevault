import { createServerFn } from "@tanstack/react-start"

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
import { publishReport } from "@/server/reports/publish"
import { requireStaff } from "@/server/auth/middleware"

// Every function here carries `requireStaff`.
//
// These are same-origin RPC endpoints reachable by direct POST no matter which
// route rendered the UI, so the guard on /admin protects the view and this
// protects the data (design §7.6).

/**
 * POST, and called from a button rather than a route loader.
 *
 * It writes a row, so the only thing that may trigger it is an explicit act of
 * intent. A loader that created a draft would mint one on every visit, every
 * refresh and every back-navigation, filling the table with rows nobody asked
 * for and leaving no way to tell which of them was meant.
 */
export const createDraftFn = createServerFn({ method: "POST" })
  .middleware([requireStaff])
  .handler(() => createDraft())

export const listDraftsFn = createServerFn({ method: "GET" })
  .middleware([requireStaff])
  .handler(() => listDrafts())

export const deleteDraftFn = createServerFn({ method: "POST" })
  .middleware([requireStaff])
  .validator(reportIdSchema)
  .handler(({ data }) => deleteDraft(data.reportId))

export const beginUploadFn = createServerFn({ method: "POST" })
  .middleware([requireStaff])
  .validator(beginUploadSchema)
  .handler(({ data }) => beginUpload(data.reportId, data.contentType))

export const completeUploadFn = createServerFn({ method: "POST" })
  .middleware([requireStaff])
  .validator(completeUploadSchema)
  .handler(({ data }) => completeUpload(data.reportId, data.quarantineKey))

export const saveDraftFn = createServerFn({ method: "POST" })
  .middleware([requireStaff])
  .validator(saveDraftSchema)
  .handler(({ data }) => saveDraft(data))

export const getDraftFn = createServerFn({ method: "GET" })
  .middleware([requireStaff])
  .validator(reportIdSchema)
  .handler(({ data }) => getDraft(data.reportId))

export const publishReportFn = createServerFn({ method: "POST" })
  .middleware([requireStaff])
  .validator(reportIdSchema)
  .handler(({ data }) => publishReport(data.reportId))
