import type { GateResult } from "@/core/reports/publish-gate-types"

export type PublishSuccess = {
  ok: true
  accessionId: string
}

export type PublishFailure = {
  ok: false
  reason: "not_found" | "not_a_draft" | "gate_failed" | "accession_taken"
  gate?: GateResult
}

export type PublishOutcome = PublishSuccess | PublishFailure
