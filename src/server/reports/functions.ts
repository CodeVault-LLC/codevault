import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"

import type { Viewer } from "./types"
import { getReportByAccessionId, listReports } from "./queries"

// The public reports server reads as an anonymous viewer, always.
//
// The query layer is shared with the dashboard and differs only in the Viewer
// passed in (design §8.4) — this is where the public half of that decision is
// made. Pinning it to anonymous rather than deriving it from the session means
// the public surface cannot serve an internal record even to a signed-in
// admin, and it makes §8.4's acceptance test (load the record page in a private
// window) exercise the same code path a reader gets. Staff preview internal
// records through /admin, which passes a staff viewer.
const PUBLIC_VIEWER: Viewer = { kind: "anonymous" }

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

export const fetchPublicReport = createServerFn({ method: "GET" })
  .validator(recordInput)
  .handler(({ data }) =>
    getReportByAccessionId(PUBLIC_VIEWER, data.accessionId)
  )
