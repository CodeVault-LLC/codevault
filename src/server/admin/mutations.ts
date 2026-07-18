import { and, eq } from "drizzle-orm"
import type { z } from "zod"

import type { AuditActor } from "@/server/audit/types"
import type {
  MutationResult,
  ReviseResult,
  UpdateReportResult,
} from "./mutation-types"
import type { updateReportSchema } from "./schema"
import { INVERSE_RELATIONS, listRelations } from "./record"
import { db } from "@/server/db/client"
import { evaluatePublishGate } from "@/core/reports/publish-gate"
import { recordAudit } from "@/server/audit/audit"
import { reportRelations, reports } from "@/server/db/schema"
import { toGateCandidate } from "@/server/reports/publish"

// Everything the dashboard does to a record after it has been deposited
// (design §8.1). Each of these is audited, and each one that changes a record's
// public standing says so in the entry it writes.

/** The subset of the row every mutation needs in order to audit itself. */
const AUDIT_COLUMNS = {
  id: reports.id,
  accessionId: reports.accessionId,
  title: reports.title,
  status: reports.status,
  classification: reports.classification,
}

/**
 * Edits metadata, on a draft or on a published record.
 *
 * Post-publication editing is deliberately cheap: §4.4 is explicit that a typo
 * in an abstract is corrected in place with no new record, because if fixing a
 * typo requires a workflow then typos do not get fixed. A *revision* — a new
 * document — is a different act and gets a different record (`reviseReport`).
 *
 * The one thing it is not allowed to do is walk a published record back out of
 * compliance. Save is unconditional for a draft, because a draft may be
 * incomplete; a published record may not be (design §2, principle 5), and this
 * is the only path by which one could become so after the publish gate has
 * already run. So for anything already published the gate re-runs on the
 * *result* of the patch, and the write is refused if the edit would break it.
 *
 * Refused, rather than published-then-unpublished: the record is live and
 * cited, and silently pulling it because someone shortened an abstract would be
 * a far larger action than the one they took.
 */
export async function updateReport(
  input: z.infer<typeof updateReportSchema>,
  actor: AuditActor
): Promise<UpdateReportResult> {
  const rows = await db
    .select()
    .from(reports)
    .where(eq(reports.id, input.reportId))
    .limit(1)

  if (rows.length === 0) return { ok: false, reason: "not_found" }

  const before = rows[0]
  const after = { ...before, ...input.patch }

  // Drafts are exempt: validation belongs at publish, not at save.
  if (before.status === "published" || before.status === "in_review") {
    const gate = evaluatePublishGate(toGateCandidate(after))

    if (!gate.publishable) {
      return { ok: false, reason: "would_break_gate", gate }
    }
  }

  await db
    .update(reports)
    .set({ ...input.patch, updatedAt: new Date() })
    .where(eq(reports.id, input.reportId))

  // Which fields moved, not what they moved to. An abstract is thousands of
  // words and a title may be sensitive on an internal record; the audit log's
  // job here is "who touched what, when", and storing the values would turn it
  // into a second copy of the archive with none of the access control.
  const changed = Object.keys(input.patch).filter((key) => {
    const field = key as keyof typeof before
    return JSON.stringify(before[field]) !== JSON.stringify(after[field])
  })

  await recordAudit({
    actor,
    action: "report.update",
    targetType: "report",
    targetId: before.id,
    targetLabel: before.accessionId ?? before.title,
    classification: after.classification,
    summary:
      changed.length === 0
        ? "No fields changed."
        : `Changed ${changed.join(", ")}.`,
    detail: { fields: changed, status: before.status },
  })

  return { ok: true }
}

/**
 * Withdraws a published record.
 *
 * A state transition, never a delete — citations must not break (design §4.4).
 * The row keeps its accession ID, its metadata and its file; what changes is
 * that the record page becomes a tombstone and the document stops being served.
 * The identifier is not released for reuse, then or ever.
 *
 * The stored object is left where it is. Withdrawal is reversible by design
 * (`restoreReport`), and deleting the artifact would make it reversible only in
 * the sense that a stub could be put back. If a withdrawal ever needs the bytes
 * genuinely destroyed, that is a deliberate second act and should look like
 * one.
 */
