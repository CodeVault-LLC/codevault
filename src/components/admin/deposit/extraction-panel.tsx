import { Check, ShieldCheck, TriangleAlert } from "lucide-react"

import type { ReactNode } from "react"
import type { SanitizationReport } from "@/server/ingest/types"
import type { UploadReview } from "@/server/deposit/types"
import { formatBytes } from "../format"

/**
 * Says what CDR actually did, in the order that matters to a reader: what was
 * found first, then which tool ran. "Cleaned" alone would leave a depositor
 * unable to tell a file that had active content stripped from one that never
 * had any.
 */
function sanitizationSummary(report: SanitizationReport): string {
  if (report.method === "none") return "Not sanitized — no tool available"

  if (report.removedConstructs.length === 0) {
    return "Cleaned; no active content found"
  }

  return `Removed ${report.removedConstructs.join(", ")}`
}

/**
 * What the server derived from the uploaded bytes.
 *
 * This is §8.2's "review extracted" step, and it exists because none of these
 * values are hand-entered — they are facts about the file, and the depositor's
 * job here is to notice when one of them is wrong (a page count of 1 on a
 * report that should be 40, an empty text extraction on a scan) *before*
 * publishing rather than after.
 */
export function ExtractionPanel({ review }: { review: UploadReview }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border p-4">
      <h3 className="text-ui-sm font-medium">What the server found</h3>

      <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
        <Fact label="Pages" value={String(review.pageCount)} />
        <Fact label="Size" value={formatBytes(review.byteSize)} />

        <Fact
          label="Embedded title"
          value={review.embeddedTitle ?? "None recorded"}
          muted={!review.embeddedTitle}
        />
        <Fact
          label="Embedded author"
          value={review.embeddedAuthor ?? "None recorded"}
          muted={!review.embeddedAuthor}
        />

        <Fact
          label="Searchable text"
          value={
            review.hasSearchableText ? (
              <span className="inline-flex items-center gap-1.5">
                <Check className="size-3.5 text-olive" aria-hidden />
                Extracted
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-destructive">
                <TriangleAlert className="size-3.5" aria-hidden />
                None — a scan will not be indexed
              </span>
            )
          }
        />

        <Fact
          label="Sanitization"
          value={
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck
                className={
                  review.sanitization.method === "none"
                    ? "size-3.5 text-muted-foreground"
                    : "size-3.5 text-olive"
                }
                aria-hidden
              />
              {sanitizationSummary(review.sanitization)}
            </span>
          }
        />

        <Fact
          label="sha256"
          value={review.checksum}
          className="sm:col-span-2"
          mono
        />
      </dl>

      {/* Not a warning about the document — a warning about the deployment.
          The bytes were archived unchanged because no sanitizer was installed,
          and that is worth saying plainly rather than leaving as an absence. */}
      {review.sanitization.method === "none" && (
        <p className="flex items-start gap-2 rounded-lg border border-border px-3 py-2 text-ui-xs text-pretty text-muted-foreground">
          <TriangleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          No sanitizer was available on the server, so the file was stored as
          uploaded. Install mupdf-tools and ghostscript to enable CDR.
        </p>
      )}

      {review.thumbnailDataUrl && (
        <div className="flex items-start gap-4 border-t border-border pt-3">
          <img
            src={review.thumbnailDataUrl}
            alt="First page of the uploaded document"
            className="w-24 rounded-md border border-border"
          />
          <p className="text-ui-xs text-pretty text-muted-foreground">
            The cover page as it was rendered. If this is not the document you
            meant to deposit, replace the file above.
          </p>
        </div>
      )}

      {review.textPreview && (
        <details className="border-t border-border pt-3">
          <summary className="cursor-pointer text-ui-xs text-muted-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
            Extracted text preview
          </summary>
          <p className="mt-2 font-mono text-ui-xs wrap-break-word text-muted-foreground">
            {review.textPreview}
          </p>
        </details>
      )}
    </div>
  )
}

function Fact({
  label,
  value,
  muted = false,
  mono = false,
  className,
}: {
  label: string
  value: ReactNode
  muted?: boolean
  mono?: boolean
  className?: string
}) {
  return (
    <div className={className}>
      <dt className="text-ui-xs text-muted-foreground">{label}</dt>
      <dd
        className={[
          "text-ui-sm",
          mono ? "font-mono break-all" : "",
          muted ? "text-muted-foreground" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {value}
      </dd>
    </div>
  )
}
