import type { GateResult } from "@/core/reports/publish-gate-types"

export type GateChecklistProps = {
  gate: GateResult
}

export type AdminShellProps = {
  children: React.ReactNode
  /** Shown in the sidebar so it is obvious which account is acting. */
  userName: string
}

export type UploadPanelProps = {
  reportId: string
  onUploaded: () => void
}
