import { useCallback, useMemo, useRef, useState } from "react"

import type { DraftView, UploadReview } from "@/server/deposit/types"
import type { GateCandidate } from "@/core/reports/publish-gate-types"
import type { MetadataPatch, SaveState } from "./types"
import { evaluatePublishGate } from "@/core/reports/publish-gate"
import { saveDraftFn } from "@/server/deposit/functions"

/**
 * Stand-ins for two values the browser deliberately never receives.
 *
 * `fulltext` runs to megabytes and `checksum` is raw bytes; the form has no use
 * for either, and the gate only asks whether they are present. A non-empty
 * placeholder answers exactly that question, so the local verdict matches the
 * server's — which is the property that makes this safe, and the same argument
 * the server's bounded `fulltext` probe rests on.
 *
 * If the gate ever starts reading the *content* of either — measuring length,
 * comparing digests — these stop being equivalent and every site has to change
 * together.
 */
const FULLTEXT_PRESENT = "present"
const CHECKSUM_PRESENT = new Uint8Array(32)

/** The fields the deposit form edits. Everything else is derived on ingest. */
type EditableFields = {
  title: string
  abstract: string
  abstractOverrideReason: string | null
  authors: { name: string; affiliation?: string }[]
  docType: GateCandidate["docType"]
  subjectCategory: string | null
  keywords: string[]
  classification: GateCandidate["classification"]
  dissemination: GateCandidate["dissemination"]
  discoverable: boolean
}

/**
 * What ingest derived from the uploaded file. Never hand-entered.
 *
 * `hasChecksum` and `hasSearchableText` are booleans rather than the values
 * themselves — see the sentinels above for why the browser is not given either.
 */
type FileFacts = {
  pdfKey: string | null
  fileSize: number | null
  hasChecksum: boolean
  pageCount: number | null
  pdfEmbeddedTitle: string | null
  hasSearchableText: boolean
}

/**
 * Local draft state, a live publish verdict, and autosave.
 *
 * The gate runs here, on the client, against unsaved values — which is possible
 * only because `evaluatePublishGate` is a pure function in `src/core` with no
 * server imports. That is not an incidental property; it is the reason the
 * module is placed there, and it means the instant feedback under each field
 * and the authoritative check at publish are *the same function*, not two
 * implementations that agree until they don't.
 *
 * The server still re-runs it at publish. This one informs; that one decides.
 */
export function useDraftForm(reportId: string, initial: DraftView) {
  const [fields, setFields] = useState<EditableFields>({
    title: initial.report.title,
    abstract: initial.report.abstract,
    abstractOverrideReason: initial.report.abstractOverrideReason,
    authors: initial.report.authors,
    docType: initial.report.docType,
    subjectCategory: initial.report.subjectCategory,
    keywords: initial.report.keywords,
    classification: initial.report.classification,
    dissemination: initial.report.dissemination,
    discoverable: initial.report.discoverable,
  })

  const [file, setFile] = useState<FileFacts>({
    pdfKey: initial.report.pdfKey,
    fileSize: initial.report.fileSize,
    hasChecksum: initial.report.checksum !== null,
    pageCount: initial.report.pageCount,
    pdfEmbeddedTitle: initial.report.pdfEmbeddedTitle,
    hasSearchableText: initial.report.hasSearchableText,
  })

  const [saveState, setSaveState] = useState<SaveState>({ status: "idle" })

  // Saves are fire-and-forget per field, so a slow one can land after a fast
  // one issued later. Sequencing them by issue order means the status line
  // reports the newest outcome rather than whichever request happened to
  // finish last.
  const saveSequence = useRef(0)

  const save = useCallback(
    async (patch: MetadataPatch) => {
      const sequence = ++saveSequence.current
      setSaveState({ status: "saving" })

      try {
        await saveDraftFn({ data: { reportId, patch } })
        if (sequence === saveSequence.current) {
          setSaveState({ status: "saved", at: new Date() })
        }
      } catch (error) {
        if (sequence === saveSequence.current) {
          setSaveState({
            status: "failed",
            message:
              error instanceof Error
                ? error.message
                : "Could not save changes.",
          })
        }
      }
    },
    [reportId]
  )

  /**
   * Applies an edit locally and persists it.
   *
   * Local state updates first so the gate re-runs on this keystroke rather than
   * after a round trip. Save is always permitted however incomplete the result
   * — validation belongs at publish, not at save (design §2).
   */
  const update = useCallback(
    (patch: MetadataPatch) => {
      setFields((current) => ({ ...current, ...patch }))
      void save(patch)
    },
    [save]
  )

  /** Folds what ingest derived into local state, without a refetch. */
  const applyReview = useCallback((review: UploadReview, pdfKey: string) => {
    setFile({
      pdfKey,
      fileSize: review.byteSize,
      // Ingest stored one; the browser is only told that it did.
      hasChecksum: true,
      pageCount: review.pageCount,
      pdfEmbeddedTitle: review.embeddedTitle,
      hasSearchableText: review.hasSearchableText,
    })
  }, [])

  const clearFile = useCallback(() => {
    setFile({
      pdfKey: null,
      fileSize: null,
      hasChecksum: false,
      pageCount: null,
      pdfEmbeddedTitle: null,
      hasSearchableText: false,
    })
  }, [])

  const gate = useMemo(
    () =>
      evaluatePublishGate({
        ...fields,
        pdfKey: file.pdfKey,
        fileSize: file.fileSize,
        pdfEmbeddedTitle: file.pdfEmbeddedTitle,
        checksum: file.hasChecksum ? CHECKSUM_PRESENT : null,
        fulltext: file.hasSearchableText ? FULLTEXT_PRESENT : null,
      } satisfies GateCandidate),
    [fields, file]
  )

  return { fields, file, gate, saveState, update, applyReview, clearFile }
}
