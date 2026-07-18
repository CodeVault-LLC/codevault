import { createServerFn } from "@tanstack/react-start"

import {
  ADMIN_PAGE_SIZE,
  adminAuditSchema,
  adminReportsSchema,
} from "@/core/admin/search-params"
import {
  addRelation,
  removeRelation,
  restoreReport,
  reviseReport,
  updateReport,
  withdrawReport,
} from "./mutations"
import {
  credentialSchema,
  provisionUserSchema,
  relationSchema,
  removeRelationSchema,
  reportIdSchema,
  setRoleSchema,
  updateReportSchema,
  userIdSchema,
  withdrawReportSchema,
} from "./schema"
import {
  issueEnrollment,
  listStaffAccounts,
  provisionAccount,
  revokeCredential,
  revokeSessions,
  setAccountDisabled,
  setAccountRole,
} from "./users"
import { listAudit, verifyAuditChain } from "@/server/audit/audit"
import { findReportByAnyId, getAdminReport } from "./record"
import { getAdminOverview } from "./overview"
import { listAdminReports, listPublishedYears } from "./reports"
import { requireCapability } from "@/server/auth/middleware"

// Every function here carries a capability, not merely a session.
//
// This is the actual security boundary — not the `beforeLoad` guard on /admin.
// A server function is a same-origin RPC endpoint reachable by direct POST
// regardless of which route rendered the UI that calls it (design §7.6), so a
// staff account POSTing straight at `provisionAccountFn` has to be refused
// here or it is not refused at all. The sidebar hiding a screen is a courtesy;
// this is the check.

const readReports = requireCapability("reports.read")
const writeReports = requireCapability("reports.write")

/**
 * `requireStaff` would keep the public out, but the overview carries draft
 * titles and corpus-wide counts, which is `reports.read` — the same thing the
 * table needs. Naming the capability rather than the role means a future role
 * that may not see unpublished work is refused here without this line changing.
 */
export const fetchAdminOverviewFn = createServerFn({ method: "GET" })
  .middleware([readReports])
  .handler(() => getAdminOverview())

/**
 * The reports table.
 *
 * Takes the URL's own search schema rather than a bespoke input shape, so the
 * link an operator shares and the query the server runs are the same object,
 * with the `type` → `docType` rename and the page arithmetic in between.
 */
export const fetchAdminReportsFn = createServerFn({ method: "GET" })
  .middleware([readReports])
  .validator(adminReportsSchema)
  .handler(({ data }) =>
    listAdminReports({
      q: data.q || undefined,
      status: data.status,
      classification: data.classification,
      docType: data.type,
      year: data.year,
      page: data.page,
    })
  )

/**
 * The year filter's options.
 *
 * Its own function rather than folded into the page payload, because it does
 * not change when a filter does — the years the archive covers are a property
 * of the archive, not of the current query — and recomputing it on every
 * keystroke-driven refetch would be a `group by` over the whole table for a
 * list that had not moved.
 */
export const fetchReportYearsFn = createServerFn({ method: "GET" })
  .middleware([readReports])
  .handler(() => listPublishedYears())

export const fetchAdminReportFn = createServerFn({ method: "GET" })
  .middleware([readReports])
  .validator(reportIdSchema)
  .handler(({ data }) => getAdminReport(data.reportId))

export const updateReportFn = createServerFn({ method: "POST" })
  .middleware([writeReports])
  .validator(updateReportSchema)
  .handler(({ data, context }) => updateReport(data, context.actor))

export const withdrawReportFn = createServerFn({ method: "POST" })
  .middleware([requireCapability("reports.withdraw")])
  .validator(withdrawReportSchema)
  .handler(({ data, context }) =>
    withdrawReport(data.reportId, data.reason, context.actor)
  )

export const restoreReportFn = createServerFn({ method: "POST" })
  .middleware([requireCapability("reports.restore")])
  .validator(reportIdSchema)
  .handler(({ data, context }) => restoreReport(data.reportId, context.actor))

/**
 * Resolves whatever identifier was typed into the relation field.
 *
 * Separate from `addRelationFn` so the form can confirm what it found — "this
 * will link to CV-2026-0004, *Structural fatigue in…*" — before anything is
 * written. Linking to the wrong record is otherwise a quiet mistake: it
 * succeeds, and nothing looks wrong until someone follows the link.
 */
