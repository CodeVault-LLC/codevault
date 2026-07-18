export type AuthAsideItem = {
  /** Short mono label — a noun for a list, a verb for a sequence. */
  label: string
  body: string
}

export type AuthAside = {
  eyebrow: string
  /** One line that says what the reader is looking at. */
  intro: string
  /**
   * Optional. Anything listed here is read by anyone who can reach the sign-in
   * page, so it has to be public-facing copy — never a description of what is
   * behind the wall.
   */
  items?: AuthAsideItem[]
  /**
   * Numbers the items. Only pass this when the items really are a sequence —
   * order has to carry information the reader needs, or the numbers are just
   * decoration.
   */
  ordered?: boolean
  closing: string
  /** Fills the panel; the copy sits over a scrim at the bottom. */
  image?: { src: string; alt: string }
}

export type AuthPanelProps = {
  eyebrow: string
  /** Takes a node so a single word can carry the serif italic (design §2). */
  heading: React.ReactNode
  /** One or two lines of plain help under the heading. */
  help: string
  actionLabel: string
  pendingLabel: string
  /** Shown between the successful ceremony and the redirect landing. */
  doneLabel?: string
  onAction?: () => Promise<void>
  /** Renders the action inert — for a page that has nothing to offer yet. */
  disabled?: boolean
  aside: AuthAside
  footnote?: React.ReactNode
}

export type AuthStatus =
  | { phase: "idle" }
  | { phase: "working" }
  | { phase: "error"; message: string }
  | { phase: "done" }
