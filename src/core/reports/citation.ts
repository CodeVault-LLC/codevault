// Citation export, with CSL-JSON as the pivot format (design §12).
//
// Everything converts through CSL-JSON: the record becomes a CSL item once, and
// BibTeX and RIS are two serializations of that one shape. Adding a third
// format later is a serializer, not another mapping of the domain model.
//
// Hand-rolled rather than `@citation-js/core`, which pulls `node-fetch` and
// `sync-fetch` for the network features this archive does not use. Three
// serializers of a fixed record shape are less code than that dependency, and
// this module stays pure so the record page and the export route share it.

import type { Author, DocType } from "./types"

export type CitableReport = {
  accessionId: string
  title: string
  abstract: string
  authors: Author[]
  docType: DocType
  publishedAt: string | null
  keywords: string[]
  reportNumbers: string[]
  pageCount: number | null
  doi: string | null
}

export type CslName = { family: string; given?: string; literal?: string }

export type CslItem = {
  id: string
  type: string
  title: string
  author: CslName[]
  issued?: { "date-parts": [[number, number?, number?]] }
  number?: string
  "number-of-pages"?: string
  publisher: string
  "publisher-place"?: string
  abstract?: string
  keyword?: string
  DOI?: string
  URL: string
  genre?: string
}

// CSL types that carry the same meaning as ours. `report` is the CSL fallback
// for anything document-shaped without a better home; the specific flavour
// survives in `genre`, which both BibTeX and RIS can also carry.
const CSL_TYPES: Record<DocType, string> = {
  report: "report",
  memorandum: "report",
  note: "report",
  conference_paper: "paper-conference",
  presentation: "speech",
  preprint: "article",
  dataset: "dataset",
  white_paper: "report",
}

// RIS reference types, same mapping problem.
const RIS_TYPES: Record<DocType, string> = {
  report: "RPRT",
  memorandum: "RPRT",
  note: "RPRT",
  conference_paper: "CPAPER",
  presentation: "SLIDE",
  preprint: "UNPB",
  dataset: "DATA",
  white_paper: "RPRT",
}

// BibTeX entry types. `@techreport` is the honest one for most of this
// archive — it is what `citation_technical_report_*` describes (design §12).
const BIBTEX_TYPES: Record<DocType, string> = {
  report: "techreport",
  memorandum: "techreport",
  note: "techreport",
  conference_paper: "inproceedings",
  presentation: "misc",
  preprint: "misc",
  dataset: "misc",
  white_paper: "techreport",
}

/**
 * Splits a display name into CSL's given/family pair.
 *
 * Names are stored as one string because that is what a depositor types and
 * the only form that is always correct. Splitting on the last token is the
 * conventional heuristic and is wrong for some names, so the whole string is
 * kept in `literal` too — a consumer that cares can prefer it.
 */
export function toCslName(author: Author): CslName {
  const parts = author.name.trim().split(/\s+/)

  if (parts.length < 2) {
    return { family: author.name.trim(), literal: author.name.trim() }
  }

  return {
    family: parts[parts.length - 1],
    given: parts.slice(0, -1).join(" "),
    literal: author.name.trim(),
  }
}

function issuedFrom(publishedAt: string | null): CslItem["issued"] {
  if (!publishedAt) return undefined

  // Postgres `date` arrives as "YYYY-MM-DD". Parsed by slicing rather than by
  // `new Date`, which would reintroduce a timezone the value does not have.
  const [year, month, day] = publishedAt.split("-").map(Number)
  if (!year) return undefined

  return { "date-parts": [[year, month, day]] }
}

export function toCsl(
  report: CitableReport,
  { institution, baseUrl }: { institution: string; baseUrl: string }
): CslItem {
  return {
    id: report.accessionId,
    type: CSL_TYPES[report.docType],
    title: report.title,
    author: report.authors.map(toCslName),
    issued: issuedFrom(report.publishedAt),
    // The accession ID is the report number a citation should carry. Editorial
    // `report_numbers` are alternates and ride along in the note fields.
    number: report.accessionId,
    "number-of-pages": report.pageCount ? String(report.pageCount) : undefined,
    publisher: institution,
    abstract: report.abstract || undefined,
    keyword:
      report.keywords.length > 0 ? report.keywords.join(", ") : undefined,
    DOI: report.doi ?? undefined,
    URL: recordUrl(report.accessionId, baseUrl),
    genre: report.docType,
  }
}

/**
 * The record's canonical site-relative path.
 *
 * Split out of `recordUrl` because the head tags need the path and the
 * citation formats need the absolute URL, and two places writing
 * `/reports/${id}` is one place too many — see `pdfUrl` below for the bug this
 * shape produces when it drifts.
 */
