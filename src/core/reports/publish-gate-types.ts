import type { Author, Classification, Dissemination, DocType } from "./types"

// What the gate needs to judge a record. A structural subset of the row rather
// than the row itself, so the deposit form can run the same gate against
// unsaved values and show the checklist live (design §8.2).
export type GateCandidate = {
  title: string
  abstract: string
  abstractOverrideReason: string | null
  authors: Author[]
  classification: Classification | null
  dissemination: Dissemination
  docType: DocType
  subjectCategory: string | null
  keywords: string[]
  pdfKey: string | null
  fileSize: number | null
  checksum: Uint8Array | null
  fulltext: string | null
  pdfEmbeddedTitle: string | null

  /**
   * The identifier the draft is asking to be published under, or null to let
   * the counter allocate one. Only the *shape* is judged here — whether it is
   * already taken is a database question, and the gate is pure.
   */
  requestedAccessionId: string | null
}

export type GateCode =
  | "classification_unset"
  | "abstract_too_short"
  | "placeholder_text"
  | "title_looks_like_filename"
  | "no_author_with_affiliation"
  | "subject_category_unset"
  | "too_few_keywords"
  | "no_file"
  | "no_checksum"
  | "no_searchable_text"
  | "invalid_requested_accession_id"

export type GateWarningCode = "over_scholar_size_limit" | "embedded_title_drift"

/**
 * Which control a finding belongs under.
 *
 * The gate is the single authority on what blocks publish, and it is the only
 * thing that knows *why*. Without this anchor the deposit form would have to
 * re-derive the mapping from code to input, which is a second copy of the
 * gate's judgement and would drift from it. `"document"` covers findings about
 * the file itself, which has no form control — those surface on the upload
 * panel instead.
 */
export type GateField =
  | "title"
  | "abstract"
  | "authors"
  | "subjectCategory"
  | "keywords"
  | "classification"
  | "accessionId"
  | "document"

export type GateFinding = {
  code: GateCode | GateWarningCode
  field: GateField
  message: string
}

export type GateResult = {
  /** Non-empty means publish is refused. */
  blockers: GateFinding[]
  /** Worth surfacing in the dashboard; never blocks. */
  warnings: GateFinding[]
  publishable: boolean
}
