// User-facing strings and label maps for the reports archive. Content lives in
// config (docs/code-rules.md); the components own structure and presentation.

import type {
  Classification,
  DocType,
  ReportStatus,
  TechnicalReviewType,
} from "@/core/reports/types"
import type { FacetDimension } from "@/core/reports/search-params"

export const reportsArchive = {
  name: "Technical reports",
  // Plain and understated. This is a catalogue, not a pitch.
  description:
    "Work we've written down — reports, notes and memoranda from CodeVault projects. Each record is a catalogue entry with a PDF attached.",
  emptyListing: "Nothing published yet.",
  // Shown on a record whose document is deliberately withheld.
  metadataOnlyNotice:
    "The document for this record is not being distributed. The catalogue entry stands on its own.",

  // The tombstone (design §4.5). A withdrawn record keeps its page and its
  // identifier so that citations written against it still resolve; what they
  // resolve to has to say plainly that the document is gone, carry the full
  // citation, and show the identifier in a form both a person and a machine can
  // read. That is DataCite's guidance for a tombstone and it is what this copy
  // is for.
  tombstone: {
    heading: "This report has been withdrawn",
    body: "The document is no longer distributed. This page remains so that citations to it still resolve, and the record below is preserved unchanged.",
    reasonLabel: "Reason",
    dateLabel: "Withdrawn",
    // Shown when a record was withdrawn with no reason recorded. Should not
    // happen — the withdrawal form requires one — but an older row might.
    noReason: "No reason was recorded.",
  },

  searchLabel: "Search the archive",
  searchPlaceholder: "Title, abstract, keywords, full text",
  // Distinct from `emptyListing`: an empty archive and an over-narrow query are
  // different problems and the reader can only fix one of them.
  emptySearch: "No records match those filters.",

  browseTitle: "Browse",
  browseDescription:
    "The archive by year and by subject — every record within a couple of links from here.",
} as const

// The facet rail's headings, in the archive's own words.
export const facetLabels: Record<FacetDimension, string> = {
  year: "Year",
  docType: "Type",
  subject: "Subject",
  project: "Project",
  author: "Author",
}

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
