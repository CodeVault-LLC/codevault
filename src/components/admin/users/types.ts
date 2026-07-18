/**
 * A freshly minted enrollment link.
 *
 * Carries the email it belongs to, because the link is shown at the top of the
 * screen rather than beside the row that produced it — and a one-time secret
 * whose recipient you have to infer from where you last clicked is a secret
 * that gets sent to the wrong person.
 */
export type IssuedEnrollment = {
  /** Plaintext, shown once, never retrievable. Only its hash is stored. */
  url: string
  expiresAt: Date
  email: string
}
