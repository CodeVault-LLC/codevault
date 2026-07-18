import type { ReportRow } from "@/server/db/types"

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
