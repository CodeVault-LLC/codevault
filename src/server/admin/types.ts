import type { ReportStatus } from "@/core/reports/types"

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
