import { and, eq, sql } from "drizzle-orm"
import type { SQL } from "drizzle-orm"

import type { FacetDimension, SearchReportsOptions } from "./types"
import { reports } from "@/server/db/schema"

// The search predicate, assembled one filter at a time.
//
// Every clause here is *additional* to the visibility predicate the caller
// composes in — this module never decides who may see what. That rule lives in
// `./visibility.ts` and nowhere else.

/**
 * The parsed query, as a tsquery.
 *
 * `websearch_to_tsquery` rather than `plainto_tsquery`: it understands quoted
 * phrases, `or`, and leading `-` to exclude, which is what a reader typing into
 * a search box already expects, and it never throws on malformed input the way
 * `to_tsquery` does.
 */
export function tsquery(q: string): SQL {
  return sql`websearch_to_tsquery('english', ${q})`
}

/**
 * Relevance, for ordering.
 *
 * The weights are the setweight labels' multipliers in reverse order —
 * `{D, C, B, A}` — so a title hit outranks a body hit by roughly an order of
 * magnitude. Body text is indexed at weight D and therefore participates
 * without dominating (design §6).
 */
export function rank(q: string): SQL<number> {
  return sql<number>`ts_rank('{0.05, 0.2, 0.6, 1.0}'::float4[], ${reports.searchVector}, ${tsquery(q)})`
}

function matchesQuery(q: string): SQL {
  return sql`${reports.searchVector} @@ ${tsquery(q)}`
}

// `published_at` is a date, so the year is a substring — but extract() is what
// the planner understands, and the listing index covers the ordering anyway.
function inYear(year: number): SQL {
  return sql`extract(year from ${reports.publishedAt}) = ${year}`
}

function authorNamed(author: string): SQL {
  // The authors column is a JSONB array of objects. Containment can't express
  // "any element whose name matches case-insensitively", so this expands the
  // array and asks. Facet values come from `facetCounts`, so the common path is
  // an exact string a reader clicked rather than something they typed.
  return sql`exists (
    select 1 from jsonb_array_elements(${reports.authors}) as a
    where lower(a->>'name') = lower(${author})
  )`
}

/**
 * The filter clauses for a search, with one dimension optionally omitted.
 *
 * Omitting a dimension is what makes faceting useful rather than a set of
 * dead ends: the year counts shown next to an active year filter must be the
 * counts you would get by switching to that year, not zero for every other
 * year (which is what applying the filter to its own counts would produce).
 */
export function searchFilters(
  options: SearchReportsOptions,
  { except }: { except?: FacetDimension } = {}
): SQL[] {
  const clauses: SQL[] = []

  if (options.q) clauses.push(matchesQuery(options.q))
  if (options.year && except !== "year") clauses.push(inYear(options.year))
  if (options.docType && except !== "docType") {
    clauses.push(eq(reports.docType, options.docType))
  }
  if (options.subject && except !== "subject") {
    clauses.push(eq(reports.subjectCategory, options.subject))
  }
  if (options.project && except !== "project") {
    clauses.push(eq(reports.projectSlug, options.project))
  }
  if (options.author && except !== "author") {
    clauses.push(authorNamed(options.author))
  }

  return clauses
}

/** The full WHERE clause: visibility first, then the reader's filters. */
export function searchWhere(
  visibility: SQL,
  options: SearchReportsOptions,
  scope: { except?: FacetDimension } = {}
): SQL {
  return and(visibility, ...searchFilters(options, scope))!
}