export const resolveRelationTargetFn = createServerFn({ method: "GET" })
  .middleware([readReports])
  .validator(relationSchema.pick({ target: true }))
  .handler(({ data }) => findReportByAnyId(data.target))

export const addRelationFn = createServerFn({ method: "POST" })
  .middleware([writeReports])
  .validator(relationSchema)
  .handler(async ({ data, context }) => {
    // Resolved again here rather than trusting an id the client says it looked
    // up. The client's lookup was for the operator's benefit; this one decides
    // what actually gets written.
    const target = await findReportByAnyId(data.target)
    if (!target) return { ok: false, reason: "not_found" } as const

    return addRelation(data.fromId, target.id, data.relation, context.actor)
  })

export const removeRelationFn = createServerFn({ method: "POST" })
  .middleware([writeReports])
  .validator(removeRelationSchema)
  .handler(({ data, context }) =>
    removeRelation(data.fromId, data.toId, data.relation, context.actor)
  )

export const reviseReportFn = createServerFn({ method: "POST" })
  .middleware([writeReports])
  .validator(reportIdSchema)
  .handler(({ data, context }) => reviseReport(data.reportId, context.actor))

// ---------------------------------------------------------------------------
// Accounts and the audit log — admin only, through the capability table.
// ---------------------------------------------------------------------------

const readUsers = requireCapability("users.read")
const writeUsers = requireCapability("users.write")
const manageCredentials = requireCapability("users.credentials")

export const fetchStaffAccountsFn = createServerFn({ method: "GET" })
  .middleware([readUsers])
  .handler(() => listStaffAccounts())

export const provisionAccountFn = createServerFn({ method: "POST" })
  .middleware([writeUsers])
  .validator(provisionUserSchema)
  .handler(({ data, context }) => provisionAccount(data, context.actor))

export const setAccountRoleFn = createServerFn({ method: "POST" })
  .middleware([writeUsers])
  .validator(setRoleSchema)
  .handler(({ data, context }) =>
    setAccountRole(data.userId, data.role, context.actor)
  )

export const disableAccountFn = createServerFn({ method: "POST" })
  .middleware([writeUsers])
  .validator(userIdSchema)
  .handler(({ data, context }) =>
    setAccountDisabled(data.userId, true, context.actor)
  )

export const enableAccountFn = createServerFn({ method: "POST" })
  .middleware([writeUsers])
  .validator(userIdSchema)
  .handler(({ data, context }) =>
    setAccountDisabled(data.userId, false, context.actor)
  )

export const issueEnrollmentFn = createServerFn({ method: "POST" })
  .middleware([manageCredentials])
  .validator(userIdSchema)
  .handler(({ data, context }) => issueEnrollment(data.userId, context.actor))

export const revokeSessionsFn = createServerFn({ method: "POST" })
  .middleware([manageCredentials])
  .validator(userIdSchema)
  .handler(({ data, context }) => revokeSessions(data.userId, context.actor))

export const revokeCredentialFn = createServerFn({ method: "POST" })
  .middleware([manageCredentials])
  .validator(credentialSchema)
  .handler(({ data, context }) =>
    revokeCredential(data.userId, data.credentialRowId, context.actor)
  )

/**
 * The audit log, together with a verdict on its own integrity.
 *
 * Both in one round trip because they are one question. A log with no statement
 * about whether it has been tampered with asks the reader to trust it, which is
 * exactly what the hash chain exists to make unnecessary.
 */
export const fetchAuditLogFn = createServerFn({ method: "GET" })
  .middleware([requireCapability("audit.read")])
  .validator(adminAuditSchema)
  .handler(async ({ data }) => {
    const [page, chain] = await Promise.all([
      listAudit({
        action: data.action,
        outcome: data.outcome,
        actorUserId: data.actor,
        targetId: data.target,
        limit: ADMIN_PAGE_SIZE,
        offset: (data.page - 1) * ADMIN_PAGE_SIZE,
      }),
      verifyAuditChain(),
    ])

    return {
      ...page,
      chain,
      page: data.page,
      pageSize: ADMIN_PAGE_SIZE,
      pageCount: Math.max(1, Math.ceil(page.total / ADMIN_PAGE_SIZE)),
    }
  })
