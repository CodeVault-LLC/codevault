// Row types inferred from the schema. Kept separate from the table
// definitions so consumers can import a shape without pulling in Drizzle's
// builders.

import type {
  accessionSequence,
  reportFiles,
  reportRelations,
  reports,
  subjectCategories,
} from "./schema"
import type { db } from "./client"

// Drizzle 1.0 does not export a usable `PgTransaction` alias, so derive the
// transaction handle from the callback `db.transaction` actually passes. This
// stays correct if the driver or schema generics change.
export type DbTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0]

export type ReportRow = typeof reports.$inferSelect
export type NewReportRow = typeof reports.$inferInsert

export type ReportFileRow = typeof reportFiles.$inferSelect
export type NewReportFileRow = typeof reportFiles.$inferInsert

export type ReportRelationRow = typeof reportRelations.$inferSelect
export type NewReportRelationRow = typeof reportRelations.$inferInsert

export type SubjectCategoryRow = typeof subjectCategories.$inferSelect
export type NewSubjectCategoryRow = typeof subjectCategories.$inferInsert

export type AccessionSequenceRow = typeof accessionSequence.$inferSelect