export async function withdrawReport(
  reportId: string,
  reason: string,
  actor: AuditActor
): Promise<MutationResult> {
  const withdrawn = await db
    .update(reports)
    .set({
      status: "withdrawn",
      withdrawnAt: new Date(),
      withdrawnReason: reason,
      updatedAt: new Date(),
    })
    // Guarded on the current state rather than checked beforehand, so two
    // concurrent withdrawals cannot both report success and the second cannot
    // overwrite the first one's reason and timestamp.
    .where(and(eq(reports.id, reportId), eq(reports.status, "published")))
    .returning(AUDIT_COLUMNS)

  if (withdrawn.length === 0) {
    // Either it does not exist or it was not published. Distinguished so the
    // dashboard can say which; there is no confidentiality argument here, as
    // the caller already holds the capability to withdraw.
    const exists = await db
      .select({ id: reports.id })
      .from(reports)
      .where(eq(reports.id, reportId))
      .limit(1)

    return {
      ok: false,
      reason: exists.length === 0 ? "not_found" : "wrong_status",
    }
  }

  const row = withdrawn[0]

  await recordAudit({
    actor,
    action: "report.withdraw",
    targetType: "report",
    targetId: row.id,
    targetLabel: row.accessionId ?? row.title,
    classification: row.classification,
    // The reason, not "withdrew CV-2026-0023" — the target column already
    // says which record this was, and a summary that repeats it spends the one
    // line the row has on information the reader already has. The reason is on
    // the public tombstone anyway, so recording it here leaks nothing and lets
    // the log answer "why" without a second lookup.
    summary: reason,
    detail: { reason },
  })

  return { ok: true }
}

/**
 * Puts a withdrawn record back.
 *
 * Withdrawal by mistake is a real thing, and without this the only remedy is a
 * hand-written UPDATE against production. Held at a higher capability than
 * withdrawal (`reports.restore`, admin only) because the asymmetry is real: one
 * of these stops distributing a document and the other resumes it, possibly one
 * that was taken down for a reason the person restoring it does not know.
 *
 * `withdrawn_at` and `withdrawn_reason` are cleared. They describe a withdrawal
 * that is no longer in force, and leaving them would make the next tombstone
 * show a reason from a previous, reversed decision. The audit log is what
 * remembers that any of this happened.
 */
export async function restoreReport(
  reportId: string,
  actor: AuditActor
): Promise<MutationResult> {
  const restored = await db
    .update(reports)
    .set({
      status: "published",
      withdrawnAt: null,
      withdrawnReason: null,
      updatedAt: new Date(),
    })
    .where(and(eq(reports.id, reportId), eq(reports.status, "withdrawn")))
    .returning(AUDIT_COLUMNS)

  if (restored.length === 0) {
    const exists = await db
      .select({ id: reports.id })
      .from(reports)
      .where(eq(reports.id, reportId))
      .limit(1)

    return {
      ok: false,
      reason: exists.length === 0 ? "not_found" : "wrong_status",
    }
  }

  const row = restored[0]

  await recordAudit({
    actor,
    action: "report.restore",
    targetType: "report",
    targetId: row.id,
    targetLabel: row.accessionId ?? row.title,
    classification: row.classification,
    // Deliberately spare: the action label and the target column carry the
    // whole fact. What the reversed withdrawal said is still in the log above.
    summary: "The document is being served again.",
  })

  return { ok: true }
}

/**
 * Links two records with a typed DataCite relation, in both directions.
 *
 * A relation is mutual, and storing only the side someone happened to enter
 * would make the other record's page silently incomplete — the superseded
 * report would not know it had been superseded. Writing the inverse alongside
 * it means every record's links are one query against `from_id`, and neither
 * end is the owner of the relationship.
 */
