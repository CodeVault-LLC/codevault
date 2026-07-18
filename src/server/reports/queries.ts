import { and, desc, eq, isNotNull } from "drizzle-orm"

import type {
  ListReportsOptions,
  ReportDetail,
  ReportSummary,
  Viewer,
} from "./types"
import { db } from "@/server/db/client"
import { listableBy, reachableBy } from "./visibility"
import { reports } from "@/server/db/schema"

// Columns safe to expose in a listing. `fulltext` is deliberately absent —
// selecting it for thirty rows would pull megabytes of TOASTed text.
const SUMMARY_COLUMNS = {
  accessionId: reports.accessionId,
  title: reports.title,
  authors: reports.authors,
  docType: reports.docType,
  publishedAt: reports.publishedAt,
  pageCount: reports.pageCount,
  subjectCategory: reports.subjectCategory,
}

/**
 * Reverse-chronological listing. Filtered by `listableBy`, so a non-discoverable
 * or internal record cannot appear here regardless of what the caller renders.
 */
export async function listReports(
  viewer: Viewer,
  { limit, offset }: ListReportsOptions
): Promise<ReportSummary[]> {
  return db
    .select(SUMMARY_COLUMNS)
    .from(reports)
    .where(and(listableBy(viewer), isNotNull(reports.accessionId)))
    .orderBy(desc(reports.publishedAt), desc(reports.createdAt))
    .limit(limit)
    .offset(offset)
}

/**
 * One record by its accession ID.
 *
 * Returns null rather than throwing when the viewer may not see it, so the
 * caller renders a 404. A record the viewer is not entitled to and a record
 * that does not exist are deliberately indistinguishable.
 */
export async function getReportByAccessionId(
  viewer: Viewer,
  accessionId: string
): Promise<ReportDetail | null> {
  const rows = await db
    .select()
    .from(reports)
    .where(and(eq(reports.accessionId, accessionId), reachableBy(viewer)))
    .limit(1)

  // Length rather than a truthiness check on rows[0]: without
  // noUncheckedIndexedAccess, TypeScript types the element as always present.
  if (rows.length === 0) return null

  // Drop the internal UUID and the extracted body text before this crosses the
  // wire. Neither is any of the browser's business.
  const {
    id: _id,
    fulltext: _fulltext,
    searchVector: _vector,
    ...detail
  } = rows[0]

  return detail
}
