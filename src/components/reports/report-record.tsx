import type { MetadataRow, ReportRecordProps } from "./types"
import {
  docTypeLabels,
  metadataLabels,
  reportsArchive,
  technicalReviewLabels,
} from "@/core/config/reports"
import {
  formatAuthors,
  formatDate,
  formatFileSize,
  formatPageCount,
} from "./format"
import { CitationLinks } from "./citation-links"
import { Container } from "@/components/layout/container"
import { HighwireTags } from "./highwire-tags"
import { MetadataTable } from "./metadata-table"
import { Tombstone } from "./tombstone"
import { isFileServable } from "@/core/reports/access"

function joinOrNull(values: string[]): string | null {
  return values.length > 0 ? values.join(", ") : null
}

// The record page. It should read like a catalogue card and be legible without
// scrolling past decoration (design §13) — the PDF is the artifact, but this is
// the front door: what people find, cite and link.
export function ReportRecord({ report }: ReportRecordProps) {
  const servable = isFileServable(report)
  const withdrawn = report.status === "withdrawn"

  const rows: MetadataRow[] = [
    {
      label: metadataLabels.accessionId,
      value: report.accessionId,
      mono: true,
    },
    { label: metadataLabels.docType, value: docTypeLabels[report.docType] },
    {
      label: metadataLabels.publishedAt,
      value: formatDate(report.publishedAt),
      mono: true,
    },
    { label: metadataLabels.authors, value: formatAuthors(report.authors, 99) },
    { label: metadataLabels.subjectCategory, value: report.subjectCategory },
    { label: metadataLabels.keywords, value: joinOrNull(report.keywords) },
    {
      label: metadataLabels.reportNumbers,
      value: joinOrNull(report.reportNumbers),
      mono: true,
    },
    {
      label: metadataLabels.technicalReviewType,
      value: technicalReviewLabels[report.technicalReviewType],
    },
    { label: metadataLabels.license, value: report.license },
    {
      label: metadataLabels.pageCount,
      value: report.pageCount ? formatPageCount(report.pageCount) : null,
      mono: true,
    },
    {
      label: metadataLabels.fileSize,
      value: report.fileSize ? formatFileSize(report.fileSize) : null,
      mono: true,
    },
    { label: metadataLabels.doi, value: report.doi, mono: true },
  ]

  return (
    <Container className="py-10 md:py-12">
      {/* Hoisted into <head> by React during SSR — see the component for why
          this is not a route `head` option (design §12).

          Suppressed on a withdrawn record. Highwire tags are how this page
          offers itself to Google Scholar as a publication, and a withdrawn
          report is precisely one the archive has stopped offering. The page
          still resolves and still carries its citation; it just no longer
          advertises itself for indexing. */}
      {report.accessionId && !withdrawn && (
        <HighwireTags report={{ ...report, accessionId: report.accessionId }} />
      )}

      <article className="max-w-3xl">
        <p className="text-faded font-mono text-detail-xs tracking-wide">
          {report.accessionId}
        </p>

        <h1 className="mt-2 text-display-m font-semibold text-balance">
          {report.title}
        </h1>

        <p className="text-faded mt-3 text-paragraph-s">
          {formatAuthors(report.authors, 99)}
        </p>

        {withdrawn ? (
          <Tombstone
            withdrawnAt={report.withdrawnAt}
            withdrawnReason={report.withdrawnReason}
          />
        ) : servable ? (
          <p className="mt-6">
            {/* A plain anchor, not a router Link: this is a document download,
                and Scholar requires real <a href> GET links (design §12). */}
            <a
              href={`/reports/${report.accessionId}/download`}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              Download PDF
              <span className="font-mono text-xs text-primary-foreground/70">
                {formatFileSize(report.fileSize)}
              </span>
            </a>
          </p>
        ) : (
          <p className="border-faded text-faded mt-6 rounded-lg border px-4 py-3 text-paragraph-s">
            {reportsArchive.metadataOnlyNotice}
          </p>
        )}

        {report.abstract && (
          <section className="mt-10">
            <h2 className="text-faded text-detail-xs tracking-wide uppercase">
              Abstract
            </h2>
            <p className="mt-3 text-paragraph-s text-pretty">
              {report.abstract}
            </p>
          </section>
        )}

        <section className="mt-10">
          <h2 className="text-faded mb-3 text-detail-xs tracking-wide uppercase">
            Record
          </h2>
          <MetadataTable rows={rows} />
        </section>

        {report.accessionId && (
          <div className="mt-6">
            <CitationLinks accessionId={report.accessionId} />
          </div>
        )}
      </article>
    </Container>
  )
}
