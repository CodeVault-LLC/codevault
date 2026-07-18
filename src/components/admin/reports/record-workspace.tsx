import { Link } from "@tanstack/react-router"
import { ChevronLeft, FileText } from "lucide-react"

import type { RecordWorkspaceProps } from "./types"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { formatBytes, formatRelativeTime } from "@/components/admin/format"
import { CataloguingSection } from "./cataloguing-section"
import { ClassificationSection } from "@/components/admin/deposit/classification-section"
import { MetadataForm } from "@/components/admin/deposit/metadata-form"
import { RelationsPanel } from "./relations-panel"
import { StatePanel } from "./state-panel"
import { adminRecord } from "@/core/config/admin"
import { useRecordForm } from "./use-record-form"

/**
 * One record's workspace (design §8.1, §4.4).
 *
 * `MetadataForm` and `ClassificationSection` are the deposit flow's components,
 * used here unchanged. That is the point rather than a shortcut: the fields the
 * publish gate judges have to look and behave identically wherever they are
 * edited, and the gate findings are anchored to fields by `GateField` so both
 * screens render the same message under the same input. Two forms would drift
 * the first time a validation message was reworded.
 *
 * What is *not* shared is the save behaviour — see `useRecordForm`.
 */
export function RecordWorkspace({ detail, permissions }: RecordWorkspaceProps) {
  const { fields, gate, saveState, update } = useRecordForm(detail)
  const { report } = detail

  // Read-only rather than hidden for an account without write access. Someone
  // who can read the archive can read this record; what they cannot do is
  // change it, and showing the fields greyed out says that far more clearly
  // than an empty screen.
  const onChange = permissions.canWrite ? update : () => {}

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link
          to="/admin/reports"
          className="inline-flex w-fit items-center gap-1 rounded-sm text-ui-xs text-muted-foreground underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <ChevronLeft className="size-3.5" aria-hidden />
          All reports
        </Link>

        <h1 className="text-ui-xl text-balance">
          {report.title || "Untitled draft"}
        </h1>

        <p className="text-ui-sm text-muted-foreground">
          Deposited {formatRelativeTime(report.createdAt, new Date())}
          {report.publishedAt && ` · published ${report.publishedAt}`}
        </p>
      </div>

      {!permissions.canWrite && (
        <p
          role="status"
          className="rounded-lg border border-border px-4 py-3 text-ui-sm text-muted-foreground"
        >
          Your account can read this record but not change it.
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex min-w-0 flex-col gap-6">
          <fieldset disabled={!permissions.canWrite} className="contents">
            <Card>
              <CardHeader>
                <CardTitle className="text-ui-lg">
                  {adminRecord.metadataTitle}
                </CardTitle>
                <CardDescription className="text-ui-sm text-pretty">
                  {adminRecord.metadataDescription}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex flex-col gap-5">
                <MetadataForm fields={fields} gate={gate} onChange={onChange} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-ui-lg">
                  {adminRecord.cataloguingTitle}
                </CardTitle>
                <CardDescription className="text-ui-sm text-pretty">
                  {adminRecord.cataloguingDescription}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <CataloguingSection
                  fields={fields}
                  gate={gate}
                  accessionId={detail.report.accessionId}
                  isDraft={detail.report.status === "draft"}
                  onChange={onChange}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-ui-lg">Visibility</CardTitle>
              </CardHeader>

              <CardContent>
                <ClassificationSection
                  fields={fields}
                  gate={gate}
                  onChange={onChange}
                />
              </CardContent>
            </Card>
          </fieldset>

          <DocumentPanel report={report} />

          <RelationsPanel
            reportId={report.id}
            relations={detail.relations}
            canEdit={permissions.canWrite}
          />
        </div>

        <StatePanel
          detail={detail}
          permissions={permissions}
          gate={gate}
          saveState={saveState}
        />
      </div>
    </div>
  )
}

/**
 * What ingest derived from the file. Read-only, and visibly so.
 *
 * Every value here describes a specific set of bytes. Making them editable
 * would let the record claim a page count or a checksum belonging to a document
 * nobody holds, which is exactly the drift the ingest pipeline exists to
 * prevent (design §1). Replacing the document is a revision, not an edit.
 */
function DocumentPanel({
  report,
}: {
  report: RecordWorkspaceProps["detail"]["report"]
}) {
  const rows: [string, string][] = [
    ["Pages", report.pageCount === null ? "—" : String(report.pageCount)],
    ["Size", report.fileSize === null ? "—" : formatBytes(report.fileSize)],
    [
      "Checksum",
      report.checksumHex
        ? // First bytes only. The whole digest is 64 hex characters of noise
          // and nobody compares it by eye; the prefix is enough to tell two
          // documents apart, which is the only thing anyone does with it here.
          `${report.checksumHex.slice(0, 16)}…`
        : "Not validated",
    ],
    [
      "Searchable text",
      report.hasSearchableText
        ? "Extracted"
        : // A real publication requirement, not a nicety: Scholar will not
          // index a scanned image (design §11).
          "None — a scanned image will not be indexed",
    ],
    ["Embedded title", report.pdfEmbeddedTitle ?? "—"],
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-ui-lg">
          {adminRecord.documentTitle}
        </CardTitle>
        <CardDescription className="text-ui-sm text-pretty">
          {adminRecord.documentDescription}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {report.pdfKey ? (
          <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-[10rem_1fr]">
            {rows.map(([label, value]) => (
              <div key={label} className="contents">
                <dt className="text-ui-xs text-muted-foreground">{label}</dt>
                <dd className="text-ui-sm break-words">{value}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="flex items-center gap-2 text-ui-sm text-muted-foreground">
            <FileText className="size-4" aria-hidden />
            No document attached.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
