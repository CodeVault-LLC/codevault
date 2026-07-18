import { describe, expect, it } from "vitest"

import type { CitableReport } from "./citation"
import { pdfUrl, toBibtex, toCsl, toRis } from "./citation"

const OPTIONS = { institution: "CodeVault", baseUrl: "https://codevault.no" }

const REPORT: CitableReport = {
  accessionId: "CV-2026-0042",
  title: "Soil moisture telemetry for a windowsill",
  abstract: "A study of\nwatering, in\nsentences.",
  authors: [
    { name: "Lukas Olsen", affiliation: "CodeVault" },
    { name: "Ada Lovelace" },
  ],
  docType: "report",
  publishedAt: "2026-03-04",
  keywords: ["telemetry", "irrigation"],
  reportNumbers: ["CV-TR-7"],
  pageCount: 24,
  doi: null,
}

describe("CSL-JSON, the pivot format", () => {
  it("splits a display name into given and family, keeping the original", () => {
    const [first] = toCsl(REPORT, OPTIONS).author

    expect(first).toEqual({
      family: "Olsen",
      given: "Lukas",
      literal: "Lukas Olsen",
    })
  })

  it("preserves authorship order, which is part of the citation", () => {
    const names = toCsl(REPORT, OPTIONS).author.map((a) => a.family)
    expect(names).toEqual(["Olsen", "Lovelace"])
  })

  it("reads the date without going through a timezone", () => {
    expect(toCsl(REPORT, OPTIONS).issued).toEqual({
      "date-parts": [[2026, 3, 4]],
    })
  })
})

describe("absolute URLs", () => {
  // NTRS ships "https://ntrs.nasa.govundefined" in production from a
  // template-string bug of exactly this shape (design §11).
  it("builds a well-formed absolute PDF URL", () => {
    const url = pdfUrl("CV-2026-0042", OPTIONS.baseUrl)

    expect(url).toBe("https://codevault.no/reports/CV-2026-0042/download")
    expect(() => new URL(url)).not.toThrow()
    expect(url).not.toContain("undefined")
  })

  it("does not double the slash when the base URL has a trailing one", () => {
    expect(pdfUrl("CV-2026-0042", "https://codevault.no/")).toBe(
      "https://codevault.no/reports/CV-2026-0042/download"
    )
  })
})

describe("BibTeX", () => {
  const bib = toBibtex(REPORT, OPTIONS)

  it("uses the accession ID as the citation key and the report number", () => {
    expect(bib).toContain("@techreport{CV-2026-0042,")
    expect(bib).toContain("number = {CV-2026-0042}")
  })

  it("joins authors with `and`, in `Family, Given` form", () => {
    expect(bib).toContain("author = {Olsen, Lukas and Lovelace, Ada}")
  })

  it("escapes characters that would break a .bib file", () => {
    const hostile = toBibtex(
      { ...REPORT, title: "Cost & scope: 100% {done} #1 $x_1$" },
      OPTIONS
    )

    expect(hostile).toContain(
      "title = {Cost \\& scope: 100\\% \\{done\\} \\#1 \\$x\\_1\\$}"
    )
  })
})

describe("RIS", () => {
  const ris = toRis(REPORT, OPTIONS)

  it("opens with a reference type and closes with ER", () => {
    expect(ris.startsWith("TY  - RPRT")).toBe(true)
    // Trailing space included: `ER  - ` is the end-of-record tag, and the two
    // spaces before the dash are the RIS separator rather than a typo.
    expect(ris.endsWith("ER  - \n")).toBe(true)
  })

  it("repeats AU once per author", () => {
    const authors = ris.split("\n").filter((line) => line.startsWith("AU  - "))
    expect(authors).toEqual(["AU  - Olsen, Lukas", "AU  - Lovelace, Ada"])
  })

  it("writes the date in RIS's own format", () => {
    expect(ris).toContain("DA  - 2026/03/04/")
    expect(ris).toContain("PY  - 2026")
  })

  it("folds the abstract onto one line, because newlines break parsers", () => {
    expect(ris).toContain("AB  - A study of watering, in sentences.")
  })
})
