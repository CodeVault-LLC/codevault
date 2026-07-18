import { useRef, useState } from "react"
import { FileText, Lock, X } from "lucide-react"
import { Link } from "@tanstack/react-router"

import type { UploadPanelProps } from "./types"
import type { UploadState } from "../upload/types"
import { beginUploadFn, completeUploadFn } from "@/server/deposit/functions"
import { Button } from "@/components/ui/button"
import { Dropzone } from "@/components/ui/dropzone"
import { ExtractionPanel } from "./extraction-panel"
import { findingsFor } from "@/core/reports/publish-gate"
import { formatBytes } from "../format"
import { uploadFileWithRetry } from "../upload/upload-file"

/**
 * Step 1 and 2: get the file in, then show what the server made of it.
 *
 * Upload comes first because everything else on the page can be prefilled from
 * what comes back (design §8.2).
 */
export function UploadPanel({
  reportId,
  gate,
  review,
  pageCount,
  fileSize,
  hasFile,
  onReviewed,
  onCleared,
}: UploadPanelProps) {
  const [state, setState] = useState<UploadState>({ phase: "idle" })
  const abortRef = useRef<AbortController | null>(null)

  // Findings about the document itself have no form control to sit under, so
  // they surface here instead.
  const findings = findingsFor(gate, "document")

  async function upload(file: File) {
    const controller = new AbortController()
    abortRef.current = controller

    // A replacement upload invalidates whatever the last one derived. Clearing
    // first means the gate cannot briefly read as satisfied on the strength of
    // a file that is being replaced.
    onCleared()

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
        setState({
          phase: "failed",
          message: result.detail,
          duplicateOf: result.duplicateOf,
        })
        return
      }

      onReviewed(result.review, quarantineKey)
      setState({ phase: "done" })
    } catch (error) {
      setState({
        phase: "failed",
        message: error instanceof Error ? error.message : "Upload failed.",
      })
    }
  }

  const busy = state.phase === "uploading" || state.phase === "validating"

  return (
    <div className="flex flex-col gap-4">
      <Dropzone
        id="deposit-file"
        onFile={(file) => void upload(file)}
        disabled={busy}
      >
        {hasFile && !busy ? (
          <>
            <span className="flex size-9 items-center justify-center rounded-lg bg-muted">
              <FileText className="size-4" aria-hidden />
            </span>
            <span className="text-ui-sm font-medium">
              {pageCount !== null && `${pageCount} pages`}
              {pageCount !== null && fileSize !== null && " · "}
              {fileSize !== null && formatBytes(fileSize)}
            </span>
            <span className="text-ui-xs text-muted-foreground">
              Drop another PDF to replace it.
            </span>
          </>
        ) : undefined}
      </Dropzone>

      {/* The single most load-bearing fact in the flow, and the page used to be
          silent on it. Where the file is determines whether it is reachable. */}
      {hasFile && (
        <p className="flex items-start gap-2 text-ui-xs text-pretty text-muted-foreground">
          <Lock className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          This file is in a private staging bucket. It is not reachable from any
          public URL, and does not move until you publish.
        </p>
      )}

      {state.phase === "uploading" && (
        <div className="flex flex-col gap-2">
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(state.progress.fraction * 100)}
            aria-label="Upload progress"
            className="h-1 w-full overflow-hidden rounded-full bg-muted"
          >
            <div
              className="h-full bg-olive transition-[width]"
              style={{ width: `${state.progress.fraction * 100}%` }}
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-ui-xs text-muted-foreground">
              {Math.round(state.progress.fraction * 100)}% ·{" "}
              {formatBytes(state.progress.loaded)} of{" "}
              {formatBytes(state.progress.total)}
            </span>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => abortRef.current?.abort()}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {state.phase === "validating" && (
        <p className="text-ui-sm text-muted-foreground" aria-live="polite">
          Validating and extracting…
        </p>
      )}

      {state.phase === "failed" && (
        <div
          role="alert"
          className="flex flex-col gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2"
        >
          <p className="flex items-start gap-2 text-ui-sm text-pretty text-destructive">
            <X className="mt-0.5 size-4 shrink-0" aria-hidden />
            {state.message}
          </p>

          {/* A duplicate is the one rejection with somewhere useful to go. */}
          {state.duplicateOf &&
            (state.duplicateOf.accessionId ? (
              <Link
                to="/reports/$accessionId"
                params={{ accessionId: state.duplicateOf.accessionId }}
                className="ml-6 w-fit rounded-sm text-ui-xs underline underline-offset-4 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                View {state.duplicateOf.accessionId}
              </Link>
            ) : (
              <Link
                to="/admin/deposit/$draftId"
                params={{ draftId: state.duplicateOf.reportId }}
                className="ml-6 w-fit rounded-sm text-ui-xs underline underline-offset-4 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                Open the other draft
              </Link>
            ))}
        </div>
      )}

      {(findings.blockers.length > 0 || findings.warnings.length > 0) &&
        state.phase !== "failed" && (
          <ul className="flex flex-col gap-1">
            {findings.blockers.map((finding) => (
              <li key={finding.code} className="text-ui-xs text-destructive">
                {finding.message}
              </li>
            ))}
            {findings.warnings.map((finding) => (
              <li
                key={finding.code}
                className="text-ui-xs text-pretty text-muted-foreground"
              >
                {finding.message}
              </li>
            ))}
          </ul>
        )}

      {review && <ExtractionPanel review={review} />}
    </div>
  )
}
