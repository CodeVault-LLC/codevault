export type AuthPanelProps = {
  heading: string
  /** One line of plain help text under the heading. */
  help: string
  actionLabel: string
  pendingLabel: string
  onAction: () => Promise<void>
}

export type AuthStatus =
  | { phase: "idle" }
  | { phase: "working" }
  | { phase: "error"; message: string }
  | { phase: "done" }
