import {
  bigint,
  bytea,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core"

import { reports } from "./reports"

export const reportFiles = pgTable(
  "report_files",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    reportId: uuid("report_id")
      .notNull()
      .references(() => reports.id, { onDelete: "cascade" }),

    // 'pdf' | 'text' | 'thumb' | 'source'
    kind: text("kind").notNull(),

    // Which of the three buckets holds it. Stored rather than derived, because
    // a record's classification can change and already-written objects do not
    // move themselves.
    bucket: text("bucket").notNull(),
    key: text("key").notNull(),

    byteSize: bigint("byte_size", { mode: "number" }).notNull(),
    checksum: bytea("checksum").notNull(),

    // Per-file embargo, independent of the record's own (design §4.2).
    embargoUntil: timestamp("embargo_until", { withTimezone: true }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("report_files_report_id_idx").on(table.reportId)]
)
