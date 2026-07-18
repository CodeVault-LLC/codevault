import type { Dissemination, ReportStatus } from "./types"

// Whether a record's *file* may be served to the public, given that the record
// itself is already reachable.
//
// Deliberately free of any server import so the record page can call it to
// decide whether to render a download button, while the download route calls
// the same function to decide whether to serve bytes. One rule, one
// implementation — the button and the endpoint cannot disagree.
//
// This is the anonymous rule. Staff bypass it upstream.

export type AccessibleReport = {
  status: ReportStatus
  dissemination: Dissemination
  embargoUntil: Date | null
}

export function isFileServable(
  report: AccessibleReport,
  now: Date = new Date()
): boolean {
  // A withdrawn record stays reachable so its citations still resolve, but what
  // they resolve to is a tombstone. Withdrawal is the act of ceasing to
  // distribute the document, so continuing to serve it would undo the act
  // (design §4.5).
  if (report.status === "withdrawn") return false

  // A metadata-only record is publicly findable and citable while the document
  // is withheld (design §4.3).
  if (report.dissemination === "metadata_only") return false

  // Embargo is evaluated against the clock, never against a flag some job was
  // meant to flip.
  if (report.embargoUntil && report.embargoUntil > now) return false

  return true
}
