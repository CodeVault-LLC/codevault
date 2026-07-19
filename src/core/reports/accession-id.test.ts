import { describe, expect, it } from "vitest"

import { parseAccessionId } from "./accession-id"

describe("parseAccessionId", () => {
  it.each([
    "CV-STD-0001",
    "CV-RPT-0042",
    "CV-TN-0007",
    "CV-A1-9999",
    "SMK-PPD-0001",
    "2026-STD-0001", // a year is reserved only in the series slot, not the prefix
  ])("accepts %s", (input) => {
    expect(parseAccessionId(input)).toEqual({ ok: true, value: input })
  })

  it("trims surrounding whitespace before judging", () => {
    expect(parseAccessionId("  CV-STD-0001  ")).toEqual({
      ok: true,
      value: "CV-STD-0001",
    })
  })

  it.each([
    ["cv-std-0001", "lowercase"],
    ["CV-STD-1", "tail shorter than four digits"],
    ["CV-STD-00001", "tail longer than four digits"],
    ["CV-STANDARDS-0001", "series longer than eight"],
    ["CV-S-0001", "series shorter than two"],
    ["STD-0001", "missing the series segment"],
    ["CV/STD/0001", "unsafe as a path segment"],
    ["CV-STD-000A", "non-numeric tail"],
    ["", "empty"],
  ])("rejects %s as malformed (%s)", (input) => {
    expect(parseAccessionId(input)).toEqual({ ok: false, error: "malformed" })
  })

  // The counter owns CV-<year>-NNNN. Letting a human claim one would put two
  // allocators in the same namespace.
  it.each(["CV-2026-0005", "CV-1999-0001", "CV-0000-0001", "SMK-2026-0001"])(
    "rejects %s as a reserved series",
    (input) => {
      expect(parseAccessionId(input)).toEqual({
        ok: false,
        error: "reserved_series",
      })
    }
  )
})