export function recordPath(accessionId: string): string {
  return `/reports/${accessionId}`
}

/** The record's canonical absolute URL — the thing a citation points at. */
export function recordUrl(accessionId: string, baseUrl: string): string {
  return `${baseUrl.replace(/\/+$/, "")}${recordPath(accessionId)}`
}

/**
 * The absolute URL of the PDF itself, for `citation_pdf_url`.
 *
 * Absolute, always, and built by the same function the meta tag and the export
 * both call. NTRS ships `"https://ntrs.nasa.govundefined"` in production from a
 * template-string bug of exactly this shape (design §11) — one function with
 * one test is the cheapest way not to repeat it.
 */
export function pdfUrl(accessionId: string, baseUrl: string): string {
  return `${recordUrl(accessionId, baseUrl)}/download`
}

// BibTeX's escape set. Order matters: the backslash must go first or it would
// escape the escapes.
const BIBTEX_ESCAPES: [RegExp, string][] = [
  [/\\/g, "\\textbackslash{}"],
  [/([{}$&%#_])/g, "\\$1"],
  [/~/g, "\\textasciitilde{}"],
  [/\^/g, "\\textasciicircum{}"],
]

function escapeBibtex(value: string): string {
  return BIBTEX_ESCAPES.reduce(
    (text, [pattern, replacement]) => text.replace(pattern, replacement),
    value
  )
}

function bibtexName(name: CslName): string {
  return name.given ? `${name.family}, ${name.given}` : name.family
}

export function toBibtex(
  report: CitableReport,
  options: { institution: string; baseUrl: string }
): string {
  const item = toCsl(report, options)
  const year = item.issued?.["date-parts"][0][0]

  const fields: [string, string | undefined][] = [
    ["title", item.title],
    [
      "author",
      item.author.length > 0
        ? item.author.map(bibtexName).join(" and ")
        : undefined,
    ],
    ["institution", item.publisher],
    ["type", item.genre],
    ["number", item.number],
    ["year", year ? String(year) : undefined],
    ["pages", item["number-of-pages"]],
    ["doi", item.DOI],
    ["url", item.URL],
    ["keywords", item.keyword],
    ["abstract", item.abstract],
    [
      "note",
      report.reportNumbers.length > 0
        ? `Also numbered ${report.reportNumbers.join(", ")}`
        : undefined,
    ],
  ]

  const body = fields
    .filter((entry): entry is [string, string] => Boolean(entry[1]))
    .map(([key, value]) => `  ${key} = {${escapeBibtex(value)}}`)
    .join(",\n")

  // The citation key is the accession ID: stable, unique, and already what a
  // reader would type.
  return `@${BIBTEX_TYPES[report.docType]}{${report.accessionId},\n${body}\n}\n`
}

export function toRis(
  report: CitableReport,
  options: { institution: string; baseUrl: string }
): string {
  const item = toCsl(report, options)
  const dateParts = item.issued?.["date-parts"][0]

  const lines: [string, string | undefined][] = [
    ["TY", RIS_TYPES[report.docType]],
    ["TI", item.title],
    ...item.author.map(
      (name): [string, string] => ["AU", bibtexName(name)] as [string, string]
    ),
    ["PB", item.publisher],
    ["M3", item.genre],
    ["RP", item.number],
    ["PY", dateParts?.[0] ? String(dateParts[0]) : undefined],
    // RIS's DA is `YYYY/MM/DD/`, trailing slash included.
    [
      "DA",
      dateParts
        ? `${dateParts[0]}/${pad(dateParts[1])}/${pad(dateParts[2])}/`
        : undefined,
    ],
    ["SP", item["number-of-pages"]],
    ["DO", item.DOI],
    ["UR", item.URL],
    ...report.keywords.map((keyword): [string, string] => ["KW", keyword]),
    ...report.reportNumbers.map((number): [string, string] => ["AN", number]),
    // Newlines inside a tag value break RIS parsers, so the abstract folds to
    // one line.
    ["AB", item.abstract?.replace(/\s+/g, " ")],
    ["ER", ""],
  ]

  return (
    lines
      .filter((line): line is [string, string] => line[1] !== undefined)
      // Two spaces before the dash is the RIS spec, not a typo.
      .map(([tag, value]) => `${tag}  - ${value}`)
      .join("\n") + "\n"
  )
}

function pad(value: number | undefined): string {
  return value ? String(value).padStart(2, "0") : ""
}
