// The archive's controlled vocabularies, as ordered tuples.
//
// These are the single source of truth for three things that must never drift
// apart: the TypeScript unions in `./types.ts`, the Postgres enums in
// `src/server/db/schema/enums.ts`, and the options rendered in the deposit
// form. Adding a value here is the only place it needs adding.

export const REPORT_STATUSES = [
  "draft",
  "in_review",
  "published",
  "withdrawn",
] as const

// Deliberately has no default anywhere in the stack. A record without an
// explicitly chosen classification cannot be published (design §2, §11).
export const CLASSIFICATIONS = ["public", "internal"] as const

// Decides whether *files* are served, independently of whether the *record* is
// visible. A metadata-only record is publicly findable and citable while the
// document itself is withheld (design §4.3).
export const DISSEMINATIONS = [
  "document_and_metadata",
  "metadata_only",
] as const

export const DOC_TYPES = [
  "report",
  "memorandum",
  "note",
  "conference_paper",
  "presentation",
  "preprint",
  "dataset",
  "white_paper",
] as const

// A record of what review the document actually received. Metadata, not a
// workflow state (design §4.1).
export const TECHNICAL_REVIEW_TYPES = [
  "none",
  "internal",
  "external",
  "single_expert",
] as const

// DataCite 4.6's relation vocabulary rather than an invented one. A revision is
// an independent record joined by a typed relation, not a version of its
// predecessor (design §4.4).
export const RELATION_TYPES = [
  "IsNewVersionOf",
  "IsPreviousVersionOf",
  "Obsoletes",
  "IsObsoletedBy",
  "IsSupplementTo",
  "References",
] as const

export const FILE_KINDS = ["pdf", "text", "thumb", "source"] as const
