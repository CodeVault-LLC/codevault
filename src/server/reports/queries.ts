import { and, count, desc, eq, isNotNull, sql } from "drizzle-orm"
import type { SQL } from "drizzle-orm"

import type {
  BrowseIndex,
  FacetDimension,
  FacetValue,
  Facets,
  ListReportsOptions,
  ReportDetail,
  ReportSummary,
  SearchReportsOptions,
  SearchResults,
  SitemapEntry,
  Viewer,
} from "./types"
import type { DocType } from "@/core/reports/types"
import { db } from "@/server/db/client"
import { docTypeLabels } from "@/core/config/reports"
import { listableBy, reachableBy } from "./visibility"
import { rank, searchWhere } from "./search"
import { reports, subjectCategories } from "@/server/db/schema"

// Columns safe to expose in a listing. `fulltext` is deliberately absent —
// selecting it for thirty rows would pull megabytes of TOASTed text.
const SUMMARY_COLUMNS = {
  accessionId: reports.accessionId,
  title: reports.title,
  authors: reports.authors,
  docType: reports.docType,
  publishedAt: reports.publishedAt,
  pageCount: reports.pageCount,
  subjectCategory: reports.subjectCategory,
}

// A published record always has an accession ID, but the column is nullable
// because drafts do not. Asserting it in SQL is what lets the rendering code
// treat it as present.
const HAS_ACCESSION = isNotNull(reports.accessionId)

// The year, as an expression rather than a column. Shared by the year facet and
// by browse, so the two cannot disagree about which year a record is in.
const YEAR = sql<string>`extract(year from ${reports.publishedAt})::text`

// How many facet values are worth showing. Beyond this the rail becomes a
// second scroll region and stops being a summary of the result set.
const FACET_LIMIT = 12

/**
 * Reverse-chronological listing. Filtered by `listableBy`, so a non-discoverable
 * or internal record cannot appear here regardless of what the caller renders.
 */
export async function listReports(
  viewer: Viewer,
  { limit, offset }: ListReportsOptions
): Promise<ReportSummary[]> {
  return db
    .select(SUMMARY_COLUMNS)
    .from(reports)
    .where(and(listableBy(viewer), HAS_ACCESSION))
    .orderBy(desc(reports.publishedAt), desc(reports.createdAt))
    .limit(limit)
    .offset(offset)
}

/**
 * Search, faceted and paginated.
 *
 * Ordering depends on whether there is a query: with one, by relevance and then
 * by date; without one, by date alone. Ranking an unqueried archive by
 * `ts_rank` of nothing would order it arbitrarily.
 */
export async function searchReports(
  viewer: Viewer,
  options: SearchReportsOptions
): Promise<SearchResults> {
  const visibility = and(listableBy(viewer), HAS_ACCESSION)!
  const where = searchWhere(visibility, options)

  const order = options.q
    ? [desc(rank(options.q)), desc(reports.publishedAt)]
    : [desc(reports.publishedAt), desc(reports.createdAt)]

  const [rows, totals, facets] = await Promise.all([
    db
      .select(SUMMARY_COLUMNS)
      .from(reports)
      .where(where)
      .orderBy(...order)
      .limit(options.limit)
      .offset(options.offset),
    db.select({ total: count() }).from(reports).where(where),
    facetCounts(visibility, options),
  ])

  return { reports: rows, total: totals[0]?.total ?? 0, facets }
}

/**
 * The facet rail's counts.
 *
 * Each dimension is counted with every filter applied *except its own*, so the
 * numbers answer "what would I get if I switched to this value" rather than
 * "how many of the results I am already looking at have the value I already
 * picked" — which would render every unselected value as zero.
 */
async function facetCounts(
  visibility: SQL,
  options: SearchReportsOptions
): Promise<Facets> {
  const [year, docType, subject, project, author] = await Promise.all([
    facetOn(visibility, options, "year", YEAR),
    facetOn(visibility, options, "docType", sql`${reports.docType}`),
    subjectFacet(visibility, options),
    facetOn(visibility, options, "project", sql`${reports.projectSlug}`),
    authorFacet(visibility, options),
  ])

  return {
    year,
    docType: docType.map((value) => ({
      ...value,
      label: docTypeLabels[value.value as DocType],
    })),
    subject,
    project,
    author,
  }
}

/** One `group by`, for a facet whose values are a single expression. */
async function facetOn(
  visibility: SQL,
  options: SearchReportsOptions,
  dimension: FacetDimension,
  expr: SQL
): Promise<FacetValue[]> {
  const rows = await db
    .select({ value: sql<string>`${expr}`, count: count() })
    .from(reports)
    .where(
      and(
        searchWhere(visibility, options, { except: dimension }),
        sql`${expr} is not null`
      )
    )
    .groupBy(expr)
    .orderBy(desc(count()), sql`${expr} desc`)
    .limit(FACET_LIMIT)

  return rows.map((row) => ({
    value: row.value,
    label: row.value,
    count: row.count,
  }))
}

