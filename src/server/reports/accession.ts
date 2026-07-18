import { sql } from "drizzle-orm"

import type { DbTransaction } from "@/server/db/types"
import { accessionSequence } from "@/server/db/schema"

const PREFIX = "CV"
const SEQUENCE_WIDTH = 4

export function formatAccessionId(year: number, value: number): string {
  return `${PREFIX}-${year}-${String(value).padStart(SEQUENCE_WIDTH, "0")}`
}

/**
 * Allocates the next accession ID for a year: CV-2026-0042.
 *
 * A single upsert with `returning` rather than `max(accession_id) + 1`, which
 * races under concurrent publishes. Postgres serializes conflicting upserts on
 * the same primary key, so two simultaneous publishes get two different
 * numbers rather than one duplicate.
 *
 * Takes the transaction so the allocation commits or rolls back with the rest
 * of the publish. Numbers consumed by a rolled-back publish are simply lost —
 * gaps are correct, because identifiers are never reused (design §4.5).
 */
export async function allocateAccessionId(
  tx: DbTransaction,
  year: number
): Promise<string> {
  const [row] = await tx
    .insert(accessionSequence)
    .values({ year, lastValue: 1 })
    .onConflictDoUpdate({
      target: accessionSequence.year,
      set: { lastValue: sql`${accessionSequence.lastValue} + 1` },
    })
    .returning({ lastValue: accessionSequence.lastValue })

  return formatAccessionId(year, row.lastValue)
}