export async function addRelation(
  fromId: string,
  toId: string,
  relation: string,
  actor: AuditActor
): Promise<MutationResult> {
  if (fromId === toId) return { ok: false, reason: "self_relation" }

  const inverse = INVERSE_RELATIONS[relation]
  if (!inverse) return { ok: false, reason: "unknown_relation" }

  const rows = await db
    .select(AUDIT_COLUMNS)
    .from(reports)
    .where(eq(reports.id, toId))
    .limit(1)

  if (rows.length === 0) return { ok: false, reason: "not_found" }

  await db
    .insert(reportRelations)
    .values([
      { fromId, toId, relation },
      { fromId: toId, toId: fromId, relation: inverse },
    ])
    // The primary key is (from, to, relation), so re-adding an existing link is
    // a no-op rather than an error. Linking twice is not a mistake worth
    // interrupting someone over.
    .onConflictDoNothing()

  await recordAudit({
    actor,
    action: "report.relation.add",
    targetType: "report",
    targetId: fromId,
    targetLabel: rows[0].accessionId ?? rows[0].title,
    summary: `Linked as ${relation}.`,
    detail: { relation, inverse, toId },
  })

  return { ok: true }
}

/** Removes a link and its inverse, so the two sides cannot disagree. */
export async function removeRelation(
  fromId: string,
  toId: string,
  relation: string,
  actor: AuditActor
): Promise<MutationResult> {
  const inverse = INVERSE_RELATIONS[relation]

  await db
    .delete(reportRelations)
    .where(
      and(
        eq(reportRelations.fromId, fromId),
        eq(reportRelations.toId, toId),
        eq(reportRelations.relation, relation)
      )
    )

  if (inverse) {
    await db
      .delete(reportRelations)
      .where(
        and(
          eq(reportRelations.fromId, toId),
          eq(reportRelations.toId, fromId),
          eq(reportRelations.relation, inverse)
        )
      )
  }

  await recordAudit({
    actor,
    action: "report.relation.remove",
    targetType: "report",
    targetId: fromId,
    summary: `Removed the ${relation} link.`,
    detail: { relation, toId },
  })

  return { ok: true }
}

/**
 * Starts a successor record, pre-filled from its predecessor and linked to it.
 *
 * This is the NTRS model, not Invenio's (design §4.4): a revision is an
 * independent record with its own accession ID, joined by a typed relation, not
 * a new version of a parent row. Rev B is a distinct published document — it
 * gets cited on its own terms, and Rev A stays exactly as it was for anyone who
 * cited *that*.
 *
 * What carries over is the description; what does not is anything describing a
 * file. `pdfKey`, `checksum`, `pageCount`, `fulltext` and the embedded title
 * all belong to a specific set of bytes, and the whole premise of a revision is
 * that there is a new set. Copying them would produce a draft claiming to hold
 * a document it does not, which the publish gate would then wave through.
 */
export async function reviseReport(
  reportId: string,
  actor: AuditActor
): Promise<ReviseResult> {
  const rows = await db
    .select()
    .from(reports)
    .where(eq(reports.id, reportId))
    .limit(1)

  if (rows.length === 0) return { ok: false, reason: "not_found" }

  const source = rows[0]

  // Only a record that exists publicly is worth superseding. Revising a draft
  // is just editing it, and a chain of drafts superseding drafts is a mess with
  // no reader on the other end of it.
  if (source.status !== "published" && source.status !== "withdrawn") {
    return { ok: false, reason: "wrong_status" }
  }

  const [draft] = await db
    .insert(reports)
    .values({
      title: source.title,
      abstract: source.abstract,
      abstractOverrideReason: source.abstractOverrideReason,
      authors: source.authors,
      docType: source.docType,
      technicalReviewType: source.technicalReviewType,
      projectSlug: source.projectSlug,
      subjectCategory: source.subjectCategory,
      keywords: source.keywords,
      reportNumbers: source.reportNumbers,
      license: source.license,
      funding: source.funding,

      // Carried over as a starting point, not as a decision. It is still an
      // explicit field on the deposit form and the gate still requires it —
      // but defaulting a revision to a *narrower* classification than its
      // predecessor would be the wrong direction to be quiet about.
      classification: source.classification,
      dissemination: source.dissemination,
      discoverable: source.discoverable,
    })
    .returning({ id: reports.id })

  await addRelation(draft.id, source.id, "IsNewVersionOf", actor)

  await recordAudit({
    actor,
    action: "report.revise",
    targetType: "report",
    targetId: draft.id,
    targetLabel: source.accessionId ?? source.title,
    classification: source.classification,
    summary: `Started a revision of ${source.accessionId}.`,
    detail: { supersedes: source.id },
  })

  return { ok: true, draftId: draft.id }
}

/** Everything a relation lookup needs after a mutation, for a fresh render. */
export { listRelations }
