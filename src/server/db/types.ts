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

export type ReportRow = typeof reports.$inferSelect
export type NewReportRow = typeof reports.$inferInsert

export type ReportFileRow = typeof reportFiles.$inferSelect
export type NewReportFileRow = typeof reportFiles.$inferInsert

export type ReportRelationRow = typeof reportRelations.$inferSelect
export type NewReportRelationRow = typeof reportRelations.$inferInsert

export type SubjectCategoryRow = typeof subjectCategories.$inferSelect
export type NewSubjectCategoryRow = typeof subjectCategories.$inferInsert

export type AccessionSequenceRow = typeof accessionSequence.$inferSelect
