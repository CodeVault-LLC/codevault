import type { DocType } from "@/core/reports/types"
import type { FacetDimension } from "@/core/reports/search-params"
import type { ReportRow } from "@/server/db/types"

// The facet vocabulary belongs to the URL contract, not to the query layer —
// re-exported so server-side callers have one import for the search types.
export type { FacetDimension }

// Who is asking. Every read of the reports table takes one of these, and the
// public site and the dashboard differ only in which one they pass — there is
// one table and one query layer, not a published mirror that could drift
// (design §8.4).
export type Viewer = { kind: "anonymous" } | { kind: "staff"; userId: string }

// What a listing row needs. Narrower than the full row on purpose: `fulltext`
// runs 50KB–2MB per record and must never be selected for a list of thirty.
export type ReportSummary = Pick<
  ReportRow,
  | "accessionId"
  | "title"
  | "authors"
  | "docType"
  | "publishedAt"
  | "pageCount"
  | "subjectCategory"
>

// The record page's view of a report. Excludes `fulltext` and the internal
// UUID: neither belongs in a payload serialized to a browser.
export type ReportDetail = Omit<ReportRow, "id" | "fulltext" | "searchVector">

export type ListReportsOptions = {
  limit: number
  offset: number
}

export type SearchReportsOptions = ListReportsOptions & {
  // Free text, parsed by `websearch_to_tsquery`. Absent means "everything",
  // ordered by date rather than by relevance.
  q?: string
  year?: number
  docType?: DocType
  subject?: string
  project?: string
  author?: string
}

export type FacetValue = {
  value: string
  // What the row renders — the vocabulary label for a doc type, the value
  // itself for a year.
  label: string
  count: number
}

export type Facets = Record<FacetDimension, FacetValue[]>

export type SearchResults = {
  reports: ReportSummary[]
  // The count of everything matching, not of the page — pagination needs it and
  // "3 of 412 records" is the one number that tells a reader whether to refine.
  total: number
  facets: Facets
}

// One year's worth of the shelf, for /reports/browse.
export type BrowseYear = {
  year: number
  count: number
}

export type BrowseSubject = {
  slug: string
  name: string
  count: number
}

export type BrowseIndex = {
  years: BrowseYear[]
  subjects: BrowseSubject[]
  total: number
}

// The minimum a sitemap entry needs. Deliberately not a ReportSummary: a
// sitemap of the whole archive should not carry titles and author arrays
// through memory to render fifty bytes of XML per row.
export type SitemapEntry = {
  accessionId: string
  updatedAt: Date
}
