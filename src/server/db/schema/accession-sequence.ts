import { integer, pgTable } from "drizzle-orm/pg-core"

// One row per year, holding the highest accession number allocated so far.
//
// A Postgres sequence cannot express "monotonic *within the year*" without a
// new sequence per year, and `max(accession_id) + 1` races under concurrent
// publishes. A single upsert with `returning` is atomic and reads plainly:
//
//   insert into accession_sequence (year, last_value) values ($1, 1)
//   on conflict (year) do update set last_value = accession_sequence.last_value + 1
//   returning last_value
//
// Numbers are consumed on allocation and never handed back, so a failed
// publish leaves a gap. That is correct — identifiers are never reused.
export const accessionSequence = pgTable("accession_sequence", {
  year: integer("year").primaryKey(),
  lastValue: integer("last_value").notNull().default(0),
})
