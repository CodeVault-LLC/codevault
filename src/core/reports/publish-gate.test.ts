// The gate is pure, so this is the one test file in the server tree that needs
// no database and no object store.

import { describe, expect, it } from "vitest"

import type { GateCandidate } from "./publish-gate-types"
import { evaluatePublishGate, findingsFor } from "./publish-gate"

const LONG_ABSTRACT = Array.from({ length: 80 }, (_, i) => `word${i}`).join(" ")

function candidate(overrides: Partial<GateCandidate> = {}): GateCandidate {
  return {
    title: "Orbital decay in low-earth constellations",
    abstract: LONG_ABSTRACT,
    abstractOverrideReason: null,
    authors: [{ name: "L. Olsen", affiliation: "CodeVault" }],
    classification: "public",
    dissemination: "document_and_metadata",
    docType: "report",
    subjectCategory: "Aerospace",
    keywords: ["orbits", "debris", "simulation"],
    pdfKey: "reports/CV-2026-0001/v1/report.pdf",
    fileSize: 120_000,
    checksum: new Uint8Array(32),
    fulltext: "extracted body text",
    pdfEmbeddedTitle: null,
    requestedAccessionId: null,
    ...overrides,
  }
}

describe("the publish gate", () => {
  it("passes a complete record", () => {
    const gate = evaluatePublishGate(candidate())

    expect(gate.publishable).toBe(true)
    expect(gate.blockers).toEqual([])
  })

  it("refuses a record with no classification, because there is no default", () => {
    const gate = evaluatePublishGate(candidate({ classification: null }))

    expect(gate.publishable).toBe(false)
    expect(findingsFor(gate, "classification").blockers).toHaveLength(1)
  })
})

// The anchors are what let a finding render under the input it is about rather
// than only in the rail. A miswired one is invisible in the type system and
// merely looks like a message in the wrong place, so it is worth asserting.
describe("field anchoring", () => {
  it("puts each blocker under the control that can fix it", () => {
    const gate = evaluatePublishGate(
      candidate({
        title: "report-final-v3.pdf",
        abstract: "Too short.",
        authors: [{ name: "L. Olsen" }],
        subjectCategory: null,
        keywords: ["orbits"],
        classification: null,
      })
    )

    expect(findingsFor(gate, "title").blockers[0].code).toBe(
      "title_looks_like_filename"
    )
    expect(findingsFor(gate, "abstract").blockers[0].code).toBe(
      "abstract_too_short"
    )
    expect(findingsFor(gate, "authors").blockers[0].code).toBe(
      "no_author_with_affiliation"
    )
    expect(findingsFor(gate, "subjectCategory").blockers[0].code).toBe(
      "subject_category_unset"
    )
    expect(findingsFor(gate, "keywords").blockers[0].code).toBe(
      "too_few_keywords"
    )
    expect(findingsFor(gate, "classification").blockers[0].code).toBe(
      "classification_unset"
    )
  })

  it("reports a placeholder against the field it is actually in", () => {
    const inAbstract = evaluatePublishGate(
      candidate({ abstract: `TODO ${LONG_ABSTRACT}` })
    )

    // The bug this guards against: coalescing the title and abstract checks
    // reports an abstract's placeholder under the title.
    expect(findingsFor(inAbstract, "abstract").blockers[0].code).toBe(
      "placeholder_text"
    )
    expect(findingsFor(inAbstract, "title").blockers).toEqual([])

    const inTitle = evaluatePublishGate(candidate({ title: "TBD" }))
    expect(findingsFor(inTitle, "title").blockers[0].code).toBe(
      "placeholder_text"
    )
    expect(findingsFor(inTitle, "abstract").blockers).toEqual([])
  })

  it("anchors file findings to the document, which has no form control", () => {
    const gate = evaluatePublishGate(
      candidate({ pdfKey: null, checksum: null, fulltext: null })
    )

    expect(findingsFor(gate, "document").blockers.map((f) => f.code)).toEqual([
      "no_file",
      "no_checksum",
      "no_searchable_text",
    ])
  })

  it("anchors the embedded-title drift warning to the title, without blocking", () => {
    const gate = evaluatePublishGate(
      candidate({ pdfEmbeddedTitle: "Something else entirely" })
    )

    expect(gate.publishable).toBe(true)
    expect(findingsFor(gate, "title").warnings[0].code).toBe(
      "embedded_title_drift"
    )
  })

  it("does not apply file requirements to a metadata-only record", () => {
    const gate = evaluatePublishGate(
      candidate({
        dissemination: "metadata_only",
        pdfKey: null,
        checksum: null,
        fulltext: null,
      })
    )

    expect(gate.publishable).toBe(true)
    expect(findingsFor(gate, "document").blockers).toEqual([])
  })
})

describe("a staged accession identifier", () => {
  it("does not block when absent — the counter will allocate", () => {
    const gate = evaluatePublishGate(candidate({ requestedAccessionId: null }))

    expect(gate.publishable).toBe(true)
  })

  it("does not block when well formed", () => {
    const gate = evaluatePublishGate(
      candidate({ requestedAccessionId: "CV-STD-0001" })
    )

    expect(gate.publishable).toBe(true)
  })

  it("blocks a malformed identifier, under its own field", () => {
    const gate = evaluatePublishGate(
      candidate({ requestedAccessionId: "nope" })
    )

    expect(gate.publishable).toBe(false)
    expect(findingsFor(gate, "accessionId").blockers).toHaveLength(1)
  })

  // The counter owns the year namespace, and someone typing CV-2026-0005 has
  // made a mistake that looks nothing like a malformed one.
  it("blocks a reserved year series with a message that explains why", () => {
    const gate = evaluatePublishGate(
      candidate({ requestedAccessionId: "CV-2026-0005" })
    )

    expect(findingsFor(gate, "accessionId").blockers[0].message).toContain(
      "allocated automatically"
    )
  })
})
