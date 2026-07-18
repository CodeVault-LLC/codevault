import type {
  Author,
  Classification,
  Dissemination,
  DocType,
  ReportStatus,
} from "@/core/reports/types"
import type { GateResult } from "@/core/reports/publish-gate-types"
import type { ReportRow } from "@/server/db/types"

export type StatusCounts = Record<ReportStatus, number>

export type RecentDeposit = {
  id: string
  /** Null while still a draft — accession IDs are allocated at publish. */
  accessionId: string | null
  title: string
  status: ReportStatus
  createdAt: Date
}

export type AttentionDraft = {
  id: string
  title: string
  createdAt: Date
  /** How many gate blockers stand between this draft and publish. */
  blockerCount: number
  /** The first blocker's message, so the row is actionable at a glance. */
  topBlocker: string
}

export type AdminOverview = {
  /**
   * When the server built this snapshot.
   *
   * Every relative timestamp on the dashboard is measured against this rather
   * than a `new Date()` taken during render. Render-time clocks differ between
   * the SSR pass and hydration, which turns "2 minutes ago" into "3 minutes
   * ago" and trips a hydration mismatch. One serialized instant renders
   * identically in both passes.
   */
  generatedAt: Date
  counts: StatusCounts
  /** Total bytes across every stored file. Null when nothing is stored yet. */
  storageBytes: number
  recent: RecentDeposit[]
  attention: AttentionDraft[]
  /** Drafts with at least one blocker, which may exceed `attention.length`. */
  attentionTotal: number
}

// ---------------------------------------------------------------------------
// The reports table and one record's workspace (design §8.1).
// ---------------------------------------------------------------------------

/**
 * The filter the table was asked for.
 *
 * Structurally the URL's search schema with `type` spelled `docType` — the URL
 * says `type` because that is what a person would type, the query layer says
 * `docType` because that is the column. The mapping happens once, in the server
 * function, and this is the far side of it.
 */
export type AdminReportsQuery = {
  q?: string
  status?: ReportStatus
  classification?: Classification
  docType?: DocType
  year?: number
  page: number
}

/** One row of the table. Never carries `fulltext`. */
export type AdminReportRow = {
  id: string
  /** Null on a draft — accession IDs are allocated at publish (design §4.5). */
  accessionId: string | null
  title: string
  status: ReportStatus
  /** Null until explicitly chosen. There is no default anywhere (design §2). */
  classification: Classification | null
  dissemination: Dissemination
  discoverable: boolean
  embargoUntil: Date | null
  docType: DocType
  authors: Author[]
  publishedAt: string | null
  updatedAt: Date
  createdAt: Date
  pageCount: number | null
  fileSize: number | null
}

export type AdminReportPage = {
  rows: AdminReportRow[]
  /** Everything matching the filter, not the page — pagination needs it. */
  total: number
  page: number
  pageSize: number
  pageCount: number
  /**
   * Per-status totals for the filter chips, counted with every filter applied
   * except status itself.
   */
  statusCounts: Record<string, number>
}

/**
 * The other end of a typed relation, as the record page renders it.
 *
 * Carries the counterpart's own status so a link to something withdrawn or
 * still in draft says so — "supersedes CV-2026-0004" reads very differently
 * when CV-2026-0004 turns out never to have been published.
 */
export type RelatedRecord = {
  relation: string
  reportId: string
  accessionId: string | null
  title: string
  status: ReportStatus
}

/** Everything `/admin/reports/$id` renders, in one round trip. */
export type AdminReportDetail = {
  report: Omit<ReportRow, "fulltext" | "searchVector" | "checksum"> & {
    /** Whether any text was extracted. The text itself never leaves the server. */
    hasSearchableText: boolean
    /**
     * The stored checksum, already hex-encoded, or null if the file has not
     * been validated.
     *
     * Formatted on the server rather than shipped as raw bytes for the browser
     * to encode. Encoding 32 bytes to hex in the browser means `Buffer`, which
     * is a Node global — it exists during SSR and does not after hydration, so
     * the page renders once and then throws into the error boundary. The
     * browser has no use for the bytes themselves either way.
     */
    checksumHex: string | null
  }
  /**
   * The publish gate's verdict on the record as it stands.
   *
   * Rendered for a published record too, not just a draft. A published record
   * that no longer passes its own gate is the thing an editor most needs told
   * about, and it is reachable — the gate runs on the transition, so an edit
   * afterwards can walk a record back out of compliance (design §11).
   */
  gate: GateResult
  relations: RelatedRecord[]
}
