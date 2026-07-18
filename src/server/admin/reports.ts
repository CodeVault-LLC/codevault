import { and, count, desc, eq, ilike, or, sql } from "drizzle-orm"
import type { SQL } from "drizzle-orm"

import type {
  AdminReportPage,
  AdminReportRow,
  AdminReportsQuery,
} from "./types"
import { ADMIN_PAGE_SIZE } from "@/core/admin/search-params"
import { REPORT_STATUSES } from "@/core/reports/vocabulary"
import { db } from "@/server/db/client"
import { reports } from "@/server/db/schema"

// The dashboard's view of the archive.
//
// It reads the same `reports` table the public site does — publication is a
// state transition, not a copy into a second system (design §8.4). What differs
// is that nothing here composes a visibility predicate: this table's entire
// purpose is to show every record in every state, including the drafts and
// withdrawals the public query layer exists to hide. The guard is at the server
// function, where `requireCapability("reports.read")` sits.

/**
 * Columns the table renders. Narrower than the row on purpose: `fulltext` runs
 * 50KB–2MB per record and selecting it for forty rows would move hundreds of
 * megabytes to render a page of titles.
 */
const ROW_COLUMNS = {
  id: reports.id,
  accessionId: reports.accessionId,
  title: reports.title,
  status: reports.status,
  classification: reports.classification,
  dissemination: reports.dissemination,
  discoverable: reports.discoverable,
  embargoUntil: reports.embargoUntil,
  docType: reports.docType,
  authors: reports.authors,
  publishedAt: reports.publishedAt,
  updatedAt: reports.updatedAt,
  createdAt: reports.createdAt,
  pageCount: reports.pageCount,
  fileSize: reports.fileSize,
}

/**
 * Matches the identifier a person would actually have in hand.
 *
 * Title, accession ID and report numbers — not the abstract and not the full
 * text. This box answers "find the record I am thinking of", which is a
 * different question from the archive's search, and widening it to full text
 * would bury an exact accession-ID match under every report that mentions it.
 *
 * `ilike` rather than the tsvector index: this runs against a few thousand rows
 * at most, and substring matching on a partial identifier — `CV-2026-00` — is
 * exactly what a stemmed full-text index will not do.
 */
function matchesQuery(q: string): SQL {
  const pattern = `%${q}%`

  return or(
    ilike(reports.title, pattern),
    ilike(reports.accessionId, pattern),
    // `array_to_string` so a substring can span the separator-free values, and
    // coalesce because the column is never null but the join of an empty array
    // is the empty string either way.
    sql`array_to_string(${reports.reportNumbers}, ' ') ilike ${pattern}`
  )!
}

function filterWhere(query: AdminReportsQuery): SQL | undefined {
  const predicates: SQL[] = []

  if (query.q) predicates.push(matchesQuery(query.q))
  if (query.status) predicates.push(eq(reports.status, query.status))
  if (query.classification) {
    predicates.push(eq(reports.classification, query.classification))
  }
  if (query.docType) predicates.push(eq(reports.docType, query.docType))
  if (query.year) {
    // Against `published_at`, so the year filter means "the year of record"
    // rather than "the year someone happened to type it in". A draft has no
    // published date and so is correctly absent from any year.
    predicates.push(
      sql`extract(year from ${reports.publishedAt}) = ${query.year}`
    )
  }

  return predicates.length === 0 ? undefined : and(...predicates)
}

/**
 * Counts per status for the filter chips.
 *
 * Counted with every filter applied *except* status, so the numbers answer
 * "how many would I get if I switched to this status" rather than collapsing
 * every unselected chip to zero the moment one is picked. Same argument as the
 * public facet rail's.
 */
async function statusCounts(
  query: AdminReportsQuery
): Promise<Record<string, number>> {
  const rows = await db
    .select({ status: reports.status, total: count() })
    .from(reports)
    .where(filterWhere({ ...query, status: undefined }))
    .groupBy(reports.status)

  // Seeded at zero for every status: absent from the result set means "none",
  // and a chip has to render 0 rather than a gap.
  const counts = Object.fromEntries(REPORT_STATUSES.map((s) => [s, 0]))
  for (const row of rows) counts[row.status] = row.total

  return counts
}

/**
 * One page of the archive, most recently touched first.
 *
 * `updated_at` rather than `published_at`, which is what the public listing
 * sorts by. The dashboard's question is "what has been happening", and a draft
 * edited this morning has no published date at all — sorting by one would file
 * every draft under "null" at whichever end the collation put it.
 */
export async function listAdminReports(
  query: AdminReportsQuery
): Promise<AdminReportPage> {
  const where = filterWhere(query)
  const offset = (query.page - 1) * ADMIN_PAGE_SIZE

  const [rows, totals, counts] = await Promise.all([
    db
      .select(ROW_COLUMNS)
      .from(reports)
      .where(where)
      .orderBy(desc(reports.updatedAt))
      .limit(ADMIN_PAGE_SIZE)
      .offset(offset),
    db.select({ total: count() }).from(reports).where(where),
    statusCounts(query),
  ])

  const total = totals[0]?.total ?? 0

  return {
    rows: rows satisfies AdminReportRow[],
    total,
    page: query.page,
    pageSize: ADMIN_PAGE_SIZE,
    pageCount: Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE)),
    statusCounts: counts,
  }
}

/**
 * Every year that has a published record, newest first.
 *
 * For the year filter's options. Derived rather than a range from the current
 * year backwards, so the control offers only years that would actually return
 * something — an operator picking a year and getting nothing has learned
 * something about the control, not about the archive.
 */
export async function listPublishedYears(): Promise<number[]> {
  const rows = await db
    .select({
      year: sql<string>`extract(year from ${reports.publishedAt})::text`,
    })
    .from(reports)
    .where(sql`${reports.publishedAt} is not null`)
    .groupBy(sql`extract(year from ${reports.publishedAt})`)
    .orderBy(sql`extract(year from ${reports.publishedAt}) desc`)

  return rows.map((row) => Number(row.year))
}
