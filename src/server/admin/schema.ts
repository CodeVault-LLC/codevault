import { z } from "zod"

import {
  CLASSIFICATIONS,
  DISSEMINATIONS,
  DOC_TYPES,
  RELATION_TYPES,
  TECHNICAL_REVIEW_TYPES,
} from "@/core/reports/vocabulary"
import { STAFF_ROLES } from "@/core/auth/permissions"
import {
  adminAuditSchema,
  adminReportsSchema,
} from "@/core/admin/search-params"

// Input validation for the dashboard.
//
// Every server function validates, including the ones whose input the router
// already parsed on the way in. A server function is a public endpoint reachable
// by direct POST regardless of which UI called it (design §7.6), so the router's
// parse is a convenience and this is the check.

export { adminAuditSchema, adminReportsSchema }

export const reportIdSchema = z.object({ reportId: z.uuid() })

const authorSchema = z.object({
  name: z.string().min(1).max(200),
  affiliation: z.string().max(200).optional(),
  orcid: z.string().max(40).optional(),
})

const fundingSchema = z.object({
  number: z.string().min(1).max(100),
  type: z.string().min(1).max(100),
})

/**
 * The editable surface of a record after deposit.
 *
 * Wider than the deposit form's patch — it reaches the fields the deposit flow
 * leaves at their defaults (report numbers, funding, licence, project, DOI) —
 * but it still stops at everything ingest derives. `pdfKey`, `checksum`,
 * `pageCount`, `fileSize` and `fulltext` describe a specific set of bytes and
 * are not editorial facts; letting a form set them would let the record claim
 * things about a document nobody has.
 *
 * `status`, `accessionId`, `withdrawnAt` and `withdrawnReason` are absent for a
 * different reason: those are state transitions, and each has its own operation
 * with its own guard and its own audit entry. An UPDATE that could set `status`
 * would be a way to publish or withdraw without passing through either.
 */
export const updateReportSchema = z.object({
  reportId: z.uuid(),
  patch: z.object({
    title: z.string().max(500).optional(),
    abstract: z.string().max(20_000).optional(),
    abstractOverrideReason: z.string().max(500).nullish(),
    authors: z.array(authorSchema).max(50).optional(),

    docType: z.enum(DOC_TYPES).optional(),
    technicalReviewType: z.enum(TECHNICAL_REVIEW_TYPES).optional(),

    // Nullable throughout: "not chosen" is a real state and the one the publish
    // gate refuses. There is no default anywhere in the stack (design §2).
    classification: z.enum(CLASSIFICATIONS).nullish(),
    dissemination: z.enum(DISSEMINATIONS).optional(),
    discoverable: z.boolean().optional(),
    embargoUntil: z.coerce.date().nullish(),

    projectSlug: z.string().max(100).nullish(),
    subjectCategory: z.string().max(100).nullish(),
    keywords: z.array(z.string().min(1).max(80)).max(20).optional(),
    reportNumbers: z.array(z.string().min(1).max(100)).max(20).optional(),
    license: z.string().max(100).nullish(),
    funding: z.array(fundingSchema).max(20).optional(),
    doi: z.string().max(200).nullish(),
  }),
})

/**
 * A withdrawal reason is required, and long enough to be a sentence.
 *
 * It goes on the public tombstone, where per DataCite guidance it has to state
 * why the item is no longer available. "no" or "x" satisfies a non-empty check
 * and tells a reader chasing a citation nothing at all — which is the one job
 * the tombstone has.
 */
export const withdrawReportSchema = z.object({
  reportId: z.uuid(),
  reason: z.string().trim().min(10).max(500),
})

export const relationSchema = z.object({
  fromId: z.uuid(),
  // Free text, because the operator types whatever identifier they have — an
  // accession ID for a published record, a UUID for a draft. Resolved
  // server-side by `findReportByAnyId`.
  target: z.string().trim().min(1).max(100),
  relation: z.enum(RELATION_TYPES),
})

export const removeRelationSchema = z.object({
  fromId: z.uuid(),
  toId: z.uuid(),
  relation: z.string().min(1).max(60),
})

// ---------------------------------------------------------------------------
// Accounts
// ---------------------------------------------------------------------------

export const userIdSchema = z.object({ userId: z.string().min(1).max(100) })

export const provisionUserSchema = z.object({
  email: z.email().max(200),
  name: z.string().trim().min(1).max(200),
  role: z.enum(STAFF_ROLES),
})

export const setRoleSchema = z.object({
  userId: z.string().min(1).max(100),
  role: z.enum(STAFF_ROLES),
})

export const credentialSchema = z.object({
  userId: z.string().min(1).max(100),
  credentialRowId: z.string().min(1).max(100),
})
