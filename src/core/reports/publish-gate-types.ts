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

export type GateWarningCode = "over_scholar_size_limit" | "embedded_title_drift"

export type GateFinding = {
  code: GateCode | GateWarningCode
  message: string
}

export type GateResult = {
  /** Non-empty means publish is refused. */
  blockers: GateFinding[]
  /** Worth surfacing in the dashboard; never blocks. */
  warnings: GateFinding[]
  publishable: boolean
}
