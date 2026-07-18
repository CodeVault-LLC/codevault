export type IssuedEnrollmentToken = {
  /** Plaintext. Returned once, never stored, never logged. */
  token: string
  expiresAt: Date
}

export type EnrollmentGrant = {
  tokenId: string
  userId: string
  name: string
  email: string
}
