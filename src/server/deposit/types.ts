import type { GateResult } from "@/core/reports/publish-gate-types"
import type {
  DuplicateRecord,
  IngestRejectionReason,
  SanitizationReport,
} from "@/server/ingest/types"
import type { ReportRow } from "@/server/db/types"

export type BeginUploadResult = {
  /** Server-generated. The client never chooses a storage key. */
  quarantineKey: string
  uploadUrl: string
  expiresInSeconds: number
}

/** What the deposit screen shows after §9 has run over the uploaded file. */
export type UploadReview = {
  pageCount: number
  /** Of the sanitized artifact, which is what will be stored and served. */
  byteSize: number
  /** Hex, for display. The raw bytes stay in the database. */
  checksum: string
  embeddedTitle: string | null
  embeddedAuthor: string | null
  /** First few hundred characters, so the depositor can sanity-check it. */
  textPreview: string | null
  hasSearchableText: boolean
  /** What CDR did to the file (design §9.3). */
  sanitization: SanitizationReport
  /**
   * The cover render, inlined as a data URL. Null when nothing rendered — the
   * document is still perfectly archivable without one.
   */
  thumbnailDataUrl: string | null
}

export type CompleteUploadResult =
  | { ok: true; review: UploadReview }
  | {
      ok: false
      reason: IngestRejectionReason
      detail: string
      /** Set when `reason` is `duplicate`, so the UI can link to the original. */
      duplicateOf: DuplicateRecord | null
    }

/** The draft as the deposit form needs it, plus a live gate evaluation. */
export type DraftView = {
  report: Omit<ReportRow, "fulltext" | "searchVector"> & {
    hasSearchableText: boolean
  }
  gate: GateResult
}

/**
 * A draft as the landing page lists it.
 *
 * Carries the gate's verdict rather than the fields it judged, so a row can say
 * what is standing in the way without the client re-running anything or the
 * server shipping an entire draft per row.
 */
export type DraftSummary = {
  id: string
  title: string
  createdAt: Date
  updatedAt: Date
  hasFile: boolean
  pageCount: number | null
  fileSize: number | null
  blockerCount: number
  /** The first blocker's message, so a row is actionable at a glance. */
  topBlocker: string
  publishable: boolean
}

export type DeleteDraftResult =
  { ok: true } | { ok: false; reason: "not_found" | "not_a_draft" }
