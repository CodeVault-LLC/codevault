import type { GateResult } from "@/core/reports/publish-gate-types"

// Outcomes as values, not exceptions.
//
// Every one of these failures is an ordinary thing a person can do — withdraw
// something already withdrawn, edit a published record down below its own gate,
// link a record to itself. A thrown error would surface as an opaque 500 and
// the screen would have nothing useful to say; a named reason lets it say the
// one sentence that actually helps.

export type MutationFailure =
  | "not_found"
  // The record is not in a state this transition applies to — withdrawing a
  // draft, restoring something that was never withdrawn.
  | "wrong_status"
  | "self_relation"
  | "unknown_relation"
  // An accession ID was staged on a record that is no longer a draft, where the
  // identifier is already frozen.
  | "accession_not_editable"

export type MutationResult =
  { ok: true } | { ok: false; reason: MutationFailure }

export type UpdateReportResult =
  | { ok: true }
  | { ok: false; reason: MutationFailure }
  // Carries the gate so the screen can show *what* the edit would have broken,
  // rather than refusing without saying why.
  | { ok: false; reason: "would_break_gate"; gate: GateResult }

export type ReviseResult =
  { ok: true; draftId: string } | { ok: false; reason: MutationFailure }