/** Subjects carry a display name from the taxonomy table, so they join. */
async function subjectFacet(
  visibility: SQL,
  options: SearchReportsOptions
): Promise<FacetValue[]> {
  const rows = await db
    .select({
      value: reports.subjectCategory,
      name: subjectCategories.name,
      count: count(),
    })
    .from(reports)
    .leftJoin(
      subjectCategories,
      eq(subjectCategories.slug, reports.subjectCategory)
    )
    .where(
      and(
        searchWhere(visibility, options, { except: "subject" }),
        isNotNull(reports.subjectCategory)
      )
    )
    .groupBy(reports.subjectCategory, subjectCategories.name)
    .orderBy(desc(count()))
    .limit(FACET_LIMIT)

  return rows.map((row) => ({
    value: row.value!,
    // A slug with no taxonomy row is a seeding gap, not a reason to render an
    // empty label.
    label: row.name ?? row.value!,
    count: row.count,
  }))
}

/**
 * Authors, which live inside a JSONB array rather than in a column.
 *
 * `jsonb_array_elements` in the FROM clause is a lateral join, so a record with
 * three authors contributes a row to each of their counts — which is exactly
 * what an author facet means.
 */
async function authorFacet(
  visibility: SQL,
  options: SearchReportsOptions
): Promise<FacetValue[]> {
  const where = searchWhere(visibility, options, { except: "author" })

  const rows = await db.execute<{ value: string; count: string }>(sql`
    select a->>'name' as value, count(*) as count
    from ${reports}, jsonb_array_elements(${reports.authors}) as a
    where ${where} and coalesce(a->>'name', '') <> ''
    group by 1
    order by count(*) desc, 1 asc
    limit ${FACET_LIMIT}
  `)

  return Array.from(rows).map((row) => ({
    value: row.value,
    label: row.value,
    // Drizzle maps `count()` for us; a raw statement is ours to convert, and
    // postgres.js hands back bigint as a string.
    count: Number(row.count),
  }))
}

/**
 * The shelf, by year and by subject — what a reader needs to walk the archive
 * without typing a query (design §13).
 */
export async function browseIndex(viewer: Viewer): Promise<BrowseIndex> {
  const visibility = and(listableBy(viewer), HAS_ACCESSION)!
  const unfiltered: SearchReportsOptions = { limit: 0, offset: 0 }

  const [years, subjects, totals] = await Promise.all([
    db
      .select({ year: YEAR, count: count() })
      .from(reports)
      .where(and(visibility, isNotNull(reports.publishedAt)))
      .groupBy(YEAR)
      .orderBy(sql`${YEAR} desc`),
    subjectFacet(visibility, unfiltered),
    db.select({ total: count() }).from(reports).where(visibility),
  ])

  return {
    years: years.map((row) => ({ year: Number(row.year), count: row.count })),
    subjects: subjects.map((row) => ({
      slug: row.value,
      name: row.label,
      count: row.count,
    })),
    total: totals[0]?.total ?? 0,
  }
}

/**
 * Every record that belongs in `sitemap.xml`.
 *
 * `listableBy`, not `reachableBy`: an unlisted-but-citable record resolves by
 * direct link and must not be advertised in a sitemap (design §4.2).
 */
export async function sitemapEntries(viewer: Viewer): Promise<SitemapEntry[]> {
  const rows = await db
    .select({ accessionId: reports.accessionId, updatedAt: reports.updatedAt })
    .from(reports)
    .where(and(listableBy(viewer), HAS_ACCESSION))
    .orderBy(desc(reports.publishedAt))

  return rows.map((row) => ({
    accessionId: row.accessionId!,
    updatedAt: row.updatedAt,
  }))
}

/**
 * One record by its accession ID.
 *
 * Returns null rather than throwing when the viewer may not see it, so the
 * caller renders a 404. A record the viewer is not entitled to and a record
 * that does not exist are deliberately indistinguishable.
 */
export async function getReportByAccessionId(
  viewer: Viewer,
  accessionId: string
): Promise<ReportDetail | null> {
  const rows = await db
    .select()
    .from(reports)
    .where(and(eq(reports.accessionId, accessionId), reachableBy(viewer)))
    .limit(1)

  // Length rather than a truthiness check on rows[0]: without
  // noUncheckedIndexedAccess, TypeScript types the element as always present.
  if (rows.length === 0) return null

  // Drop the internal UUID and the extracted body text before this crosses the
  // wire. Neither is any of the browser's business.
  const {
    id: _id,
    fulltext: _fulltext,
    searchVector: _vector,
    ...detail
  } = rows[0]

  return detail
}
