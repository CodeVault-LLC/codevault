// Highwire Press meta tags — the single highest-value thing in §12.
//
// This is what Google Scholar actually reads. Dublin Core is "a last resort"
// per Scholar's own guidelines, so it is not emitted here.
//
// Pure, and separated from the component that renders it, because the tags are
// also what the CI test asserts on: `citation_pdf_url` must be a well-formed
// absolute URL. NTRS ships `"https://ntrs.nasa.govundefined"` in production
// from a template-string bug of exactly this shape (design §11).

import type { CitableReport } from "./citation"
import type { Dissemination } from "./types"
import { isFileServable } from "./access"
import { pdfUrl, recordUrl, toCslName } from "./citation"

export type HighwireTag = { name: string; content: string }

export type TaggableReport = CitableReport & {
  dissemination: Dissemination
  embargoUntil: Date | null
  // Whether a file exists at all, independent of whether it may be served.
  pdfKey: string | null
}

/**
 * `citation_publication_date` wants `YYYY/MM/DD`, and accepts `YYYY` alone.
 * The stored value is a Postgres date string, so this is a reformat rather
 * than a parse — no `Date`, no timezone to get wrong.
 */
function citationDate(publishedAt: string | null): string | null {
  if (!publishedAt) return null

  const [year, month, day] = publishedAt.split("-")
  if (!year) return null
  if (!month || !day) return year

  return `${year}/${month}/${day}`
}

export function highwireTags(
  report: TaggableReport,
  { institution, baseUrl }: { institution: string; baseUrl: string }
): HighwireTag[] {
  const tags: HighwireTag[] = [
    // The *paper's* title, explicitly not the repository's name.
    { name: "citation_title", content: report.title },
  ]

  // Repeated once per author, in authorship order — order is part of the
  // citation, so this never sorts.
  for (const author of report.authors) {
    const name = toCslName(author)
    tags.push({
      name: "citation_author",
      content: name.given ? `${name.family}, ${name.given}` : name.family,
    })

    if (author.affiliation) {
      // Scholar reads an institution tag as belonging to the author tag above
      // it, which is why this is pushed inside the loop.
      tags.push({
        name: "citation_author_institution",
        content: author.affiliation,
      })
    }
  }

  const date = citationDate(report.publishedAt)
  if (date) tags.push({ name: "citation_publication_date", content: date })

  // The correct pair for a technical report. NTRS abuses
  // `citation_journal_title` for this; a report is not a journal article and
  // saying so misfiles the record (design §12).
  tags.push({
    name: "citation_technical_report_institution",
    content: institution,
  })
  tags.push({
    name: "citation_technical_report_number",
    content: report.accessionId,
  })

  tags.push({
    name: "citation_abstract_html_url",
    content: recordUrl(report.accessionId, baseUrl),
  })

  // Only when the document is actually being distributed. Advertising a PDF URL
  // for a metadata-only or embargoed record would point a crawler at a 404 and
  // promise a file the archive is deliberately withholding (design §4.3).
  if (report.pdfKey && isFileServable(report)) {
    tags.push({
      name: "citation_pdf_url",
      content: pdfUrl(report.accessionId, baseUrl),
    })
  }

  if (report.keywords.length > 0) {
    tags.push({
      name: "citation_keywords",
      content: report.keywords.join("; "),
    })
  }

  if (report.doi) tags.push({ name: "citation_doi", content: report.doi })

  tags.push({ name: "citation_language", content: "en" })

  return tags
}
