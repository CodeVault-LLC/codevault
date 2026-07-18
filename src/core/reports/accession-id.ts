// Validation for a hand-entered accession identifier.
//
// Pure and free of server imports, like `publish-gate.ts` beside it, so the
// dashboard validates as the operator types and the server validates before it
// commits — the same function in both places rather than two that agree until
// they don't.

/**
 * `CV-<series>-<NNNN>`.
 *
 * Deliberately the same shape the counter emits: `CV-2026-0001` and
 * `CV-STD-0001` differ only in what occupies the series slot. There is one
 * identifier format in this system, not a manual one and an automatic one.
 *
 * Uppercase alphanumerics only, and no separator other than the two hyphens,
 * because this string becomes an S3 key segment (`server/storage/keys.ts`) and
 * a URL path segment.
 */
const ACCESSION_ID = /^CV-([A-Z0-9]{2,8})-\d{4}$/

/** A four-digit series is a year, and years belong to the counter. */
const YEAR_SERIES = /^\d{4}$/

export type AccessionIdError = "malformed" | "reserved_series"

export type AccessionIdResult =
  { ok: true; value: string } | { ok: false; error: AccessionIdError }

/** Shown under the input, and in the malformed error. */
export const ACCESSION_ID_HINT =
  "CV-STD-0001 — two to eight uppercase letters or digits, then four digits."

/**
 * A tagged result rather than a boolean.
 *
 * `reserved_series` in particular has to be distinguishable: someone typing
 * `CV-2026-0005` has made a reasonable-looking mistake, and "invalid" would
 * leave them re-reading a grammar their input already satisfies.
 */
export function parseAccessionId(input: string): AccessionIdResult {
  const value = input.trim()
  const match = ACCESSION_ID.exec(value)

  if (!match) return { ok: false, error: "malformed" }
  if (YEAR_SERIES.test(match[1])) {
    return { ok: false, error: "reserved_series" }
  }

  return { ok: true, value }
}

/** Form and gate copy for a rejection, so the two cannot word it differently. */
export function accessionIdErrorMessage(error: AccessionIdError): string {
  return error === "reserved_series"
    ? "Year series such as CV-2026-0005 are allocated automatically. Use a letter series, e.g. CV-STD-0001."
    : `Not a valid accession ID. Expected ${ACCESSION_ID_HINT}`
}
