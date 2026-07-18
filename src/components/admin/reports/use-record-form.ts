import { useCallback, useMemo, useRef, useState } from "react"

import type { AdminReportDetail } from "@/server/admin/types"
import type {
  GateCandidate,
  GateResult,
} from "@/core/reports/publish-gate-types"
import type { RecordPatch, SaveState } from "./types"
import { evaluatePublishGate } from "@/core/reports/publish-gate"
import { updateReportFn } from "@/server/admin/functions"

/**
 * Stand-ins for two values the browser deliberately never receives.
 *
 * `fulltext` runs to megabytes and `checksum` is raw bytes; the form has no use
 * for either, and the gate only asks whether they are present. A non-empty
 * placeholder answers exactly that question, so the local verdict matches the
 * server's — which is the property that makes this safe, and the same argument
 * the deposit form's version of this rests on.
 *
 * If the gate ever starts reading the *content* of either — measuring length,
 * comparing digests — these stop being equivalent and every site has to change
 * together.
 */
const FULLTEXT_PRESENT = "present"
const CHECKSUM_PRESENT = new Uint8Array(32)

/**
 * Local record state, a live gate verdict, and save-on-blur.
 *
 * The deposit workspace has a hook shaped almost exactly like this, and they
 * are deliberately not shared. Two things differ, and both are load-bearing:
 *
 * - Deposit's save is unconditional, because a draft may be incomplete
 *   (design §2). This one's can be **refused**, when an edit to a published
 *   record would push it back below its own publish gate — so this hook has to
 *   carry a rejection state and roll the field back, which the deposit form has
 *   no concept of.
 * - Deposit edits only what §11 blocks publish on. This edits the record's
 *   whole editorial surface, including fields the deposit flow never touches.
 *
 * Merging them would mean a hook with a mode flag threading two different
 * failure models through one code path, which is more confusing than two
 * hundred lines that each say one thing.
 */
export function useRecordForm(initial: AdminReportDetail) {
  const report = initial.report

  const [fields, setFields] = useState({
    title: report.title,
    abstract: report.abstract,
    abstractOverrideReason: report.abstractOverrideReason,
    authors: report.authors,
    docType: report.docType,
    technicalReviewType: report.technicalReviewType,
    subjectCategory: report.subjectCategory,
    keywords: report.keywords,
    reportNumbers: report.reportNumbers,
    license: report.license,
    doi: report.doi,
    projectSlug: report.projectSlug,
    classification: report.classification,
    dissemination: report.dissemination,
    discoverable: report.discoverable,
    embargoUntil: report.embargoUntil,
  })

  const [saveState, setSaveState] = useState<SaveState>({ status: "idle" })

  // Saves are fire-and-forget per field, so a slow one can land after a fast
  // one issued later. Sequencing by issue order means the status line reports
  // the newest outcome rather than whichever request happened to finish last.
  const saveSequence = useRef(0)

  const update = useCallback(
    (patch: RecordPatch) => {
      // Captured before the optimistic update so a refusal can put it back.
      // Without this, a rejected edit leaves the input showing a value the
      // database does not hold — the worst of both outcomes, since the operator
      // reads it as saved.
      const previous = fields

      setFields((current) => ({ ...current, ...patch }))

      const sequence = ++saveSequence.current
      setSaveState({ status: "saving" })

      void updateReportFn({ data: { reportId: report.id, patch } })
        .then((result) => {
          if (sequence !== saveSequence.current) return

          if (result.ok) {
            setSaveState({ status: "saved", at: new Date() })
            return
          }

          setFields(previous)

          setSaveState({
            status: "failed",
            message:
              result.reason === "would_break_gate"
                ? // Named specifically. "Could not save" would send someone
                  // hunting for a network problem when the system is in fact
                  // working exactly as designed.
                  `That edit would leave this published record unable to pass its own publish gate: ${result.gate.blockers[0]?.message ?? "a requirement is unmet."} The change has been reverted.`
                : "Could not save that change.",
          })
        })
        .catch((error: unknown) => {
          if (sequence !== saveSequence.current) return

          setFields(previous)
          setSaveState({
            status: "failed",
            message:
              error instanceof Error
                ? error.message
                : "Could not save changes.",
          })
        })
    },
    [fields, report.id]
  )

  /**
   * The gate, run locally against unsaved values.
   *
   * Possible only because `evaluatePublishGate` is pure and lives in `src/core`
   * with no server imports. That is not incidental — it is why the module is
   * placed there, and it means the checklist under the form and the check the
   * server enforces are *the same function* rather than two that agree until
   * they don't.
   */
  const gate: GateResult = useMemo(
    () =>
      evaluatePublishGate({
        ...fields,
        pdfKey: report.pdfKey,
        fileSize: report.fileSize,
        pdfEmbeddedTitle: report.pdfEmbeddedTitle,
        checksum: report.checksumHex ? CHECKSUM_PRESENT : null,
        fulltext: report.hasSearchableText ? FULLTEXT_PRESENT : null,
      } satisfies GateCandidate),
    [fields, report]
  )

  return { fields, gate, saveState, update }
}
