import type { Author } from "@/core/reports/types"

// Presentation helpers for catalogue data. Pure and dependency-free so the
// record page and the listing render identical strings.

/**
 * Authorship order is meaning, so this never sorts. Long lists truncate with
 * "et al." the way a citation would, rather than wrapping to four lines.
 */
export function formatAuthors(authors: Author[], max = 4): string {
  if (authors.length === 0) return "—"

  const names = authors.map((author) => author.name)
  if (names.length <= max) return names.join(", ")

  return `${names.slice(0, max).join(", ")}, et al.`
}

/**
 * `published_at` is a Postgres `date`, which arrives as "YYYY-MM-DD". Parsed as
 * UTC on purpose: `new Date("2026-01-01")` is midnight UTC, and formatting that
 * in a west-of-UTC timezone would render the previous day.
 */
export function formatDate(value: string | null): string {
  if (!value) return "—"

  const parsed = new Date(`${value}T00:00:00Z`)
  if (Number.isNaN(parsed.getTime())) return value

  return parsed.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  })
}

/** The year alone, for browse headings and dense rows. */
export function formatYear(value: string | null): string {
  return value ? value.slice(0, 4) : "—"
}

export function formatFileSize(bytes: number | null): string {
  if (bytes === null || bytes <= 0) return "—"

  const megabytes = bytes / 1_000_000
  if (megabytes >= 1) return `${megabytes.toFixed(1)} MB`

  return `${Math.max(1, Math.round(bytes / 1000))} kB`
}

export function formatPageCount(pages: number | null): string {
  if (!pages) return "—"
  return pages === 1 ? "1 page" : `${pages} pages`
}
