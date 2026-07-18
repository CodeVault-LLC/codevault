import { count, desc, sum } from "drizzle-orm"

import type {
  AdminOverview,
  AttentionDraft,
  RecentDeposit,
  StatusCounts,
} from "./types"
import { REPORT_STATUSES } from "@/core/reports/vocabulary"
import { db } from "@/server/db/client"
import { listDrafts } from "@/server/deposit/drafts"
import { reports } from "@/server/db/schema"

/** How many rows each dashboard panel shows. */
const RECENT_LIMIT = 8
const ATTENTION_LIMIT = 5

function emptyCounts(): StatusCounts {
  return Object.fromEntries(
    REPORT_STATUSES.map((status) => [status, 0])
  ) as StatusCounts
}

async function countsByStatus(): Promise<StatusCounts> {
  const rows = await db
    .select({ status: reports.status, total: count() })
    .from(reports)
    .groupBy(reports.status)

  // Seeded with every status at zero: a status absent from the result set means
  // "none yet", and the dashboard must render that as 0 rather than a gap.
  const counts = emptyCounts()
  for (const row of rows) counts[row.status] = row.total
  return counts
}

/**
 * Bytes stored, summed from `reports.file_size`.
 *
 * `report_files` looks like the right source — it is the table that models one
 * row per stored object — but nothing in the pipeline writes to it yet. Ingest
 * and publish record the PDF on the report row itself (`pdf_key`, `file_size`)
 * and never insert a file row, so summing that table returns 0 no matter how
 * much is actually stored.
 *
 * The consequence is that this undercounts: it is the PDFs only, and misses
 * extracted text and thumbnails. That is the honest number available today.
 * When the pipeline starts populating `report_files`, move this back — that
 * table is the one that can account for every object.
 */
async function storageBytes(): Promise<number> {
  const rows = await db.select({ total: sum(reports.fileSize) }).from(reports)

  // `sum` is null over zero rows, and Drizzle returns numerics as strings to
  // avoid precision loss. Both have to be unwound before this is a number.
  return Number(rows[0]?.total ?? 0)
}

async function recentDeposits(): Promise<RecentDeposit[]> {
  return db
    .select({
      id: reports.id,
      accessionId: reports.accessionId,
      title: reports.title,
      status: reports.status,
      createdAt: reports.createdAt,
    })
    .from(reports)
    .orderBy(desc(reports.createdAt))
    .limit(RECENT_LIMIT)
}

/**
 * Drafts that cannot publish yet, oldest first.
 *
 * Oldest rather than newest: a draft that has sat blocked for a month is the
 * one that needs attention, whereas one deposited this morning is simply still
 * being worked on.
 */
async function draftsNeedingAttention(): Promise<{
  drafts: AttentionDraft[]
  total: number
}> {
  // `listDrafts` already scans and judges every draft for the deposit landing
  // page. Reusing it keeps one projection and one gate evaluation in the
  // codebase; the two screens differ only in how they slice the result.
  //
  // Oldest first, which `listDrafts` already orders by: a draft that has sat
  // blocked for a month is the one needing attention, whereas one deposited
  // this morning is simply still being worked on.
  const blocked = (await listDrafts()).filter((draft) => !draft.publishable)

  return {
    drafts: blocked.slice(0, ATTENTION_LIMIT).map((draft) => ({
      id: draft.id,
      title: draft.title,
      createdAt: draft.createdAt,
      blockerCount: draft.blockerCount,
      topBlocker: draft.topBlocker,
    })),
    total: blocked.length,
  }
}

/**
 * Everything the `/admin` overview renders, in one round trip.
 *
 * Deliberately excludes the "failed ingests" panel from design §8.1: there is
 * no ingest-runs table, so there is no honest way to populate it. It comes back
 * when the pipeline records its outcomes.
 */
export async function getAdminOverview(): Promise<AdminOverview> {
  const [counts, bytes, recent, attention] = await Promise.all([
    countsByStatus(),
    storageBytes(),
    recentDeposits(),
    draftsNeedingAttention(),
  ])

  return {
    generatedAt: new Date(),
    counts,
    storageBytes: bytes,
    recent,
    attention: attention.drafts,
    attentionTotal: attention.total,
  }
}
