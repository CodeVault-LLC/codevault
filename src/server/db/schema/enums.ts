// Postgres enums, generated from the controlled vocabularies so the database
// and the TypeScript unions cannot drift.

import { pgEnum } from "drizzle-orm/pg-core"

import {
  CLASSIFICATIONS,
  DISSEMINATIONS,
  DOC_TYPES,
  REPORT_STATUSES,
  TECHNICAL_REVIEW_TYPES,
} from "@/core/reports/vocabulary"
import { STAFF_ROLES } from "@/core/auth/permissions"

export const reportStatusEnum = pgEnum("report_status", REPORT_STATUSES)
export const classificationEnum = pgEnum("classification", CLASSIFICATIONS)
export const disseminationEnum = pgEnum("dissemination", DISSEMINATIONS)
export const docTypeEnum = pgEnum("doc_type", DOC_TYPES)
export const technicalReviewTypeEnum = pgEnum(
  "technical_review_type",
  TECHNICAL_REVIEW_TYPES
)

// Roles live in `@/core/auth/permissions` rather than beside the report
// vocabularies: what a role *is* has to be readable by the browser so the
// sidebar can hide what it cannot reach, and the capability map has to be the
// same one the server decides with.
export const staffRoleEnum = pgEnum("staff_role", STAFF_ROLES)
