import type { GateResult } from "@/core/reports/publish-gate-types"
import type { IngestRejectionReason } from "@/server/ingest/types"
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
  byteSize: number
  /** Hex, for display. The raw bytes stay in the database. */
  checksum: string
  embeddedTitle: string | null
  embeddedAuthor: string | null
  /** First few hundred characters, so the depositor can sanity-check it. */
  textPreview: string | null
  hasSearchableText: boolean
}

export type CompleteUploadResult =
  | { ok: true; review: UploadReview }
  | { ok: false; reason: IngestRejectionReason; detail: string }

/** The draft as the deposit form needs it, plus a live gate evaluation. */
export type DraftView = {
  report: Omit<ReportRow, "fulltext" | "searchVector"> & {
    hasSearchableText: boolean
  }
  gate: GateResult
}
