import { Link, createFileRoute } from "@tanstack/react-router"
import {
  AlertTriangle,
  CircleCheck,
  FileUp,
  HardDrive,
  Inbox,
  PencilLine,
} from "lucide-react"

import type { AttentionDraft, RecentDeposit } from "@/server/admin/types"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import { formatBytes, formatRelativeTime } from "@/components/admin/format"
import { Button } from "@/components/ui/button"
import { StatTile } from "@/components/admin/stat-tile"
import { StatusBadge } from "@/components/admin/status-badge"
import { fetchAdminOverviewFn } from "@/server/admin/functions"

export const Route = createFileRoute("/admin/")({
  loader: () => fetchAdminOverviewFn(),
  component: AdminIndexRoute,
})

function AdminIndexRoute() {
  const {
    generatedAt,
    counts,
    storageBytes,
    recent,
    attention,
    attentionTotal,
  } = Route.useLoaderData()

  // The server's clock, not the renderer's. A `new Date()` here would be
  // evaluated once during SSR and again at hydration, so a row near a minute
  // boundary would render "2 minutes ago" into the HTML and "3 minutes ago"
  // into the DOM — a hydration mismatch. It also keeps every row in the list
  // measured against a single instant.
  const now = generatedAt

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-ui-xl">Overview</h1>
          <p className="text-ui-sm text-muted-foreground">
            The state of the archive.
          </p>
        </div>

        <Button render={<Link to="/admin/deposit" />}>
          <FileUp data-icon="inline-start" />
          Deposit a report
        </Button>
      </div>

      <section aria-labelledby="totals-heading">
        <h2 id="totals-heading" className="sr-only">
          Totals
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatTile
            label="Published"
            value={String(counts.published)}
            hint="Live in the archive"
            icon={CircleCheck}
          />
          <StatTile
            label="Drafts"
            value={String(counts.draft)}
            hint={
              attentionTotal > 0
                ? `${attentionTotal} blocked from publishing`
                : "None blocked"
            }
            icon={PencilLine}
          />
          <StatTile
            label="In review"
            value={String(counts.in_review)}
            hint="Awaiting sign-off"
            icon={Inbox}
          />
          <StatTile
            label="Stored"
            value={formatBytes(storageBytes)}
            hint="Deposited PDFs"
            icon={HardDrive}
          />
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-5">
        <RecentDeposits deposits={recent} now={now} />
        <NeedsAttention
          drafts={attention}
          total={attentionTotal}
          draftCount={counts.draft}
        />
      </div>
    </div>
  )
}

function RecentDeposits({
  deposits,
  now,
}: {
  deposits: RecentDeposit[]
  now: Date
}) {
  return (
    <Card className="lg:col-span-3">
      <CardHeader>
        <CardTitle className="text-ui-lg">Recent deposits</CardTitle>
        <CardDescription className="text-ui-sm">
          The last {deposits.length || "few"} records to enter the system.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        {deposits.length === 0 ? (
          <Empty className="py-8">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Inbox />
              </EmptyMedia>
              <EmptyTitle className="text-ui-base">No deposits yet</EmptyTitle>
              <EmptyDescription className="text-ui-sm">
                The first report you deposit will appear here.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6 text-ui-xs">Accession</TableHead>
                <TableHead className="text-ui-xs">Title</TableHead>
                <TableHead className="text-ui-xs">Status</TableHead>
                <TableHead className="pr-6 text-right text-ui-xs">
                  Deposited
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deposits.map((deposit) => (
                <TableRow key={deposit.id}>
                  <TableCell className="pl-6 font-mono text-ui-xs text-muted-foreground">
                    {/* Drafts have no accession ID — one is allocated at
                        publish and never reused, so an em dash is the honest
                        rendering rather than a placeholder that looks like an
                        identifier. */}
                    {deposit.accessionId ?? "—"}
                  </TableCell>
                  <TableCell className="max-w-0 truncate text-ui-sm font-medium">
                    {deposit.title || "Untitled draft"}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={deposit.status} />
                  </TableCell>
                  <TableCell className="pr-6 text-right text-ui-xs whitespace-nowrap text-muted-foreground">
                    {formatRelativeTime(deposit.createdAt, now)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

function NeedsAttention({
  drafts,
  total,
  draftCount,
}: {
  drafts: AttentionDraft[]
  total: number
  draftCount: number
}) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-ui-lg">Needs attention</CardTitle>
        <CardDescription className="text-ui-sm">
          {total > drafts.length
            ? `${drafts.length} of ${total} drafts blocked from publishing.`
            : "Drafts the publish gate is refusing."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {drafts.length === 0 ? (
          <Empty className="py-8">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <CircleCheck />
              </EmptyMedia>
              <EmptyTitle className="text-ui-base">Nothing blocked</EmptyTitle>
              <EmptyDescription className="text-ui-sm">
                {draftCount === 0
                  ? "There are no drafts in progress."
                  : "Every draft in progress can publish."}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ul className="flex flex-col gap-3">
            {drafts.map((draft) => (
              <li key={draft.id} className="flex items-start gap-3">
                <AlertTriangle
                  className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                  aria-hidden
                />
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="truncate text-ui-sm font-medium">
                    {draft.title}
                  </span>
                  <span className="text-ui-xs text-pretty text-muted-foreground">
                    {draft.topBlocker}
                    {draft.blockerCount > 1 &&
                      ` +${draft.blockerCount - 1} more`}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
