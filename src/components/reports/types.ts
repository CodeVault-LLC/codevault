import type { ReportDetail, ReportSummary } from "@/server/reports/types"

export type ReportListProps = {
  reports: ReportSummary[]
}

export type ReportRowProps = {
  report: ReportSummary
}

export type ReportRecordProps = {
  report: ReportDetail
}

export type MetadataRow = {
  label: string
  // Rendered as-is when a string; `null` rows are dropped rather than shown
  // as an empty cell, so a sparse record reads as a short table.
  value: React.ReactNode | null
  // Renders in the mono face — identifiers, dates, counts.
  mono?: boolean
}

export type MetadataTableProps = {
  rows: MetadataRow[]
}
