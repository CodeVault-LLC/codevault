import { useState } from "react"
import { useRouter } from "@tanstack/react-router"

import type { DepositPageProps, MetadataPatch } from "./types"
import type { DraftView, UploadReview } from "@/server/deposit/types"
import { Button } from "@/components/ui/button"
import { Container } from "@/components/layout/container"
import { GateChecklist } from "../gate-checklist"
import { MetadataForm } from "./metadata-form"
import { UploadSection } from "./upload-section"
import {
  getDraftFn,
  publishReportFn,
  saveDraftFn,
} from "@/server/deposit/functions"

// One page, four sections, upload first — deliberately not a wizard that hides
// fields (design §8.2).
//
// Save is always permitted; Publish runs the gate. The checklist is persistent
// rather than an error thrown on submit.
export function DepositPage({ reportId, initialDraft }: DepositPageProps) {
  const router = useRouter()
  const [draft, setDraft] = useState<DraftView>(initialDraft)
  const [review, setReview] = useState<UploadReview | null>(null)
  const [status, setStatus] = useState<string | null>(null)

  // Re-reads the draft so the checklist reflects the server's judgement, not a
  // guess made on the client.
  async function refresh() {
    const next = await getDraftFn({ data: { reportId } })
    if (next) setDraft(next)
  }

  async function save(patch: MetadataPatch) {
    setStatus("Saving…")
    await saveDraftFn({ data: { reportId, patch } })
    await refresh()
    setStatus("Saved.")
  }

  async function publish() {
    setStatus("Publishing…")
    const result = await publishReportFn({ data: { reportId } })

    if (!result.ok) {
      await refresh()
      setStatus(
        result.reason === "gate_failed"
          ? "Not publishable yet — see the checklist."
          : `Could not publish: ${result.reason}.`
      )
      return
    }

    // Straight to the live record, which is the point of the whole loop.
    await router.navigate({
      to: "/reports/$accessionId",
      params: { accessionId: result.accessionId },
    })
  }

  return (
    <Container className="grid gap-8 py-8 lg:grid-cols-[1fr_20rem]">
      <div className="space-y-6">
        <header>
          <h1 className="text-display-s font-semibold">Deposit a report</h1>
          <p className="text-faded mt-1 text-paragraph-s">
            Upload the PDF first — the rest can be prefilled from it.
          </p>
        </header>

        <UploadSection
          reportId={reportId}
          review={review}
          typedTitle={draft.report.title}
          onReviewed={(next) => {
            setReview(next)
            // Prefill the title from the PDF only when nothing has been typed.
            if (!draft.report.title && next.embeddedTitle) {
              void save({ title: next.embeddedTitle })
            } else {
              void refresh()
            }
          }}
        />

        <MetadataForm draft={draft} onChange={(patch) => void save(patch)} />
      </div>

      <aside className="space-y-4 lg:sticky lg:top-8 lg:self-start">
        <GateChecklist gate={draft.gate} />

        <Button
          className="w-full"
          size="lg"
          disabled={!draft.gate.publishable}
          onClick={() => void publish()}
        >
          Publish
        </Button>

        <p className="text-faded text-detail-xs" aria-live="polite">
          {status ?? "Changes save when you leave a field."}
        </p>
      </aside>
    </Container>
  )
}
