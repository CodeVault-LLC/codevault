// The archive's URL contract.
//
// One schema, used by `validateSearch` on the route and by the server
// function's validator. Search state lives in the URL and nowhere else: a
// filtered result set has to be linkable, bookmarkable and crawlable, which
// rules out component state (design §12, §13).

import { z } from "zod"

import { DOC_TYPES } from "./vocabulary"

export const REPORTS_PAGE_SIZE = 25

// The values a bare /reports carries. Listed once so `stripSearchParams` can
// keep them out of the URL and the route and the server agree on what "no
// filter" means.
export const REPORT_SEARCH_DEFAULTS = {
  q: "",
  page: 1,
} as const

export const reportSearchSchema = z.object({
  q: z.string().trim().max(200).default(REPORT_SEARCH_DEFAULTS.q),
  year: z.coerce.number().int().min(1900).max(2999).optional(),
  type: z.enum(DOC_TYPES).optional(),
  subject: z.string().max(120).optional(),
  project: z.string().max(120).optional(),
  author: z.string().max(200).optional(),
  // One-based, because it is a URL a human reads. The offset arithmetic is the
  // server's problem, not the reader's.
  page: z.coerce.number().int().min(1).max(1000).default(1),
})

export type ReportSearch = z.infer<typeof reportSearchSchema>

// The dimensions the archive can be sliced by, in the order the rail shows
// them. One list, read by the query layer, the URL contract and the facet rail
// alike, so a dimension cannot be added to one and forgotten in another.
export const FACET_DIMENSIONS = [
  "year",
  "docType",
  "subject",
  "project",
  "author",
] as const

export type FacetDimension = (typeof FACET_DIMENSIONS)[number]

// `docType` is `type` in a query string, because that is what a reader would
// type. This is the only place the two names meet.
export const FACET_PARAM: Record<FacetDimension, keyof ReportSearch> = {
  year: "year",
  docType: "type",
  subject: "subject",
  project: "project",
  author: "author",
}

/** Whether anything is filtering the archive, for "clear all" and empty copy. */
export function hasActiveFilters(search: ReportSearch): boolean {
  return Boolean(
    search.q ||
    search.year ||
    search.type ||
    search.subject ||
    search.project ||
    search.author
  )
}
