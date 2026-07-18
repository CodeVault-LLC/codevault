// Domain types for the reports archive, derived from the controlled
// vocabularies in `./vocabulary.ts` so the two can never disagree.

import type {
  CLASSIFICATIONS,
  DISSEMINATIONS,
  DOC_TYPES,
  FILE_KINDS,
  RELATION_TYPES,
  REPORT_STATUSES,
  TECHNICAL_REVIEW_TYPES,
} from "./vocabulary"

export type ReportStatus = (typeof REPORT_STATUSES)[number]
export type Classification = (typeof CLASSIFICATIONS)[number]
export type Dissemination = (typeof DISSEMINATIONS)[number]
export type DocType = (typeof DOC_TYPES)[number]
export type TechnicalReviewType = (typeof TECHNICAL_REVIEW_TYPES)[number]
export type RelationType = (typeof RELATION_TYPES)[number]
export type FileKind = (typeof FILE_KINDS)[number]

// Order is meaning — authorship order is part of the citation, not a
// presentation detail.
export type Author = {
  name: string
  affiliation?: string
  orcid?: string
}

export type Funding = {
  number: string
  type: string
}

// The accession identifier: CV-<series>-NNNN. The series is a year when the
// counter allocated it at publish, or a letter code such as STD when the
// document arrived carrying an identifier of its own. Permanent once set, and
// never reused — including after withdrawal (design §4.5).
export type AccessionId = `CV-${string}-${string}`
