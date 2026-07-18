import type { Dissemination } from "./types"

// Whether a record's *file* may be served to the public, given that the record
// itself is already reachable.
//
// Deliberately free of any server import so the record page can call it to
// decide whether to render a download button, while the download route calls
// the same function to decide whether to serve bytes. One rule, one
// implementation — the button and the endpoint cannot disagree.
//
// This is the anonymous rule. Staff bypass it upstream.
export function isFileServable(
  report: { dissemination: Dissemination; embargoUntil: Date | null },
  now: Date = new Date()
): boolean {
  // A metadata-only record is publicly findable and citable while the document
  // is withheld (design §4.3).
  if (report.dissemination === "metadata_only") return false

  // Embargo is evaluated against the clock, never against a flag some job was
  // meant to flip.
  if (report.embargoUntil && report.embargoUntil > now) return false

  return true
}
