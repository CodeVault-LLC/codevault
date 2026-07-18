import { useState } from "react"
import { Link, useRouter } from "@tanstack/react-router"
import { ChevronLeft } from "lucide-react"

import type { DepositWorkspaceProps } from "./types"
import type { UploadReview } from "@/server/deposit/types"
import { ClassificationSection } from "./classification-section"
import { MetadataForm } from "./metadata-form"
import { PublishRail } from "./publish-rail"
import { Section } from "./section"
import { Separator } from "@/components/ui/separator"
import { UploadPanel } from "./upload-panel"
import { publishReportFn } from "@/server/deposit/functions"
import { useDraftForm } from "./use-draft-form"

/**
 * The deposit workspace: one page, four sections, upload first.
 *
 * Deliberately not a wizard that hides fields (design §8.2) — everything is
 * visible and editable at once, and the numbers describe a useful order rather
 * than a required one. Save is always permitted; only publish runs the gate.
 */
export function DepositWorkspace({
  reportId,
  initialDraft,
}: DepositWorkspaceProps) {
  const router = useRouter()
  const { fields, file, gate, saveState, update, applyReview, clearFile } =
    useDraftForm(reportId, initialDraft)

  const [review, setReview] = useState<UploadReview | null>(null)
  const [publishing, setPublishing] = useState(false)
  const [publishError, setPublishError] = useState<string | null>(null)

  async function publish() {
    setPublishing(true)
    setPublishError(null)

    try {
      const result = await publishReportFn({ data: { reportId } })

      if (!result.ok) {
        // The server re-ran the gate and refused. The local verdict and this
        // one come from the same function, so a disagreement means the draft
        // changed underneath — reload rather than argue with it.
        setPublishError(
          result.reason === "gate_failed"
            ? "The server refused this as not yet publishable. Reload to see what changed."
            : `Could not publish: ${result.reason}.`
        )
        return
      }

      // Straight to the live record, which is the point of the whole loop.
      await router.navigate({
        to: "/reports/$accessionId",
        params: { accessionId: result.accessionId },
      })
    } catch (error) {
      setPublishError(
        error instanceof Error ? error.message : "Could not publish."
      )
    } finally {
      setPublishing(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link
          to="/admin/deposit"
          className="inline-flex w-fit items-center gap-1 rounded-sm text-ui-xs text-muted-foreground underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <ChevronLeft className="size-3.5" aria-hidden />
          All deposits
        </Link>

        <h1 className="text-ui-xl">{fields.title || "Untitled draft"}</h1>
        <p className="text-ui-sm text-muted-foreground">
          A draft. It holds no accession ID and is not publicly reachable.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex min-w-0 flex-col gap-8">
          <Section
            step={1}
            title="The document"
            description="Upload first — the rest of the form can be prefilled from what the server reads out of it."
          >
            <UploadPanel
              reportId={reportId}
              gate={gate}
              review={review}
              pageCount={file.pageCount}
              fileSize={file.fileSize}
              hasFile={Boolean(file.pdfKey)}
              onReviewed={(next, quarantineKey) => {
                setReview(next)
                applyReview(next, quarantineKey)

                // Prefill the title from the PDF only when nothing has been
                // typed. Overwriting a considered title with the PDF's often
                // wrong /Title would be worse than not prefilling at all.
                if (!fields.title && next.embeddedTitle) {
                  update({ title: next.embeddedTitle })
                }
              }}
              onCleared={() => {
                setReview(null)
                clearFile()
              }}
            />
          </Section>

          <Separator />

          <Section
            step={2}
            title="Describe it"
            description="What someone searching the archive will match against, and all a search engine will ever read."
          >
            <MetadataForm fields={fields} gate={gate} onChange={update} />
          </Section>

          <Separator />

          <Section
            step={3}
            title="Who can see it"
            description="There is no default classification anywhere in the stack. This is a decision, and it has to be made explicitly."
          >
            <ClassificationSection
              fields={fields}
              gate={gate}
              onChange={update}
            />
          </Section>
        </div>

        <PublishRail
          gate={gate}
          saveState={saveState}
          classification={fields.classification}
          dissemination={fields.dissemination}
          publishing={publishing}
          error={publishError}
          onPublish={() => void publish()}
        />
      </div>
    </div>
  )
}
