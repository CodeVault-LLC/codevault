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
import { publishReport } from "@/server/reports/publish"
import { requireStaff } from "@/server/auth/middleware"

// Every function here carries `requireStaff`.
//
// These are same-origin RPC endpoints reachable by direct POST no matter which
// route rendered the UI, so the guard on /admin protects the view and this
// protects the data (design §7.6).

export const createDraftFn = createServerFn({ method: "POST" })
  .middleware([requireStaff])
  .handler(() => createDraft())

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
