import { and, eq, isNull, lte, or, sql } from "drizzle-orm"
import type { SQL } from "drizzle-orm"

import type { Viewer } from "./types"
import { reports } from "@/server/db/schema"

// Default deny, enforced here and nowhere else.
//
// This module is the single place that decides what an anonymous viewer may
// see. It must never be duplicated into a route, a loader, or a template: a
// second copy is a second thing to forget to update. Every query in
// `./queries.ts` composes one of these predicates into its WHERE clause.

/**
 * A record is *reachable* — by direct link, and citable.
 *
 * `classification = 'internal'` hides the record completely rather than
 * returning a forbidden response. Leaking the title of an internal report is
 * still a leak, and a 403 confirms the record exists (design §8.4).
 */
function reachableByAnonymous(): SQL {
  return and(
    eq(reports.status, "published"),
    eq(reports.classification, "public"),
    // Embargo is evaluated lazily against now(), the way DSpace treats a policy
    // start date. No job flips rows, so there is no window where a cron failure
    // leaves an embargoed record exposed.
    or(isNull(reports.embargoUntil), lte(reports.embargoUntil, sql`now()`))
  )!
}

/**
 * Whether the record may appear in a *listing* — search results, browse,
 * sitemap, RSS.
 *
 * Strictly narrower than reachability: a non-discoverable record is absent from
 * every listing but still resolves by direct link, which is what makes
 * "unlisted but citable" possible without a bespoke code path (design §4.2).
 */
function listableByAnonymous(): SQL {
  return and(reachableByAnonymous(), eq(reports.discoverable, true))!
}

/** Staff see every record, in every state. */
const UNRESTRICTED: SQL = sql`true`

export function reachableBy(viewer: Viewer): SQL {
  return viewer.kind === "staff" ? UNRESTRICTED : reachableByAnonymous()
}

export function listableBy(viewer: Viewer): SQL {
  return viewer.kind === "staff" ? UNRESTRICTED : listableByAnonymous()
}

/**
 * Whether the *file* may be served, given that the record is already reachable.
 *
 * Independent of record visibility: a `metadata_only` record is publicly
 * findable and citable while the document itself is withheld. This generalizes
 * "available on request" without a separate flag (design §4.3).
 */
export function canServeFile(
  viewer: Viewer,
  report: { dissemination: string; embargoUntil: Date | null }
): boolean {
  if (viewer.kind === "staff") return true
  if (report.dissemination === "metadata_only") return false
  if (report.embargoUntil && report.embargoUntil > new Date()) return false
  return true
}
