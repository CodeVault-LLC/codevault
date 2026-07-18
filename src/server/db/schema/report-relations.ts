import { pgTable, primaryKey, text, uuid } from "drizzle-orm/pg-core"

import { reports } from "./reports"

// Revisions are independent records joined by a typed relation, not versions of
// a parent — Rev B is a distinct published document, not an edit of Rev A
// (design §4.4). `relation` holds a DataCite 4.6 term; it is text rather than a
// Postgres enum because DataCite's vocabulary grows and we would rather add a
// seed row than run a migration.
export const reportRelations = pgTable(
  "report_relations",
  {
    fromId: uuid("from_id")
      .notNull()
      .references(() => reports.id, { onDelete: "cascade" }),
    toId: uuid("to_id")
      .notNull()
      .references(() => reports.id, { onDelete: "cascade" }),
    relation: text("relation").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.fromId, table.toId, table.relation] }),
  ]
)
