import type {
  Classification,
  Dissemination,
  DocType,
} from "@/core/reports/types"
import type { DraftView, UploadReview } from "@/server/deposit/types"
import type { GateResult } from "@/core/reports/publish-gate-types"

export type DepositWorkspaceProps = {
  reportId: string
  initialDraft: DraftView
}

/**
 * Autosave status, surfaced next to the form rather than as a toast.
 *
 * A failed save is the one state that must not be quiet: the depositor's work
 * is in the browser and nowhere else, and a toast that has already faded is no
 * way to learn that.
 */
export type SaveState =
  | { status: "idle" }
  | { status: "saving" }
  | { status: "saved"; at: Date }
  | { status: "failed"; message: string }

export type UploadPanelProps = {
  reportId: string
  gate: GateResult
  /** Null until something has been uploaded in this session or a prior one. */
  review: UploadReview | null
  pageCount: number | null
  fileSize: number | null
  hasFile: boolean
  onReviewed: (review: UploadReview, quarantineKey: string) => void
  onCleared: () => void
}

export type MetadataFormProps = {
  fields: {
    title: string
    abstract: string
    authors: { name: string; affiliation?: string }[]
    docType: DocType
    subjectCategory: string | null
    keywords: string[]
  }
  gate: GateResult
  onChange: (patch: MetadataPatch) => void
}

export type ClassificationSectionProps = {
  fields: {
    classification: Classification | null
    dissemination: Dissemination
    discoverable: boolean
  }
  gate: GateResult
  onChange: (patch: MetadataPatch) => void
}

export type PublishRailProps = {
  gate: GateResult
  saveState: SaveState
  classification: Classification | null
  dissemination: Dissemination
  publishing: boolean
  error: string | null
  onPublish: () => void
}

// The subset of fields the deposit form edits — deliberately only what §11
// blocks publish on, plus the classification controls.
export type MetadataPatch = {
  title?: string
  abstract?: string
  abstractOverrideReason?: string | null
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
