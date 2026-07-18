import { integer, pgTable, text } from "drizzle-orm/pg-core"

// The subject taxonomy — reference data, not fixtures. Seeded in every
// environment on deploy and keyed on `slug` (a natural key) so an
// `onConflictDoUpdate` propagates edits instead of silently no-opping
// (design §10.4).
export const subjectCategories = pgTable("subject_categories", {
  slug: text("slug").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  // Display order in the deposit form and the browse page.
  position: integer("position").notNull().default(0),
})
