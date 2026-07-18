import { Link } from "@tanstack/react-router"
import { EyeOff, FileStack, FileUp, Lock, Timer } from "lucide-react"

import type { AdminReportPage, AdminReportRow } from "@/server/admin/types"
import type { AdminReportsSearch } from "@/core/admin/search-params"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { formatBytes, formatRelativeTime } from "@/components/admin/format"
import { AdminPagination } from "@/components/admin/pagination"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ReportFilterBar } from "./filter-bar"
import { StatusBadge } from "@/components/admin/status-badge"
import { adminReports } from "@/core/config/admin"
import { docTypeLabels } from "@/core/config/reports"
import { formatAuthors } from "@/components/reports/format"
import { hasActiveReportFilters } from "@/core/admin/search-params"

/**
 * Every record in the archive, in every state (design §8.1).
 *
 * The state column is the reason this screen exists separately from the public
 * listing. `/reports` is filtered by the visibility predicates and shows what a
 * reader may see; this shows drafts, embargoed records, internal records and
 * tombstones side by side, because the operator's question — "where is
 * everything up to" — cannot be answered by a view that hides most of it.
 */
export function ReportsTable({
  page,
  search,
  years,
  generatedAt,
}: {
  page: AdminReportPage
  search: AdminReportsSearch
  years: number[]
  /** The server's clock, so relative times match between SSR and hydration. */
  generatedAt: Date
}) {
  const filtered = hasActiveReportFilters(search)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-ui-xl">{adminReports.title}</h1>
          <p className="text-ui-sm text-muted-foreground">
            {adminReports.description}
          </p>
        </div>

        <Button render={<Link to="/admin/deposit" />}>
          <FileUp data-icon="inline-start" />
          Deposit a report
        </Button>
      </div>

      <ReportFilterBar
        search={search}
        statusCounts={page.statusCounts}
        years={years}
      />

      <Card>
        <CardContent className={page.rows.length === 0 ? undefined : "px-0"}>
          {page.rows.length === 0 ? (
            <Empty className="py-12">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <FileStack />
                </EmptyMedia>
                <EmptyTitle className="text-ui-base">
                  {filtered ? "Nothing matches" : "The archive is empty"}
                </EmptyTitle>
                <EmptyDescription className="text-ui-sm">
                  {filtered ? adminReports.emptyFiltered : adminReports.empty}
                </EmptyDescription>
              </EmptyHeader>

              {filtered && (
                <Button
                  variant="outline"
                  render={
                    <Link to="/admin/reports" search={{ q: "", page: 1 }} />
                  }
                >
                  {adminReports.clearFilters}
                </Button>
              )}
            </Empty>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6 text-ui-xs">Accession</TableHead>
                    <TableHead className="text-ui-xs">Title</TableHead>
                    <TableHead className="text-ui-xs">Status</TableHead>
                    <TableHead className="text-ui-xs">Type</TableHead>
                    <TableHead className="text-ui-xs">Document</TableHead>
                    <TableHead className="pr-6 text-right text-ui-xs">
                      Edited
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {page.rows.map((row) => (
                    <ReportTableRow key={row.id} row={row} now={generatedAt} />
                  ))}
                </TableBody>
              </Table>

              <AdminPagination
                linkTo={(next) => ({
                  to: "/admin/reports",
                  // Merged into whatever filters are already in the URL, so
                  // paging never silently drops them.
                  search: (prev) => ({ ...prev, page: next }),
                })}
                page={page.page}
                pageCount={page.pageCount}
                pageSize={page.pageSize}
                total={page.total}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function ReportTableRow({ row, now }: { row: AdminReportRow; now: Date }) {
  return (
    <TableRow>
      <TableCell className="pl-6 font-mono text-ui-xs whitespace-nowrap text-muted-foreground">
        {/* A draft has no accession ID: one is allocated at publish and never
            reused, so an em dash is the honest rendering rather than a
            placeholder that looks like an identifier (design §4.5). */}
        {row.accessionId ?? "—"}
      </TableCell>

      <TableCell className="max-w-0">
        <div className="flex items-center gap-2">
          <Link
            to="/admin/reports/$reportId"
            params={{ reportId: row.id }}
            className="truncate rounded-sm text-ui-sm font-medium underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {row.title || "Untitled draft"}
          </Link>

          <RecordFlags row={row} now={now} />
        </div>

        {row.authors.length > 0 && (
          <p className="truncate text-ui-xs text-muted-foreground">
            {formatAuthors(row.authors, 3)}
          </p>
        )}
      </TableCell>

      <TableCell>
        <StatusBadge status={row.status} />
      </TableCell>

      <TableCell className="text-ui-xs whitespace-nowrap text-muted-foreground">
        {docTypeLabels[row.docType]}
      </TableCell>

      <TableCell className="text-ui-xs whitespace-nowrap text-muted-foreground">
        {row.pageCount === null && row.fileSize === null ? (
          "No file"
        ) : (
          <>
            {row.pageCount !== null && `${row.pageCount} pp`}
            {row.pageCount !== null && row.fileSize !== null && " · "}
            {row.fileSize !== null && formatBytes(row.fileSize)}
          </>
        )}
      </TableCell>

      <TableCell className="pr-6 text-right text-ui-xs whitespace-nowrap text-muted-foreground">
        {formatRelativeTime(row.updatedAt, now)}
      </TableCell>
    </TableRow>
  )
}

/**
 * The properties that change who can see a record, as icons beside its title.
 *
 * These are orthogonal to status and to each other — internal, unlisted and
 * embargoed can all be true of one published record — so they are flags rather
 * than another badge. Each carries a tooltip *and* an `sr-only` label: an icon
 * whose meaning is only in a hover is invisible to a keyboard and to a screen
 * reader, and "why can nobody see this record" is precisely the question these
 * exist to answer.
 */
function RecordFlags({ row, now }: { row: AdminReportRow; now: Date }) {
  const flags: { icon: typeof Lock; label: string }[] = []

  if (row.classification === "internal") {
    flags.push({
      icon: Lock,
      label: "Internal — hidden from anonymous viewers",
    })
  }

  if (!row.discoverable) {
    flags.push({
      icon: EyeOff,
      label: "Not discoverable — reachable by direct link only",
    })
  }

  // Evaluated against the server's clock, the same way the query layer does it.
  // A lapsed embargo is not a flag: the record is simply visible.
  if (row.embargoUntil && row.embargoUntil > now) {
    flags.push({
      icon: Timer,
      label: `Embargoed until ${row.embargoUntil.toISOString().slice(0, 10)}`,
    })
  }

  if (row.dissemination === "metadata_only") {
    flags.push({
      icon: EyeOff,
      label: "Metadata only — the document is not served",
    })
  }

  if (flags.length === 0) return null

  return (
    <span className="flex shrink-0 items-center gap-1">
      {flags.map((flag) => (
        <Tooltip key={flag.label}>
          {/* A real button, not a span. Base UI's tooltip trigger is a button
              by design, and the reason is accessibility rather than markup
              pedantry: a hover-only affordance is unreachable by keyboard, so
              the flag would be invisible to anyone not using a mouse. The
              sr-only label carries the same text for a screen reader. */}
          <TooltipTrigger
            render={
              <button
                type="button"
                className="cursor-default rounded-sm text-muted-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                <flag.icon className="size-3.5" aria-hidden />
                <span className="sr-only">{flag.label}</span>
              </button>
            }
          />
          <TooltipContent>{flag.label}</TooltipContent>
        </Tooltip>
      ))}
    </span>
  )
}
