// Presentation helpers for the dashboard. Separate from the catalogue's
// `reports/format.ts` because these serve a different reader: an operator
// scanning a dense table, not someone reading a record page.

const BYTE_UNITS = ["B", "kB", "MB", "GB", "TB"] as const

/**
 * Decimal units, matching how object stores bill and report capacity — a
 * dashboard that disagrees with the S3 console about how much is stored is
 * worse than one that is imprecise.
 *
 * Unlike the catalogue's `formatFileSize`, this scales past MB, because it
 * totals the whole corpus rather than one file.
 */
export function formatBytes(bytes: number): string {
  if (bytes <= 0) return "0 B"

  const exponent = Math.min(
    Math.floor(Math.log10(bytes) / 3),
    BYTE_UNITS.length - 1
  )
  const value = bytes / 1000 ** exponent

  // Whole bytes never want a decimal point; larger units read better with one
  // significant place until they reach three digits.
  const decimals = exponent === 0 || value >= 100 ? 0 : 1

  return `${value.toFixed(decimals)} ${BYTE_UNITS[exponent]}`
}

const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 60 * 60 * 1000],
  ["month", 30 * 24 * 60 * 60 * 1000],
  ["day", 24 * 60 * 60 * 1000],
  ["hour", 60 * 60 * 1000],
  ["minute", 60 * 1000],
]

/**
 * "3 days ago". Relative rather than absolute because the question these rows
 * answer is "how stale is this", which a reader would otherwise have to work
 * out from a date.
 *
 * `now` is a parameter so this stays pure and testable, and so a list rendered
 * in one pass cannot straddle a tick and disagree with itself.
 */
export function formatRelativeTime(
  value: Date,
  now: Date = new Date()
): string {
  const elapsed = value.getTime() - now.getTime()
  const magnitude = Math.abs(elapsed)

  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" })

  for (const [unit, ms] of RELATIVE_UNITS) {
    if (magnitude >= ms) {
      return formatter.format(Math.round(elapsed / ms), unit)
    }
  }

  return "just now"
}
