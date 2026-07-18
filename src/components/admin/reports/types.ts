import type {
  Author,
  Classification,
  Dissemination,
  DocType,
  TechnicalReviewType,
} from "@/core/reports/types"
import type { AdminReportDetail } from "@/server/admin/types"
import type { GateResult } from "@/core/reports/publish-gate-types"

/**
 * Save status, surfaced beside the form rather than as a toast.
 *
 * A failed save is the one state that must not be quiet — and here it carries
 * more weight than on the deposit form, because a *refused* save has also
 * reverted the field the operator was looking at. A toast that has already
 * faded is no way to learn that.
 */
export type SaveState =
  | { status: "idle" }
  | { status: "saving" }
  | { status: "saved"; at: Date }
  | { status: "failed"; message: string }

/** The editable surface of a record after deposit. */
export type RecordPatch = {
  title?: string
  abstract?: string
  abstractOverrideReason?: string | null
  authors?: Author[]
  docType?: DocType
  technicalReviewType?: TechnicalReviewType
  subjectCategory?: string | null
  keywords?: string[]
  reportNumbers?: string[]
  license?: string | null
  doi?: string | null
  requestedAccessionId?: string | null
  projectSlug?: string | null
  classification?: Classification | null
  dissemination?: Dissemination
  discoverable?: boolean
  embargoUntil?: Date | null
}

export type RecordFields = Required<{
  [K in keyof RecordPatch]: RecordPatch[K]
}>

export type RecordWorkspaceProps = {
  detail: AdminReportDetail
  /** What this account may do, so the screen offers only what will work. */
  permissions: {
    canWrite: boolean
    canPublish: boolean
    canWithdraw: boolean
    canRestore: boolean
  }
}

export type CataloguingSectionProps = {
  fields: RecordFields
  gate: GateResult
  /**
   * The allocated identifier, or null on a draft that has not been published.
   *
   * Separate from `fields.requestedAccessionId` because they are different
   * facts: one is what the record *is* called and is frozen, the other is what
   * a draft is *asking* to be called and is still editable.
   */
  accessionId: string | null
  isDraft: boolean
  onChange: (patch: RecordPatch) => void
}
