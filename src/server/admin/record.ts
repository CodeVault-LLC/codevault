import { aliasedTable, eq, or } from "drizzle-orm"

import type { AdminReportDetail, RelatedRecord } from "./types"
import { db } from "@/server/db/client"
import { evaluatePublishGate } from "@/core/reports/publish-gate"
import { reportRelations, reports } from "@/server/db/schema"
import { toGateCandidate } from "@/server/reports/publish"

/**
 * The inverse of every DataCite relation we use.
 *
 * Relations are stored in both directions (see `addRelation`), so this is not
 * needed to *read* them — it is what lets a single user action write the
 * matching pair. Keeping the table symmetric means either record's page can
 * render its links with one query against `from_id` instead of a union with
 * `to_id`, and neither record is quietly the "owner" of a relationship that is
 * inherently mutual.
 */
export const INVERSE_RELATIONS: Record<string, string> = {
  IsNewVersionOf: "IsPreviousVersionOf",
  IsPreviousVersionOf: "IsNewVersionOf",
  Obsoletes: "IsObsoletedBy",
  IsObsoletedBy: "Obsoletes",
  // DataCite pairs `IsSupplementTo` with `IsSupplementedBy`. We do not offer
  // the latter as a choice — nobody reaches for it — but the inverse still has
  // to be written or the supplemented record would not know about the link.
  IsSupplementTo: "IsSupplementedBy",
  IsSupplementedBy: "IsSupplementTo",
  References: "IsReferencedBy",
  IsReferencedBy: "References",
}

/** Everything hanging off one record, resolved to something renderable. */
export async function listRelations(
  reportId: string
): Promise<RelatedRecord[]> {
  // Aliased because this joins `reports` to itself: the row on the far end of
  // the relation is a different report from the one being asked about.
  const other = aliasedTable(reports, "related_report")

  const rows = await db
    .select({
      relation: reportRelations.relation,
      reportId: other.id,
      accessionId: other.accessionId,
      title: other.title,
      status: other.status,
    })
    .from(reportRelations)
    .innerJoin(other, eq(other.id, reportRelations.toId))
    .where(eq(reportRelations.fromId, reportId))
    .orderBy(reportRelations.relation, other.accessionId)

  return rows.map((row) => ({
    ...row,
    title: row.title || "Untitled draft",
  }))
}

/**
 * One record, with its relations and a live gate verdict.
 *
 * No visibility predicate, deliberately — this is the dashboard, and it exists
 * to show records the public query layer hides. The guard is
 * `requireCapability("reports.read")` on the server function that calls this.
 */
export async function getAdminReport(
  reportId: string
): Promise<AdminReportDetail | null> {
  const rows = await db
    .select()
    .from(reports)
    .where(eq(reports.id, reportId))
    .limit(1)

  if (rows.length === 0) return null

  const row = rows[0]
  const gate = evaluatePublishGate(toGateCandidate(row))

  // The extracted body text never crosses the wire — megabytes per record, and
  // the form has no use for it. Whether any exists is what the gate needs.
  // The checksum goes the same way: formatted here, because hex-encoding it in
  // the browser needs `Buffer`, which only exists on the server.
  const { fulltext, checksum, searchVector: _vector, ...rest } = row

  return {
    report: {
      ...rest,
      hasSearchableText: Boolean(fulltext?.trim()),
      checksumHex: checksum ? Buffer.from(checksum).toString("hex") : null,
    },
    gate,
    relations: await listRelations(reportId),
  }
}

/**
 * Resolves a record by accession ID *or* by internal UUID.
 *
 * The relation editor takes whatever the operator has in hand. An accession ID
 * is what they will have — it is on the record page, in the citation, in the
 * URL — but a draft has none, and linking a revision to its unpublished
 * predecessor is a real case. Accepting both means the field does not have to
 * ask which kind of identifier this is.
 */
export async function findReportByAnyId(identifier: string) {
  const trimmed = identifier.trim()
  if (!trimmed) return null

  // A UUID is only worth trying as one if it looks like one; passing arbitrary
  // text to a `uuid` comparison is a Postgres cast error, not a non-match.
  const looksLikeUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      trimmed
    )

  const rows = await db
    .select({
      id: reports.id,
      accessionId: reports.accessionId,
      title: reports.title,
      status: reports.status,
    })
    .from(reports)
    .where(
      looksLikeUuid
        ? or(eq(reports.accessionId, trimmed), eq(reports.id, trimmed))
        : eq(reports.accessionId, trimmed)
    )
    .limit(1)

  return rows.length === 0 ? null : rows[0]
}
