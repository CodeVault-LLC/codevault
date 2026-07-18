import { and, eq, ne } from "drizzle-orm"

import type { DuplicateRecord } from "./types"
import { db } from "@/server/db/client"
import { reports } from "@/server/db/schema"

/**
 * Deduplication by content hash (design §10.5).
 *
 * The checksum is of the *sanitized* bytes, not the upload, and that is a
 * deliberate consequence of doing CDR first: the same source document
 * sanitized twice produces the same artifact, so re-depositing a file that has
 * already been through the pipeline is recognised. Hashing the upload instead
 * would let a byte-identical document past whenever its metadata timestamp
 * differed.
 *
 * A partial unique index on `reports.checksum` already enforces this at the
 * database level, which is what actually guarantees it under concurrency. This
 * lookup exists to turn what would surface as an opaque constraint violation
 * into a message naming the record that already holds the bytes — a check, not
 * the enforcement.
 */
export async function findDuplicate(
  checksum: Uint8Array,
  /** Excluded from the search, so re-uploading to the same draft is not a clash. */
  exceptReportId: string
): Promise<DuplicateRecord | null> {
  const rows = await db
    .select({
      reportId: reports.id,
      accessionId: reports.accessionId,
      title: reports.title,
    })
    .from(reports)
    .where(
      and(
        eq(reports.checksum, Buffer.from(checksum)),
        ne(reports.id, exceptReportId)
      )
    )
    .limit(1)

  if (rows.length === 0) return null

  return {
    reportId: rows[0].reportId,
    accessionId: rows[0].accessionId,
    title: rows[0].title || "Untitled draft",
  }
}

/**
 * Whether a database error is the checksum uniqueness constraint firing.
 *
 * The race this covers is real but narrow: two deposits of the same document
 * that both pass `findDuplicate` before either writes. Postgres refuses the
 * second, and this is what lets the caller report that as a duplicate rather
 * than as an unexplained write failure.
 */
export function isChecksumConflict(error: unknown): boolean {
  const { code, constraint_name: constraint } = (error ?? {}) as {
    code?: string
    constraint_name?: string
  }

  return code === "23505" && constraint === "reports_checksum_idx"
}
