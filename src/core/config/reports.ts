// User-facing strings and label maps for the reports archive. Content lives in
// config (docs/code-rules.md); the components own structure and presentation.

import type {
  Classification,
  DocType,
  ReportStatus,
  TechnicalReviewType,
} from "@/core/reports/types"

export const reportsArchive = {
  name: "Technical reports",
  // Plain and understated. This is a catalogue, not a pitch.
  description:
    "Work we've written down — reports, notes and memoranda from CodeVault projects. Each record is a catalogue entry with a PDF attached.",
  emptyListing: "Nothing published yet.",
  // Shown on a record whose document is deliberately withheld.
  metadataOnlyNotice:
    "The document for this record is not being distributed. The catalogue entry stands on its own.",
} as const

export const docTypeLabels: Record<DocType, string> = {
  report: "Report",
  memorandum: "Memorandum",
  note: "Note",
  conference_paper: "Conference paper",
  presentation: "Presentation",
  preprint: "Preprint",
  dataset: "Dataset",
  white_paper: "White paper",
}

export const classificationLabels: Record<Classification, string> = {
  public: "Public",
  internal: "Internal",
}

export const statusLabels: Record<ReportStatus, string> = {
  draft: "Draft",
  in_review: "In review",
  published: "Published",
  withdrawn: "Withdrawn",
}

export const technicalReviewLabels: Record<TechnicalReviewType, string> = {
  none: "None",
  internal: "Internal review",
  external: "External review",
  single_expert: "Single expert",
}

// Row labels on the record page's metadata table, in display order.
export const metadataLabels = {
  accessionId: "Identifier",
  docType: "Document type",
  publishedAt: "Date",
  authors: "Authors",
  subjectCategory: "Subject",
  keywords: "Keywords",
  reportNumbers: "Report numbers",
  technicalReviewType: "Technical review",
  license: "License",
  pageCount: "Pages",
  fileSize: "File size",
  doi: "DOI",
} as const
