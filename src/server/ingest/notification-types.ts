import type { FailureClass, IngestRejectionReason } from "./types"

/**
 * One object-created notification.
 *
 * Narrowed to the key deliberately. R2's event payload carries more — bucket,
 * size, an eTag — but size is re-read with a HEAD (the notification's copy is
 * not what the pipeline should trust) and R2's eTag differs between single-PUT
 * and multipart, so it must never be mistaken for a content hash. Taking only
 * the key means nothing downstream can accidentally rely on either.
 */
export type QuarantineEvent = {
  key: string
}

export type SweepOutcome =
  | { key: string; outcome: "ingested" }
  /** The deposit form's own completion call already ran the pipeline. */
  | { key: string; outcome: "already_ingested" }
  /** No draft claims this object; it has been deleted. */
  | { key: string; outcome: "orphaned" }
  | {
      key: string
      outcome: "rejected"
      reason: IngestRejectionReason
      failureClass: FailureClass
      detail: string
    }
