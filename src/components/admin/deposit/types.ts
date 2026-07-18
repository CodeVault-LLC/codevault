import type {
  Classification,
  Dissemination,
  DocType,
} from "@/core/reports/types"
import type { DraftView, UploadReview } from "@/server/deposit/types"

export type DepositPageProps = {
  reportId: string
  initialDraft: DraftView
}

export type UploadSectionProps = {
  reportId: string
  review: UploadReview | null
  /** The title currently typed into the form, for the drift diff. */
  typedTitle: string
  onReviewed: (review: UploadReview) => void
}

export type MetadataFormProps = {
  draft: DraftView
  onChange: (patch: MetadataPatch) => void
}

// The subset of fields the Phase 1 form edits — deliberately only what §11
// blocks publish on, plus the classification controls.
export type MetadataPatch = {
  title?: string
  abstract?: string
  authors?: { name: string; affiliation?: string }[]
  docType?: DocType
  subjectCategory?: string | null
  keywords?: string[]
  // Nullable, because "not chosen yet" is a real state and the one that blocks
  // publish. There is no default anywhere in the stack.
  classification?: Classification | null
  dissemination?: Dissemination
  discoverable?: boolean
}
