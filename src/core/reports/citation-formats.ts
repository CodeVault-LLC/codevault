// The export formats, as one table.
//
// The route reads it to decide what it can serve and with which content type;
// the record page reads it to decide what to link to. Adding a format is one
// entry plus a serializer, and the two surfaces cannot fall out of step.

import type { CitableReport } from "./citation"
import { toBibtex, toRis } from "./citation"

export type CitationFormat = {
  slug: string
  label: string
  extension: string
  // `text/plain` for both would work in a browser, but a reference manager
  // decides what to do with a download by its content type.
  contentType: string
  render: (
    report: CitableReport,
    options: { institution: string; baseUrl: string }
  ) => string
}

export const CITATION_FORMATS: CitationFormat[] = [
  {
    slug: "bibtex",
    label: "BibTeX",
    extension: "bib",
    contentType: "application/x-bibtex; charset=utf-8",
    render: toBibtex,
  },
  {
    slug: "ris",
    label: "RIS",
    extension: "ris",
    contentType: "application/x-research-info-systems; charset=utf-8",
    render: toRis,
  },
]

export function findCitationFormat(slug: string): CitationFormat | undefined {
  return CITATION_FORMATS.find((format) => format.slug === slug)
}
