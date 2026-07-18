import { describe, expect, it } from "vitest"

import type { TaggableReport } from "./highwire"
import { highwireTags } from "./highwire"

const OPTIONS = { institution: "CodeVault", baseUrl: "https://codevault.dev" }

const REPORT: TaggableReport = {
  accessionId: "CV-2026-0042",
  title: "Soil moisture telemetry for a windowsill",
  abstract: "A study of watering.",
  authors: [
    { name: "Lukas Olsen", affiliation: "CodeVault" },
    { name: "Ada Lovelace" },
  ],
  docType: "report",
  status: "published",
  publishedAt: "2026-03-04",
  keywords: ["telemetry", "irrigation"],
  reportNumbers: [],
  pageCount: 24,
  doi: null,
  dissemination: "document_and_metadata",
  embargoUntil: null,
  pdfKey: "reports/CV-2026-0042/v1/report.pdf",
}

function contentOf(report: TaggableReport, name: string): string[] {
  return highwireTags(report, OPTIONS)
    .filter((tag) => tag.name === name)
    .map((tag) => tag.content)
}

describe("Highwire Press tags", () => {
  it("carries the paper's title, not the repository's name", () => {
    expect(contentOf(REPORT, "citation_title")).toEqual([REPORT.title])
  })

  it("repeats citation_author once per author, in order", () => {
    expect(contentOf(REPORT, "citation_author")).toEqual([
      "Olsen, Lukas",
      "Lovelace, Ada",
    ])
  })

  it("uses the technical-report pair rather than a journal title", () => {
    const names = highwireTags(REPORT, OPTIONS).map((tag) => tag.name)

    expect(names).toContain("citation_technical_report_institution")
    expect(names).toContain("citation_technical_report_number")
    expect(names).not.toContain("citation_journal_title")
  })

  it("formats the publication date as YYYY/MM/DD", () => {
    expect(contentOf(REPORT, "citation_publication_date")).toEqual([
      "2026/03/04",
    ])
  })

  it("emits a well-formed absolute citation_pdf_url", () => {
    const [url] = contentOf(REPORT, "citation_pdf_url")

    expect(url).toBe("https://codevault.dev/reports/CV-2026-0042/download")
    expect(url).not.toContain("undefined")
    expect(() => new URL(url)).not.toThrow()
  })
})

describe("citation_pdf_url is only promised when the file is served", () => {
  it("is omitted for a metadata-only record", () => {
    const withheld = { ...REPORT, dissemination: "metadata_only" } as const
    expect(contentOf(withheld, "citation_pdf_url")).toEqual([])
  })

  it("is omitted while an embargo is in force", () => {
    const embargoed = { ...REPORT, embargoUntil: new Date("2099-01-01") }
    expect(contentOf(embargoed, "citation_pdf_url")).toEqual([])
  })

  it("is omitted when no file has been attached", () => {
    expect(contentOf({ ...REPORT, pdfKey: null }, "citation_pdf_url")).toEqual(
      []
    )
  })

  it("still describes the record itself in all those cases", () => {
    const withheld = { ...REPORT, dissemination: "metadata_only" } as const
    expect(contentOf(withheld, "citation_title")).toEqual([REPORT.title])
  })
})
