import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"

import type { Viewer } from "./types"
import {
  REPORTS_PAGE_SIZE,
  reportSearchSchema,
} from "@/core/reports/search-params"
import {
  browseIndex,
  getReportByAccessionId,
  listReports,
  searchReports,
} from "./queries"

// The public reports server reads as an anonymous viewer, always.
//
// The query layer is shared with the dashboard and differs only in the Viewer
// passed in (design §8.4) — this is where the public half of that decision is
// made. Pinning it to anonymous rather than deriving it from the session means
// the public surface cannot serve an internal record even to a signed-in
// admin, and it makes §8.4's acceptance test (load the record page in a private
// window) exercise the same code path a reader gets. Staff preview internal
// records through /admin, which passes a staff viewer.
export const PUBLIC_VIEWER: Viewer = { kind: "anonymous" }

const listInput = z.object({
  limit: z.number().int().min(1).max(100).default(50),
  offset: z.number().int().min(0).default(0),
})

const recordInput = z.object({
  accessionId: z.string().min(1).max(64),
})

export const fetchPublicReports = createServerFn({ method: "GET" })
  .validator(listInput)
  .handler(({ data }) => listReports(PUBLIC_VIEWER, data))

/**
 * Faceted search.
 *
 * Takes the URL's own search schema rather than a bespoke input shape, so the
 * link a reader shares and the query the server runs are the same object with
 * page-to-offset arithmetic in between. Validated again here because a server
 * function is a public endpoint whatever the router did on the way in.
 */
export const fetchReportSearch = createServerFn({ method: "GET" })
  .validator(reportSearchSchema)
  .handler(({ data }) =>
    searchReports(PUBLIC_VIEWER, {
      q: data.q || undefined,
      year: data.year,
      docType: data.type,
      subject: data.subject,
      project: data.project,
      author: data.author,
      limit: REPORTS_PAGE_SIZE,
      offset: (data.page - 1) * REPORTS_PAGE_SIZE,
    })
  )

export const fetchBrowseIndex = createServerFn({ method: "GET" }).handler(() =>
  browseIndex(PUBLIC_VIEWER)
)

export const fetchPublicReport = createServerFn({ method: "GET" })
  .validator(recordInput)
  .handler(({ data }) =>
    getReportByAccessionId(PUBLIC_VIEWER, data.accessionId)
  )
