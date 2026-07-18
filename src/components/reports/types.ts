import type {
  BrowseIndex,
  FacetDimension,
  FacetValue,
  Facets,
  ReportDetail,
  ReportSummary,
  SearchResults,
} from "@/server/reports/types"
import type { ReportSearch } from "@/core/reports/search-params"
import type { TaggableReport } from "@/core/reports/highwire"

export type ReportRowProps = {
  report: ReportSummary
}

export type ReportRecordProps = {
  report: ReportDetail
}

export type SearchResultsViewProps = {
  results: SearchResults
  search: ReportSearch
}

export type SearchBarProps = {
  search: ReportSearch
  total: number
}

export type FacetRailProps = {
  facets: Facets
  search: ReportSearch
}

export type FacetGroupProps = {
  dimension: FacetDimension
  values: FacetValue[]
  search: ReportSearch
}

export type PaginationProps = {
  page: number
  total: number
}

export type BrowseIndexProps = {
  index: BrowseIndex
}

export type HighwireTagsProps = {
  report: TaggableReport
}

export type CitationLinksProps = {
  accessionId: string
}

export type TombstoneProps = {
  withdrawnAt: Date | null
  withdrawnReason: string | null
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
