// The dashboard's URL contract.
//
// Same argument as the public archive's (`@/core/reports/search-params`): the
// filter state lives in the URL and nowhere else, so a filtered table can be
// linked to, bookmarked, and reloaded onto the row you were looking at. It also
// means the browser's back button steps back through filters, which component
// state does not give you.
//
// One schema, read by `validateSearch` on the route and by the server
// function's validator — the server re-validates because a server function is a
// public endpoint whatever the router did on the way in.

import { z } from "zod"

import { AUDIT_ACTIONS, AUDIT_OUTCOMES } from "@/core/audit/vocabulary"
import {
  CLASSIFICATIONS,
  DOC_TYPES,
  REPORT_STATUSES,
} from "@/core/reports/vocabulary"

/**
 * Denser than the public archive's 25.
 *
 * An operator scanning for one record wants more rows per screen and is working
 * on a wide viewport with a dense type scale; a reader wants breathing room.
 * Same reason the admin surface exists at all (design-rules §Surfaces).
 */
export const ADMIN_PAGE_SIZE = 40

// What a bare /admin/reports carries, so `stripSearchParams` can keep the
// defaults out of the URL and route and server agree on what "no filter" means.
export const ADMIN_REPORTS_DEFAULTS = {
  q: "",
  page: 1,
} as const

export const adminReportsSchema = z.object({
  // Matches title, accession ID and report numbers. Not full text: this is a
  // "find the record I am thinking of" box, not the archive's search.
  q: z.string().trim().max(200).default(ADMIN_REPORTS_DEFAULTS.q),

  // Every one of these is optional and absent means "all states". That default
  // is the point of the screen: unlike the public archive, the dashboard's
  // reason for existing is that it shows drafts and withdrawals alongside what
  // is published (design §8.1).
  status: z.enum(REPORT_STATUSES).optional(),
  classification: z.enum(CLASSIFICATIONS).optional(),
  type: z.enum(DOC_TYPES).optional(),
  year: z.coerce.number().int().min(1900).max(2999).optional(),

  page: z.coerce.number().int().min(1).max(10_000).default(1),
})

export type AdminReportsSearch = z.infer<typeof adminReportsSchema>

export function hasActiveReportFilters(search: AdminReportsSearch): boolean {
  return Boolean(
    search.q ||
    search.status ||
    search.classification ||
    search.type ||
    search.year
  )
}

export const ADMIN_AUDIT_DEFAULTS = { page: 1 } as const

export const adminAuditSchema = z.object({
  action: z.enum(AUDIT_ACTIONS).optional(),
  outcome: z.enum(AUDIT_OUTCOMES).optional(),
  actor: z.string().max(100).optional(),
  // Filters the log down to one report or one account — the "what happened to
  // this thing" view, reached from that thing's own screen.
  target: z.string().max(100).optional(),
  page: z.coerce.number().int().min(1).max(10_000).default(1),
})

export type AdminAuditSearch = z.infer<typeof adminAuditSchema>

export function hasActiveAuditFilters(search: AdminAuditSearch): boolean {
  return Boolean(
    search.action || search.outcome || search.actor || search.target
  )
}
