import { useRef, useState } from "react"

import type { UploadSectionProps } from "./types"
import type { UploadState } from "../upload/types"
import { beginUploadFn, completeUploadFn } from "@/server/deposit/functions"
import { Button } from "@/components/ui/button"
import { formatFileSize } from "@/components/reports/format"
import { uploadFileWithRetry } from "../upload/upload-file"

// Step 1 and 2 of the deposit flow: upload first, because everything else can
// be prefilled from what comes back (design §8.2).
export function UploadSection({
  reportId,
  review,
  typedTitle,
  onReviewed,
}: UploadSectionProps) {
  const [state, setState] = useState<UploadState>({ phase: "idle" })
  const abortRef = useRef<AbortController | null>(null)

  async function upload(file: File) {
    const controller = new AbortController()
    abortRef.current = controller

    try {
      const { quarantineKey, uploadUrl } = await beginUploadFn({
        data: { reportId, contentType: "application/pdf" },
      })

      setState({
        phase: "uploading",
        progress: { loaded: 0, total: file.size, fraction: 0 },
      })

      await uploadFileWithRetry({
        file,
        url: uploadUrl,
        contentType: "application/pdf",
        signal: controller.signal,
        onProgress: (progress) => setState({ phase: "uploading", progress }),
      })

      // The bytes are in quarantine; nothing is trusted about them yet.
      setState({ phase: "validating" })

      const result = await completeUploadFn({
        data: { reportId, quarantineKey },
      })

      if (!result.ok) {
        setState({ phase: "failed", message: result.detail })
        return
      }

      onReviewed(result.review)
      setState({ phase: "done" })
    } catch (error) {
      setState({
        phase: "failed",
        message: error instanceof Error ? error.message : "Upload failed.",
      })
    }
  }

  // The whole reason pdf_embedded_title is stored: a locally compiled PDF and
  // a hand-filled form drift, and this is where that becomes visible
  // (design §1).
  const drift =
    review?.embeddedTitle &&
    typedTitle.trim() !== "" &&
    review.embeddedTitle.trim() !== typedTitle.trim()

  return (
    <section className="border-faded rounded-lg border p-4">
      <h2 className="text-faded text-detail-xs tracking-wide uppercase">
        Document
      </h2>

      <input
        id="deposit-file"
        type="file"
        accept="application/pdf"
        className="file:border-faded mt-3 block w-full text-paragraph-s file:mr-3 file:rounded-lg file:border file:bg-transparent file:px-3 file:py-1.5 file:text-sm"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) void upload(file)
        }}
      />

      {state.phase === "uploading" && (
        <div className="mt-3">
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(state.progress.fraction * 100)}
            className="h-1 w-full overflow-hidden rounded-full bg-ivory-dark"
          >
            <div
              className="h-full bg-olive"
              style={{ width: `${state.progress.fraction * 100}%` }}
            />
          </div>
          <p className="text-faded mt-2 font-mono text-detail-xs">
            {Math.round(state.progress.fraction * 100)}%
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2"
            onClick={() => abortRef.current?.abort()}
          >
            Cancel
          </Button>
        </div>
      )}

      {state.phase === "validating" && (
        <p className="text-faded mt-3 text-paragraph-s">
          Validating and extracting…
        </p>
      )}

      {state.phase === "failed" && (
        <p className="mt-3 text-paragraph-s text-pretty text-destructive">
          {state.message}
        </p>
      )}

      {review && (
        <dl className="divide-faded mt-4 divide-y text-sm">
          <Row label="Pages" value={String(review.pageCount)} />
          <Row label="Size" value={formatFileSize(review.byteSize)} />
          <Row label="sha256" value={review.checksum.slice(0, 32) + "…"} />
          <Row
            label="Embedded title"
            value={review.embeddedTitle ?? "— none —"}
          />
          <Row
            label="Searchable text"
            value={review.hasSearchableText ? "yes" : "no — will not publish"}
          />
        </dl>
      )}

      {drift && (
        <p className="border-faded text-faded mt-3 rounded-lg border px-3 py-2 text-paragraph-s text-pretty">
          The PDF says its title is “{review.embeddedTitle}”, which is not what
          you typed. Neither is necessarily wrong — this does not block publish.
        </p>
      )}

      {review?.textPreview && (
        <details className="mt-3">
          <summary className="text-faded cursor-pointer text-detail-xs">
            Extracted text preview
          </summary>
          <p className="text-faded mt-2 font-mono text-detail-xs break-words">
            {review.textPreview}
          </p>
        </details>
      )}
    </section>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[10rem_1fr] gap-4 py-2">
      <dt className="text-faded text-detail-xs uppercase">{label}</dt>
      <dd className="font-mono text-xs break-all">{value}</dd>
    </div>
  )
}
